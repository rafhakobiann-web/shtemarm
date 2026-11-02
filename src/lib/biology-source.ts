/**
 * Original Biology III–IV PDF page/answer-key index.
 * The question wording, figures and the book PDF remain in the student's own local file.
 */
export type BiologyVolume = 3 | 4;

export interface BiologyOriginalChapter {
  id: number;
  title: string;
  startPage: number;
  endPage: number;
  answerPages: [number, number];
  questionCount: number;
  pageRuns: [number, number][];
  choiceKeys: string;
  manualNumberingChecks: number[];
}

export interface BiologyOriginalIndex {
  schemaVersion: number;
  volume: BiologyVolume;
  editionYear: number;
  sourceName: string;
  sourceSha256: string;
  totalPages: number;
  chapters: BiologyOriginalChapter[];
}

export function pageForBiologyQuestion(chapter: BiologyOriginalChapter, number: number): number {
  if (!Number.isInteger(number) || number < 1 || number > chapter.questionCount) {
    throw new RangeError("Question number is outside this printed chapter.");
  }
  let page = chapter.startPage;
  for (const [first, sourcePage] of chapter.pageRuns) {
    if (first > number) break;
    page = sourcePage;
  }
  return page;
}

export function answerForBiologyChoice(chapter: BiologyOriginalChapter, number: number): string | null {
  if (!Number.isInteger(number) || number < 1 || number > chapter.questionCount) return null;
  const digit = chapter.choiceKeys.charAt(number - 1);
  return /^[1-4]$/.test(digit) ? digit : null;
}

export function biologyIndexedCount(index: BiologyOriginalIndex): number {
  return index.chapters.reduce((sum, c) => sum + c.questionCount, 0);
}

export function biologyAutoGradedCount(index: BiologyOriginalIndex): number {
  return index.chapters.reduce((sum, c) => sum + c.choiceKeys.length, 0);
}

export function validateBiologyOriginalIndex(source: unknown, volume: BiologyVolume): BiologyOriginalIndex {
  const index = source as BiologyOriginalIndex;
  if (index?.schemaVersion !== 1 || index.volume !== volume ||
      !/^[a-f0-9]{64}$/.test(index.sourceSha256 ?? "") ||
      !Array.isArray(index.chapters) || index.chapters.length !== 6 ||
      !Number.isInteger(index.totalPages)) {
    throw new Error("Invalid source-volume index");
  }
  for (const [i, ch] of index.chapters.entries()) {
    if (ch.id !== i + 1 || !Number.isInteger(ch.questionCount) || ch.questionCount <= 0 ||
        !Number.isInteger(ch.startPage) || !Number.isInteger(ch.endPage) ||
        ch.startPage > ch.endPage || ch.endPage >= index.totalPages ||
        !Array.isArray(ch.pageRuns) || !ch.pageRuns.length ||
        !Array.isArray(ch.answerPages) || ch.answerPages.length !== 2 ||
        ch.answerPages[0] < ch.endPage || ch.answerPages[1] >= index.totalPages ||
        !/^[1-4]*$/.test(ch.choiceKeys) || ch.choiceKeys.length > ch.questionCount) {
      throw new Error("Malformed source chapter");
    }
    let previousNumber = 0, previousPage = ch.startPage;
    for (const [number, page] of ch.pageRuns) {
      if (!Number.isInteger(number) || number <= previousNumber || number > ch.questionCount ||
          !Number.isInteger(page) || page < previousPage || page > ch.endPage) {
        throw new Error("Invalid question-to-page mapping");
      }
      previousNumber = number; previousPage = page;
    }
    if (ch.pageRuns[0][0] !== 1 || ch.pageRuns[0][1] !== ch.startPage) {
      throw new Error("First question must start at the printed chapter page");
    }
  }
  return index;
}

export async function loadBiologyOriginalIndex(volume: BiologyVolume): Promise<BiologyOriginalIndex> {
  const response = await fetch(`/data/biology-original-volume${volume}-index.json`);
  if (!response.ok || !(response.headers.get("content-type") ?? "").includes("application/json")) {
    throw new Error("The source index could not be loaded.");
  }
  return validateBiologyOriginalIndex(await response.json(), volume);
}

export async function verifyBiologySourcePdf(file: Blob, index: BiologyOriginalIndex): Promise<boolean> {
  if (!file.size || file.size > 40 * 1024 * 1024 || !globalThis.crypto?.subtle) return false;
  if (await file.slice(0, 5).text() !== "%PDF-") return false;
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  return hex === index.sourceSha256;
}

const DATABASE = "shtemarm-biology-source-local-v1";
const STORE = "pdfs";

/** Only verified source PDFs are stored on the student's device; never uploaded. */
function openLocalDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("Browser local storage unavailable")); return; }
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Local PDF storage unavailable"));
  });
}

async function localTransaction<T>(
  volume: BiologyVolume, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openLocalDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Local PDF operation failed"));
    });
  } finally { db.close(); }
}

export async function readLocalBiologyPdf(volume: BiologyVolume): Promise<Blob | undefined> {
  const file = await localTransaction<Blob | undefined>(volume, "readonly", store => store.get(volume));
  return file instanceof Blob ? file : undefined;
}

export async function saveLocalBiologyPdf(volume: BiologyVolume, file: Blob): Promise<void> {
  await localTransaction<IDBValidKey>(volume, "readwrite", store => store.put(file, volume));
}

export async function deleteLocalBiologyPdf(volume: BiologyVolume): Promise<void> {
  await localTransaction<undefined>(volume, "readwrite", store => store.delete(volume));
}
