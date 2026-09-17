import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAI, previewSchema, baseInstructions } from "@/lib/openai";

const Input = z.object({
  adults:z.string().optional(),kids:z.string().optional(),kidsAge:z.string().optional(),
  origin:z.string().optional(),startDate:z.string().optional(),endDate:z.string().optional(),
  duration:z.string().optional(),budget:z.string().optional(),transport:z.string().optional(),
  maxTravel:z.string().optional(),stay:z.string().optional(),style:z.string().optional(),
  pool:z.string().optional(),food:z.string().optional(),buggy:z.string().optional(),
  nap:z.string().optional(),bedtime:z.string().optional(),pace:z.string().optional(),notes:z.string().optional()
});

const fallbackImages=[
 "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=900&q=80"
];

export async function POST(req){
  try{
    const input=Input.parse(await req.json());
    const client=getOpenAI();
    const response=await client.responses.create({
      model:process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions:baseInstructions(),
      input:`Erstelle genau drei passende Reiseziele als kostenlose Vorschau. Bewerte nicht mit erfundenen Scores. Reiseprofil:\n${JSON.stringify(input,null,2)}`,
      text:{format:{type:"json_schema",name:"edivano_preview",strict:true,schema:previewSchema}}
    });
    const parsed=JSON.parse(response.output_text);
    parsed.destinations=parsed.destinations.map((d,i)=>({...d,image:fallbackImages[i]}));
    return NextResponse.json(parsed);
  }catch(e){
    console.error(e);
    return NextResponse.json({error:"Die KI-Vorschau konnte nicht erstellt werden. Prüfe API-Key und Server-Konfiguration."},{status:500});
  }
}
