/** Pure gesture rules shared by touch previews and their regression tests. */
export type PreviewDirection = -1 | 0 | 1;

export function previewSwipeDirection(dx: number, dy: number): PreviewDirection {
  // A deliberate horizontal swipe only. Vertical reading remains native.
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return 0;
  if (Math.abs(dx) <= 55 || Math.abs(dx) <= Math.abs(dy) * 1.25) return 0;
  return dx < 0 ? 1 : -1;
}

export function previewIndex(current: number, direction: PreviewDirection, length: number): number {
  if (!Number.isInteger(current) || !Number.isInteger(length) || length <= 0) return 0;
  return ((current + direction) % length + length) % length;
}
