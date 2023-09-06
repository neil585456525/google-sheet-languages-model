import { describe, test } from "vitest";
import { LanguagesModel } from "../LanguagesModel.ts";
import { resolve } from "path";
import {
  __dirname,
  languages,
  flatLanguagesContentExample,
  nestLanguagesContentExample,
  expectLanguagesModel,
} from "./helper.ts";

describe("LanguagesModel", () => {
  test("create the right model from flatLanguagesContent", () => {
    const languagesModel = new LanguagesModel({
      languages,
      languagesContent: flatLanguagesContentExample,
    });

    expectLanguagesModel(languagesModel);
  });

  test("create the right model from nestLanguagesContent", () => {
    const languagesModel = new LanguagesModel({
      languages,
      languagesContent: nestLanguagesContentExample,
    });

    expectLanguagesModel(languagesModel);
  });

  test("load languages from local folder and create the right model", () => {
    const languagesModel = LanguagesModel.loadFromFolder(
      resolve(__dirname + "/i18n"),
      languages
    );

    expectLanguagesModel(languagesModel);
  });

  test("save languages to local folder", () => {
    const languagesModel = new LanguagesModel({
      languages,
      languagesContent: flatLanguagesContentExample,
    });

    const folderPath = resolve(__dirname + "/tmp/nestI18n");

    languagesModel.saveToFolder(folderPath, "nest");

    const languagesModel2 = LanguagesModel.loadFromFolder(
      folderPath,
      languages
    );

    expectLanguagesModel(languagesModel2);
  });
});
