# Public-repository content and rights checklist

**Decision:** Do not change Shtemarm's source repository from private to public
until distribution rights are checked and sensitive assets are removed from both
the current tree and any reachable Git history.

## Materials that need review

The repository currently contains multiple full mathematics-book PDFs:
- `public/matem-1 (1).pdf`
- `public/matem-2 (1).pdf`
- `public/math/books/matem-1.pdf`
- `public/math/books/matem-2.pdf`

It also contains hundreds of scanned mathematics page images and text-derived
question banks for English, mathematics, history, physics, biology and other
subjects. Book covers, exam papers and illustrations may have separate rights.

These source files being in a private repo does **not** prove that they may be
redistributed through a public GitHub repository, public APK or source archive.

## Checklist before any public switch

- [ ] Confirm which book scans, question texts and exam papers are public domain,
      permissively licensed, created by Shtemarm or shared with documented
      redistribution permission.
- [ ] Remove content without publication rights from a prospective public repo.
- [ ] Use Git history cleanup or a fresh sanitized repository for previously
      committed unauthorized material; deleting files only from `main` does
      not remove earlier copies from Git history.
- [ ] Validate that the public website and Android app do not depend on removed
      private assets, or set up an appropriately licensed content distribution
      system.
- [ ] Keep server API keys, admin password, service-role key and Android signing
      keystore outside the repository.
- [ ] Check runtime server environment variables after removing tracked `.env`.
- [ ] Rerun current-file and historical key scans and inspect the results.
- [ ] Review production database policies and feedback/contact data access.

## Suggested architecture

Open-source code can be maintained separately from *licensed or private
question content*. A public app repository can contain Kotlin/React source,
generic test fixtures, translations, documentation and the explicitly
licensed Noto font files. Official books and scans should be distributed only
when Shtemarm has the appropriate rights.

The GitHub Actions security checks detect known credential formats, not
copyright ownership. They cannot certify the repository as legally
publishable.

Once every item is cleared, a repository administrator can use GitHub
Settings → General → Danger Zone → Change repository visibility.
