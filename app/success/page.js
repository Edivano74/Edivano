"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Success(){
  const params=useSearchParams();
  const sessionId=params.get("session_id");
  const [plan,setPlan]=useState(null);
  const [error,setError]=useState("");

  useEffect(()=>{
    if(!sessionId) return;
    fetch("/api/plan/full",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId})})
      .then(async r=>{const j=await r.json(); if(!r.ok) throw new Error(j.error); return j})
      .then(setPlan).catch(e=>setError(e.message));
  },[sessionId]);

  return <main className="status">
    <a href="/">← Edivano</a>
    <h1 style={{fontSize:44}}>Zahlung erfolgreich.</h1>
    {!plan && !error && <p>Edivano erstellt gerade euren vollständigen Familienreiseplan…</p>}
    {error && <div className="notice">{error}</div>}
    {plan && <>
      <span className="eyebrow">Euer Ziel</span><h2>{plan.destination}</h2><p>{plan.intro}</p>
      {plan.daily_plan.map(d=><section key={d.day} className="step" style={{marginTop:14}}>
        <h3>Tag {d.day}: {d.title}</h3>
        <p><b>Morgens:</b> {d.morning}</p><p><b>Mittags:</b> {d.midday}</p><p><b>Nachmittags:</b> {d.afternoon}</p><p><b>Abends:</b> {d.evening}</p><p><b>Schlechtwetter:</b> {d.bad_weather}</p>
      </section>)}
      <h2>Packliste</h2><ul>{plan.packing_list.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <h2>Budget-Hinweise</h2><ul>{plan.budget_notes.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <h2>Vor der Buchung prüfen</h2><ul>{plan.booking_checklist.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <div className="notice">{plan.important_notes.join(" ")}</div>
    </>}
  </main>;
}
