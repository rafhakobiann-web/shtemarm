# Shtemarm AI provider setup

Shtemarm supports optional server-side AI providers. No API keys are committed to this repository.

## Providers

Set one or more server-side environment variables:

- `GROQ_API_KEY` — Groq API key.
- `GEMINI_API_KEY` — Google Gemini API key.
- `OPENROUTER_API_KEY` — OpenRouter API key; the chat adapter uses the provider's `openrouter/free` model route.

The chat tries configured providers in order: Groq, Gemini, then OpenRouter. If none is configured or all fail, it returns a limited local study fallback. This keeps the chat endpoint responsive, but the fallback is not a generative model and cannot answer arbitrary questions.

Provider model names, free availability, and rate limits can change. Check the provider dashboard and terms before relying on a free tier. Do not use API keys copied from other GitHub repositories; they may be stolen, exposed, revoked, or billed to someone else.

## Where to add keys

Add keys as **server-side environment variables in the deployment platform**, not in browser code and not in GitHub source files.

1. Open the hosting/deployment project that builds the live Shtemarm site.
2. Find **Settings** or **Project Settings**, then **Environment Variables** / **Secrets**.
3. Add the variable name exactly as shown above and paste your own key as its value.
4. Enable it for the production environment (and preview/development if needed).
5. Save the settings and redeploy/restart the deployment so the server receives the new variable.
6. Test the chat. If one provider is out of quota, the code attempts the next configured provider.

If the site is deployed through Lovable, check the linked deployment's secrets/environment-variable settings; the exact location depends on where the app is hosted. If it is deployed on Vercel, use Project Settings → Environment Variables. Never prefix server-only keys with `VITE_` or expose them in client-side code.

## Local development

Create a local `.env.local` file (which must stay untracked) in the project root, for example:

```dotenv
GROQ_API_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
```

Paste keys only into your own local file. Do not commit that file. If a real key is ever committed or shared publicly, revoke it and create a new one.

## Limits and privacy

Multiple providers can improve availability but do not guarantee unlimited usage. Each provider can enforce quotas, rate limits, model availability, and usage policies. Avoid sending private student information to third-party model providers.
