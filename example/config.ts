import { createRequire } from "module";
import { google } from "googleapis";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const require = createRequire(import.meta.url);
const credentials = require("./credentials.json");

export const SHEET_ID = process.env.SHEET_ID as string;

export const languages = ["en", "zh", "ja", "fr", "es"] as const;

export const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const __dirname = dirname(fileURLToPath(import.meta.url));
export const folderPath = resolve(__dirname + "/i18n");
