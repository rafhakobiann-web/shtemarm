import { createFileRoute } from "@tanstack/react-router";
import { PhysicsScanPractice } from "@/components/PhysicsScanPractice";

export const Route=createFileRoute("/physics/scan-practice")({
  staticData: { sitemap: true },
  head:()=>({meta:[
      { property: "og:title", content: "Ֆիզիկա · 250 բնօրինակ առաջադրանքի վարժանք · Shtemarm" },
      { property: "og:description", content: "Լուծիր ֆիզիկայի երկու բնօրինակ շտեմարանների առաջին 125-ական առաջադրանքները քո սարքում պահված PDF-ից՝ ստուգելով հենց գրքի պատասխանների աղյուսակով։" },
    {title:"Ֆիզիկա · 250 բնօրինակ առաջադրանքի վարժանք · Shtemarm"},
    {name:"description",content:"Լուծիր ֆիզիկայի երկու բնօրինակ շտեմարանների առաջին 125-ական առաջադրանքները քո սարքում պահված PDF-ից՝ ստուգելով հենց գրքի պատասխանների աղյուսակով։"},
  ]}),
  component:PhysicsScanPractice,
});
