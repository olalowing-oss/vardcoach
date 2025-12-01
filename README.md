# Vårdcoachen v4 - Mobilanpassad hälsoapp

En komplett React-app för att hantera din hälsa med stöd för mobil och desktop.

## 🚀 Funktioner

### Huvudfunktioner
- **Hem** - Översikt över din hälsa
- **Anteckningsbok** - Fri anteckningsyta för tankar och observationer
- **Helhetsanalys** - AI som analyserar alla diagnoser + läkemedel
- **Kalender** - Månadsvy och besökshantering
- **Diagnoser** - Registrering med AI-analys
- **Läkemedel** - Dosering och dagligt intag
- **Läkarbesök** - Anteckna vad som sades hos läkaren
- **Hälsodagbok** - Humör och symtom
- **Påminnelser** - Webbnotifikationer
- **Frågor** - AI-genererade frågor till läkaren
- **PDF-export** - Sammanfattning att ta med till läkarbesök

### Mobilanpassning
- 📱 **Bottom navigation** - Enkel navigering på mobil
- 👆 **Touch-vänligt** - Stora klickytor (44px+)
- 🔄 **Responsiv design** - Anpassar sig till skärmstorleken
- 💾 **PWA-stöd** - Kan installeras som app
- 🔔 **Push-notiser** - Påminnelser via webbläsaren

## 📁 Projektstruktur

```
vårdcoachen/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/           # Återanvändbara komponenter
│   │   │   ├── Navigation/   # Sidebar, BottomNav, Header
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Input.jsx
│   │   ├── ExportModal.jsx
│   │   └── Notifications.jsx
│   ├── context/
│   │   └── AppContext.jsx    # Global state management
│   ├── hooks/
│   │   ├── useReminders.js   # Besökspåminnelser
│   │   └── useAI.js          # AI-integration
│   ├── services/
│   │   └── supabaseClient.js # Supabase-klient
│   ├── utils/
│   │   ├── helpers.js        # Hjälpfunktioner
│   │   └── pdfExport.js      # PDF-generering
│   ├── views/
│   │   ├── Dashboard.jsx
│   │   ├── CalendarView.jsx
│   │   ├── MedicationsView.jsx
│   │   ├── DiagnosesView.jsx
│   │   ├── DoctorVisitsView.jsx
│   │   ├── NotebookView.jsx
│   │   ├── OverallAnalysisView.jsx
│   │   ├── DiaryView.jsx
│   │   ├── RemindersView.jsx
│   │   └── QuestionsView.jsx
│   ├── styles/
│   │   ├── variables.css     # CSS-variabler
│   │   └── index.css         # Globala stilar
│   ├── App.jsx
│   ├── App.css
│   └── index.js
└── package.json
```

## 🛠️ Installation

### Alternativ 1: Från scratch med Create React App

```bash
# Skapa nytt projekt
npx create-react-app vårdcoachen
cd vårdcoachen

# Ta bort standardfiler
rm -rf src/*
rm -rf public/*

# Kopiera alla filer från detta projekt till src/ och public/

# Installera och starta
npm install
npm start
```

### Alternativ 2: Kopiera till befintligt projekt

1. Kopiera hela `src/` mappen till ditt projekt
2. Kopiera `public/` filerna
3. Kör `npm install` och `npm start`

## 📱 Responsiva breakpoints

| Breakpoint | Storlek | Layout |
|------------|---------|--------|
| Mobile | < 640px | Bottom nav, enkel kolumn |
| Tablet | 640-1024px | Bottom nav, 2 kolumner |
| Desktop | > 1024px | Sidebar, full layout |

## 🎨 Design System

### Färger
- **Primary**: `#2E7D5C` (Medicinsk grön)
- **Secondary**: `#3498db` (Blå)
- **Accent**: `#9b59b6` (Lila)

### Typografi
- **Font**: Nunito (Google Fonts)
- **Storlekar**: 0.75rem - 1.875rem

### Spacing
- XS: 0.25rem
- SM: 0.5rem
- MD: 1rem
- LG: 1.5rem
- XL: 2rem

## 🔔 Påminnelser

Appen stöder webbnotifikationer för:
- **Besök**: Kl 18:00 dagen innan

**Krav:**
- Webbläsaren måste vara öppen (kan vara i bakgrunden)
- Användaren måste godkänna notifikationer

## 📄 PDF-export

