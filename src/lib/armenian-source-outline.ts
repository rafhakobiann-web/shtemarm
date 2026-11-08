/** Four user-provided 2018 exam PDFs: structure only, not digitized question text. */
export const ARMENIAN_ORIGINAL_CHAPTERS = [
  "Հնչյունաբանություն",
  "Բառագիտություն",
  "Ձևաբանություն",
  "Շարահյուսություն",
  "Կապակցված խոսք",
  "Ընդհանուր գիտելիքներ հայոց լեզվի մասին",
  "Ոճագիտություն",
  "Գրականություն",
] as const;

export const ARMENIAN_SOURCE_PAGES = {
  1: { starts: [5,27,49,98,173,187,189,194], appendix: 240, answers: 249 },
  2: { starts: [5,30,52,74,170,184,188,202], appendix: 243, answers: 250 },
  3: { starts: [5,35,61,97,169,176,182,190], appendix: 241, answers: 249 },
  4: { starts: [6,38,69,111,186,198,203,210], appendix: 242, answers: 251 },
} as const;

export type ArmenianVolume = keyof typeof ARMENIAN_SOURCE_PAGES;

/** Page ranges refer to the user's original PDF, not web-hosted source scans. */
export function armenianSourceChapters(volume: ArmenianVolume) {
  const source = ARMENIAN_SOURCE_PAGES[volume];
  return ARMENIAN_ORIGINAL_CHAPTERS.map((title, index) => ({
    number: index + 1,
    title,
    page: source.starts[index],
    endPage: (source.starts[index + 1] ?? source.appendix) - 1,
  }));
}
