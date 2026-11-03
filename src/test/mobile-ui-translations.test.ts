import { describe, expect, it } from "vitest";
import { DICT } from "@/i18n";
import { RU_DICT } from "@/i18n/ru";

// These are user-visible labels reported as mixed-language in mobile screenshots.
// Keep both language dictionaries complete when editing these screens.
const criticalLabels = [
  "Հիշողության քարտեր",
  "Իմ բառապաշարը",
  "Ուսումնական գործիքներ",
  "Ուսումնական առաջընթաց",
  "Ճիշտ պատասխաններ",
  "Կրկնելու հարցեր",
  "Կրկին փորձել",
  "Գիտական հաշվիչ",
  "AI լուծիչ",
  "Հաշվիչի ռեժիմ",
  "Պարզ",
  "Գիտական",
  "Ջնջել",
  "Մաքրել",
  "Կրկնության գործիք",
  "Թեմաների ընտրություն",
  "Հիշված քարտեր",
  "Հպիր քարտին՝ շրջելու համար",
  "Կապի տվյալներ (ոչ պարտադիր)՝ էլ. փոստ կամ TikTok անուն",
  "Գրեք ձեր հաղորդագրությունը մշակողին…",
  "Ձեր հաղորդագրությունները և պատասխանները",
  "Ուղարկել",
  "Քո հաջորդ քայլը",
  "Ընտրել շտեմարան",
];

describe("three-language mobile UI labels", () => {
  it.each(criticalLabels)("%s has English and Russian translations", (label) => {
    expect(DICT[label], `Missing English translation for ${label}`).toBeTruthy();
    expect(RU_DICT[label], `Missing Russian translation for ${label}`).toBeTruthy();
  });
});
