import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminSupabase } from "@/lib/supabase";

export async function POST(req){
  try{
    const body=await req.json();
    const stripe=getStripe();
    const appUrl=process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let requestId=null;
    const db=adminSupabase();

    if(db){
      const {data,error}=await db.from("trip_requests").insert({
        request_json:body.tripRequest,
        preview_json:body.preview,
        payment_status:"pending"
      }).select("id").single();
      if(error) throw error;
      requestId=data.id;
    }

    const priceId=process.env.STRIPE_PRICE_ID;
    if(!priceId) throw new Error("STRIPE_PRICE_ID fehlt.");

    const session=await stripe.checkout.sessions.create({
      mode:"payment",
      line_items:[{price:priceId,quantity:1}],
      success_url:`${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${appUrl}/cancel`,
      metadata:requestId?{trip_request_id:requestId}:{}
    });

    return NextResponse.json({url:session.url});
  }catch(e){
    console.error(e);
    return NextResponse.json({error:"Checkout konnte nicht gestartet werden. Prüfe Stripe- und Supabase-Konfiguration."},{status:500});
  }
}
