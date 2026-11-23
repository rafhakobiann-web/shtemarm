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

## Publish a signed APK on the website

Use the manual workflow
[`Build and publish signed Shtemarm Android release`](../.github/workflows/android-signed-release.yml)
from the `main` branch. It defaults to building version **0.4.0 (code 13)**
as a private Actions artifact. To publish it publicly, enable **Publish to
website** and confirm both that you have permission to redistribute all
bundled textbook-derived content and that the replacement is approved.

The workflow requires the four persistent signing secrets:
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`. For a public update, it
also checks that the new APK has the exact same signing certificate as the
currently public APK, the same package name, and a higher version code. It
stops without changing the website if any check fails.

When approved checks pass, the workflow updates
`public/downloads/shtemarm-android.apk` and
`public/downloads/android-release.json` on `main`. The website's
`/download` page reads that manifest and enables its same-origin APK link
after the site host deploys the files. This does not make the GitHub repository
public.

Never publish a fresh CI debug-signed APK: its signature can differ between
builds and prevent Android from updating an existing installation.

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
