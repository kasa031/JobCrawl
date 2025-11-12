# 🔧 Produksjon API Setup - GitHub Pages

## Problem
Når frontend er deployet på GitHub Pages (.io), prøver den å koble til `localhost:3000` som ikke fungerer fra mobil eller eksterne enheter.

## Løsning

### Alternativ 1: Sett VITE_API_URL under build (Anbefalt)

1. **Deploy backend til en gratis hosting-tjeneste:**
   - Railway: https://railway.app
   - Render: https://render.com
   - Fly.io: https://fly.io
   - Supabase: https://supabase.com

2. **Få backend URL** (f.eks. `https://jobcrawl-backend.railway.app`)

3. **Sett environment variable før build:**
   ```bash
   # Windows PowerShell
   $env:VITE_API_URL="https://jobcrawl-backend.railway.app/api"
   npm run build

   # Mac/Linux
   VITE_API_URL="https://jobcrawl-backend.railway.app/api" npm run build
   ```

4. **Eller opprett `.env.production` fil:**
   ```env
   VITE_API_URL=https://jobcrawl-backend.railway.app/api
   ```

5. **Build og deploy:**
   ```bash
   npm run build
   # Deploy dist/ mappen til GitHub Pages
   ```

### Alternativ 2: Bruk GitHub Actions med Environment Variables

1. **Legg til secrets i GitHub:**
   - Gå til repository → Settings → Secrets and variables → Actions
   - Legg til `VITE_API_URL` secret

2. **Oppdater GitHub Actions workflow:**
   ```yaml
   - name: Build
     env:
       VITE_API_URL: ${{ secrets.VITE_API_URL }}
     run: npm run build
   ```

### Alternativ 3: Lokal Testing med Nettverks-IP

For lokal testing på mobil/nettbrett (ikke produksjon):

1. **Start backend lokalt:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Noter IP-adressen** (f.eks. `192.168.1.252`)

3. **Start frontend med API URL:**
   ```bash
   cd frontend
   $env:VITE_API_URL="http://192.168.1.252:3000/api"
   npm run dev
   ```

4. **På mobil:** Gå til `http://192.168.1.252:5173/JobCrawl/`

## Feilsøking

### "Cannot connect to server" på mobil
- Sjekk at backend kjører lokalt
- Sjekk at mobil er på samme Wi-Fi
- Sjekk Windows Firewall
- Sjekk at `VITE_API_URL` er satt riktig

### "Network error" i produksjon
- Backend må være deployet og tilgjengelig
- `VITE_API_URL` må være satt under build
- CORS må tillate GitHub Pages domain

### Browser Extension Errors
Feilmeldinger fra `content_script.js` er fra nettleserutvidelser (password managers, etc.) og kan ignoreres. De påvirker ikke JobCrawl.

## Nåværende Status

- ✅ Frontend detekterer automatisk produksjon vs development
- ✅ API URL logikk er forbedret
- ⚠️ Du må sette `VITE_API_URL` for produksjon
- ⚠️ Backend må deployes separat for produksjon

## Quick Fix for Testing

For å teste på mobil med lokal backend:

1. Start backend: `cd backend && npm run dev`
2. Noter IP (f.eks. `192.168.1.252`)
3. Start frontend: 
   ```powershell
   cd frontend
   $env:VITE_API_URL="http://192.168.1.252:3000/api"
   npm run dev
   ```
4. På mobil: `http://192.168.1.252:5173/JobCrawl/`

