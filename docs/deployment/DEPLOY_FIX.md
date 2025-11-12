# 🔧 Fix: GitHub Pages viser README i stedet for appen

## Problem
GitHub Pages serverer README.md i stedet for React-appen.

## Løsning

### Steg 1: Sjekk GitHub Pages Settings

1. Gå til: https://github.com/kasa031/JobCrawl/settings/pages
2. Under **"Source"**, sjekk hva som er valgt:
   
   **❌ Hvis det står "Deploy from a branch" med "root" eller "/" som folder:**
   - Dette er feil! Dette serverer README.md
   
   **✅ Riktig innstilling:**
   - Velg: **"GitHub Actions"** (automatisk deploy)
   - ELLER velg: **"Deploy from a branch"** → Branch: `main` → Folder: **`/frontend/dist`**

### Steg 2: Hvis GitHub Actions ikke fungerer

1. Gå til: https://github.com/kasa031/JobCrawl/actions
2. Sjekk om workflow-en "Deploy to GitHub Pages" har kjørt
3. Hvis den feiler, klikk på den og se feilmeldingen

### Steg 3: Manuell løsning (hvis GitHub Actions ikke fungerer)

1. Gå til: https://github.com/kasa031/JobCrawl/settings/pages
2. Under **"Source"**:
   - Velg: **"Deploy from a branch"**
   - Branch: **`main`**
   - Folder: **`/frontend/dist`** (IKKE `/` eller `/root`)
3. Klikk **"Save"**
4. Vent 1-2 minutter
5. Refresh siden: https://kasa031.github.io/JobCrawl/

### Steg 4: Verifiser at det fungerer

1. Gå til: https://kasa031.github.io/JobCrawl/
2. Du skal nå se JobCrawl-appen (med login/register), IKKE README
3. Hvis du fortsatt ser README, vent litt lenger (GitHub Pages tar noen minutter)

---

## 🔍 Hvordan vite om det fungerer

**❌ Feil (ser README):**
- Du ser "About", "Features", "Technology Stack", "Project Structure"
- Dette er README.md innholdet

**✅ Riktig (ser appen):**
- Du ser "JobCrawl" header med menyer
- Du ser "Login" eller "Register" knapper
- Du ser appens UI, ikke dokumentasjon

---

## 📝 Hvis det fortsatt ikke fungerer

1. Sjekk at `frontend/dist` mappen er committet til GitHub
2. Sjekk at GitHub Actions workflow kjører (https://github.com/kasa031/JobCrawl/actions)
3. Vent 3-5 minutter etter endring (GitHub Pages kan være treg)
4. Prøv å åpne i inkognito/private modus (cache kan være problemet)

