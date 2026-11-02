import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PhysicsSourceReader } from "@/components/PhysicsSourceReader";
import type { PhysicsVolume } from "@/lib/physics-source";

export const Route=createFileRoute("/physics/books")({
  staticData: { sitemap: true },
  validateSearch:z.object({
    volume:z.coerce.number().int().refine(v=>v===61||v===62).catch(61),
    page:z.coerce.number().int().positive().catch(5),
  }),
  head:()=>({meta:[
    {title:"Ֆիզիկայի բնօրինակ շտեմարաններ · Մաս I և II · Shtemarm"},
    {name:"description",content:"Կարդա ֆիզիկայի երկու շտեմարանների 2017 թ. բնօրինակ PDF-ները՝ առանց դրանք սերվեր ուղարկելու։ Գծագրերը, բանաձևերը և պատասխանների բաժինները պահպանվում են։"},
  ]}),
  component:()=> {
    const {volume,page}=Route.useSearch();
    return <PhysicsSourceReader key={volume} volume={volume as PhysicsVolume} initialPage={page}/>;
  },
});
