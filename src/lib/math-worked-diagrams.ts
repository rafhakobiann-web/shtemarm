import type { DiagramSpec } from "@/components/MathDiagram";

/**
 * Only attach a drawing to a WORKED EXAMPLE with known measurements.
 * Never imply these educational sketches reproduce an unrelated original-book task.
 */
const WORKED_EXAMPLE_DIAGRAMS: Readonly<Record<string, DiagramSpec>> = {
  "linear-function": { type: "function", shape: "linear", a: 2, b: 1, c: 0,
    title: "y = 2x + 1 · A(1,3), B(3,7)" },
  "quadratic-function": { type: "function", shape: "quadratic", a: 1, b: -4, c: 1,
    title: "y = x² − 4x + 1 · գագաթը (2,−3)" },
  "geometry-pythagoras": { type: "right-triangle", legA: "8", legB: "6", hypotenuse: "c = 10",
    title: "Ուղղանկյուն եռանկյուն․ էջերը 6 և 8, ներքնաձիգը 10" },
  "geometry-area": { type: "triangle-height", base: "10", height: "6",
    title: "Եռանկյան մակերես․ հիմք 10, բարձրություն 6" },
  "geometry-circles": { type: "circle", radius: "3", title: "Շրջան՝ r = 3" },
  "stereometry-prism": { type: "solid", shape: "cylinder", radius: 2, height: 5,
    title: "Գլան․ r = 2, h = 5, V = 20π" },
  "stereometry-pyramid": { type: "solid", shape: "cone", radius: 3, height: 4,
    title: "Կոն․ r = 3, h = 4, V = 12π" },
  "vectors": { type: "vectors", ax: 2, ay: -1, bx: 3, by: 4,
    title: "a=(2,−1), b=(3,4), a+b=(5,3)" },
};
export function diagramForWorkedExample(topicId: string): DiagramSpec | null {
  return WORKED_EXAMPLE_DIAGRAMS[topicId] ?? null;
}
