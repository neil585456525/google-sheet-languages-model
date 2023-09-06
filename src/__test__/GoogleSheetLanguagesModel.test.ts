import { describe, test, expect, vi } from "vitest";
import { GoogleSheetLanguagesModel } from "../GoogleSheetLanguagesModel.ts";
import { LanguagesModel } from "../LanguagesModel.ts";
import {
  languages,
  flatLanguagesContentExample,
  expectLanguagesModel,
} from "./helper.ts";

const sheetValueExample = [
  ["key", "en", "fr", "es"],
  ["name", "name", "nom", "nombre"],
  ["job", "job", "emploi", "trabajo"],
  ["nest.object.example1", "example1"],
  ["nest.object.example2", "example2"],
];

describe("GoogleSheetLanguagesModel.test", () => {
  test("sheetValueToLanguageModel", () => {
    const googleSheetLanguagesModel = new GoogleSheetLanguagesModel({
      sheetId: "",
      auth: {} as any,
    });

    const languagesModel = googleSheetLanguagesModel.sheetValueToLanguageModel(
      sheetValueExample,
      languages
    );

    expectLanguagesModel(languagesModel);
  });

  test("languagesModelToSheetValue", () => {
    const googleSheetLanguagesModel = new GoogleSheetLanguagesModel({
      sheetId: "",
      auth: {} as any,
    });

    const languagesModel = new LanguagesModel({
      languagesContent: flatLanguagesContentExample,
      languages,
    });

    const sheetValue =
      googleSheetLanguagesModel.languagesModelToSheetValue(languagesModel);

    expect(sheetValue).toStrictEqual(sheetValueExample);
  });

  test("load languages from google sheet and create the right model", async () => {
    const googleSheetLanguagesModel = new GoogleSheetLanguagesModel({
      sheetId: "",
      auth: {} as any,
    });

    const spy = vi
      .spyOn(googleSheetLanguagesModel as any, "_getSheetValueFromGoogleSheet")
      .mockResolvedValue(sheetValueExample);

    const args: Parameters<
      typeof googleSheetLanguagesModel.loadFromGoogleSheet
    > = ["sheetTitle", languages];

    const languagesModel = await googleSheetLanguagesModel.loadFromGoogleSheet(
      ...args
    );

    expect(spy).toHaveBeenCalledWith(args[0]);
    expectLanguagesModel(languagesModel);
  });

  test("save languages to google sheet", async () => {
    const googleSheetLanguagesModel = new GoogleSheetLanguagesModel({
      sheetId: "",
      auth: {} as any,
    });

    const spy = vi
      .spyOn(googleSheetLanguagesModel as any, "_updateSheetValueToGoogleSheet")
      .mockResolvedValue(undefined);

    const languagesModel = new LanguagesModel({
      languagesContent: flatLanguagesContentExample,
      languages,
    });

    const args: Parameters<typeof googleSheetLanguagesModel.saveToGoogleSheet> =
      ["sheetTitle", languagesModel];

    await googleSheetLanguagesModel.saveToGoogleSheet(...args);

    expect(spy).toHaveBeenCalledWith(args[0], sheetValueExample);
  });
});
