# JobCrawl - Intelligent Job Application Assistant

## About
JobCrawl er en intelligent jobbsøknadspasient designet for bachelorprosjekt. Systemet crawler relevante stillinger fra norske jobbsider og bruker AI til å generere tilpassede søknader basert på brukerens profil.

## Features
- 🤖 **AI-powered søknadsgenerering** - Automatisk generering av tilpassede søknader
- 🔍 **Smart web scraping** - Crawler fra 6 norske jobbsider (Finn.no, Manpower, Adecco, Arbeidsplassen, Karriere, og flere)
- 👤 **Brukerprofiler** - Lagre CV, kompetanser og preferanser
- 📊 **Jobbmatching** - Intelligent matching av relevante stillinger med AI-scoring
- 📝 **Søknadssporing** - Oversikt over sendte søknader og status
- 📧 **E-postvarsler** - Få varsler når nye relevante jobber blir funnet
- 📤 **Export** - Eksporter søknader til PDF eller Word
- 📈 **Analytics** - Dashboard med statistikk og oversikt
- 🎨 **Moderne UI** - Elegant mocca/champagne fargepalett med dark mode
- ⚡ **Høy ytelse** - Caching, parallell scraping, og optimaliserte database-spørringer

Se [docs/FEATURES.md](docs/FEATURES.md) for en komplett liste over alle funksjoner.

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Scraping**: Puppeteer, Cheerio
- **AI**: OpenAI API / OpenRouter (gratis) / Google Gemini (gratis)
- **Email**: Nodemailer med SMTP support (Gmail, iCloud, MailHog)
- **Logging**: Winston
- **Authentication**: JWT

## Project Structure
```
jobcrawl/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend
├── database/          # Database migrations and schemas
└── docs/              # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm eller yarn
- (Valgfritt) MailHog for email testing i development

### Installation

1. **Klon repositoriet:**
```bash
git clone <repository-url>
cd JobCrawl
```

2. **Installer alle dependencies:**
```bash
npm run install:all
```

3. **Sett opp database:**
```bash
cd backend
npx prisma migrate dev
# eller
npx prisma db push
```

4. **Konfigurer environment variabler:**
- Kopier `backend/.env.example` til `backend/env`
- Fyll ut påkrevde variabler (DATABASE_URL, JWT_SECRET)
- Se `backend/.env.example` for detaljert dokumentasjon

5. **Start utviklingsserver:**
```bash
# Fra root directory
npm run dev

# Eller separat:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Eller bruk start script:**
- Windows: `scripts/START_TESTING.bat`
- Mac/Linux: `chmod +x scripts/START_TESTING.sh && ./scripts/START_TESTING.sh`

Frontend vil være tilgjengelig på http://localhost:5173/JobCrawl/
Backend API vil være tilgjengelig på http://localhost:3000/api

### 📱 Testing på Mobil, Nettbrett og PC

JobCrawl er konfigurert for testing på alle enheter på samme Wi-Fi nettverk!

**Se `TESTING_GUIDE.md` for detaljerte instruksjoner.**

**Kort versjon:**
1. Start både backend og frontend (se over)
2. Noter IP-adressen som vises i terminalen (f.eks. `192.168.1.252`)
3. På mobil/nettbrett: Åpne `http://[IP-ADRESSE]:5173/JobCrawl/` i nettleseren
4. Alle enheter må være på samme Wi-Fi nettverk

### Environment Setup

#### Backend Environment Variables

Kopier `backend/.env.example` til `backend/env` og fyll ut verdiene:

**Påkrevde variabler:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/jobcrawl
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
```

**Valgfrie variabler (har standardverdier):**
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AI Configuration (velg én provider)
AI_PROVIDER=openai  # eller 'openrouter' eller 'gemini'
OPENAI_API_KEY=your_openai_api_key
# ELLER
OPENROUTER_API_KEY=your_openrouter_api_key  # Gratis tier
# ELLER
GEMINI_API_KEY=your_gemini_api_key  # Gratis tier

# Email Configuration (valgfritt - bruk MailHog for development)
SMTP_HOST=localhost
SMTP_PORT=1025
```

**Se `backend/.env.example` for komplett liste over alle variabler med dokumentasjon.**

#### Frontend Environment Variables

