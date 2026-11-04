#!/usr/bin/env node
/** Targeted lockfile safety checks for confirmed, actionable TanStack advisories.
 * This complements (does not replace) a current full dependency audit.
 */
import { readFileSync } from "node:fs";

const source=readFileSync(new URL("../bun.lock",import.meta.url),"utf8");
// bun.lock is JSONC with trailing commas. Package data do not use comments.
const lock=JSON.parse(source.replace(/,\s*([}\]])/g,"$1"));
const packages=Object.fromEntries(Object.entries(lock.packages ?? {}).map(([name,entry])=>
  [name,String(entry?.[0] ?? "")]));
const fail=[];
const compare=(a,b)=>{
  const pa=a.split(".").map(Number),pb=b.split(".").map(Number);
  for(let i=0;i<Math.max(pa.length,pb.length);i++){
    const n=(pa[i]||0)-(pb[i]||0);if(n)return n;
  }
  return 0;
};
const resolved=(name)=>{
  const spec=packages[name] ?? "";
  return spec.startsWith(name+"@")?spec.slice(name.length+1):null;
};
// CVE-2026-102989 / GHSA-qx66-fv34-fjm8
for(const [name,min] of Object.entries({
  "@tanstack/react-start":"1.168.60",
  "@tanstack/start-server-core":"1.169.39",
})){
  const version=resolved(name);
  if(!version||!/^\d+\.\d+\.\d+$/.test(version)||compare(version,min)<0)
    fail.push(name+" requires >= "+min+" (resolved "+(version||"MISSING")+")");
}
// GHSA-g7cv-rxg3-hmpx: precisely affected versions of the May 2026
// poisoned package publication. Do not assume later legitimate versions are bad.
const compromised={
  "@tanstack/history":["1.161.9","1.161.12"],
  "@tanstack/react-router":["1.169.5","1.169.8"],
  "@tanstack/react-start":["1.167.68","1.167.71"],
  "@tanstack/react-start-client":["1.166.51","1.166.54"],
  "@tanstack/react-start-rsc":["0.0.47","0.0.50"],
  "@tanstack/react-start-server":["1.166.55","1.166.58"],
  "@tanstack/router-core":["1.169.5","1.169.8"],
  "@tanstack/router-generator":["1.166.45","1.166.48"],
  "@tanstack/router-plugin":["1.167.38","1.167.41"],
  "@tanstack/router-utils":["1.161.11","1.161.14"],
  "@tanstack/start-client-core":["1.168.5","1.168.8"],
  "@tanstack/start-plugin-core":["1.169.23","1.169.26"],
  "@tanstack/start-server-core":["1.167.33","1.167.36"],
  "@tanstack/start-storage-context":["1.166.38","1.166.41"],
  "@tanstack/virtual-file-routes":["1.161.10","1.161.13"],
  "@tanstack/arktype-adapter":["1.166.12","1.166.15"],
  "@tanstack/zod-adapter":["1.166.12","1.166.15"],
  "@tanstack/valibot-adapter":["1.166.12","1.166.15"],
  "@tanstack/router-cli":["1.166.46","1.166.49"],
  "@tanstack/router-devtools":["1.166.16","1.166.19"],
  "@tanstack/router-devtools-core":["1.167.6","1.167.9"],
  "@tanstack/react-router-devtools":["1.166.16","1.166.19"],
  "@tanstack/react-router-ssr-query":["1.166.15","1.166.18"],
  "@tanstack/router-ssr-query-core":["1.168.3","1.168.6"],
  "@tanstack/react-router-ssr-query":["1.166.15","1.166.18"],
  "@tanstack/nitro-v2-vite-plugin":["1.154.12","1.154.15"],
  "@tanstack/solid-start":["1.167.65","1.167.68"],
  "@tanstack/vue-start":["1.167.61","1.167.64"],
  "@tanstack/solid-router":["1.169.5","1.169.8"],
  "@tanstack/vue-router":["1.169.5","1.169.8"],
};
for(const [name,versions] of Object.entries(compromised)){
  for(const [key,spec] of Object.entries(packages)){
    if((key===name||key.endsWith("/"+name)) && versions.includes(spec.slice(spec.indexOf("@",1)+1)))
      fail.push("Compromised version in bun.lock: "+key+" "+spec);
  }
}
// Catch the malicious git-based optional package bootstrap if reintroduced.
if(source.includes("github:tanstack/router#79ac49eedf774dd4b0cfa308722bc463cfe5885c")||
   source.includes('"@tanstack/setup"'))fail.push("Known malicious TanStack setup dependency");
if(fail.length){
  console.error("Dependency security check FAILED:\n"+fail.join("\n"));
  process.exitCode=1;
}else{
  console.log("Dependency security check passed: "+Object.keys(packages).length+
    " lockfile entries checked; patched TanStack Start transport, no listed poisoned versions.");
}
