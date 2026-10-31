# Shtemarm Android — Editorial Liquid Glass visual direction

The user approved these seven choices, in order:

1. **E: Complete Visual Redesign** — glass, layout, typography, icons, colors, and motion.
2. **A: Pure iOS-style Interface** — well-structured native layout, without copying Apple's assets or branding.
3. **C: Refractive Liquid Glass** — true source-backed blur, geometric glass refraction and responsive lighting.
4. **C: Premium Editorial** — Noto Serif Armenian headings, Noto Sans Armenian body and functional controls.
5. **B: Fluid Liquid Motion** — spring transitions, gently animated light, responsive controls.
6. **E: Complete Theme Studio** — adjust palette, background style, blur radius, clarity/transparency and reflections.
7. **A: Visual Quality First** — judge screenshots and actual use before performance/release optimization.

## Prototype in PR #131

- Dedicated moving Glass Lab under Settings to make source-backed blur visually observable.
- Haze v1.6.2 blur captured by a local HazeState, adjustable on Android 12+ (older Android uses fallback).
- Replaces home hero's old saturated green banner with a lighter translucent editorial card and clean action hierarchy.
- Serif headings for major sections and a lighter top brand; fluid tab spring across glass presets.
- Three backdrop palettes, blur, clarity and reflection controls, persisted in native preferences and progress backups.

## Not complete and must not be advertised as finished

- **No real refractive displacement shader**: Haze v1 supplies captured backdrop blur, not an Apple-like refraction shader. Haze 2's separate Glass effect requires Kotlin/Compose toolchain migration and careful device verification.
- Only limited navigation and preview glass surfaces receive true captured blur; moving content behind all screens and comprehensive layout redesign remain open.
- Screenshots, contrast, accessibility, frame timings, battery and actual upgrade signing compatibility must be verified on Android hardware.
- User requested Visual Quality First, not premature release. Retain the Shtemarm name and **do not** modify Lovable, website Preview, Production or current published APK.

## Next development gates

1. Verify this exact PR head compiles and all Android CI checks pass.
2. Test Glass Lab with contrasting moving sources; compare screenshots and video with user's desired material.
3. Resolve toolchain prerequisites for genuine refraction; experiment in an isolated Draft PR, with non-refraction fallback.
4. Redesign remaining Screens/Books/Exams/Tools with content readability and accessible reduced-motion modes.
5. Measure jank and battery after the visual direction is approved, then build a properly signed release candidate.

Do not change users' existing locally stored study data or assume a debug CI APK can be installed over another runner's debug APK.
