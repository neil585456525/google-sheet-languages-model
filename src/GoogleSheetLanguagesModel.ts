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
    const sheetValue = await this._getSheetValueFromGoogleSheet(sheetTitle);

    return this.sheetValueToLanguageModel(sheetValue, languages);
  }

  public async saveToGoogleSheet(
    sheetTitle: string,
    languagesModel: LanguagesModel<Languages>
  ) {
    const sheetValue = this.languagesModelToSheetValue(languagesModel);

    await this._updateSheetValueToGoogleSheet(sheetTitle, sheetValue);
  }

  private async _getSheetValueFromGoogleSheet(sheetTitle: string) {
    const sheet = await this.googleSheet.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${sheetTitle}`,
    });
    return sheet.data.values;
  }

  private async _updateSheetValueToGoogleSheet(
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

    const mainLangData =
      languagesModel.flatLanguagesContent[languagesModel.languages[0]];

    let tmpRaw: string[] = [];
    for (const mainRowKey in mainLangData) {
      tmpRaw.push(mainRowKey);
      tmpRaw.push(mainLangData[mainRowKey]);
      languagesModel.languages.slice(1).forEach((anotherLang) => {
        const field =
          languagesModel.flatLanguagesContent[anotherLang][mainRowKey];
        if (!field) return;
        tmpRaw.push(field);
      });
      contentRaws.push(tmpRaw);
      tmpRaw = [];
    }

    return contentRaws;
  }

  public sheetValueToLanguageModel(
    sheetValue: SheetValue,
    languages: Languages
  ) {
    const [_, ...contentRowsData] = sheetValue;

    const contentRows = contentRowsData.map((rowItem) => {
      const [key, ...translationRows] = rowItem;
      return { key, translationRows };
    });

    const flatLanguagesContent: FlatLanguagesContent<Languages> = {};

    languages.forEach((language) => {
      flatLanguagesContent[language] = {};
    });

    contentRows.forEach((rowItem) => {
      // ex. rowItem = ['user.name','name','名字',...]
      const { key, translationRows } = rowItem;

      languages.forEach((language, index) => {
        if (!translationRows[index]) return;
        flatLanguagesContent[language][`${key}`] = translationRows[index];
      });
    });

    return new LanguagesModel({
      languages,
      languagesContent: flatLanguagesContent,
    });
  }
}
