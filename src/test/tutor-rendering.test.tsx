import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("@/components/MathText",()=>({useKatex:()=>null,RichText:({text}:{text:string})=><span>{text}</span>}));
import { ExplanationContent, teachingParagraphs } from "@/components/RichExplanation";
describe("Readable tutor and explanation content",()=>{
  it("renders consecutive steps, headings and emphasis without blank-line dependence",()=>{
    const html=renderToStaticMarkup(<ExplanationContent text={"## Method\n1. **Subtract 5.**\n2. Divide by 3.\n- Check the answer."}/>);
    expect(html).toContain("<h4");
    expect(html).toContain("<strong");
    expect(html).toContain("<ul");
    expect(teachingParagraphs("1. First\n2. Second")).toEqual(["1. First","2. Second"]);
  });
  it("keeps display math in one block even when lines resemble steps",()=>{
    expect(teachingParagraphs("1. Solve\n$$\n1. x = 3\n\n2. y = 4\n$$\n2. Verify")).toHaveLength(2);
    expect(teachingParagraphs("1. Solve\n\\[\n1. x=3\n\n2. y=4\n\\]\n2. Verify")).toHaveLength(2);
  });
  it("escapes arbitrary HTML and only renders schema-validated diagrams",()=>{
    const fence=String.fromCharCode(96).repeat(3);
    const html=renderToStaticMarkup(<ExplanationContent text={'<img src=x onerror=alert(1)>\n\n'+fence+'diagram\n{"type":"circle","radius":"r"}\n'+fence}/>);
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
    expect(html).toContain("<svg");
    const unsafe=renderToStaticMarkup(<ExplanationContent text={fence+'text\n<script>alert(1)</script>\n'+fence}/>);
    expect(unsafe).not.toContain("<script");
    expect(unsafe).toContain("<pre");
  });
});
