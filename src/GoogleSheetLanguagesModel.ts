import {
  LanguagesModel,
  Languages,
  FlatLanguagesContent,
} from "./LanguagesModel.ts";
import { google } from "googleapis";

type SheetValue = string[][];

interface GoogleSheetLanguagesModelConfig {
  sheetId: string;
  auth: Parameters<typeof google.sheets>[0]["auth"];
}

export class GoogleSheetLanguagesModel {
  sheetId: string;
  googleSheet: ReturnType<typeof google.sheets>;

  static loadFromFolder = LanguagesModel.loadFromFolder;

  constructor(config: GoogleSheetLanguagesModelConfig) {
    this.sheetId = config.sheetId;
    this.googleSheet = google.sheets({ version: "v4", auth: config.auth });
  }

  public async loadFromGoogleSheet(sheetTitle: string, languages: Languages) {
    const sheetValue = await this.getSheetValueFromGoogleSheet(sheetTitle);

    return this.sheetValueToLanguageModel(sheetValue, languages);
  }

  public async saveToGoogleSheet(
    sheetTitle: string,
    languagesModel: LanguagesModel<Languages>
  ) {
    const sheetValue = this.languagesModelToSheetValue(languagesModel);

    await this.updateSheetValueToGoogleSheet(sheetTitle, sheetValue);
  }

  public async getSheetValueFromGoogleSheet(sheetTitle: string) {
    const sheet = await this.googleSheet.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${sheetTitle}`,
    });
    return sheet.data.values as string[][];
  }

  public async updateSheetValueToGoogleSheet(
    sheetTitle: string,
    sheetValue: SheetValue
  ) {
    await this.googleSheet.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: `${sheetTitle}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: sheetValue,
      },
    });
  }

  public languagesModelToSheetValue(languagesModel: LanguagesModel<Languages>) {
    const contentRaws: string[][] = [["key", ...languagesModel.languages]];

    // [
    //   ["key", "en", "zh", "ja", "fr", "es"],
    // ]

    const mainLangData =
      languagesModel.flatLanguagesContent[languagesModel.languages[0]];

    let tmpRaw: string[] = [];
    for (const mainRowKey in mainLangData) {
      tmpRaw.push(mainRowKey);
      tmpRaw.push(mainLangData[mainRowKey]);
      languagesModel.languages.slice(1).forEach((anotherLang) => {
        const field =
          languagesModel.flatLanguagesContent[anotherLang][mainRowKey];
        if (!field) {
          tmpRaw.push("");
          return;
        }
        tmpRaw.push(field);
      });
      contentRaws.push(tmpRaw);
      tmpRaw = [];
    }

    // [
    //   ["key", "en", "zh", "ja", "fr", "es"],
    //   ["user.name", "name", "名字", "名前", "nom", "nombre"],
    //   ["user.age", "age", "", "", "âge", "edad"],
    // ]

    return contentRaws;
  }

  public sheetValueToLanguageModel(
    sheetValue: SheetValue,
    languages: Languages
  ) {
    // [
    //   ["key", "en", "zh", "ja", "fr", "es"],
    //   ["user.name", "name", "名字", "名前", "nom", "nombre"],
    //   ["user.age", "age", "年龄", "年齢", "âge", "edad"],
    // ]

    const [_, ...contentRowsData] = sheetValue;

    const contentRows = contentRowsData.map((rowItem) => {
      const [key, ...translationRows] = rowItem;
      return { key, translationRows };
    });

    // [
    //   {
    //     key: 'user.name',
    //     translationRows: [ 'name', '名字', '名前', 'nom', 'nombre' ]
    //   },
    //   {
    //     key: 'user.age',
    //     translationRows: [ 'age', '年龄', '年齢', 'âge', 'edad' ]
    //   }
    // ]

    const flatLanguagesContent: FlatLanguagesContent<Languages> = {};

    languages.forEach((language) => {
      flatLanguagesContent[language] = {};
    });

    // {
    //   en:{},
    //   zh:{},
    //   ja:{},
    //   fr:{},
    //   es:{},
    // }

    contentRows.forEach((rowItem) => {
      const { key, translationRows } = rowItem;

      languages.forEach((language, index) => {
        if (!translationRows[index]) return;
        flatLanguagesContent[language][`${key}`] = translationRows[index];
      });
    });

    // {
    //   en: {
    //     "user.name": "name",
    //     "user.age": "age",
    //   },
    //   zh: {
    //     "user.name": "名字",
    //     "user.age": "年龄",
    //   },
    // }

    return new LanguagesModel({
      languages,
      languagesContent: flatLanguagesContent,
    });
  }
}
