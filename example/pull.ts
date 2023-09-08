import { GoogleSheetLanguagesModel } from "google-sheet-languages-model";
import { SHEET_ID, languages, auth, folderPath } from "./config.ts";

const googleSheetLanguagesModel = new GoogleSheetLanguagesModel({
  sheetId: SHEET_ID,
  auth,
});

const languagesModel = await googleSheetLanguagesModel.loadFromGoogleSheet(
  "Test",
  languages
);

languagesModel.saveToFolder(folderPath, "nest");

console.log("pull done");
