# JobCrawl - Funksjoner og Features

## Oversikt
JobCrawl er en intelligent jobbsøknadspasient som hjelper deg med å finne relevante stillinger, generere søknader, og organisere søknadsprosessen.

## Hovedfunksjoner

### 🔍 Jobb-søking og Scraping
- **Automatisk scraping** fra flere norske jobbsider:
  - Finn.no
  - Manpower.no
  - Adecco.no
  - Arbeidsplassen.nav.no
  - Karriere.no
- **Intelligent søk**:
  - AI-drevet søkeord-ekspansjon
  - Støtte for lokasjonsfiltrering
  - Automatisk deduplisering av jobber
  - Fuzzy matching for å unngå duplikater
- **Scheduled scraping**: Automatisk oppdatering av jobber på konfigurerbare intervaller

### 🤖 AI-funksjoner
- **Søknadsbrev-generering**: Automatisk generering av tilpassede søknadsbrev basert på CV og stillingsbeskrivelse
- **Job matching score**: Vurderer hvor godt du matcher en stilling basert på dine ferdigheter
- **Søkeord-ekspansjon**: Utvider søkeordene dine for å finne flere relevante stillinger
- **Forbedringsforslag**: Får forslag til hvordan du kan forbedre match-scoren din

### 📊 Organisering og Sporing
- **Søknadssporing**: Hold oversikt over alle søknadene dine med status
- **Favoritter**: Bookmark jobber du er interessert i
- **Notater**: Legg til notater på hver søknad
- **Status-oppdatering**: Følg opp søknadene med status som:
  - Draft
  - Pending
  - Sent
  - Viewed
  - Rejected
  - Accepted
  - Interview
  - Offer

### 📝 CV-håndtering
- **CV-upload**: Last opp CV i flere formater:
  - PDF
  - Word (.doc, .docx)
  - ODT (OpenDocument Text)
  - RTF (Rich Text Format)
  - Plain Text (.txt)
- **Strukturert ekstraksjon**: Automatisk ekstraksjon av:
  - Personlig informasjon
  - Erfaring
  - Utdanning
  - Ferdigheter
  - Sammendrag

### 📧 Varsler
- **E-postvarsler**: Få e-post når nye relevante jobber blir funnet
- **Intelligent matching**: Varsler basert på:
  - Dine ferdigheter
  - Lokasjon
  - AI-match score
- **Konfigurerbar**: Kan aktiveres/deaktiveres via environment variables

### 📤 Export
- **PDF-export**: Eksporter søknader til PDF
- **Word-export**: Eksporter søknader til Word-dokumenter
- **Bulk-operasjoner**: Slett eller oppdater status for flere søknader samtidig

### 📈 Analytics
- **Dashboard**: Oversikt over din aktivitet:
  - Totalt antall jobber funnet
  - Totalt antall søknader sendt
  - Totalt antall favoritter
  - Status-oversikt
  - Kilde-oversikt
  - Månedlig statistikk

### 🎨 Brukeropplevelse
- **Dark mode**: Toggle mellom lyst og mørk modus
- **Responsive design**: Fungerer på alle enheter
- **Skeleton screens**: Bedre loading-opplevelse
- **Toast-notifikasjoner**: Ikke-intrusive varsler
- **Søkehistorikk**: Rask tilgang til tidligere søk
- **Paginering**: Effektiv visning av store lister
- **Sortering**: Sorter jobber og søknader etter ulike kriterier
- **Søk og filtrering**: Finn raskt det du leter etter

### 🔒 Sikkerhet
- **Rate limiting**: Beskyttelse mot spam og misbruk
  - Per-endpoint limits
  - Frontend rate limiting
  - Backend rate limiting med headers
- **Autentisering**: JWT-basert autentisering
- **E-postverifisering**: Bekreft e-postadresse før bruk
- **Sikker lagring**: Passord hashet med bcrypt

### ⚡ Ytelse
- **Caching**: In-memory cache for scraped jobs (20 minutter TTL)
- **Database-indeksering**: Optimaliserte database-spørringer
- **Parallell scraping**: Scraper fra flere kilder samtidig
- **Retry-strategi**: Automatisk retry ved feil med exponential backoff

### 🧪 Testing
- **Unit tests**: Omfattende test-suite for kritiske komponenter:
  - CacheService
  - Deduplication
  - RetryStrategy

## Teknisk Stack

### Frontend
- React 18 med TypeScript
- Tailwind CSS for styling
- Framer Motion for animasjoner
- React Router for navigasjon
- Axios for API-kommunikasjon

### Backend
- Node.js med Express
- TypeScript
- Prisma ORM med PostgreSQL
- Puppeteer for web scraping
- OpenAI API for AI-funksjoner
- Winston for logging

### Deployment
- Frontend: GitHub Pages
- Backend: Lokalt eller valgfritt hosting (Render, Fly.io, etc.)

## Kommende funksjoner
- Flere jobbkilder (nav.no, etc.)
- E-postvarsler med mer detaljerte preferanser
- Avanserte søkefiltre
- Jobb-anbefalinger basert på historikk
- Integrasjon med LinkedIn
- Mobile app

