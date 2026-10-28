# Security policy

Shtemarm is an active beta. Please report suspected credential leaks or
security vulnerabilities privately to the repository owner. Do **not** open a
public issue containing a token, password, student record, or exploit payload.

## Credential handling

- Configure `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`,
  `ADMIN_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL`
  only as server-side hosting environment variables / secrets.
- Never add server secrets to `VITE_*`, browser code, the APK, public assets,
  console logs, GitHub issues, or a source file.
- Supabase publishable keys are **not private credentials**. Protect data with
  Row Level Security and only expose intended policies.
- The tracked `.env` file was removed from the current branch and ignored.
  Its historical contents can still be fetched from old commits by anyone
  who gains repository access. If a private key was ever committed, revoke it
  and rewrite Git history before publishing.
- Keep any stable Android signing keystore and passwords in GitHub Actions
  Secrets. Do not commit or attach them to a release.
- Rotate any key you have pasted into an untrusted service or exposed in logs.

## Automated guardrails

```sh
node scripts/check-repo-secrets.mjs
python3 scripts/audit-git-history.py
```

The first gate checks tracked paths and known token patterns. The second scans
reachable Git blobs for known secret formats. They are not substitutes for a
manual audit of Git history, host configuration, database grants, user data
handling, source licenses, and deployed build artifacts.

## Before public visibility

1. Confirm production/preview environment variables are set in the hosting
   provider, independently of the removed `.env` file, and redeploy/test.
2. Review any earlier shared private keys and rotate them as necessary.
3. Run the current + historical credential scan; inspect results.
4. Review Supabase RLS policies and authentication/feedback endpoints.
5. Confirm you have permission to redistribute **all** question-bank content,
   math textbooks, uploaded PDFs, scans, and cover images.
6. Review GitHub Actions write permissions, branch protection and release
   assets. Public source files and all reachable Git history will be visible.
7. Only then, as an authorized repository administrator, use
   GitHub → Repository Settings → General → Danger Zone → Change repository visibility.

Do not paste secrets into ChatGPT messages to perform these steps.
