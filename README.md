# Edivano

KI-gestützter Familienreiseplaner für realistische, familiengerechte Urlaubsplanung.

## MVP-Flow
1. Nutzer beantwortet 6 Schritte.
2. Edivano erzeugt 3 kostenlose Reiseideen.
3. Für 9,99 € kann der vollständige Familienreiseplan freigeschaltet werden.
4. Stripe Checkout bestätigt die Zahlung.
5. Supabase speichert Anfrage, Zahlungsstatus, Vorschau und Vollplan.
6. Der Vollplan enthält Tagesabläufe, Packliste, Budget-Hinweise und Schlechtwetter-Alternativen.

## Stack
- Next.js
- OpenAI API
- Supabase
- Stripe
- Vercel

## Vor Livegang noch nötig
- Environment Variables in Vercel setzen
- Stripe-Produkt/Price-ID und Webhook anlegen
- Domain verbinden
- finales Impressum / Datenschutz / AGB / Widerruf
- Gewerbe/steuerliche Einrichtung
- Marken-/Ähnlichkeitsprüfung abschließen

Keine Secrets in dieses Repository committen.
