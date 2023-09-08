import { GoogleSheetLanguagesModel } from "google-sheet-languages-model";
import { SHEET_ID, languages, auth, folderPath } from "./config.ts";

const languagesModel = GoogleSheetLanguagesModel.loadFromFolder(
  folderPath,
  languages
);

const googleSheetLanguagesModel = new GoogleSheetLanguagesModel({
  sheetId: SHEET_ID,
  auth,
});

await googleSheetLanguagesModel.saveToGoogleSheet("Test", languagesModel);

console.log("push done");
