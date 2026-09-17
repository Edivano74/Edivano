import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminSupabase } from "@/lib/supabase";

export async function POST(req){
  try{
    const body=await req.json();
    if(!body?.tripRequest || !body?.preview) throw new Error("Reisedaten fehlen.");

    const stripe=getStripe();
    const db=adminSupabase();
    if(!db) throw new Error("Supabase ist nicht konfiguriert.");

    const appUrl=process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const {data,error}=await db.from("trip_requests").insert({
      request_json:body.tripRequest,
      preview_json:body.preview,
      payment_status:"pending"
    }).select("id").single();
    if(error) throw error;

    const priceId=process.env.STRIPE_PRICE_ID;
    if(!priceId) throw new Error("STRIPE_PRICE_ID fehlt.");

    const session=await stripe.checkout.sessions.create({
      mode:"payment",
      line_items:[{price:priceId,quantity:1}],
      success_url:`${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${appUrl}/cancel`,
      metadata:{trip_request_id:data.id},
      allow_promotion_codes:false
    });

    await db.from("trip_requests").update({stripe_session_id:session.id}).eq("id",data.id);
    return NextResponse.json({url:session.url});
  }catch(e){
    console.error(e);
    return NextResponse.json({error:"Checkout konnte nicht gestartet werden. Prüfe Stripe- und Supabase-Konfiguration."},{status:500});
  }
}
