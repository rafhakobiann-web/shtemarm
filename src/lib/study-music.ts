/** Curated links verified against Spotify public embeds, October 2026.
 * All playback is served by Spotify. Do not proxy, download or host audio.
 */
export const STUDY_MUSIC_STORAGE_KEY = "shtemarm-study-music-v1";
export const STUDY_MUSIC_OPEN_EVENT = "shtemarm:open-study-music";

export const STUDY_MUSIC_CHANNELS = [
  {
    id: "lofi", kind: "playlist", spotifyId: "37i9dQZF1DWWQRwui0ExPn",
    name: "lofi beats", category: "lofi",
    description: "Spotify · mellow instrumental beats",
  },
  {
    id: "ambient", kind: "playlist", spotifyId: "37i9dQZF1DX3Ogo9pFvBkY",
    name: "Ambient Relaxation", category: "ambient",
    description: "Spotify · calm atmospheric music",
  },
  {
    id: "rain", kind: "playlist", spotifyId: "37i9dQZF1DXbcPC6Vvqudd",
    name: "Night Rain", category: "ambient",
    description: "Spotify · rain and occasional thunder",
  },
  {
    id: "nature", kind: "playlist", spotifyId: "37i9dQZF1DX4PP3DA4J0N8",
    name: "Nature Sounds", category: "ambient",
    description: "Spotify · forest, rain, and birds",
  },
  {
    id: "boo", kind: "album", spotifyId: "06MkkxRBZbQPmPRac45vkZ",
    name: "BOO! · Naré", category: "featured",
    description: "Junior Eurovision 2026 winner · 1-song single",
  },
] as const;
export type StudyMusicChannel = (typeof STUDY_MUSIC_CHANNELS)[number];
export type StudyMusicChannelId = StudyMusicChannel["id"];
export type StudyMusicCategory = StudyMusicChannel["category"];
export type StudyMusicPreference = { channel: StudyMusicChannelId };

/** Only curated playlist IDs and the verified one-track BOO! album may embed. */
export function studyMusicEmbedUrl(channel: StudyMusicChannel) {
  return "https://open.spotify.com/embed/" + channel.kind + "/" + channel.spotifyId + "?utm_source=generator";
}
export function studyMusicSpotifyUrl(channel: StudyMusicChannel) {
  return "https://open.spotify.com/" + channel.kind + "/" + channel.spotifyId;
}
export function isStudyMusicChannel(value: unknown): value is StudyMusicChannelId {
  return typeof value === "string" && STUDY_MUSIC_CHANNELS.some(item => item.id === value);
}
export function readStudyMusicPreference(): StudyMusicPreference {
  if (typeof window === "undefined") return { channel: "lofi" };
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(STUDY_MUSIC_STORAGE_KEY) ?? "null");
    if (data && typeof data === "object" && "channel" in data &&
        isStudyMusicChannel(data.channel)) return { channel: data.channel };
  } catch { /* The website stays usable in private or restricted browsers. */ }
  return { channel: "lofi" };
}
export function saveStudyMusicPreference(channel: StudyMusicChannelId) {
  try {
    window.localStorage.setItem(STUDY_MUSIC_STORAGE_KEY, JSON.stringify({ channel }));
  } catch { /* Only a device-side preference, never a requirement to listen. */ }
}
