import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminSupabase } from "@/lib/supabase";

export async function POST(req){
  const stripe=getStripe();
  const sig=req.headers.get("stripe-signature");
  const secret=process.env.STRIPE_WEBHOOK_SECRET;
  if(!secret) return NextResponse.json({error:"Webhook secret fehlt."},{status:500});
  try{
    const raw=await req.text();
    const event=stripe.webhooks.constructEvent(raw,sig,secret);
    if(event.type==="checkout.session.completed"){
      const session=event.data.object;
      const id=session.metadata?.trip_request_id;
      const db=adminSupabase();
      if(id && db){
        await db.from("trip_requests").update({
          payment_status:"paid",
          stripe_session_id:session.id,
          paid_at:new Date().toISOString()
        }).eq("id",id);
      }
    }
    return NextResponse.json({received:true});
  }catch(e){
    console.error(e);
    return NextResponse.json({error:"Ungültiger Webhook."},{status:400});
  }
}
