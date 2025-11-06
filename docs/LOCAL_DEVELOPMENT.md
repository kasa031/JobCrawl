# Lokal Utvikling - Uten Railway

Dette prosjektet kan kjøres fullstendig lokalt uten Railway eller andre betalte tjenester. Frontend er deployet på GitHub Pages (gratis), og backend kan kjøres lokalt.

## Hvordan kjøre prosjektet lokalt

### 1. Backend (Lokalt)

Backend kjører på `http://localhost:3000` og trenger:
- PostgreSQL database (lokalt eller gratis tier)
- Node.js 18+
- Environment variables i `backend/env`

**Start backend:**
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend (Lokalt eller GitHub Pages)

Frontend kan kjøres lokalt eller bruke GitHub Pages deployment.

**Lokalt:**
```bash
cd frontend
npm install
# Sett VITE_API_URL=http://localhost:3000/api i .env fil
npm run dev
```

**GitHub Pages:**
- Frontend er allerede deployet på GitHub Pages
- For å endre API URL, sett `VITE_API_URL` environment variable i GitHub Actions eller bruk lokal backend

## Railway er IKKE nødvendig

- ✅ Frontend: GitHub Pages (gratis)
- ✅ Backend: Lokal utvikling (gratis)
- ✅ Database: Lokal PostgreSQL eller gratis tier (Supabase, Neon, etc.)

## Alternativer til Railway (hvis du vil ha backend i skyen)

Hvis du ønsker å deploye backend i skyen uten å betale, kan du bruke:

1. **Render** (gratis tier)
   - 750 timer/måned gratis
   - Automatisk deployment fra GitHub

2. **Fly.io** (gratis tier)
   - 3 shared-cpu VMs gratis
   - Bra for Node.js apps

3. **Supabase** (gratis tier)
   - PostgreSQL database + edge functions
   - 500 MB database, 2 GB bandwidth

4. **Neon** (gratis tier)
   - Serverless PostgreSQL
   - 0.5 GB storage gratis

## Konfigurasjon

### Backend Environment Variables (`backend/env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/jobcrawl
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
PORT=3000
NODE_ENV=development
```

### Frontend Environment Variables (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

## Testing

Prosjektet fungerer perfekt lokalt:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Database: Lokal PostgreSQL

Du trenger IKKE Railway for å utvikle eller teste prosjektet!

