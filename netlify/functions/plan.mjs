import { json,db,cleanText,fallbackPlan,env } from './_shared.mjs';

async function generatePlan(request,preview){
  const key=env('OPENAI_API_KEY');
  const model=env('OPENAI_MODEL');
  if(!key||!model)return fallbackPlan(request,preview);
  try{
    const prompt=`Du bist Edivano, ein nüchterner Familien-Reiseplaner. Erstelle einen vollständigen personalisierten Reiseplan. Keine erfundenen Live-Preise, Öffnungszeiten oder Verfügbarkeiten. Nutze die Reiseangaben ${JSON.stringify(request)} und die Zielideen ${JSON.stringify(preview)}. Antworte ausschließlich als JSON-Objekt mit: title (string), intro (string), days (Array aus {day,title,plan}), activities (string[]), packing (string[]), budget (string), rainy (string[]).`;
    const resp=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({model,input:prompt})});
    if(!resp.ok)throw new Error('AI request failed');
    const data=await resp.json();
    const text=data.output_text||data.output?.flatMap(x=>x.content||[]).map(x=>x.text||'').join('')||'';
    return JSON.parse(text.replace(/^```json|```$/g,'').trim());
  }catch(e){console.error('AI plan fallback',e.message);return fallbackPlan(request,preview)}
}

export default async(req)=>{if(req.method!=='POST')return json({error:'Method not allowed'},405);try{const body=await req.json();const id=cleanText(body.id,80);const token=cleanText(body.token,120);const client=db(token);const {data,error}=await client.from('trip_requests').select('payment_status,full_plan_json,request_json,preview_json').eq('id',id).single();if(error)return json({ready:false,message:'Reiseplan nicht gefunden.'},404);if(data.payment_status!=='paid')return json({ready:false,message:'Zahlung wird noch bestätigt …'});if(data.full_plan_json)return json({ready:true,plan:data.full_plan_json});const plan=await generatePlan(data.request_json,data.preview_json);const {error:updateError}=await client.from('trip_requests').update({full_plan_json:plan}).eq('id',id);if(updateError)console.error('plan save',updateError.message);return json({ready:true,plan})}catch(e){console.error(e);return json({ready:false,message:'Plan konnte nicht geladen werden.'},500)}}
