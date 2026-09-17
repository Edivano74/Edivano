import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getOpenAI, fullPlanSchema, baseInstructions } from "@/lib/openai";
import { adminSupabase } from "@/lib/supabase";

export async function POST(req){
  try{
    const {sessionId}=await req.json();
    if(!sessionId) return NextResponse.json({error:"sessionId fehlt."},{status:400});

    const stripe=getStripe();
    const session=await stripe.checkout.sessions.retrieve(sessionId);
    if(session.payment_status!=="paid") return NextResponse.json({error:"Zahlung noch nicht bestätigt."},{status:402});

    const requestId=session.metadata?.trip_request_id;
    const db=adminSupabase();
    if(!requestId || !db) return NextResponse.json({error:"Reiseanfrage nicht gefunden."},{status:404});

    const {data:row,error}=await db.from("trip_requests").select("*").eq("id",requestId).single();
    if(error || !row) throw error || new Error("Request fehlt");

    if(row.full_plan_json) return NextResponse.json(row.full_plan_json);

    const client=getOpenAI();
    const ai=await client.responses.create({
      model:process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions:baseInstructions(),
      input:`Erstelle jetzt den vollständigen bezahlten Familienreiseplan. Wähle das am besten passende Ziel aus der Vorschau und erstelle einen realistischen Plan passend zur Dauer. Wenn die Dauer nicht eindeutig als Zahl angegeben ist, nutze 7 Tage.\nReiseanfrage:\n${JSON.stringify(row.request_json,null,2)}\nVorschau:\n${JSON.stringify(row.preview_json,null,2)}`,
      text:{format:{type:"json_schema",name:"edivano_full_plan",strict:true,schema:fullPlanSchema}}
    });
    const plan=JSON.parse(ai.output_text);
    await db.from("trip_requests").update({full_plan_json:plan}).eq("id",requestId);
    return NextResponse.json(plan);
  }catch(e){
    console.error(e);
    return NextResponse.json({error:"Vollständiger Reiseplan konnte nicht erstellt werden."},{status:500});
  }
}