Genererar PDF med jsPDF (laddas från CDN). Innehåller:
- Diagnoser
- Läkemedel (aktiva + avslutade)
- Vårdbesök (senaste 10)
- Dagboksanteckningar (senaste 15)

## 🤖 AI-funktioner

Appen använder OpenAI:s Chat Completions API för:
- Diagnosanalys och förklaring
- Generering av frågor till läkaren
- Analys av dagboksmönster
- Sparade AI-svar och följdfrågor per diagnos (med möjlighet att radera)

**OBS:** Du behöver ett eget OpenAI-konto och API-nyckel.

### Konfiguration
1. Skapa en fil som heter `.env.local` i projektroten.
2. Kopiera innehållet från `src/.env.example` och klistra in i `.env.local`.
3. Fyll i `OPENAI_API_KEY` (används endast av backend-proxyn och ligger därmed inte i bundle).
4. Valfritt: ändra `REACT_APP_OPENAI_MODEL` (t.ex. `gpt-4o-mini`) eller `REACT_APP_AI_PROXY_URL` om du har en extern server.
5. Starta om både backend och frontend efter ändringar.

### Backend-proxy
OpenAI-blockerar webbläsare direkt, därför finns en enkel Express-proxy i `server/index.js`.

```bash
# Installera beroenden (engångs)
npm install

# Starta proxyservern (lyssnar på http://localhost:5001)
npm run server

# I en annan terminal
npm start   # startar React-appen, proxyn fångar upp /api/ai
```

- Backend läser `OPENAI_API_KEY` från `.env.local` (eller `.env`/miljön när du deployar).
- I lokal utveckling fungerar allt tack vare `proxy`-fältet i `package.json`.
- I produktion sätter du `REACT_APP_AI_PROXY_URL` till den URL där du hostar servern (t.ex. en Vercel/Render/Heroku-endpoint) och deployar `server/index.js` som backend.

> Din OpenAI-nyckel ska inte längre ligga i `REACT_APP_*`. All känslig information stannar på servern.

## ☁️ Supabase-synk (valfri)

Vill du spara informationen i molnet istället för endast i localStorage kan du aktivera Supabase:

1. Skapa ett Supabase-projekt och kopiera URL + `anon`-nyckel.
2. Lägg till variablerna `REACT_APP_SUPABASE_URL` och `REACT_APP_SUPABASE_ANON_KEY` i `.env.local`.
3. Skapa tabellen `health_profiles` i Supabase (SQL):

```sql
create table if not exists public.health_profiles (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
```

> Om du vill använda en annan struktur går det bra – ändra bara tabellnamn/kolumner i `AppContext`.

Appen skapar automatiskt ett anonymt profil-id (`vårdcoachen-profile-id` i localStorage) och synkar allt innehåll till kolumnen `data`. Om Supabase inte är konfigurerat eller om synken misslyckas fortsätter appen använda localStorage som tidigare.

## 💾 Datalagring

All data lagras lokalt i webbläsarens localStorage:
- `vårdcoachen-diagnoses`
- `vårdcoachen-medications`
- `vårdcoachen-diary`
- `vårdcoachen-appointments`
- `vårdcoachen-aiNotes`
- `vårdcoachen-overallAiNotes`
- `vårdcoachen-medicationLog`
- `vårdcoachen-doctorVisits`
- `vårdcoachen-visitAiNotes`
- `vårdcoachen-notes`
- `vårdcoachen-profile-id` (endast när Supabase används)

**Begränsningar:**
- Data synkroniseras INTE mellan enheter
- Rensas om användaren rensar webbläsardata
- Ca 5MB lagringsutrymme

> Med Supabase aktiverat kan du nå samma data från flera enheter så länge du använder samma profil-id (hanteras automatiskt av appen).

### 🎯 Demodata för demo

Vill du snabbt demonstrera appen? Logga in, öppna sidan **Profil → Demodata för demo** och klicka på **Importera demodata**. Alla befintliga poster ersätts med ett komplett exempel (diagnoser, läkemedel, dagbok, besök m.m.) så att du kan visa funktionerna direkt på valfritt konto.

## ⚠️ Viktig information

**Vårdcoachen ersätter INTE medicinsk rådgivning.**

Kontakta alltid vården vid medicinska frågor. AI-funktionerna ger endast allmän information för att hjälpa dig förbereda dig för vårdbesök.

## 📝 Licens

Privat projekt. All kod är fri att använda för personligt bruk.
