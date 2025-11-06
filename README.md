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
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Scraping**: Puppeteer, Cheerio
- **AI**: OpenAI API

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
- npm or yarn

### Installation
```bash
npm run install:all
```

### Development
```bash
npm run dev
```

This will start both frontend and backend in development mode.

### Environment Setup
Create `.env` files in both `frontend/` and `backend/` directories:

**Backend `.env`:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/jobcrawl
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
PORT=3000
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000/api
```

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

## License
MIT