Opprett `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

#### MailHog Setup (for Email Testing)

For development, kan du bruke MailHog for å teste email funksjonalitet:

1. Last ned MailHog fra https://github.com/mailhog/MailHog
2. Start MailHog: `./mailhog.exe` (Windows) eller `mailhog` (Linux/Mac)
3. MailHog UI: http://localhost:8025
4. Sett i `backend/env`:
   ```env
   SMTP_HOST=localhost
   SMTP_PORT=1025
   ```

## API Endpoints

### Health Check
```
GET /api/health
```
Returnerer status for alle tjenester (database, AI, email, cache).

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Jobs
```
GET  /api/jobs
GET  /api/jobs/:id
POST /api/jobs/refresh
```

### Applications
```
GET    /api/applications
POST   /api/applications
PUT    /api/applications/:id
DELETE /api/applications/:id
POST   /api/applications/bulk/delete
POST   /api/applications/bulk/update-status
```

### AI
```
POST /api/ai/cover-letter
POST /api/ai/cover-letter-from-text
POST /api/ai/match
POST /api/ai/suggest-improvements
```

### Profile
```
GET    /api/profile
PUT    /api/profile
POST   /api/profile/cv
DELETE /api/profile/cv
GET    /api/profile/cv
```

### Analytics
```
GET /api/analytics
```

**Se `backend/.env.example` for detaljert dokumentasjon av alle variabler.**

## Deployment

### Frontend (GitHub Pages)
Frontend er automatisk deployet til GitHub Pages når du pusher til `main` branch.

### Backend (Lokalt eller valgfritt)
Backend kan kjøres lokalt eller deployes til en gratis hosting-tjeneste:
- **Lokalt**: `npm run dev` i `backend/` mappen
- **Gratis alternativer**: Render, Fly.io, Supabase, Neon
- **Railway er IKKE nødvendig** - prosjektet fungerer perfekt lokalt

Se [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md) for detaljer.

## Color Palette
The application uses a beautiful mocca/champagne color scheme:
- **Background**: `#FAF5F0` (Lightest mocca)
- **Cards**: `#F5ECE2` (Light champagne)
- **Text**: `#3D2F1F` (Dark brown)
- **Headings**: `#2A2018` (Bold dark)
- **Buttons**: `#C29B73` (Medium mocca)

## Troubleshooting

### Jobs Not Loading
- Sjekk at backend server kjører på `http://localhost:3000`
- Verifiser at database har jobber (eller bruk "Refresh Jobs" for å scrape)
- Sjekk browser console for CORS eller nettverksfeil
- Se [docs/troubleshooting/TROUBLESHOOTING_JOBS.md](docs/troubleshooting/TROUBLESHOOTING_JOBS.md) for detaljert guide

### Database Connection Issues
- Sjekk at PostgreSQL kjører: `pg_isready`
- Verifiser DATABASE_URL format: `postgresql://user:password@host:port/database`
- Test tilkobling: `npx prisma db pull`

### Email Issues
- For development: Bruk MailHog (http://localhost:8025)
- For produksjon: Konfigurer SMTP (Gmail/iCloud)
- Sjekk app passwords for Gmail/iCloud

### AI Service Issues
- Sjekk at API key er satt riktig
- Verifiser AI_PROVIDER setting
- Test med health check: `GET /api/health`

### Authentication Issues
- Sjekk at JWT_SECRET er satt (minimum 32 tegn)
- Verifiser token i browser DevTools
- Sjekk at email er verifisert før innlogging

## Dokumentasjon

Se [docs/README.md](docs/README.md) for komplett dokumentasjonsoversikt.

### Hoveddokumentasjon
- **Getting Started**: [docs/getting-started/](docs/getting-started/) - Oppstartsguider
- **Setup Guide**: [docs/setup/](docs/setup/) - Setup og konfigurasjon
- **API Dokumentasjon**: [docs/api/API_DOCUMENTATION.md](docs/api/API_DOCUMENTATION.md) - Komplett API dokumentasjon
- **Testing Guide**: [docs/testing/TESTING_GUIDE.md](docs/testing/TESTING_GUIDE.md) - Test på mobil, nettbrett og PC
- **Troubleshooting**: [docs/troubleshooting/](docs/troubleshooting/) - Feilsøking
- **PWA Guide**: [docs/pwa/](docs/pwa/) - Progressive Web App installasjon
- **Security**: [docs/security/](docs/security/) - Sikkerhetsregler og best practices
- **Deployment**: [docs/deployment/](docs/deployment/) - Deploy-instruksjoner

### Teknisk dokumentasjon
- **Environment Variables**: Se `backend/env.example`
- **API Endpoints**: Se seksjonen over
- **Database Schema**: Se `backend/prisma/schema.prisma`
- **Project Architecture**: [docs/development/PROJECT_ARCHITECTURE.md](docs/development/PROJECT_ARCHITECTURE.md)
- **TODO Liste**: Se [TODO_SAMLET.md](TODO_SAMLET.md)

## License
MIT

