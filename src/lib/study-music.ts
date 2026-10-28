import { useSyncExternalStore } from "react";

/**
 * YouTube music is embedded from the creator's official YouTube videos.
 * We do not intercept, download, re-stream or play YouTube audio via Howler.
 * Howler plays only our independently generated, original ambient WAV loops.
 */
export const STUDY_MUSIC_CHANNELS = [
  { id:"lofi", title:"Lofi Girl · Study radio", label:"Lo-fi · դասերի համար",
    description:"Հանգիստ ռիթմեր կենտրոնանալու և սովորելու համար", videoId:"jfKfPfyJRdk" },
  { id:"jazz", title:"Lofi Girl · Jazz radio", label:"Jazz lo-fi",
    description:"Ջազային մեղմ ռիթմեր՝ հանգիստ ընթերցման համար", videoId:"HuFYqnbVbzY" },
  { id:"synth", title:"Lofi Girl · Synthwave radio", label:"Synthwave",
    description:"Գործիքային էլեկտրոնային երաժշտություն", videoId:"MVPTGNGiI-4" },
] as const;

export const STUDY_AMBIENCE = [
  { id:"off", label:"Առանց միջավայրային ձայնի", description:"Միայն YouTube, եթե միացված է" },
  { id:"rain", label:"Մեղմ անձրև", description:"Գեներացված անձրևի աղմուկ" },
  { id:"brown", label:"Խորը մեղմ աղմուկ", description:"Ցածր հաճախականության հանգիստ ձայն" },
  { id:"white", label:"Սպիտակ աղմուկ", description:"Հավասարաչափ, չեզոք ֆոն" },
  { id:"ocean", label:"Ծովի ալիքներ", description:"Գեներացված մեղմ ալիքների շրշյուն" },
  { id:"fan", label:"Օդափոխիչ", description:"Մեղմ, կայուն մեխանիկական ֆոն" },
] as const;
export type StudyMusicChannel = (typeof STUDY_MUSIC_CHANNELS)[number]["id"];
export type AmbientScene = (typeof STUDY_AMBIENCE)[number]["id"];
export type StudyMusicSettings = {
  channel: StudyMusicChannel;
  ambience: AmbientScene;
  ambientVolume: number;
  youtubeEnabled: boolean;
  ambientEnabled: boolean;
};
export const STUDY_MUSIC_KEY = "shtemarm-study-sound-v2";
export const OLD_STUDY_MUSIC_KEY = "shtemarm-study-music-v1";
export const DEFAULT_STUDY_MUSIC: Readonly<StudyMusicSettings> = Object.freeze({
  channel:"lofi", ambience:"rain", ambientVolume:30,
  youtubeEnabled:false, ambientEnabled:false,
});
export function clampVolume(value:unknown):number {
  return typeof value==="number" && Number.isFinite(value)
    ? Math.max(0,Math.min(100,Math.round(value))) : DEFAULT_STUDY_MUSIC.ambientVolume;
}
function validChannel(id:unknown):id is StudyMusicChannel {
  return typeof id==="string"&&STUDY_MUSIC_CHANNELS.some(c=>c.id===id);
}
function validScene(id:unknown):id is AmbientScene {
  return typeof id==="string"&&STUDY_AMBIENCE.some(c=>c.id===id);
}
export function normalizeStudyMusic(value:unknown):StudyMusicSettings {
  const v=value && typeof value==="object"&&!Array.isArray(value)
    ? value as Partial<Record<keyof StudyMusicSettings,unknown>>:{};
  const ambience=validScene(v.ambience)?v.ambience:DEFAULT_STUDY_MUSIC.ambience;
  return {
    channel:validChannel(v.channel)?v.channel:DEFAULT_STUDY_MUSIC.channel,
    ambience,
    ambientVolume:clampVolume(v.ambientVolume),
    youtubeEnabled:v.youtubeEnabled===true,
    ambientEnabled:ambience!=="off"&&v.ambientEnabled===true,
  };
}
export function channelDetails(id:StudyMusicChannel){
  return STUDY_MUSIC_CHANNELS.find(x=>x.id===id)??STUDY_MUSIC_CHANNELS[0];
}
export function youtubeEmbedSrc(channel:StudyMusicChannel){
  const id=channelDetails(channel).videoId;
  // Privacy-enhanced YouTube player; includes native controls and attribution.
  return "https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&playsinline=1&controls=1&rel=0";
}
export function youtubeContentUrl(channel:StudyMusicChannel){
  return "https://www.youtube.com/watch?v="+channelDetails(channel).videoId;
}
function persisted(settings:StudyMusicSettings){
  return {channel:settings.channel,ambience:settings.ambience,ambientVolume:settings.ambientVolume};
}
export function readStudyMusic():StudyMusicSettings {
  if(typeof window==="undefined")return {...DEFAULT_STUDY_MUSIC};
  try {
    const stored=normalizeStudyMusic(JSON.parse(localStorage.getItem(STUDY_MUSIC_KEY)||"null"));
    // No audio, nor third-party iframe, should ever start on page refresh.
    return {...stored,youtubeEnabled:false,ambientEnabled:false};
  }catch{return {...DEFAULT_STUDY_MUSIC};}
}
let snapshot:StudyMusicSettings={...DEFAULT_STUDY_MUSIC};
const subscribers=new Set<()=>void>();
function notify(){for(const fn of subscribers)fn();}
function subscribe(fn:()=>void){subscribers.add(fn);return()=>{subscribers.delete(fn);};}
function getSnapshot(){return snapshot;}
function getServerSnapshot(){return DEFAULT_STUDY_MUSIC;}
export function useStudyMusic():StudyMusicSettings{
  return useSyncExternalStore(subscribe,getSnapshot,getServerSnapshot);
}
export function initStudyMusic(){
  snapshot=readStudyMusic();
  // The old song-specific Spotify selection must never be resurrected.
  try{localStorage.removeItem(OLD_STUDY_MUSIC_KEY);}catch{/* local storage optional */}
  notify();
  const onStorage=(event:StorageEvent)=>{
    if(event.key!==STUDY_MUSIC_KEY)return;
    const updated=readStudyMusic();
    // Keep explicit playback controls local to this tab when other tabs update preferences.
    snapshot={...updated,youtubeEnabled:snapshot.youtubeEnabled,ambientEnabled:snapshot.ambientEnabled};
    notify();
  };
  window.addEventListener("storage",onStorage);
  return()=>window.removeEventListener("storage",onStorage);
}
export function setStudyMusic(patch:Partial<StudyMusicSettings>){
  snapshot=normalizeStudyMusic({...snapshot,...patch});
  try{if(typeof window!=="undefined")
    localStorage.setItem(STUDY_MUSIC_KEY,JSON.stringify(persisted(snapshot)));
  }catch{/* settings survive within this tab */}
  notify();
}
