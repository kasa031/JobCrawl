# 🚀 GitHub Setup Guide - JobCrawl

## ✅ Fullført
- [x] Git repository initialisert
- [x] Kode pushet til GitHub (https://github.com/kasa031/JobCrawl)
- [x] API-nøkler fjernet fra dokumentasjon
- [x] .gitignore sikret (env-filer ekskludert)

---

## 📝 Legge til beskrivelse i GitHub

1. Gå til: https://github.com/kasa031/JobCrawl
2. Klikk på **"⚙️ Settings"** (høyeste menylinje)
3. Scroll ned til **"About"** seksjonen
4. Klikk på **✏️ (edit)** ikonet
5. Legg til:
   - **Description:** `Intelligent job application assistant with AI-powered cover letter generation and smart job scraping from Norwegian job sites`
   - **Website (valgfritt):** 
     - Hvis du har satt opp GitHub Pages: `https://kasa031.github.io/JobCrawl/`
     - Eller la det stå tomt hvis du ikke har en deployed nettside ennå
   - **Topics:** Legg til relevante tags (alle må starte med liten bokstav, maks 50 tegn):
     - `job-search`
     - `ai`
     - `web-scraping`
     - `react`
     - `typescript`
     - `postgresql`
     - `openrouter`
     - `norway`
     - `puppeteer`
     - `express`
     - `nodejs`
     - `tailwindcss`
     - `prisma`
     
     **⚠️ Viktig:** Alle topics må starte med liten bokstav, maks 50 tegn, kun bindestreker tillatt!
6. Klikk **"Save changes"**

---

## 🌐 Sette opp GitHub Pages

**Valg 1: Frontend publisering (anbefalt)**

1. Gå til: https://github.com/kasa031/JobCrawl/settings/pages
2. Under **"Source"**:
   - Velg branch: **`main`**
   - Velg folder: **`/ (root)`** eller **`/frontend/dist`** (hvis du har bygget frontend)
3. Klikk **"Save"**
4. Vent 1-2 minutter, så får du en lenke: `https://kasa031.github.io/JobCrawl/`

**⚠️ Merk:** Hvis du velger root, må du bygge frontend først:
```powershell
cd frontend
npm run build
```

**Valg 2: Dokumentasjon (enklere)**

Hvis du vil publisere dokumentasjon i stedet:
1. Opprett en `docs` mappe med `index.html`
2. Velg branch: `main`, folder: `/docs`

---

## 🔒 Sikkerhet - Huskeregler

### ✅ ALDRI commit:
- ❌ `backend/env` (eller noen `.env` filer)
- ❌ API-nøkler i dokumentasjonsfiler
- ❌ Passord eller secrets i kode
- ❌ Database credentials

### ✅ ALLTID:
- ✅ Bruk `.gitignore` for env-filer
- ✅ Bruk `env.example` for eksempel
- ✅ Sjekk `git status` før commit
- ✅ Review endringer før push

---

## 📋 Neste steg

1. ✅ Legg til beskrivelse i GitHub (se over)
2. ✅ Sett opp GitHub Pages (valgfritt)
3. ✅ Test at alt fungerer lokalt
4. ✅ Oppdater README.md med screenshots

---

## 🔗 Nyttige lenker

- **Repository:** https://github.com/kasa031/JobCrawl
- **Settings:** https://github.com/kasa031/JobCrawl/settings
- **Pages:** https://github.com/kasa031/JobCrawl/settings/pages

