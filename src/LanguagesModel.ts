import { set } from "lodash-es";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

/**
 * @example ['en','zh-TW','ja']
 */
export type Languages = readonly string[];

type LanguagesContentType = "nest" | "flat";

export type FlatLanguagesContent<TLanguages extends Languages> = Record<
  TLanguages[number],
  { [key: string]: string }
>;

export type NestLanguagesContent<TLanguages extends Languages> = Record<
  TLanguages[number],
  { [key: string]: string | { [key: string]: string } }
>;

export type LanguagesContent =
  | FlatLanguagesContent<Languages>
  | NestLanguagesContent<Languages>;

export interface LanguagesModelConfig<TLanguages extends Languages> {
  languages: TLanguages;
  languagesContent: LanguagesContent;
  type: LanguagesContentType;
}

export class LanguagesModel<TLanguages extends Languages> {
  static loadFromFolder<TLanguages extends Languages>(
    folderPath: string,
    languages: TLanguages,
    type: LanguagesContentType = "nest"
  ) {
    const languagesContent: LanguagesContent = {};
    languages.forEach((langItem) => {
      const langFilePath = `${folderPath}/${langItem}.json`;
      const langFile = require(langFilePath);
      languagesContent[langItem] = langFile;
    });
    return new LanguagesModel<TLanguages>({
      languages,
      languagesContent,
      type,
    });
  }

  languages: TLanguages;
  flatLanguagesContent: FlatLanguagesContent<TLanguages>;
  constructor(config: LanguagesModelConfig<TLanguages>) {
    this.languages = config.languages;
    if (!config.languagesContent || !config.type)
      throw new Error(
        "LanguagesModelConfig.languagesContent and LanguagesModelConfig.type is required"
      );
    if (config.type === "flat") {
      this.flatLanguagesContent =
        config.languagesContent as FlatLanguagesContent<TLanguages>;
      return;
    }

    this.flatLanguagesContent = this.nestToFlat(
      config.languagesContent as NestLanguagesContent<TLanguages>
    );
  }

  public getFlat() {
    return this.flatLanguagesContent;
  }

  public getNest() {
    return this.flatToNest(this.flatLanguagesContent);
  }

  public saveToFolder(folderPath: string, type: LanguagesContentType = "nest") {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    this.languages.forEach((langItem) => {
      const langFilePath = `${folderPath}/${langItem}.json`;
      const model = type === "nest" ? this.getNest() : this.getFlat();
      fs.writeFileSync(langFilePath, JSON.stringify(model[langItem], null, 2));
    });
  }

  protected nestToFlat = (
    nestLanguagesObj: NestLanguagesContent<TLanguages>
  ) => {
    const obj = {};
    this.languages.forEach((langItem) => {
      obj[langItem] = this.flatten(nestLanguagesObj[langItem]);
    });
    return obj as FlatLanguagesContent<TLanguages>;
  };

  protected flatToNest(flatLanguagesObj: FlatLanguagesContent<TLanguages>) {
    const nestLanguagesObj = {} as NestLanguagesContent<TLanguages>;

    this.languages.forEach((langItem) => {
      const thisLangFlatObj = flatLanguagesObj[langItem];
      const thisLangNestObj = {};
      Object.keys(thisLangFlatObj).forEach((keyName) => {
        if (!thisLangFlatObj[keyName]) return;

        const keyIsNumber = keyName.split(".").find((i) => i.match(/^-?\d+$/));
        if (keyIsNumber) throw new Error("Key can not be Number");

        set(thisLangNestObj, keyName, thisLangFlatObj[keyName]);
      });

      nestLanguagesObj[langItem] = thisLangNestObj;
    });

    return nestLanguagesObj;
  }

  private flatten(ob: Object) {
    var toReturn = {};
    for (var i in ob) {
      if (!ob.hasOwnProperty(i)) continue;
      if (typeof ob[i] == "object" && ob[i] !== null) {
        var flatObject = this.flatten(ob[i]);
        for (var x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) continue;
          toReturn[i + "." + x] = flatObject[x];
        }
      } else {
        toReturn[i] = ob[i];
      }
    }
    return toReturn;
  }
}
