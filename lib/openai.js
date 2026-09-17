import OpenAI from "openai";

export function getOpenAI(){
  if(!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY fehlt.");
  return new OpenAI({apiKey:process.env.OPENAI_API_KEY});
}

export const previewSchema = {
  type:"object",
  additionalProperties:false,
  properties:{
    summary:{type:"string"},
    destinations:{
      type:"array",
      minItems:3,maxItems:3,
      items:{
        type:"object",
        additionalProperties:false,
        properties:{
          name:{type:"string"},
          reason:{type:"string"},
          fit:{type:"string"},
          image_query:{type:"string"}
        },
        required:["name","reason","fit","image_query"]
      }
    }
  },
  required:["summary","destinations"]
};

export const fullPlanSchema = {
  type:"object",
  additionalProperties:false,
  properties:{
    destination:{type:"string"},
    intro:{type:"string"},
    daily_plan:{type:"array",items:{
      type:"object",additionalProperties:false,
      properties:{day:{type:"integer"},title:{type:"string"},morning:{type:"string"},midday:{type:"string"},afternoon:{type:"string"},evening:{type:"string"},bad_weather:{type:"string"}},
      required:["day","title","morning","midday","afternoon","evening","bad_weather"]
    }},
    packing_list:{type:"array",items:{type:"string"}},
    budget_notes:{type:"array",items:{type:"string"}},
    booking_checklist:{type:"array",items:{type:"string"}},
    important_notes:{type:"array",items:{type:"string"}}
  },
  required:["destination","intro","daily_plan","packing_list","budget_notes","booking_checklist","important_notes"]
};

export function baseInstructions(){
  return `Du bist Edivano, ein KI-gestützter Familienreiseplaner für deutsche Verbraucher.
Ziel: realistische, familiengerechte Reiseplanung. Berücksichtige Kinderalter, Mittagsschlaf, gewünschtes Tempo, Budget, Anreise und No-Gos.
Keine erfundenen Live-Preise, Verfügbarkeiten, Öffnungszeiten oder Einreisebestimmungen. Wenn solche Angaben relevant sind, weise kurz darauf hin, dass sie aktuell beim jeweiligen oder offiziellen Anbieter geprüft werden müssen.
Edivano verkauft Reiseplanung, keine Pauschalreise und keine Reiseleistung.
Keine medizinischen oder sicherheitsbezogenen Garantien.
Schreibe auf Deutsch, klar, warm und konkret.`;
}
