# 🗞️ Shtemarm — Changelog

> 📅 A dated, emoji-led record of product improvements. Incomplete work is explicitly marked as in progress.

> **Release status:** Items below describe code merged into GitHub unless marked **Draft**. A merged PR does not prove a successful CI run, signed APK, or deployment to Lovable Production. Check the linked PR and deployment before announcing a live release.

## 🟣 November 6, 2026 — Explore-first experience, lessons, math and mobile fixes
- 🧭 Introduced a simpler discovery-first Home, Explore hub, navigation and focused dashboard (PRs [#238](https://github.com/rafhakobiann-web/shtemarm/pull/238), [#239](https://github.com/rafhakobiann-web/shtemarm/pull/239), [#240](https://github.com/rafhakobiann-web/shtemarm/pull/240), [#241](https://github.com/rafhakobiann-web/shtemarm/pull/241)).
- 🧠 Added guided, near-full-screen AI explanation steps with borders, formula/diagram support, previous/next navigation and compact content-sized layouts (PRs [#242](https://github.com/rafhakobiann-web/shtemarm/pull/242), [#246](https://github.com/rafhakobiann-web/shtemarm/pull/246)).
- 📱 Addressed unresponsive mobile answer selections, tutor overlays blocking taps, and duplicate React keys in study modes (PRs [#244](https://github.com/rafhakobiann-web/shtemarm/pull/244), [#245](https://github.com/rafhakobiann-web/shtemarm/pull/245)).
- 🧮 Restored mathematics formula rendering and expanded the handbook to **59 rules**; original exercise accuracy remains a separate source-verification task (PR [#236](https://github.com/rafhakobiann-web/shtemarm/pull/236)).
- 🇬🇧 Added a more interactive landing-page English question demo based on actual book sections (PR [#247](https://github.com/rafhakobiann-web/shtemarm/pull/247)).
- 🔎 **Draft, not released:** Armenian Volume I syntax diagrams for 9 previously withheld questions were reconstructed in [PR #248](https://github.com/rafhakobiann-web/shtemarm/pull/248). Visual review, build checks and CI verification are still needed. **Do not count these as live without verification.**

## 🟣 November 5, 2026 — Learning hub, Armenian materials and landing polish
- 🎓 Introduced the Phase 4.2 learning hub with guided study tools, learning progress and tutor-related work (PR [#234](https://github.com/rafhakobiann-web/shtemarm/pull/234)).
- 📘 Imported and organized **1,682 source-indexed Armenian Volume I tasks**: **1,673 playable** at the time of that merge; **9 syntax diagrams** required visual restoration (PR [#226](https://github.com/rafhakobiann-web/shtemarm/pull/226)). **Volumes II–IV are not yet fully transcribed.**
- 🗣️ Improved the AI tutor's Armenian explanations, formula clarity and answer feedback (PR [#228](https://github.com/rafhakobiann-web/shtemarm/pull/228)).
- ✨ Worked on the animated landing page, signed-in experience and focused dashboard (PRs [#221](https://github.com/rafhakobiann-web/shtemarm/pull/221), [#222](https://github.com/rafhakobiann-web/shtemarm/pull/222), [#223](https://github.com/rafhakobiann-web/shtemarm/pull/223)).
- 🛠️ Addressed Lovable build/auth integration and root-route issues (PRs [#224](https://github.com/rafhakobiann-web/shtemarm/pull/224), [#227](https://github.com/rafhakobiann-web/shtemarm/pull/227)).
- 🧪 Visual and CI acceptance are distinct from merged GitHub changes; deployment is **not** asserted.

## 🟣 November 4, 2026 — Safer AI and adaptive learning
- 🛡️ Tightened feedback/chat authorization and AI-role security (PR [#210](https://github.com/rafhakobiann-web/shtemarm/pull/210)).
- 🔐 Required verified sign-in for usage-metered AI requests (PR [#211](https://github.com/rafhakobiann-web/shtemarm/pull/211)).
- 🧠 Developed learning-first tutor modes with reusable explanations and more flexible study sessions, subject to server-side usage limits (PRs [#208](https://github.com/rafhakobiann-web/shtemarm/pull/208), [#209](https://github.com/rafhakobiann-web/shtemarm/pull/209)).
- 📊 Added a personal learning dashboard and adaptive tutor preferences (PR [#214](https://github.com/rafhakobiann-web/shtemarm/pull/214)).
- 📱 Improved mobile flashcard gestures and navigation-dock touch handling (PR [#206](https://github.com/rafhakobiann-web/shtemarm/pull/206)).
- 🧪 A merged security change still requires configuration and deployment verification before its production protections can be claimed.

## 🟣 November 3, 2026 — Flashcards, goals, interface and security
- 🃏 Added swipeable flashcards: swipe left for known words and right to save words for review (PR [#199](https://github.com/rafhakobiann-web/shtemarm/pull/199)).
- 🎮 Added the first daily quests, achievements and gamification features (PR [#195](https://github.com/rafhakobiann-web/shtemarm/pull/195)).
- 📋 Worked on personal study plans, recovered legacy mistakes and a unified mistake-review sequence (PRs [#194](https://github.com/rafhakobiann-web/shtemarm/pull/194), [#193](https://github.com/rafhakobiann-web/shtemarm/pull/193), [#192](https://github.com/rafhakobiann-web/shtemarm/pull/192)).
- 🛡️ Fixed feedback authorization and blocked client-forged AI assistant roles at the code level (PR [#198](https://github.com/rafhakobiann-web/shtemarm/pull/198)).
- 📱 Improved responsive navigation, interactive motion and landing/dashboard experiences (PRs [#204](https://github.com/rafhakobiann-web/shtemarm/pull/204), [#205](https://github.com/rafhakobiann-web/shtemarm/pull/205), [#196](https://github.com/rafhakobiann-web/shtemarm/pull/196)).
- 🧬 Added **34 adapted Biology III practice questions** alongside **911 original source questions**; adapted items are not represented as verbatim originals (PR [#201](https://github.com/rafhakobiann-web/shtemarm/pull/201)).
- 🌐 Expanded Armenian/English/Russian UI localization and introduced the accessible website changelog page (PRs [#182](https://github.com/rafhakobiann-web/shtemarm/pull/182), [#179](https://github.com/rafhakobiann-web/shtemarm/pull/179)).

## 🟣 November 2, 2026 — Biology source work, Android and search
- 🧬 Integrated source text for **1,681 Biology III–IV questions** into standard study/test paths; other backlog and answer-verification tasks remain (PR [#162](https://github.com/rafhakobiann-web/shtemarm/pull/162)).
- 🗂️ Added biology backlog tracking, source-ID audits and safeguards for stable study routes (PR [#170](https://github.com/rafhakobiann-web/shtemarm/pull/170)).
- 📱 Prepared Android 0.3.2 UI localization, practice feedback and bookmark improvements (PRs [#173](https://github.com/rafhakobiann-web/shtemarm/pull/173), [#174](https://github.com/rafhakobiann-web/shtemarm/pull/174), [#175](https://github.com/rafhakobiann-web/shtemarm/pull/175)). **These commits are not proof of a published APK.**
- 🔎 Added clearer homepage/book-page headings and route-specific Open Graph/search descriptions (PR [#155](https://github.com/rafhakobiann-web/shtemarm/pull/155)). Google Search Console verification remains manual.
- 🧠 Started an administrative stored-explanation workflow and a reviewed-only explanation data policy; **generation and student-facing rollout were still pending**.

## 📱 October 29, 2026 — Android study goals and guided revision
- 🎯 Native Android daily question target: choose 5, 10, 15, 20 or 30; the home screen shows progress using completed sessions, with a local-day reset.
- 🧩 Suggested review of the weakest subject with at least five recorded answers, linked to the saved mistake review list. This is a local recommendation, not AI-generated question-by-question tutoring.
- 📚 Added three original worked mathematics examples (quadratics, arithmetic progressions, Pythagoras) and three step-by-step English grammar explanations (Future Perfect, Mixed Conditionals, articles), localized HY/EN/RU.
- ✨ Shorter screen transitions and horizontally scrollable daily-goal chips on narrow devices.
- 💾 Study target is included in compatible progress backups.
- 🧪 Daily goal tests added. **APK publication remains dependent on passing Android CI and signing verification.**

## 🟣 October 29, 2026 — Private messages and optional study reminders
- ✉️ Improved the existing website feedback flow so users can find “Message the developer” and see replies on the same browser. The admin inbox is protected by a server-side developer password.
- 🔐 Hardened password comparison and added a Supabase migration to remove direct public feedback table access. **Deployment requires applying the migration and configuring ADMIN_PASSWORD**; do not claim the production inbox is private until this is verified.
- 🔔 Added Android opt-in local study reminders, with notification permission on Android 13+, no notifications before three days of inactivity, and a maximum of one reminder every seven days.
- 🌐 Reminder text supports Armenian, English and Russian. Reminders can be disabled in Settings and do not upload usage history.
- 🧪 Added reminder scheduling-policy tests. **Android APK build, signing and publication remain pending.**

## 🟢 October 29, 2026 — Study guides, math lessons and personalization
- 📖 Expanded the English grammar handbook with eight trilingual topics: Future Perfect, Future Continuous, Past Perfect Continuous, mixed conditionals, either/neither/both, so/such/too/enough, adjective order, and each/every/all (PR #92).
- 🧠 Added step-by-step guidance, comparisons and common pitfalls in Armenian, English and Russian for those eight grammar topics (PR #93). Other topics still need the same depth.
- 🧮 Added two original worked mathematics lessons on the website: geometric progressions and inequalities with negative coefficients (PR #94).
- 📱 Added six offline math reference topics to the native Android study guide in Armenian, English and Russian (PR #94). **This code change does not itself publish a new APK.**
- 🎨 Added a device-local username field to website personalization settings. **No public leaderboard is live yet**; secure account-based scoring and opt-in are still required (PR #94).
- 🧹 Removed the unnecessary “without AI” wording from the English and math handbook subtitles (PR #94).
- 📐 Applied a mobile viewport overflow fix to reduce unwanted empty space on the right; device-side confirmation remains necessary (PR #91).
- 🔎 **Still in progress:** complete source-verified per-question math and English explanations, broader grammar coverage, cross-device profile sync, leaderboard security, and an installable signed Android update.

## 🟢 October 28, 2026 — Website 0.1.1 stability fixes
- 🧭 Fixed the mobile Liquid Glass navigation highlight: it now moves the full width of a tab instead of one-fifth of a tab.
- 🧪 Added five-position navigation regression tests to prevent the highlight from drifting again.
- 🔐 Prevented stale authentication responses from overwriting a newer account state in the website header.
- 🌐 Localized the 404 page and recoverable error screen in Armenian, English and Russian.
- 🐛 Removed malformed JSX in the Support page that prevented the entire website from building.
- 🏗️ Expanded website CI triggers to cover Support page changes as well as mobile navigation; production-build verification is tracked in GitHub Actions.
- 📱 This is a **website-only** patch, separate from Android version 0.1.1.

## 🟣 October 28, 2026 — Android smoothness and saved-question fix
- 📱 Android: screen changes now fade instead of snapping.
- 🎨 Android: answer choices animate their correct/wrong colours, and the session progress bar animates between questions.
- 🗂️ Android: subject lists expand and collapse with motion, and the chevron rotates.
- 🐛 Android: removing a question from the saved list no longer reloads every book and blanks the list.
- 🧪 Build verification for these changes is pending the Android debug APK workflow, because the local sandbox cannot reach the Android SDK or Gradle.

## 🟢 October 28, 2026 — Android 0.1.1 beta stability update
- 🧪 Prepared Android 0.1.1-beta.1 (versionCode 4) with automated Kotlin scoring tests.
- ✅ Prevent repeated answer taps and duplicate score/session recording.
- 📚 Load bookmarked questions directly from their source books rather than rescanning every book.
- ⚡ Cache parsed question lists and retain polished Liquid Glass transitions.
- 💾 Add local JSON progress backup and restore in Settings for future reinstallation.
- 🛠️ Improve exam, game, and study-tool question loading when a source book is missing.
- 🔐 Keep the release private; debug signatures can differ between CI runs, so upgrading from 0.1.0 may require uninstalling and losing stored progress.
- 🧾 Some question books and exam formats are still incomplete; this is a stability beta, not a production release.

## 🟣 October 26, 2026 — English vocabulary expansion
- 📚 Added **1,104 English–Armenian dictionary entries** in two commits: 649, then 455.
- 🧹 Existing dictionary keys were excluded during those additions to reduce duplicates.
- 🛠️ Fixed a missing comma in the expanded dictionary that caused the Vercel production build to fail; a fresh deployment is still needed to confirm the build passes.
- 🧪 Fixed generated-test ordering so expanded questions return in original book/question order, and added scoring regression tests for multiple choice, numeric, set, sequence, and matching answers.
- 💾 Hardened progress saving so blocked browser storage or failed remote sync does not interrupt in-memory progress updates.
- 🚦 **Validation pending:** test execution and production build confirmation are still blocked by the current Vercel build-rate limit.
- 🔎 **Still in progress:** audit all three English books against the dictionary and calculate the exact number of untranslated forms. The new-entry count is not a verified coverage percentage.

## 🔵 October 25, 2026 — Platform usability and fixes
- 📱 Homepage and mobile-layout redesign work was recorded in the recent change set.
- ⚡ Loading/history and mini-game improvements were included in recent pull-request work.
- 🛠️ A math-books crash fix was recorded; complete math content and official-answer verification remain unfinished.

## 🟢 October 23, 2026 — Math content reconstruction
- ✍️ Started replacing screenshot-based math material with selectable text reconstructed from the supplied books.
- 🧮 The first reconstructed task was committed; complete exercise coverage and official-answer checks remain in progress.

## 🟡 October 20, 2026 — English learning tools
- 🎯 Configurable A1–C1 level-test work and English-to-Armenian vocabulary support are part of the platform's learning experience.
- 🧪 Exam-format validation, question/answer integrity checks, and durable AI explanation caching remain items to verify.

## 🧭 Current priorities
- 📖 Complete a word-by-word coverage audit for all three English books, then continue adding accurate Armenian translations.
- 🧮 Expand math exercises from both books and verify answers against the source material.
- 🧠 Verify AI explanations and caching without promising unlimited external API usage.
- 🧪 Continue regression checks for test structure, scoring, and answer integrity.
- 🗂️ Keep future entries dated, with an emoji at the start of every bullet.