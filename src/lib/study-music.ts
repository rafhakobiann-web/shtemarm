import { useSyncExternalStore } from "react";

/**
 * Study music uses Spotify's own licensed iframe player.
 * No songs, audio bytes, access tokens or copied streams are hosted by Shtemarm.
 * Playback, looping and duration remain controlled by Spotify and the browser.
 */
export const STUDY_MUSIC_CHANNELS = [
  {
    id: "lofi", title: "Lo-fi beats", label: "Lo-fi · մեղմ երաժշտություն",
    description: "Հանգիստ գործիքային ռիթմեր՝ երկարատև սովորելու համար",
    spotifyId: "37i9dQZF1DWWQRwui0ExPn", type: "playlist",
  },
  {
    id: "nature", title: "Nature Noise", label: "Բնության ձայներ",
    description: "Անտառ, հոսող ջուր և մեղմ միջավայրային աղմուկ",
    spotifyId: "37i9dQZF1DWUKPeBypcpcP", type: "playlist",
  },
  {
    id: "rain", title: "Night Rain", label: "Անձրևի ձայներ",
    description: "Անձրև և բնական ձայնային միջավայր",
    spotifyId: "37i9dQZF1DXbcPC6Vvqudd", type: "playlist",
  },
  {
    // Verified Spotify collection starts with Naré's 2026 winning song BOO!.
    // We must not present a playlist as a single-track, endlessly looping embed.
    id: "boo", title: "Naré — BOO!", label: "Naré — BOO! · հաղթող երգ",
    description: "«Մանկական Եվրատեսիլ 2026»-ի հաղթող երգը՝ երգացանկի առաջինը",
    spotifyId: "2qPh5z0IizKEUMxFJLhYmY", type: "playlist",
  },
] as const;

export type StudyMusicChannel = (typeof STUDY_MUSIC_CHANNELS)[number]["id"];
export type StudyMusicSettings = { channel: StudyMusicChannel; enabled: boolean };
export const STUDY_MUSIC_KEY = "shtemarm-study-music-v1";
export const DEFAULT_STUDY_MUSIC: Readonly<StudyMusicSettings> = Object.freeze({
  channel: "lofi", enabled: false,
});

function isChannel(id: unknown): id is StudyMusicChannel {
  return typeof id === "string" && STUDY_MUSIC_CHANNELS.some(item => item.id === id);
}
export function normalizeStudyMusic(value: unknown): StudyMusicSettings {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { ...DEFAULT_STUDY_MUSIC };
  const v = value as Partial<Record<keyof StudyMusicSettings, unknown>>;
  return {
    channel: isChannel(v.channel) ? v.channel : DEFAULT_STUDY_MUSIC.channel,
    enabled: typeof v.enabled === "boolean" ? v.enabled : false,
  };
}
export function channelDetails(channel: StudyMusicChannel) {
  return STUDY_MUSIC_CHANNELS.find(item => item.id === channel) ?? STUDY_MUSIC_CHANNELS[0];
}
export function spotifyEmbedSrc(channel: StudyMusicChannel) {
  const source = channelDetails(channel);
  return "https://open.spotify.com/embed/" + source.type + "/" + source.spotifyId + "?theme=0";
}
export function spotifyContentUrl(channel: StudyMusicChannel) {
  const source = channelDetails(channel);
  return "https://open.spotify.com/" + source.type + "/" + source.spotifyId;
}
export function readStudyMusic(): StudyMusicSettings {
  if (typeof window === "undefined") return { ...DEFAULT_STUDY_MUSIC };
  try {
    return normalizeStudyMusic(JSON.parse(localStorage.getItem(STUDY_MUSIC_KEY) || "null"));
  } catch { return { ...DEFAULT_STUDY_MUSIC }; }
}

let snapshot: StudyMusicSettings = { ...DEFAULT_STUDY_MUSIC };
const subscribers = new Set<() => void>();
function notify() { for (const fn of subscribers) fn(); }
function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => { subscribers.delete(fn); };
}
function getSnapshot() { return snapshot; }
function getServerSnapshot() { return DEFAULT_STUDY_MUSIC; }

export function useStudyMusic(): StudyMusicSettings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
export function initStudyMusic() {
  snapshot = readStudyMusic();
  notify();
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STUDY_MUSIC_KEY) return;
    snapshot = readStudyMusic();
    notify();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
export function setStudyMusic(patch: Partial<StudyMusicSettings>) {
  snapshot = normalizeStudyMusic({ ...snapshot, ...patch });
  try { if (typeof window !== "undefined") localStorage.setItem(STUDY_MUSIC_KEY, JSON.stringify(snapshot)); }
  catch { /* Stay functional for this tab when storage is blocked. */ }
  notify();
}
