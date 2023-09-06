import { set } from "lodash-es";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

/**
 * @example ['en','zh-TW','ja']
 */
export type Languages = readonly string[];

type LanguagesContentType = "nest" | "flat";

export type FlatLanguagesContent<TLanguages extends Languages = Languages> =
  Record<TLanguages[number], { [key: string]: string }>;

export type NestLanguagesContent<TLanguages extends Languages = Languages> =
  Record<
    TLanguages[number],
    {
      [key: string]:
        | string
        | { [key: string]: string | { [key: string]: string } };
    }
  >;

export type LanguagesContent = FlatLanguagesContent | NestLanguagesContent;

export interface LanguagesModelConfig<
  TLanguages extends Languages = Languages
> {
  languages: TLanguages;
  languagesContent: LanguagesContent;
}

/**
 * @description Handing i18n definition files in local side, can load from or save to local folder.
 * Support two common structures of i18n files. Flat and nest.
 */
export class LanguagesModel<TLanguages extends Languages = Languages> {
  static loadFromFolder<TLanguages extends Languages>(
    folderPath: string,
    languages: TLanguages
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
    });
  }

  languages: TLanguages;
  flatLanguagesContent: FlatLanguagesContent<TLanguages>;
  constructor(config: LanguagesModelConfig<TLanguages>) {
    this.languages = config.languages;

    this.flatLanguagesContent = this.nestToFlat(config.languagesContent);
  }

  public getFlat() {
    return this.flatLanguagesContent;
  }

  public getNest() {
    return this.flatToNest(this.flatLanguagesContent);
  }

  public saveToFolder(folderPath: string, type: LanguagesContentType = "nest") {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    this.languages.forEach((langItem) => {
      const langFilePath = `${folderPath}/${langItem}.json`;
      const model = type === "nest" ? this.getNest() : this.getFlat();
      fs.writeFileSync(langFilePath, JSON.stringify(model[langItem], null, 2));
    });
  }

  protected nestToFlat = (languagesContent: LanguagesContent) => {
    const obj = {};
    this.languages.forEach((langItem) => {
      obj[langItem] = this.flatten(languagesContent[langItem]);
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
