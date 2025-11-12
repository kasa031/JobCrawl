# 📚 API Dokumentasjon - JobCrawl Backend

**Base URL:** `http://localhost:3000/api`  
**Version:** 1.0.0

## 🔐 Autentisering

De fleste endpoints krever autentisering via JWT token. Send token i Authorization header:
```
Authorization: Bearer <token>
```

Token oppnås via `/api/auth/login` eller `/api/auth/register`.

---

## 🏥 Health Check

### GET /api/health

Sjekk status for alle tjenester.

**Response:**
```json
{
  "status": "OK",
  "message": "JobCrawl API is running",
  "timestamp": "2024-11-06T12:00:00.000Z",
  "services": {
    "database": {
      "status": "OK",
      "message": "Database connection successful"
    },
    "ai": {
      "status": "OK",
      "provider": "openai",
      "message": "AI service configured"
    },
    "email": {
      "status": "OK",
      "message": "Email service configured"
    },
    "cache": {
      "status": "OK",
      "message": "Cache service available"
    }
  }
}
```

**Status Codes:**
- `200` - OK
- `503` - Service Unavailable (DEGRADED status)

---

## 🔑 Authentication Endpoints

### POST /api/auth/register

Registrer ny bruker.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "Ola Nordmann"
}
```

**Response:**
```json
{
  "message": "User created. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Ola Nordmann",
    "emailVerified": false
  },
  "requiresVerification": true
}
```

**Status Codes:**
- `201` - Created
- `400` - Bad Request (validation error)
- `409` - Conflict (user already exists)

---

### POST /api/auth/login

Logg inn bruker.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Ola Nordmann",
    "emailVerified": true
  }
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (email not verified)

---

### GET /api/auth/me

Hent informasjon om innlogget bruker.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Ola Nordmann",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "profile": {
      "skills": ["JavaScript", "React"],
      "experience": 5,
      "location": "Oslo"
    }
  }
}
```

**Status Codes:**
- `200` - OK
- `401` - Unauthorized

---

### GET /api/auth/verify-email

Verifiser e-postadresse.

**Query Parameters:**
- `token` (string, required) - Verifiserings token fra e-post

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request (invalid token)
- `404` - Not Found (user not found)

---

### POST /api/auth/resend-verification

Send ny verifiserings e-post.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists with this email, a verification link has been sent."
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request

---

### POST /api/auth/forgot-password

Be om passordtilbakestilling.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Hvis en bruker med denne e-postadressen finnes, vil du motta en e-post med instruksjoner for å tilbakestille passordet."
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request

---

### POST /api/auth/reset-password

