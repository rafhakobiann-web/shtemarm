# Shtemarm Search Console & SEO: 2026-11-02

## Implemented in this PR
- The homepage document title now describes Shtemarm as a question-book and exam-preparation platform.
- The homepage Open Graph and Twitter titles/descriptions are more descriptive.
- The math game and study session routes render a visible H1 during normal activity, with the math game retaining an H1 on loading and error screens.
- Biology, History, English/Armenian exam builders, Physics resources, and active exam sessions already use an H1 through `ExamHero`, resource readers, or `HistorySession`. Do **not** add a second H1 to these routes merely to silence an outdated scan.
- Tests assert the heading ownership for these components.

## What cannot be completed by a code change alone
The root document already includes a `google-site-verification` HTML meta tag inside the head. This does **not** prove ownership has been verified in the Search Console account.

1. **Confirmed canonical public site (owner, 2026-11-02): `https://shtemarm.lovable.app/`.** This is the URL-prefix property to select or add in Search Console. The Vercel preview/alternate host is **not** the canonical production site; do not switch the canonical URL or sitemap to Vercel.
2. In [Google Search Console](https://search.google.com/search-console/), select/add the URL-prefix property for that exact origin. Use **HTML tag** verification, and compare its supplied token to the existing `google-site-verification` tag in `src/routes/__root.tsx`. Never replace a different owner's token blindly.
3. Confirm the correct build is **deployed** and the tag is visible in the unauthenticated live home page's HTML `<head>`; then click **Verify** in Search Console. A build on a Draft PR does not count as a published verification change.
4. After verification, inspect `https://shtemarm.lovable.app/robots.txt` and `https://shtemarm.lovable.app/sitemap.xml`. The existing robots.txt and sitemap generator already correctly use `https://shtemarm.lovable.app`; **no domain replacement is needed**. Do not submit a sitemap for the alternate Vercel host.
5. Submit the verified origin's `sitemap.xml` in Search Console, inspect the home page URL and request indexing only if necessary.
6. Rerun the page heading/metadata audit after the new build is live, including an unauthenticated mobile preview. Inspect the *rendered* document and ensure only one primary heading per page.

## Safety/limits
This PR does not change DNS, deployments, Search Console property membership, index status, the existing verification token, sitemap host, or robots.txt. Ownership verification and crawl results require the property owner and public hosting environment.
