import { createFileRoute } from "@tanstack/react-router";
import { PhysicsScanPractice } from "@/components/PhysicsScanPractice";

export const Route=createFileRoute("/physics/scan-practice")({
  head:()=>({meta:[
    {title:"Ֆիզիկա · 250 բնօրինակ առաջադրանքի վարժանք · Shtemarm"},
    {name:"description",content:"Լուծիր ֆիզիկայի երկու բնօրինակ շտեմարանների առաջին 125-ական առաջադրանքները քո սարքում պահված PDF-ից՝ ստուգելով հենց գրքի պատասխանների աղյուսակով։"},
  ]}),
  component:PhysicsScanPractice,
});
