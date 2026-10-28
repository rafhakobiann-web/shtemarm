# Shtemarm · Սովորիր վստահ, պատրաստվիր խելացի

Shtemarm is an Armenian-language exam-preparation platform with a website and a
**native Kotlin / Jetpack Compose Android application**. It offers book-based
study, themed practice, test generation and interactive learning tools.

> **Status:** Active beta. Book digitization and official exam equivalence are not
> complete. Study tests are not an official certificate or GԹԿ-issued exam.

## Android app

- Native Jetpack Compose UI — not a WebView of the website.
- Website-inspired Academy layout and Liquid Glass / Academic / Classic appearances.
- Bundled, OFL-licensed Noto Sans Armenian and Noto Serif Armenian fonts.
- Offline book question banks, practice sessions, bookmarks and local progress.
- Mini-games, vocabulary, English-level practice, basic mathematics reader and study tools.

**First private beta release:** [Shtemarm Android v0.1.0-beta.1](https://github.com/rafhakobiann-web/shtemarm/releases/tag/v0.1.0-beta.1).

Build locally with Java 17, Gradle 8.9 and Android SDK 35:

```sh
cd android
gradle --no-daemon assembleDebug
```

The GitHub workflow `.github/workflows/android-debug-apk.yml` also builds an
installable debug APK. See [beta release notes](docs/ANDROID_BETA_RELEASE.md).
Debug-signed betas are **not Google Play production releases**.

## Website

The website uses TypeScript, React, TanStack Start, Vite, Tailwind, and Supabase.

```sh
npm install
cp .env.example .env
# Provide publishable client variables for local development, and set
# server-only credentials in your deployment platform's secret store.
npm run dev
```

Never commit `.env` files, private keys, keystores, service-account credentials,
or provider API tokens. The `.env.example` file contains placeholders only.
Supabase **publishable** keys are intended for client use; secure your data using
Supabase Row Level Security. Keep all service-role, Gemini, Groq, OpenRouter and
admin credentials on the server.

## Validation and security

- `node scripts/check-repo-secrets.mjs` checks tracked secret files and known key patterns.
- `python3 scripts/audit-git-history.py` checks reachable Git objects for known
  credential formats.
- `python3 android/scripts/validate_assets.py` checks bundled question files,
  English gap-fills, vocabulary and language-level data.
- GitHub Actions runs the checks before publishing the Android beta.

**Important:** These checks do not guarantee a secret-free history. Rotate any
credential ever accidentally published, check deployment variables and review
all historical changes before changing repository visibility.

## Questions and third-party materials

The repository includes textbook-derived questions, PDFs and page images.
**Redistribution rights need to be confirmed before making the repository public
or distributing source-book assets to new users.** Do not assume that a source
file's inclusion in this repository provides a license to republish it.

The bundled Noto fonts retain their SIL Open Font License text in
`android/licenses/`. No general copyright license for the repository's other
content is asserted by this README.

## Roadmap

Priorities include improved official exam structure accuracy, missing Biology
volumes 3–4, verified mathematics answers, full native feature parity,
accessibility, stable release signing and account synchronization.
