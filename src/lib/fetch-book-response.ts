/**
 * Bound network waits when loading a question bank. A stalled connection must
 * never leave a study page spinning indefinitely.
 */
export async function fetchBookResponse(url: string, timeoutMs = 20_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Շտեմարանի բեռնումը չափազանց երկար տևեց։ Ստուգիր կապը և փորձիր կրկին։");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
