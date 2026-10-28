# Shtemarm: website download and scrolling performance

## Visible download entry point

The Shtemarm website now has a permanent **Download app** button in the
header on mobile and desktop, a matching main-menu entry, and a homepage
callout. They all lead to `/download`.

The download page offers:
- **Install website** — uses Chrome's browser installation prompt when available;
  otherwise gives Android/iOS home-screen instructions. This is a web shortcut,
  not the offline Kotlin APK.
- **Android APK beta** — links to the existing private GitHub pre-release for
  authorized testers until a public APK has been explicitly approved.
- **Public Android download** — appears automatically when the public website
  serves `/downloads/android-release.json` pointing to an approved APK, or when
  the website's public `VITE_ANDROID_APK_URL` is configured.

Do not add a GitHub access token or any server secret to `VITE_*`; these values
are public in the browser.

## Option: publish a test APK on the website

The separate workflow
[`Publish approved Android beta to Shtemarm website`](../.github/workflows/publish-android-web-download.yml)
is **manual only** and keeps the GitHub repository private.

**Before running it**, confirm you have permission to redistribute all content
embedded in the APK (including textbook-derived questions), and understand that
the current beta uses a debug signature that may change between builds.

1. Open GitHub → Shtemarm → Actions → **Publish approved Android beta to Shtemarm website**.
2. Choose **Run workflow** from `main`.
3. Review both confirmation checkboxes. Only select them if they are true.
4. The workflow checks tracked files and Git history for known credential formats,
   validates bundled question data, compiles the current native Android app, and
   writes `public/downloads/shtemarm-android.apk` and
   `public/downloads/android-release.json` to `main`.
5. Once the website host successfully deploys those files, the download page
   detects the manifest and enables a same-origin APK download.

The workflow does **not** make the repository public, expose GitHub credentials,
or create a production-signed Android release. Publishing the APK publicly is
independent of making GitHub source code visible.

For stable long-term app updates, configure the signed Android release pipeline
with a dedicated persistent keystore before distributing a production version.
See [Android beta release](ANDROID_BETA_RELEASE.md).

## Scroll improvements

### Website
- The mobile Liquid Glass dock uses a smaller blur radius on touch devices and
  retains gradient highlights, limiting repeated GPU background filtering.
- The dock's compression waits for approximately 48px of consistent movement
  rather than responding to minor finger jitter.
- Home-section detection samples after approximately 80px of movement instead
  of measuring layouts on every animation frame.
- Scroll-induced shadows, hover effects and unrelated glass repaints have been
  reduced for touch devices, while accessibility opt-outs remain respected.

### Native Android
- Liquid Glass edge gradients use Compose `drawWithCache` rather than
  rebuilding GPU shaders for each draw.
- Book data is cached in a **bounded four-book LRU** to avoid repeated parsing
  of large offline question banks.
- Lists have stable item keys and independent scroll positions.
- Every new study question starts at the beginning of its content; removing a
  saved question no longer rescans every book immediately.

The optimization changes were verified by the website test/build workflow and
the Android debug APK build. Device-specific smoothness still requires actual
scroll/FPS testing on representative Android phones.
