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
    const sheet = await this.googleSheet.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${sheetTitle}`,
    });

    return this.sheetValueToLanguageModel(sheet.data.values, languages);
  }

  public async saveToGoogleSheet(
    sheetTitle: string,
    languagesModel: LanguagesModel<Languages>
  ) {
    const sheetValue = this.languagesModelToSheetValue(languagesModel);

    await this.googleSheet.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: `${sheetTitle}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: sheetValue,
      },
    });
  }

  private languagesModelToSheetValue(
    languagesModel: LanguagesModel<Languages>
  ) {
    const contentRaws: string[][] = [["key", ...languagesModel.languages]];

    const mainLangData =
      languagesModel.flatLanguagesContent[languagesModel.languages[0]];

    let tmpRaw: string[] = [];
    for (const mainRowKey in mainLangData) {
      tmpRaw.push(mainRowKey);
      tmpRaw.push(mainLangData[mainRowKey]);
      languagesModel.languages.slice(1).forEach((anotherLang) => {
        // if there no other lang add a empty string as blank field
        tmpRaw.push(
          languagesModel.flatLanguagesContent[anotherLang][mainRowKey] || ""
        );
      });
      contentRaws.push(tmpRaw);
      tmpRaw = [];
    }

    return contentRaws;
  }

  private sheetValueToLanguageModel(
    sheetValue: SheetValue,
    languages: Languages
  ) {
    const [_, ...contentRowsData] = sheetValue;

    const contentRows = contentRowsData.map((rowItem) => {
      const [key, ...translationRows] = rowItem;
      return { key, translationRows };
    });

    const flatLanguagesContent: FlatLanguagesContent<Languages> = {};

    languages.forEach((langItem) => {
      flatLanguagesContent[langItem] = {};
    });

    contentRows.forEach((rowItem) => {
      // ex. rowItem = ['user.name','name','名字',...]
      const { key, translationRows } = rowItem;

      languages.forEach((langItem, index) => {
        if (translationRows[index] === "") return;
        flatLanguagesContent[langItem][`${key}`] = translationRows[index];
      });
    });

    return new LanguagesModel({
      languages,
      languagesContent: flatLanguagesContent,
      type: "flat",
    });
  }
}
