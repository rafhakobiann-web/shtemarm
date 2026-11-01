/**
 * Bound the entire question-bank request, including JSON body consumption.
 * fetch() resolves after headers; clearing the timeout there can leave
 * response.json() pending forever on a stalled connection.
 */
export async function fetchBookResponse<T>(
  url: string,
  read: (response: Response) => Promise<T>,
  timeoutMs = 20_000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return await read(response);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("Շտեմարանի բեռնումը չափազանց երկար տևեց։ Ստուգիր կապը և փորձիր կրկին։");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