Tilbakestill passord med token.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123"
}
```

**Response:**
```json
{
  "message": "Passordet ditt har blitt tilbakestilt. Du kan nå logge inn med ditt nye passord."
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request (invalid/expired token)

---

## 💼 Jobs Endpoints

### GET /api/jobs

Hent liste over jobber.

**Query Parameters:**
- `page` (number, optional) - Side nummer (default: 1)
- `limit` (number, optional) - Antall per side (default: 20)
- `search` (string, optional) - Søketekst
- `location` (string, optional) - Lokasjon filter
- `source` (string, optional) - Kilde filter (finn.no, manpower, etc.)

**Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Frontend Utvikler",
      "company": "Tech Solutions AS",
      "location": "Oslo",
      "url": "https://...",
      "description": "...",
      "source": "finn.no",
      "publishedDate": "2024-01-01T00:00:00.000Z",
      "scrapedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

**Status Codes:**
- `200` - OK

---

### GET /api/jobs/:id

Hent spesifikk jobb.

**Path Parameters:**
- `id` (UUID, required) - Jobb ID

**Response:**
```json
{
  "id": "uuid",
  "title": "Frontend Utvikler",
  "company": "Tech Solutions AS",
  "location": "Oslo",
  "url": "https://...",
  "description": "...",
  "requirements": ["JavaScript", "React"],
  "source": "finn.no",
  "publishedDate": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request (invalid UUID)
- `404` - Not Found

---

### POST /api/jobs/refresh

Oppdater jobbliste ved å scrape nye jobber.

**Request Body (optional):**
```json
{
  "q": "developer",
  "location": "Oslo"
}
```

**Query Parameters (fallback):**
- `q` (string, optional) - Søkeord
- `location` (string, optional) - Lokasjon

**Response:**
```json
{
  "message": "Jobs refreshed successfully",
  "saved": 15,
  "skipped": 5
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request
- `429` - Too Many Requests (rate limited)

---

## 📝 Applications Endpoints

**Alle endpoints krever autentisering.**

### GET /api/applications

Hent alle søknader for innlogget bruker.

**Query Parameters:**
- `page` (number, optional) - Side nummer
- `limit` (number, optional) - Antall per side
- `status` (string, optional) - Filter på status

**Response:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "jobListingId": "uuid",
      "status": "PENDING",
      "coverLetter": "...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "jobListing": {
        "title": "Frontend Utvikler",
        "company": "Tech Solutions AS"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "pages": 1
  }
}
```

**Status Codes:**
- `200` - OK
- `401` - Unauthorized

---

### POST /api/applications

Opprett ny søknad.

**Request Body:**
```json
{
  "jobListingId": "uuid",
  "coverLetter": "Søknadstekst...",
  "status": "DRAFT"
}
```

**Response:**
```json
{
  "id": "uuid",
  "jobListingId": "uuid",
  "status": "DRAFT",
  "coverLetter": "...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found (job not found)

---

### PUT /api/applications/:id

Oppdater søknad.

**Path Parameters:**
- `id` (UUID, required) - Application ID

**Request Body:**
```json
{
  "status": "SENT",
  "coverLetter": "Oppdatert tekst...",
  "notes": "Sendt via e-post"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "SENT",
  "coverLetter": "...",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found

---

### DELETE /api/applications/:id

Slett søknad.

**Path Parameters:**
- `id` (UUID, required) - Application ID

**Response:**
```json
{
  "message": "Application deleted successfully"
}
```

**Status Codes:**
- `200` - OK
- `401` - Unauthorized
- `404` - Not Found

---

### POST /api/applications/bulk/delete

Slett flere søknader.

**Request Body:**
```json
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "message": "Applications deleted successfully",
  "deleted": 3
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request
- `401` - Unauthorized

---

### POST /api/applications/bulk/update-status

Oppdater status for flere søknader.

**Request Body:**
```json
{
  "ids": ["uuid1", "uuid2"],
  "status": "SENT"
}
```

**Response:**
```json
{
  "message": "Applications updated successfully",
  "updated": 2
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request
- `401` - Unauthorized

---

## 🤖 AI Endpoints

**Alle endpoints krever autentisering.**

### POST /api/ai/cover-letter

Generer søknadsbrev basert på jobb ID.

**Request Body:**
```json
{
  "jobId": "uuid"
}
```

**Response:**
```json
{
  "coverLetter": "Generert søknadsbrev tekst..."
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found

---

### POST /api/ai/cover-letter-from-text

Generer søknadsbrev fra stillingsbeskrivelse tekst.

**Request Body:**
```json
{
  "jobTitle": "Frontend Utvikler",
  "company": "Tech Solutions AS",
  "jobDescription": "Vi søker en erfaren frontend utvikler..."
}
```

**Response:**
```json
{
  "coverLetter": "Generert søknadsbrev tekst..."
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request
- `401` - Unauthorized

---

### POST /api/ai/match

Match brukerprofil mot jobb.

**Request Body:**
```json
{
  "jobId": "uuid"
}
```

**Response:**
```json
{
  "score": 85,
  "explanation": "Dine ferdigheter matcher godt med stillingens krav..."
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found

---

### POST /api/ai/suggest-improvements

Foreslå forbedringer for brukerprofil.

**Request Body:**
```json
{
  "targetJobs": ["Frontend Utvikler", "React Developer"]
}
```

**Response:**
```json
{
  "suggestions": [
    "Vurder å lære TypeScript",
    "Tilegn deg mer erfaring med testing",
    "Bygg ut nettverk i bransjen"
  ]
}
```

**Status Codes:**
- `200` - OK
- `401` - Unauthorized

---

## 👤 Profile Endpoints

**Alle endpoints krever autentisering.**

### GET /api/profile

Hent brukerprofil.

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "skills": ["JavaScript", "React", "TypeScript"],
  "experience": 5,
  "education": "Bachelor i Informatikk",
  "location": "Oslo",
  "bio": "...",
  "phone": "+47 123 45 678",
  "emailNotificationsEnabled": true,
  "cvPath": "/uploads/cvs/cv.pdf"
}
```

**Status Codes:**
- `200` - OK
- `401` - Unauthorized

---

### PUT /api/profile

Oppdater brukerprofil.

**Request Body:**
```json
{
  "fullName": "Ola Nordmann",
  "skills": ["JavaScript", "React"],
  "experience": 5,
  "education": "Bachelor i Informatikk",
  "location": "Oslo",
  "bio": "...",
  "phone": "+47 123 45 678",
  "emailNotificationsEnabled": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "skills": ["JavaScript", "React"],
  "experience": 5,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request
- `401` - Unauthorized

---

### POST /api/profile/cv

Last opp CV.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `cv` (file, required) - CV fil (PDF, DOCX, ODT, RTF, TXT)

**Response:**
```json
{
  "message": "CV uploaded successfully",
  "cvPath": "/uploads/cvs/cv.pdf",
  "profile": { ... }
}
```

**Status Codes:**
- `200` - OK
- `400` - Bad Request (invalid file type)
- `401` - Unauthorized

---

### DELETE /api/profile/cv

Slett CV.

**Response:**
```json
{
  "message": "CV deleted successfully",
  "profile": { ... }
}
```

**Status Codes:**
- `200` - OK
- `401` - Unauthorized
- `404` - Not Found

---

### GET /api/profile/cv

Last ned CV.

**Response:**
File download (binary)

**Status Codes:**
- `200` - OK
- `401` - Unauthorized
- `404` - Not Found

---

## ⭐ Favorites Endpoints

**Alle endpoints krever autentisering.**

### GET /api/favorites

Hent alle favoritter.

**Response:**
```json
{
  "favorites": [
    {
      "id": "uuid",
      "jobListingId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "jobListing": {
        "title": "Frontend Utvikler",
        "company": "Tech Solutions AS",
        "location": "Oslo"
      }
    }
  ]
}
```

**Status Codes:**
- `200` - OK
- `401` - Unauthorized

---

### POST /api/favorites

Legg til favoritt.

**Request Body:**
```json
{
  "jobListingId": "uuid"
}
```

**Response:**
```json
{
  "message": "Favorite added successfully",
  "favorite": {
    "id": "uuid",
    "jobListingId": "uuid"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found

---

### DELETE /api/favorites/:jobListingId

Fjern favoritt.

**Path Parameters:**
- `jobListingId` (UUID, required) - Jobb ID

**Response:**
```json
{
  "message": "Favorite removed successfully"
}
```

**Status Codes:**
- `200` - OK
- `401` - Unauthorized
- `404` - Not Found

---

### GET /api/favorites/:jobListingId

Sjekk om jobb er favoritt.

**Path Parameters:**
- `jobListingId` (UUID, required) - Jobb ID

**Response:**
```json
{
  "isFavorite": true
}
```

**Status Codes:**
- `200` - OK
- `401` - Unauthorized

---

## 📊 Analytics Endpoints

**Krever autentisering.**

### GET /api/analytics

Hent analytics data for bruker.

**Response:**
```json
{
  "analytics": {
    "overview": {
      "totalJobs": 1000,
      "totalApplications": 25,
      "totalFavorites": 10
    },
    "statusBreakdown": {
      "PENDING": 5,
      "SENT": 10,
      "VIEWED": 5,
      "REJECTED": 3,
      "ACCEPTED": 2
    },
    "sourceBreakdown": {
      "finn.no": 500,
      "arbeidsplassen.no": 300,
      "karriere.no": 200
    },
    "monthlyApplications": [
      {
        "month": "2024-01",
        "count": 5
      }
    ],
    "recentApplications": [
      {
        "id": "uuid",
        "status": "SENT",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "jobTitle": "Frontend Utvikler",
        "company": "Tech Solutions AS"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - OK
- `401` - Unauthorized

---

## 🔄 Scheduler Endpoints

**Krever autentisering (admin).**

### GET /api/scheduler/status

Hent status for scheduled scraping.

**Response:**
```json
{
  "enabled": true,
  "intervalHours": 6,
  "lastRun": "2024-01-01T00:00:00.000Z",
  "nextRun": "2024-01-01T06:00:00.000Z"
}
```

**Status Codes:**
- `200` - OK
- `401` - Unauthorized

---

## ⚠️ Error Responses

Alle endpoints kan returnere følgende error responses:

### 400 Bad Request
```json
{
  "error": "Ugyldig e-postformat",
  "missingFields": ["email"]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "For mange forespørsler. Vennligst prøv igjen senere.",
  "retryAfter": 60,
  "limit": 100,
  "window": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Notater

- Alle UUIDs må være i UUID v4 format
- Passord må være minimum 8 tegn, inneholde stor bokstav, liten bokstav og tall
- Rate limiting er aktivert på alle endpoints
- CV filer kan være PDF, DOCX, ODT, RTF eller TXT
- Application status kan være: DRAFT, PENDING, SENT, VIEWED, REJECTED, ACCEPTED, INTERVIEW, OFFER

