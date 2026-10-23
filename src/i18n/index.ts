import { dict_a } from "./a";
import { dict_b } from "./b";
import { dict_c } from "./c";
import { dict_d } from "./d";

/** Armenian UI text (the key) → English UI text. Question content is never translated. */
export const DICT: Record<string, string> = { ...dict_a, ...dict_b, ...dict_c, ...dict_d };
