# JobCrawl - Bachelor Project Architecture

## Projektoversikt
JobCrawl er en intelligent jobbsøknadspasient som automatisk crawler relevante stillinger og genererer tilpassede søknader basert på brukerens profil.

## Teknologistack

### Frontend
- **React 18+** - Moderne UI bibliotek
- **TypeScript** - Type safety
- **Vite** - Rask build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animasjoner
- **React Router** - Routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Puppeteer** - Web scraping og browser automation
- **Cheerio** - Server-side HTML parsing
- **Joi** - Input validation
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication

### Database
- **PostgreSQL** - Relational database
- **Prisma** - ORM (Object-Relational Mapping)
- **pg** - PostgreSQL client

### AI Integration
- **OpenAI API** - GPT models for søknadsgenerering
- **Natural language processing** - Job matching algoritmer

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container setup
- **Git** - Version control
- **ESLint & Prettier** - Code quality
- **Jest** - Frontend testing
- **Mocha/Chai** - Backend testing
- **Cypress** - E2E testing

## Fargepalett - Mocca/Champagne Theme

### Hovedfarger
```css
--mocca-50: #FAF5F0;    /* Lysest - brukes for background */
--mocca-100: #F5ECE2;   /* Svært lys champaigne */
--mocca-200: #E8D5C1;   /* Lys champaigne */
--mocca-300: #D4B99A;   /* Medium mocca */
--mocca-400: #C29B73;   /* Standard mocca */
--mocca-500: #A67E5A;   /* Mørk mocca */
--mocca-600: #8B6B47;   /* Mørkere mocca */
--mocca-700: #6B5439;   /* Svært mørk mocca */
```

### Aksentfarger
```css
--champaigne: #F7E7CE;  /* Champagne accent */
--dark-text: #3D2F1F;  /* Mørk tekst - hovedtekst */
--bold-heading: #2A2018; /* Ekstra mørk for overskrifter */
```

### Bruksområder
- **Background**: `#FAF5F0` (mocca-50)
- **Cards**: `#F5ECE2` (mocca-100) eller `#E8D5C1` (mocca-200)
- **Ordinary text**: `#3D2F1F` (dark-text)
- **Headings**: `#2A2018` (bold-heading) med font-weight: 700
- **Buttons**: `#C29B73` (mocca-400) med hover-state
- **Accents**: `#F7E7CE` (champaigne) for highlights

## Arkitektur - Microservices

```
┌─────────────────────────────────────────────────┐
│              Frontend (React)                    │
│  - Dashboard                                     │
│  - Job browsing & filtering                     │
│  - Profile management                            │
│  - Application tracking                          │
└──────────────┬────────────────────────────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────────────────────────┐
│           Backend (Node.js/Express)             │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Auth        │  │ User         │            │
│  │  Service     │  │ Service      │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Scraping    │  │ AI          │            │
│  │  Service     │  │ Service     │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
└──────────────┬────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│           PostgreSQL Database                   │
│  - Users, profiles, credentials                   │
│  - Job listings & metadata                      │
│  - Applications & status                         │
│  - AI-generated content                          │
└─────────────────────────────────────────────────┘

External Services:
├─ OpenAI API (AI generation)
├─ Finn.no (Job scraping)
├─ Manpower (Job scraping)
└─ Other job sites
```

## Database Schema

### Users Table
```sql
- id (UUID, PK)
- email (String, unique)
- password_hash (String)
- full_name (String)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Profiles Table
```sql
- id (UUID, PK)
- user_id (UUID, FK → Users)
- cv_path (String)
- skills (Text[])
- experience (Integer) // years
- education (Text)
- location (String)
- preferences (JSON)
```

### Job Listings Table
```sql
- id (UUID, PK)
- title (String)
- company (String)
- location (String)
- url (String)
- description (Text)
- requirements (Text[])
- source (String) // e.g., "finn.no", "manpower"
- scraped_at (Timestamp)
- published_date (Date)
```

### Applications Table
```sql
- id (UUID, PK)
- user_id (UUID, FK → Users)
- job_listing_id (UUID, FK → Job Listings)
- status (Enum) // pending, sent, rejected, accepted
- cover_letter (Text) // AI-generated
- sent_date (Timestamp)
- response (Text)
```

## API Endpoints Design

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs/search` - Search jobs
- `POST /api/jobs/refresh` - Trigger scraping job

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/upload-cv` - Upload CV

### Applications
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application status
- `DELETE /api/applications/:id` - Delete application

### AI Services
- `POST /api/ai/generate-cover-letter` - Generate cover letter
- `POST /api/ai/match-jobs` - Get matched jobs for user

## Sikkerhet og GDPR
- Password hashing med bcrypt
- JWT authentication
- HTTPS enforcement
- GDPR-compliant data storage
- User consent for data processing
- Right to deletion functionality
- Data encryption at rest

## Deployment
- Docker containers
- Docker Compose for local development
- Production ready for cloud deployment (Heroku, AWS, Azure)

## Scalability Considerations
- Database indexing for performance
- Caching strategy (Redis potential)
- Rate limiting for scraping
- Queue system for background jobs (Bull/BullMQ)

