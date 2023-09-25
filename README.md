# i18n-google-sheet-example

`google-sheet-languages-model` is a npm package that allows you to download/upload and parse internationalization (i18n) data from a Google Sheet to your local environment. This readme provides instructions on how to set up and use the `google-sheet-languages-model` package to manage your i18n data.

## Installation

Install the package using npm:

```bash
yarn add -D google-sheet-languages-model googleapis
```

## Authorization

It's recommended to use the Service Account auth option to interact with the Google Sheets API. Follow these steps to set up the authorization:

1. Enable the Google Sheets API permission for your project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Service Account or use an existing one, and add it as a editor to your working sheet.
3. Download the `credentials.json` file which is generated from the Service Account and place it in your project directory.
4. Share your Google Sheet with the email address provided in the `client_email` field inside the `credentials.json` file.
5. Set the Google Sheet ID in your environment variables or configuration.

## Usage

Firstly, import the necessary modules from the package and your configuration:

```typescript
import { GoogleSheetLanguagesModel } from "google-sheet-languages-model";
import { SHEET_ID, languages, auth, folderPath } from "./config.ts";
```

### Download and Parse Data to Local

Here is an example of how to download and parse i18n data from a Google Sheet and save it to a local folder:

```typescript
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
```

### Upload Data to Google Sheet

Here is an example of how to upload i18n data from a local folder to a Google Sheet:

```typescript
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
```

### Configuration

Your `config.ts` should export the following variables:

- `SHEET_ID`: The ID of your Google Sheet.
- `languages`: An array of language codes (e.g., `['en', 'es', 'fr']`).
- `auth`: Your authorization credentials.
- `folderPath`: The path to the folder where you want to save or load the language files.

### Examples

- Pull i18n from google sheet to local folder. ([link](https://github.com/neil585456525/i18n-google-sheet-example/blob/main/example/pull.ts))
- Push i18n from local folder to google sheet. ([link](https://github.com/neil585456525/i18n-google-sheet-example/blob/main/example/push.ts))

## Documentation

The main classes and methods are documented in the source code provided. This will guide you on the data structures and the methods available for use.

Feel free to explore the provided code to better understand how to work with the `google-sheet-languages-model` package to manage your i18n data.

## Contributing

If you encounter any issues or have features requests, feel free to open an issue or submit a pull request. Your contributions are welcome!
