import { pageForBiologyQuestion, type BiologyOriginalChapter } from "@/lib/biology-source";

/**
 * This module reads a PDF explicitly selected by the student, in memory.
 * It never uploads the PDF or stores extracted text on Shtemarm's servers.
 */
const arm8 = " _և։) (»«—.՝,-֊…՜՛՞ԱաԲբԳգԴդԵեԶզԷէԸըԹթԺժԻիԼլԽխԾծԿկՀհՁձՂղՃճՄմՅյՆնՇշՈոՉչՊպՋջՌռՍսՎվՏտՐրՑցՒւՓփՔքՕօՖֆ՚";
// Explicit mapping avoids mistaking a PDF's legacy ArmSCII-8 font characters
// for Unicode Armenian. Some extracted font glyphs use Greek substitutions.
const arm8Codepoints: Record<number, string> = {
  160:" ", 162:"և", 163:"։", 164:")", 165:"(", 166:"»",167:"«",168:"և",
  169:".",170:"՝",171:",",172:"-",173:"֊",174:"…",175:"՜",176:"՛",177:"՞",
};
const alphabet = "ԱաԲբԳգԴդԵեԶզԷէԸըԹթԺժԻիԼլԽխԾծԿկՀհՁձՂղՃճՄմՅյՆնՇշՈոՉչՊպՋջՌռՍսՎվՏտՐրՑցՒւՓփՔքՕօՖֆ";
for (let i = 0; i < alphabet.length; i++) arm8Codepoints[178 + i] = alphabet[i]!;

export function normalizeArmenianPdfText(value: string): string {
  // Already-Unicode pages should not be modified. Most 2018 source pages
  // contain legacy bytes surfaced as Latin-1 glyphs by their PDF fonts.
  if (/[\u0531-\u058f]/u.test(value)) return value.replace(/\s+/g, " ").trim();
  return Array.from(value, char => {
    if (char === "μ") return "բ";
    if (char === "β") return "β";
    if (char === "α") return "α";
    const value = char.codePointAt(0)!;
    return arm8Codepoints[value] ?? char;
  }).join("").replace(/\s+/g, " ").trim();
}

type PdfTextPiece = { str: string; transform: number[]; width: number };
type PdfPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  getTextContent: () => Promise<{ items: unknown[] }>;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: any; canvas?: HTMLCanvasElement }) => { promise: Promise<void> };
};
export type PdfQuestionExtract = {
  status: "exact-page" | "unlocated";
  page: number;
  question: number;
  text: string;
  stem: string;
  options: string[];
  hasFourChoices: boolean;
  sourceVerified: boolean;
  crop: { left: number; top: number; right: number; bottom: number };
};
const isPiece = (v: unknown): v is PdfTextPiece => {
  const item = v as Partial<PdfTextPiece>;
  return typeof item?.str === "string" && Array.isArray(item.transform) && item.transform.length >= 6;
};
export function locatePdfQuestion(
  chapter: BiologyOriginalChapter,
  number: number,
  pageNumber: number,
  pageWidth: number,
  pageHeight: number,
  allItems: unknown[],
): PdfQuestionExtract {
  const pieces = allItems.filter(isPiece);
  const questionMarkers = pieces.filter(item =>
    /^\d{1,4}$/.test(item.str.trim()) &&
    Math.abs(item.transform[4] - 42.24) <= 6 &&
    Math.abs(item.transform[1]) < 0.2 &&
    Math.abs(item.transform[2]) < 0.2,
  );
  const selected = questionMarkers.filter(item => Number(item.str.trim()) === number);
  // Only the marker at the *actual* source page may identify a question.
  // Never display adjacent question text if the page index or segmentation differs.
  const startMarker = selected.length === 1 ? selected[0] : null;
  const nextNumber = number + 1;
  const nextPage = nextNumber <= chapter.questionCount ? pageForBiologyQuestion(chapter, nextNumber) : null;
  const nextMarkers = nextPage === pageNumber
    ? questionMarkers.filter(item => Number(item.str.trim()) === nextNumber)
    : [];
  const top = startMarker
    ? Math.max(10, pageHeight - startMarker.transform[5] - 17)
    : 0;
  const bottom = nextPage === pageNumber && nextMarkers.length === 1
    ? pageHeight - nextMarkers[0]!.transform[5] - 17
    : pageHeight - 42;
  const safe = startMarker !== null && bottom > top + 18 && bottom <= pageHeight;
  const crop = safe
    ? { left: 37, right: Math.min(pageWidth - 24, 454), top: Math.max(0, top), bottom: Math.min(pageHeight, bottom) }
    : { left: 35, right: Math.min(pageWidth - 24, 454), top: 0, bottom: pageHeight - 36 };

  if (!safe) {
    return { status: "unlocated", page: pageNumber, question: number, text: "", stem: "", options: [], hasFourChoices: false, sourceVerified: false, crop };
  }

  // Build text lines from real PDF glyph locations, not guessed questions.
  // Filter out the printed number in the left gutter, page furniture and
  // diagonal watermark. A visible source crop remains the authority.
  const ordered = pieces.filter(item => {
    const x = item.transform[4];
    const y = pageHeight - item.transform[5];
    return x > 47.4 && x < crop.right + 8 && y >= top + 5 &&
      y < bottom + 8 && Math.abs(item.transform[1]) < 0.2 &&
      Math.abs(item.transform[2]) < 0.2 &&
      !/atc\.am/i.test(item.str);
  }).map(item => ({
    x: item.transform[4],
    y: pageHeight - item.transform[5],
    str: normalizeArmenianPdfText(item.str),
  })).filter(item => item.str.length > 0).sort((a,b) => a.y-b.y || a.x-b.x);
  const lines: { y: number; parts: { x: number; str: string }[] }[] = [];
  for (const item of ordered) {
    const line = lines.length && Math.abs(lines[lines.length-1]!.y - item.y) < 3
      ? lines[lines.length-1]!
      : null;
    if (line) line.parts.push({ x:item.x, str:item.str });
    else lines.push({ y:item.y, parts: [{x:item.x, str:item.str}] });
  }
  const cleanLines = lines.map(line =>
    line.parts.sort((a,b)=>a.x-b.x).map(item=>item.str).join(" ").replace(/^\.\s+/, "").trim(),
  ).filter(Boolean);
  const text = cleanLines.join("\n");
  const validArmenian = (text.match(/[\u0531-\058f]/g) ?? []).length >= 8 &&
    !text.includes("\uFFFD") && text.length >= 18;
  if (!validArmenian) {
    return { status:"exact-page", page:pageNumber, question:number, text:"", stem:"", options:[], hasFourChoices:false, sourceVerified:false, crop };
  }
  const stemParts: string[] = [], options: string[] = [];
  for (const line of cleanLines) {
    const option = line.match(/^([1-4])\s*\)\s*(.*)$/);
    if (option && Number(option[1]) === options.length + 1) {
      options.push(option[2]!.trim());
    } else if (options.length) {
      options[options.length-1] += " " + line;
    } else {
      stemParts.push(line);
    }
  }
  const stem = stemParts.join(" ").replace(/\s+/g," ").trim();
  const hasFourChoices = options.length === 4 && options.every(x=>x.length > 0) && stem.length > 8;
  return { status:"exact-page", page:pageNumber, question:number, text, stem, options, hasFourChoices, sourceVerified: true, crop };
}

