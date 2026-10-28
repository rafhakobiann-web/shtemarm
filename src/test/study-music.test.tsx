import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import {
  STUDY_MUSIC_CHANNELS, STUDY_AMBIENCE, STUDY_MUSIC_KEY,
  OLD_STUDY_MUSIC_KEY, DEFAULT_STUDY_MUSIC,
  normalizeStudyMusic, youtubeEmbedSrc, youtubeContentUrl, readStudyMusic,
  initStudyMusic, setStudyMusic, clampVolume,
} from "@/lib/study-music";
import { generateAmbientSamples, encodeMonoWav, loadHowler } from "@/lib/study-ambience";
import { StudyMusicDock, StudyMusicSettings } from "@/components/StudyMusicDock";

describe("study mixer: official YouTube + local Howler.js ambient audio",()=>{
  let clean:()=>void=()=>{};
  beforeEach(()=>{
    window.localStorage.clear();
    clean=initStudyMusic();
    setStudyMusic({...DEFAULT_STUDY_MUSIC});
  });
  afterEach(()=>{
    clean();
    delete window.Howl;
    vi.restoreAllMocks();
  });

  it("removes the former song-based Spotify option and uses only trusted YouTube IDs",()=>{
    expect(STUDY_MUSIC_CHANNELS.map(c=>c.id)).toEqual(["lofi","jazz","synth"]);
    expect(STUDY_MUSIC_CHANNELS.every(c=>/^[A-Za-z0-9_-]{11}$/.test(c.videoId))).toBe(true);
    expect(STUDY_AMBIENCE.map(c=>c.id)).toEqual(["off","rain","brown","white","ocean","fan"]);
    expect(normalizeStudyMusic({channel:"boo",youtubeEnabled:true}).channel).toBe("lofi");
    expect(normalizeStudyMusic({channel:"javascript:alert(1)"}).channel).toBe("lofi");
    for(const c of STUDY_MUSIC_CHANNELS){
      expect(youtubeEmbedSrc(c.id)).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/[a-zA-Z0-9_-]{11}\?/);
      expect(youtubeContentUrl(c.id)).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
    }
    const source=readFileSync("src/components/StudyMusicDock.tsx","utf8");
    expect(source).not.toMatch(/spotify|Naré|BOO!/i);
    expect(readFileSync("src/lib/study-music.ts","utf8")).not.toMatch(/spotifyEmbedSrc|BOO!/);
  });

  it("never autoplays YouTube nor the ambience after mounting or page reload",()=>{
    expect(DEFAULT_STUDY_MUSIC.youtubeEnabled).toBe(false);
    expect(DEFAULT_STUDY_MUSIC.ambientEnabled).toBe(false);
    render(<StudyMusicDock/>);
    expect(screen.queryByTitle(/^YouTube ·/)).not.toBeInTheDocument();
    expect(document.querySelector('script[data-study-audio-library="howler"]')).toBeNull();
    setStudyMusic({channel:"jazz",ambience:"ocean",ambientVolume:45,
      youtubeEnabled:true,ambientEnabled:true});
    expect(readStudyMusic()).toEqual({
      channel:"jazz",ambience:"ocean",ambientVolume:45,
      youtubeEnabled:false,ambientEnabled:false,
    });
    expect(JSON.parse(localStorage.getItem(STUDY_MUSIC_KEY)||"{}")).not.toHaveProperty("youtubeEnabled");
    expect(JSON.parse(localStorage.getItem(STUDY_MUSIC_KEY)||"{}")).not.toHaveProperty("ambientEnabled");
  });

  it("removes the legacy Spotify configuration instead of restoring a deleted song",()=>{
    window.localStorage.setItem(OLD_STUDY_MUSIC_KEY,JSON.stringify({channel:"boo",enabled:true}));
    const stop=initStudyMusic();
    expect(localStorage.getItem(OLD_STUDY_MUSIC_KEY)).toBeNull();
    expect(readStudyMusic().channel).toBe("lofi");
    stop();
  });

  it("remembers only allowed preferences and clamps volume safely",()=>{
    expect(clampVolume(-50)).toBe(0);
    expect(clampVolume(144)).toBe(100);
    expect(clampVolume(Number.NaN)).toBe(30);
    expect(normalizeStudyMusic({ambience:"off",ambientEnabled:true}).ambientEnabled).toBe(false);
    expect(normalizeStudyMusic({ambientEnabled:"true"}).ambientEnabled).toBe(false);
    setStudyMusic({channel:"synth",ambience:"brown",ambientVolume:75});
    expect(readStudyMusic().channel).toBe("synth");
    expect(readStudyMusic().ambience).toBe("brown");
    expect(readStudyMusic().ambientVolume).toBe(75);
    localStorage.setItem(STUDY_MUSIC_KEY,"broken");
    expect(readStudyMusic()).toEqual(DEFAULT_STUDY_MUSIC);
  });

  it("mounts one official YouTube player after clicking Start and unloads when stopped",()=>{
    render(<StudyMusicDock/>);
    fireEvent.click(screen.getByRole("button",{name:"Ուսման ձայնային միջավայր"}));
    expect(screen.getByRole("heading",{name:"Ուսման ձայնային միջավայր"})).toBeInTheDocument();
    expect(screen.queryByTitle(/^YouTube ·/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Միացնել YouTube-ը"}));
    const iframe=screen.getByTitle(/^YouTube ·/);
    expect(iframe).toHaveAttribute("src",youtubeEmbedSrc("lofi"));
    expect(iframe).toHaveAttribute("allow",expect.stringContaining("autoplay"));
    expect(screen.getAllByTitle(/^YouTube ·/)).toHaveLength(1);
    fireEvent.change(screen.getByLabelText("YouTube երաժշտություն"),{target:{value:"jazz"}});
    expect(screen.getByTitle(/^YouTube ·/)).toHaveAttribute("src",youtubeEmbedSrc("jazz"));
    expect(screen.getAllByTitle(/^YouTube ·/)).toHaveLength(1);
    fireEvent.click(screen.getByRole("button",{name:"Փակել պատուհանը"}));
    expect(screen.queryByTitle(/^YouTube ·/)).not.toBeInTheDocument();
  });

  it("allows independent source and volume choices from Focus Mode",()=>{
    render(<StudyMusicSettings/>);
    fireEvent.click(screen.getByRole("button",{name:"Jazz lo-fi"}));
    expect(readStudyMusic().channel).toBe("jazz");
    fireEvent.click(screen.getByRole("button",{name:"Ծովի ալիքներ"}));
    expect(readStudyMusic().ambience).toBe("ocean");
    fireEvent.change(screen.getByRole("slider",{name:"Միջավայրային ձայնի ուժգնությունը"}),{
      target:{value:"60"},
    });
    expect(readStudyMusic().ambientVolume).toBe(60);
  });
});

describe("original procedural ambient audio (not copied from YouTube)",()=>{
  it("creates reproducible sound loops with no clipping and silent endpoints",()=>{
    const kinds=["rain","brown","white","ocean","fan"] as const;
    const hashes=new Set<number>();
    for(const kind of kinds){
      const pcm=generateAmbientSamples(kind);
      expect(pcm.length).toBe(16000*12);
      expect(pcm[0]).toBe(0);
      expect(pcm[pcm.length-1]).toBe(0);
      let nonzero=0;
      let sum=0;
      for(let i=0;i<pcm.length;i+=227){
        if(pcm[i]!==0)nonzero++;
        expect(Math.abs(pcm[i]!)).toBeLessThanOrEqual(1);
        sum+=pcm[i]!*Math.sin(i*0.083);
      }
      expect(nonzero).toBeGreaterThan(50);
      hashes.add(Math.round(sum*1000));
    }
    expect(hashes.size).toBe(5);
  });

  it("encodes mono PCM into a genuine, loopable WAV file",async()=>{
    const blob=encodeMonoWav(new Float32Array([0,1,-1,0]),16000);
    expect(blob.type).toBe("audio/wav");
    expect(blob.size).toBe(52);
    const bytes=new DataView(await blob.arrayBuffer());
    const text=(offset:number)=>String.fromCharCode(
      bytes.getUint8(offset),bytes.getUint8(offset+1),
      bytes.getUint8(offset+2),bytes.getUint8(offset+3));
    expect(text(0)).toBe("RIFF");
    expect(text(8)).toBe("WAVE");
    expect(text(36)).toBe("data");
    expect(bytes.getUint32(24,true)).toBe(16000);
    expect(bytes.getUint32(40,true)).toBe(8);
  });

  it("vendors the actual MIT-licensed Howler.js release, loaded lazily",()=>{
    expect(readFileSync("public/vendor/howler.core.min.js","utf8")).toContain("howler.js v2.2.4");
    expect(readFileSync("public/vendor/HOWLER-LICENSE.md","utf8")).toContain("Permission is hereby granted");
    expect(readFileSync("src/lib/study-ambience.ts","utf8")).toContain('src:[url],format:["wav"]');
  });
});
