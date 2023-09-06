import { describe, test, expect } from "vitest";
import {
  LanguagesModel,
  FlatLanguagesContent,
  NestLanguagesContent,
} from "../LanguagesModel.ts";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const languages = ["en", "fr", "es"] as const;

const flatLanguagesContentExample: FlatLanguagesContent = {
  en: {
    name: "name",
    job: "job",
    "nest.object.example1": "example1",
    "nest.object.example2": "example2",
  },
  fr: { name: "nom", job: "emploi" },
  es: { name: "nombre", job: "trabajo" },
};

const nestLanguagesContentExample: NestLanguagesContent = {
  en: {
    name: "name",
    job: "job",
    nest: { object: { example1: "example1", example2: "example2" } },
  },
  fr: { name: "nom", job: "emploi" },
  es: { name: "nombre", job: "trabajo" },
};

describe("LanguagesModel", () => {
  const expectLanguagesModel = (languagesModel: LanguagesModel) => {
    expect(languagesModel.getFlat()).toStrictEqual(flatLanguagesContentExample);
    expect(languagesModel.getNest()).toStrictEqual(nestLanguagesContentExample);
  };

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