/** Dynamically load pdfjs only in a browser when a user-selected PDF exists. */
export async function openLocalBiologyDocument(file: Blob) {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data: bytes, useSystemFonts: true });
  const document = await loadingTask.promise;
  return { document, loadingTask };
}

export async function readBiologyQuestionFromPdf(
  document: { getPage: (page: number) => Promise<any> },
  chapter: BiologyOriginalChapter,
  question: number,
): Promise<{ page: PdfPage; extract: PdfQuestionExtract }> {
  const pageNumber = pageForBiologyQuestion(chapter, question);
  const page: PdfPage = await document.getPage(pageNumber);
  const view = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  return { page, extract: locatePdfQuestion(chapter, question, pageNumber, view.width, view.height, content.items) };
}

/**
 * Render the *actual* user-provided question area on-device, preserving font,
 * formulas and figures even if copyable text is absent or damaged.
 */
export async function renderBiologyQuestionCrop(
  page: PdfPage,
  extract: PdfQuestionExtract,
  destination: HTMLCanvasElement,
): Promise<void> {
  const view = page.getViewport({ scale: 1 });
  const crop = extract.crop;
  const width = crop.right - crop.left;
  const height = crop.bottom - crop.top;
  const scale = Math.min(2.3, Math.max(1.3, 850 / Math.max(1, width)));
  const bigViewport = page.getViewport({ scale });
  const full = document.createElement("canvas");
  full.width = Math.ceil(bigViewport.width);
  full.height = Math.ceil(bigViewport.height);
  const context = full.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable.");
  await page.render({ canvasContext: context, viewport: bigViewport, canvas: full }).promise;
  destination.width = Math.max(1, Math.ceil(width * scale));
  destination.height = Math.max(1, Math.ceil(height * scale));
  const dst = destination.getContext("2d");
  if (!dst) throw new Error("Canvas is unavailable.");
  dst.fillStyle = "#fff";
  dst.fillRect(0,0,destination.width,destination.height);
  dst.drawImage(full, crop.left*scale, crop.top*scale,
    width*scale,height*scale, 0,0,destination.width,destination.height);
  full.width = 0; full.height = 0;
}
