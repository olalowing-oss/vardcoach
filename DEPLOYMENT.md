# 🚀 Deployment Guide - Vårdhjälpen på Vercel

## Snabbstart

### 1. Skapa Vercel-konto
1. Gå till https://vercel.com/signup
2. Logga in med ditt GitHub-konto
3. Godkänn åtkomst till dina repositories

### 2. Importera projektet
1. Klicka på "Add New..." → "Project"
2. Välj `vardcoach` från listan
3. Klicka "Import"

### 3. Konfigurera Environment Variables (VIKTIGT!)
Innan du deployar måste du lägga till din OpenAI API-nyckel:

1. I Vercel project settings, gå till **Environment Variables**
2. Lägg till följande:

| Name | Value | Environment |
|------|-------|-------------|
| `OPENAI_API_KEY` | `sk-your-api-key-here` | Production, Preview, Development |
| `OPENAI_MODEL` | `gpt-4o-mini` | Production, Preview, Development |

**OBS:** Byt ut `sk-your-api-key-here` mot din riktiga OpenAI API-nyckel!

### 4. Deploy
1. Klicka "Deploy"
2. Vänta 2-3 minuter medan Vercel bygger projektet
3. Klicka på den genererade URL:en (t.ex. `vardcoach.vercel.app`)

## 🔒 Säkerhet

### OpenAI API-nyckel
- ✅ Din API-nyckel lagras **ENDAST** på Vercel-servern
- ✅ Nyckeln exponeras **ALDRIG** i frontend-koden
- ✅ All kommunikation med OpenAI går via serverless function `/api/ai`

### Hur det fungerar
```
Din webbläsare → Vercel Frontend → /api/ai (serverless) → OpenAI API
                                     ↑
                                Nyckeln används här
                                (servern, ej klienten)
```

## 📝 Efter deployment

### Testa att allt fungerar
1. Öppna din deployed app
2. Gå till "Diagnoser"
3. Lägg till en diagnos och klicka "Analysera med AI"
4. Om du ser ett AI-genererat svar = ✅ Allt fungerar!

### Automatiska deployments
- Varje gång du pushar till GitHub `main`-branch deployar Vercel automatiskt
- Preview-deployments skapas för pull requests

## 🔧 Felsökning

### "OpenAI-nyckel saknas på servern"
- Kontrollera att du lagt till `OPENAI_API_KEY` i Vercel Environment Variables
- Gör en "Redeploy" efter att du lagt till nyckeln

### "API error 401"
- Din OpenAI API-nyckel är ogiltig
- Kontrollera att nyckeln börjar med `sk-`
- Skapa en ny nyckel på https://platform.openai.com/api-keys

### Build misslyckas
- Kolla build-loggen i Vercel dashboard
- Vanligaste felet: saknade dependencies (kör `npm install` lokalt först)

## 💰 Kostnader

### Vercel
- ✅ **Gratis** för hobby-projekt (100GB bandwidth/månad)

### OpenAI
- 💵 Betalas per API-anrop
- `gpt-4o-mini` kostar ~$0.15 per 1M input-tokens
- En typisk analys = ~500 tokens ≈ $0.000075 (0.0075 öre)
- Uppskattad kostnad: 100 analyser/dag ≈ $0.23/månad

## 🌐 Custom Domain (valfritt)

1. Gå till Vercel Project Settings → Domains
2. Lägg till din egen domän (t.ex. `vardcoach.se`)
3. Uppdatera DNS enligt Vercels instruktioner
4. SSL-certifikat skapas automatiskt

## 📱 PWA (Progressive Web App)

Appen fungerar som PWA automatiskt:
- Installera på mobilen via "Lägg till på hemskärmen"
- Fungerar offline (med cachad data)
- Får push-notifikationer (om aktiverat)

## 🔄 Uppdatera appen

```bash
# 1. Gör ändringar i koden
# 2. Committa
git add .
git commit -m "Uppdatera funktion X"

# 3. Pusha till GitHub
git push origin main

# 4. Vercel deployar automatiskt!
```

## 📞 Support

- Vercel docs: https://vercel.com/docs
- OpenAI API docs: https://platform.openai.com/docs
