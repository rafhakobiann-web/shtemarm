/** Published-on-main counts must match bio-book3/4; verified by tests.
 * Draft values live on a separate, unmerged review branch and are NOT playable.
 */
export const BIOLOGY_SOURCE_PROGRESS = [
  { volume: 3, bookId: 33, originalTasks: 1837, availableOnMain: 945,
    stagedInReviewBranch: 277, sourceReviewOnly: 615, sourceSha256: "adc0ddf59fa1008d6dd50f8d41583e44aa7161d2e23bc83f62b4c482e0722b93" },
  { volume: 4, bookId: 34, originalTasks: 1688, availableOnMain: 777,
    stagedInReviewBranch: 258, sourceReviewOnly: 653, sourceSha256: "9e0ec096451705d5a5b80da9c0c4ca405f888a7a39c6572b5f63aac180ce597e" },
] as const;
