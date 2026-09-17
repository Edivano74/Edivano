"use client";
import { useState } from "react";

const defaults = {
  adults:"2", kids:"1", kidsAge:"18 Monate", origin:"Hamburg", duration:"7 Tage",
  budget:"2000 €", transport:"Egal", stay:"Egal", style:"Mix",
  pool:"Egal", buggy:"Wichtig", nap:"12:30–14:00", pace:"Entspannt", notes:""
};

export default function Home(){
  const [step,setStep]=useState(1);
  const [data,setData]=useState(defaults);
  const [loading,setLoading]=useState(false);
  const [preview,setPreview]=useState(null);
  const [error,setError]=useState("");

  const pct=Math.round(step/6*100);
  const names=["Familie","Zeitraum","Budget & Anreise","Urlaubsstil","Familienalltag","Wünsche"];

  function set(name,value){setData(v=>({...v,[name]:value}))}
  function next(){setStep(s=>Math.min(6,s+1))}
  function back(){setStep(s=>Math.max(1,s-1))}

  async function submit(e){
    e.preventDefault(); setLoading(true); setError("");
    try{
      const r=await fetch("/api/plan/preview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error || "Vorschau konnte nicht erstellt werden.");
      setPreview(j);
      setTimeout(()=>document.getElementById("results")?.scrollIntoView({behavior:"smooth"}),50);
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }

  async function checkout(){
    setError("");
    try{
      const r=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tripRequest:data,preview})});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error || "Checkout konnte nicht gestartet werden.");
      window.location.href=j.url;
    }catch(err){setError(err.message)}
  }

  return <>
    <header className="nav">
      <div className="shell" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <a href="#" className="brand">Edi<span>vano</span></a>
        <a className="btn btn-dark" href="#planner">Jetzt planen</a>
      </div>
    </header>

    <main>
      <section className="hero">
        <div className="shell">
          <div className="hero-copy">
            <span className="eyebrow">KI-gestützte Familienreiseplanung</span>
            <h1>Familienurlaub.<br/><em>Clever geplant.</em></h1>
            <p className="lead">Edivano plant euren Urlaub passend zu Kinderalter, Budget, Schlafrhythmus und Reisewünschen – ohne Prompt-Chaos.</p>
            <div className="hero-points">
              <div><b>Kindgerecht</b><br/>realistische Tagesabläufe</div>
              <div><b>Persönlich</b><br/>nach euren Angaben</div>
              <div><b>Einfach</b><br/>in wenigen Schritten</div>
            </div>
            <a className="btn btn-dark" href="#planner">Kostenlos starten →</a>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="shell">
          <div className="title"><span className="eyebrow">So funktioniert es</span><h2>Von „Wohin bloß?“ zum Familienplan.</h2></div>
          <div className="steps">
            <article className="step"><b>1</b><h3>Wünsche angeben</h3><p>Familie, Budget, Zeitraum und Alltag.</p></article>
            <article className="step"><b>2</b><h3>KI vergleicht</h3><p>Passende Reiseziele werden strukturiert bewertet.</p></article>
            <article className="step"><b>3</b><h3>3 Ideen kostenlos</h3><p>Mit kurzer, nachvollziehbarer Begründung.</p></article>
            <article className="step"><b>4</b><h3>Vollplan freischalten</h3><p>Tagesplan, Packliste, Budget und Alternativen.</p></article>
          </div>
        </div>
      </section>

      <section className="section" id="planner">
        <div className="shell">
          <div className="title"><span className="eyebrow">Eure Reise beginnt hier</span><h2>6 Schritte. Keine komplizierten Prompts.</h2></div>
          <form className="planner" onSubmit={submit}>
            <div className="progress"><i style={{width:`${pct}%`}}/></div>
            <div className="progress-meta"><span>Schritt {step} von 6</span><span>{names[step-1]}</span></div>

            <div className={`step-pane ${step===1?"active":""}`}>
              <h3>Wer reist mit?</h3>
              <div className="grid">
                <label>Erwachsene<input type="number" min="1" value={data.adults} onChange={e=>set("adults",e.target.value)}/></label>
                <label>Kinder<input type="number" min="0" value={data.kids} onChange={e=>set("kids",e.target.value)}/></label>
                <label className="full">Alter der Kinder<input value={data.kidsAge} onChange={e=>set("kidsAge",e.target.value)} placeholder="z. B. 18 Monate und 5 Jahre"/></label>
              </div>
            </div>

            <div className={`step-pane ${step===2?"active":""}`}>
              <h3>Wann und wie lange?</h3>
              <div className="grid">
                <label>Frühester Start<input type="date" value={data.startDate||""} onChange={e=>set("startDate",e.target.value)}/></label>
                <label>Späteste Rückkehr<input type="date" value={data.endDate||""} onChange={e=>set("endDate",e.target.value)}/></label>
                <label>Reisedauer<input value={data.duration} onChange={e=>set("duration",e.target.value)}/></label>
                <label>Startort<input value={data.origin} onChange={e=>set("origin",e.target.value)}/></label>
              </div>
            </div>

            <div className={`step-pane ${step===3?"active":""}`}>
              <h3>Budget & Anreise</h3>
              <div className="grid">
                <label>Gesamtbudget<input value={data.budget} onChange={e=>set("budget",e.target.value)}/></label>
                <label>Verkehrsmittel<select value={data.transport} onChange={e=>set("transport",e.target.value)}><option>Egal</option><option>Auto</option><option>Flug</option><option>Bahn</option></select></label>
                <label>Maximale Reisezeit<input value={data.maxTravel||""} onChange={e=>set("maxTravel",e.target.value)} placeholder="z. B. 4 Stunden"/></label>
                <label>Unterkunft<select value={data.stay} onChange={e=>set("stay",e.target.value)}><option>Egal</option><option>Hotel</option><option>Ferienwohnung</option><option>Resort</option></select></label>
              </div>
            </div>

            <div className={`step-pane ${step===4?"active":""}`}>
              <h3>Was mögt ihr?</h3>
              <div className="chips">{["Strand","Natur","Stadt","All inclusive","Roadtrip","Mix"].map(x=><button key={x} type="button" className={`chip ${data.style===x?"sel":""}`} onClick={()=>set("style",x)}>{x}</button>)}</div>
              <div className="grid">
                <label>Pool wichtig?<select value={data.pool} onChange={e=>set("pool",e.target.value)}><option>Egal</option><option>Ja</option><option>Nein</option></select></label>
                <label>Verpflegung<select value={data.food||"Egal"} onChange={e=>set("food",e.target.value)}><option>Egal</option><option>Selbstversorgung</option><option>Frühstück</option><option>Halbpension</option><option>All inclusive</option></select></label>
              </div>
            </div>

            <div className={`step-pane ${step===5?"active":""}`}>
              <h3>Familienalltag</h3>
              <div className="grid">
                <label>Buggy/Kinderwagen<select value={data.buggy} onChange={e=>set("buggy",e.target.value)}><option>Egal</option><option>Wichtig</option><option>Nicht nötig</option></select></label>
                <label>Mittagsschlaf<input value={data.nap} onChange={e=>set("nap",e.target.value)}/></label>
                <label>Abendroutine<input value={data.bedtime||""} onChange={e=>set("bedtime",e.target.value)} placeholder="z. B. Unterkunft bis 19 Uhr"/></label>
                <label>Tempo<select value={data.pace} onChange={e=>set("pace",e.target.value)}><option>Entspannt</option><option>Ausgewogen</option><option>Viel erleben</option></select></label>
              </div>
            </div>

            <div className={`step-pane ${step===6?"active":""}`}>
              <h3>Wünsche & No-Gos</h3>
              <label>Was ist euch besonders wichtig?<textarea rows="5" value={data.notes} onChange={e=>set("notes",e.target.value)} placeholder="z. B. Strand fußläufig, keine langen Transfers, kein Partyort"/></label>
              <div className="notice">Edivano erstellt Reiseplanung. Preise, Verfügbarkeiten sowie Einreise-, Gesundheits- und Sicherheitsinformationen müssen vor einer Buchung beim jeweiligen bzw. offiziellen Anbieter geprüft werden.</div>
            </div>

            <div className="actions">
              <button type="button" className="btn btn-light" disabled={step===1} onClick={back}>← Zurück</button>
              {step<6 ? <button type="button" className="btn btn-dark" onClick={next}>Weiter →</button> :
              <button type="submit" className="btn btn-dark" disabled={loading}>{loading?"Edivano plant…":"3 Reiseideen erstellen ✦"}</button>}
            </div>
            {error && <div className="notice" style={{borderColor:"#e7b0a7",background:"#fff0ed"}}>{error}</div>}
          </form>

          {preview && <section id="results" className="results">
            <div className="title"><span className="eyebrow">Edivano Vorschläge</span><h2>Das könnte zu euch passen.</h2><p>{preview.summary}</p></div>
            <div className="cards">
              {preview.destinations.map((d,i)=><article className="card" key={i}>
                <img src={d.image} alt="Reiseziel"/>
                <div className="card-body"><span className="eyebrow">Vorschlag {i+1}</span><h3>{d.name}</h3><p>{d.reason}</p><p><b>Passt besonders wegen:</b> {d.fit}</p></div>
              </article>)}
            </div>
            <div className="unlock">
              <div><span className="eyebrow">Vollständiger Familienplan</span><h3>Aus einer Idee wird euer Reiseplan.</h3><p>Tagesablauf, familiengerechte Aktivitäten, Packliste, Budgetrahmen und Schlechtwetter-Alternativen.</p></div>
              <div><strong>9,99 €</strong><br/><button className="btn btn-dark" onClick={checkout}>Vollplan freischalten →</button></div>
            </div>
          </section>}
        </div>
      </section>
    </main>

    <footer className="footer"><div className="shell footer-inner"><b>Edivano</b><span>Familienreisen. Besser geplant.</span><span>Impressum · Datenschutz · AGB · Widerruf</span></div></footer>
  </>;
}
