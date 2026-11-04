/**
 * Server-only, tamper-evident context for Shtemarm's AI tutor.
 *
 * Incoming visitors never choose chat roles. The server signs prior generated
 * replies and returns an opaque, short-lived token kept only in React memory.
 * Forged, expired and oversized tokens are ignored: never promoted to "tutor"
 * context. No transcripts are stored in localStorage or in the database.
 */
import { z } from "zod";

const HISTORY_LIMIT = 12;
const TTL_MS = 3 * 60 * 60 * 1000; // 3 hours
const TOKEN_MAX_LENGTH = 56_000;

const HistoryMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
}).strict();
export type VerifiedChatTurn = z.infer<typeof HistoryMessage>;

const Session = z.object({
  version: z.literal(1),
  expires: z.number().int().positive(),
  turns: z.array(HistoryMessage).max(HISTORY_LIMIT),
}).strict();

function getSecret(): string | null {
  const secret = process.env["CHAT_CONTEXT_SIGNING_KEY"] ||
    process.env["SUPABASE_SERVICE_ROLE_KEY"];
  return secret && secret.length >= 32 ? secret : null;
}

async function getSigningKey() {
  const secret = getSecret();
  if (!secret) return null;
  return crypto.subtle.importKey("raw",
    new TextEncoder().encode("shtemarm:chat-context:v1:" + secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function toBase64Url(bytes: Uint8Array): string {
  let text = "";
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) throw new Error("invalid token encoding");
  const decoded = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(decoded, c=>c.charCodeAt(0));
}

export async function sealChatContext(turns: VerifiedChatTurn[]): Promise<string | undefined> {
  const key = await getSigningKey();
  if (!key) return undefined; // Single-turn tutoring still works without signing config.
  const valid = z.array(HistoryMessage).parse(turns.slice(-HISTORY_LIMIT));
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({
    version: 1, expires: Date.now() + TTL_MS, turns: valid,
  })));
  const signature = toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))));
  return payload.length + signature.length + 1 <= TOKEN_MAX_LENGTH ? payload + "." + signature : undefined;
}

export async function readChatContext(token?:string): Promise<VerifiedChatTurn[]> {
  if (!token || token.length > TOKEN_MAX_LENGTH) return [];
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return [];
    const [payload, signature] = parts as [string, string];
    const key = await getSigningKey();
    if (!key || signature.length < 40 || signature.length > 44) return [];
    const verified = await crypto.subtle.verify("HMAC", key,
      fromBase64Url(signature), new TextEncoder().encode(payload));
    if (!verified) return [];
    const record = Session.parse(JSON.parse(new TextDecoder().decode(fromBase64Url(payload))));
    if (record.expires <= Date.now() || record.expires > Date.now() + TTL_MS) return [];
    return record.turns;
  } catch {
    return [];
  }
}

