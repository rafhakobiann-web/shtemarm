import {createFileRoute} from "@tanstack/react-router";
import {PhysicsOriginalWorkspace} from "@/components/PhysicsOriginalWorkspace";

export const Route=createFileRoute("/physics/original")({
  head:()=>({meta:[
    {title:"Ֆիզիկա · Բնօրինակ շտեմարանների թվայնացված հարցերը · Shtemarm"},
    {name:"description",content:"Սովորիր ֆիզիկայի երկու բնօրինակ շտեմարանների տեքստային առաջադրանքներով՝ ստուգված պատասխաններով և PDF էջերի հղումներով։"},
  ]}),
  component:PhysicsOriginalWorkspace,
});
