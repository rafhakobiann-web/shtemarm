import type { AmbientScene } from "@/lib/study-music";

/**
 * Procedurally generated audio, owned by Shtemarm. No external sound files.
 * The WAV is created on demand after the learner opts in (about 375 KiB).
 * It runs through the bundled MIT-licensed Howler.js, NOT YouTube streams.
 */
const SAMPLE_RATE=16000;
const DURATION=12;
const SAMPLES=SAMPLE_RATE*DURATION;
export type AmbientKind=Exclude<AmbientScene,"off">;
export function generateAmbientSamples(kind:AmbientKind):Float32Array{
  const buffer=new Float32Array(SAMPLES);
  let seed=kind==="rain"?91:kind==="brown"?237:kind==="white"?743:
    kind==="ocean"?1249:2039;
  const noise=()=>{
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    return seed/2147483648-1;
  };
  let brown=0,wind=0,soft=0;
  for(let i=0;i<SAMPLES;i++){
    const t=i/SAMPLE_RATE;
    const white=noise();
    brown=Math.max(-1,Math.min(1,brown*0.994+white*0.024));
    wind=wind*0.987+white*0.013;
    soft=soft*0.85+white*0.15;
    let value=0;
    switch(kind){
      case "white":
        value=white*0.24;break;
      case "brown":
        value=brown*0.6;break;
      case "rain":{
        const swell=0.65+0.35*Math.sin(t*2.1)**2;
        const drops=(noise()>0.994?white*0.13:0);
        value=(soft*0.36+white*0.11+drops)*swell;
        break;
      }
      case "ocean":{
        const wave=Math.pow(0.5+0.5*Math.sin(2*Math.PI*t/5.8),1.45);
        value=(white*0.10+soft*0.27+brown*0.24)*(0.18+wave*0.80);
        break;
      }
      case "fan":{
        const hum=Math.sin(2*Math.PI*93*t)*0.055+
          Math.sin(2*Math.PI*186*t)*0.025;
        value=wind*0.35+soft*0.16+hum;
        break;
      }
    }
    // Gentle crossfade at boundaries prevents sharp loop pops.
    const edge=Math.min(1,i/(SAMPLE_RATE*0.2),(SAMPLES-i-1)/(SAMPLE_RATE*0.2));
    buffer[i]=Math.max(-1,Math.min(1,value*Math.max(0,edge)));
  }
  return buffer;
}
export function encodeMonoWav(pcm:Float32Array,sampleRate=SAMPLE_RATE):Blob {
  const bytes=new ArrayBuffer(44+pcm.length*2);
  const view=new DataView(bytes);
  const ascii=(position:number,characters:string)=>{
    for(let i=0;i<characters.length;i++)view.setUint8(position+i,characters.charCodeAt(i));
  };
  ascii(0,"RIFF");view.setUint32(4,bytes.byteLength-8,true);
  ascii(8,"WAVE");ascii(12,"fmt ");
  view.setUint32(16,16,true);view.setUint16(20,1,true);
  view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);
  view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
  ascii(36,"data");view.setUint32(40,pcm.length*2,true);
  for(let i=0;i<pcm.length;i++){
    const sample=Math.max(-1,Math.min(1,pcm[i]!));
    view.setInt16(44+i*2,sample<0?Math.round(sample*32768):Math.round(sample*32767),true);
  }
  return new Blob([bytes],{type:"audio/wav"});
}
export function ambientWavUrl(kind:AmbientKind):string{
  return URL.createObjectURL(encodeMonoWav(generateAmbientSamples(kind)));
}

type HowlerOptions={
  src:string[];format:string[];loop:boolean;volume:number;
  onloaderror?:(id:number,error:unknown)=>void;
  onplayerror?:(id:number,error:unknown)=>void;
};
export type HowlPlayer={
  play:()=>number; stop:()=>unknown; unload:()=>unknown; volume:(volume:number)=>unknown;
};
type HowlConstructor=new (options:HowlerOptions)=>HowlPlayer;
declare global { interface Window { Howl?:HowlConstructor } }
let loader:Promise<HowlConstructor>|null=null;
export function loadHowler():Promise<HowlConstructor> {
  if(typeof window==="undefined")return Promise.reject(new Error("Audio runs only in a browser"));
  if(window.Howl)return Promise.resolve(window.Howl);
  if(loader)return loader;
  loader=new Promise<HowlConstructor>((resolve,reject)=>{
    const script=document.createElement("script");
    script.src="/vendor/howler.core.min.js";
    script.async=true;
    script.dataset.studyAudioLibrary="howler";
    script.onload=()=>window.Howl?resolve(window.Howl):reject(new Error("Howler.js did not initialize"));
    script.onerror=()=>reject(new Error("Howler.js could not be loaded"));
    document.head.appendChild(script);
  }).catch((error:unknown)=>{
    loader=null;throw error;
  });
  return loader;
}
