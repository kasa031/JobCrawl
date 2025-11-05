# JobCrawl - Development Guide

## Prosjektoversikt

JobCrawl er en intelligent jobbsøknadspasient som automatisk crawler relevante stillinger fra norske jobbsider og bruker AI til å generere tilpassede søknader.

## Teknologi-Stack

### Frontend
- **React 19** - Moderne UI bibliotek
- **TypeScript** - Type safety
- **Vite** - Rask build tool
- **Tailwind CSS** - Utility-first CSS med mocca-fargepalett
- **Framer Motion** - Smooth animasjoner
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for database
- **PostgreSQL** - Relational database
- **Puppeteer** - Web scraping og browser automation
- **OpenAI API** - AI-generering

## Prosjektstruktur

```
jobcrawl/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   ├── tailwind.config.js
│   └── package.json
├── backend/               # Node.js backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   │   ├── ai/       # AI service
│   │   │   └── scraper/  # Web scraping
│   │   └── types/        # TypeScript types
│   ├── prisma/           # Database schema
│   └── package.json
└── database/             # Database migrations
```

## Oppsett og Installasjon

### Forutsetninger
- Node.js 18+
- PostgreSQL 14+
- Git

### Steg 1: Klone og installer
```bash
# Installer root dependencies
npm install

# Installer frontend dependencies
cd frontend
npm install

# Installer backend dependencies
cd ../backend
npm install
```

### Steg 2: Database Setup
```bash
# Opret PostgreSQL database
createdb jobcrawl

# Kopier environment fil
cp backend/env.example backend/.env

# Rediger backend/.env og sett riktig DATABASE_URL
# DATABASE_URL=postgresql://user:password@localhost:5432/jobcrawl
```

### Steg 3: Database Migrasjon
```bash
cd backend
npm run db:migrate
npm run db:seed
```

### Steg 4: Environment Variables

**Frontend** - Opprett `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

**Backend** - Rediger `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/jobcrawl
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=your_openai_api_key
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Steg 5: Start Development
```bash
# Fra root
npm run dev

# Eller start separat:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## API Endpoints

### Health Check
- `GET /api/health` - API status

### Jobs
- `GET /api/jobs` - List alle jobber (med pagination og filtering)
- `GET /api/jobs/:id` - Hent spesifik jobb
- `POST /api/jobs/refresh` - Trigger scraping job

### AI Services
- `POST /api/ai/cover-letter` - Generer søknadsbrev
- `POST /api/ai/match` - Match job med profil
- `POST /api/ai/suggestions` - Få forbedringsforslag

## Database Schema

### Users
- User authentication og basic info

### Profiles
- Extended user profile (CV, skills, preferences)

### Job Listings
- Scraped job postings fra ulike kilder

### Applications
- User søknader og deres status

## Fargepalett

Prosjektet bruker en mocca/champagne fargepalett:

- **Background**: `#FAF5F0` (mocca-50)
- **Cards**: `#F5ECE2` (mocca-100)
- **Text**: `#3D2F1F` (dark-text)
- **Headings**: `#2A2018` (bold-heading)
- **Buttons**: `#C29B73` (mocca-400)

Se `docs/COLOR_PALETTE.md` for full oversikt.

## Web Scraping

Scraper service er designet for å crawl:
- Finn.no
- Manpower
- Andre norske jobbsider (enkel å utvide)

### Legg til ny scraper:
1. Opprett ny scraper klasse i `backend/src/services/scraper/`
2. Definer selectors for siden
3. Legg til i `jobController.refreshJobs()`

## AI Funksjonalitet

### Cover Letter Generation
Bruker OpenAI GPT-4 til å generere personlige søknadsbrev basert på:
- Jobbannonse
- Brukerens profil
- Relevante ferdigheter

### Job Matching
Vurderer hvor godt en bruker passer for en stilling basert på:
- Kompetanser
- Erfaring
- Utdanning

### Profile Suggestions
Gir forbedringsforslag for brukerens profil.

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

### Build
```bash
npm run build
```

### Production
Bruk Docker for deployment:
```bash
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues
- Sjekk at PostgreSQL kjører
- Verifiser DATABASE_URL i .env
- Prøv å kjøre `npm run db:push` i backend

### Web Scraping Issues
- Noen sider kan blokkere Puppeteer
- Sjekk rate limiting
- Implementer captcha handling hvis nødvendig

### AI API Issues
- Verifiser OPENAI_API_KEY
- Sjekk API quota
- Fallback til mock data er implementert

## Videreutvikling

### Mulige forbedringer
- [ ] Implementere autentisering (JWT)
- [ ] File upload for CV
- [ ] Avanserte filtre for jobber
- [ ] Email notifikasjoner
- [ ] Analytics dashboard
- [ ] Mobile app

## Licens

MIT

