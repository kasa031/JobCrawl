# 🚀 Komplett Oppsettsguide for JobCrawl

## 📋 Oversikt

Denne guide tar deg gjennom hvert eneste steg for å få JobCrawl opp og gående 100% funksjonelt.

---

## ✅ Steg 1: Verifiser Forutsetninger

### Node.js og npm
```powershell
node --version  # Skal være 18 eller nyere
npm --version
```

### PostgreSQL
```powershell
psql --version  # Skal være installert
```

Hvis PostgreSQL ikke er installert, følg SETUP_DATABASE.md

---

## ✅ Steg 2: Installer Dependencies

```powershell
# Fra root-mappen
npm run install:all
```

Dette installerer dependencies for både frontend og backend.

---

## ✅ Steg 3: Database Setup

### 3.1 Opprett Database

```powershell
# Åpne PowerShell og kjør:
psql -U postgres
```

I psql terminalen:
```sql
CREATE DATABASE jobcrawl;
\q
```

### 3.2 Kjør Migrations

```powershell
cd backend
npm run db:generate
npm run db:migrate
```

**Viktig:** Hvis du får feil om "migration does not exist", kjør:
```powershell
npx prisma migrate dev --name init
```

### 3.3 (Valgfritt) Seed Database

```powershell
npm run db:seed
```

Dette legger til demo-data for testing.

---

## ✅ Steg 4: Konfigurer Environment Variabler

### Backend (backend/env)

Filen skal allerede eksistere med:
```env
DATABASE_URL=postgresql://postgres:93c4c664f8c9440ca3258f921df2cdd3@localhost:5432/jobcrawl
JWT_SECRET=superhemmelig_jwt_secret_key_2026_change_in_production
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_key_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=k30991043@gmail.com
SMTP_PASSWORD=vmbmohkznjpotboz
```

**Viktig:** 
- JWT_SECRET må være satt (server starter ikke uten den)
- SMTP konfigurasjon må være korrekt for email funksjonalitet

### Frontend (frontend/.env)

Opprett filen `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

---

## ✅ Steg 5: Verifiser Uploads Directory

```powershell
# Sjekk at mappen eksisterer
Test-Path "backend\uploads\cvs"

# Hvis den ikke eksisterer, opprett den:
cd backend
New-Item -ItemType Directory -Path "uploads\cvs" -Force
```

---

## ✅ Steg 6: Build Backend

```powershell
cd backend
npm run build
```

Dette kompilerer TypeScript til JavaScript.

---

## ✅ Steg 7: Start Applikasjonen

### Alternativ 1: Start begge samtidig (Anbefalt)

```powershell
# Fra root-mappen
npm run dev
```

Dette starter både backend og frontend samtidig.

**Du skal se:**
```
[0] 🚀 JobCrawl Backend running on http://localhost:3000
[1] ➜ Local: http://localhost:5173/
```

### Alternativ 2: Separate Terminals

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

---

## ✅ Steg 8: Verifiser Backend Health

Åpne nettleser og gå til:
```
http://localhost:3000/api/health
```

Du skal se:
```json
{
  "status": "OK",
  "message": "JobCrawl API is running",
  "timestamp": "..."
}
```

---

## ✅ Steg 9: Test Frontend

Åpne nettleser:
```
http://localhost:5173
```

Du skal se JobCrawl frontend.

---

## ✅ Steg 10: Test Full Funksjonalitet

### 10.1 Registrering

1. Klikk "Login" i navigasjonen
2. Klikk "Sign Up" eller "Don't have an account?"
3. Fyll ut:
   - **Full Name:** Test Bruker (minst 2 karakterer)
   - **Email:** din@email.com
   - **Password:** Minst 8 karakterer, må inneholde stor bokstav, liten bokstav, og tall
4. Klikk "Register"

**Forventet resultat:**
- Success melding: "Account created! Check your email to verify."
- Backend logger ut verifiseringslink i konsollen

### 10.2 Email Verifisering

**Alternativ 1: Via Email**
- Sjekk inbox for verifiseringsmail
- Klikk på "Verify Email" knappen i mailen

**Alternativ 2: Via Konsoll (Development)**
- Se backend konsoll for verifiseringslink
- Kopier linken og åpne i nettleser

### 10.3 Login

1. Klikk "Login"
2. Skriv inn email og password
3. Klikk "Login"

**Forventet resultat:**
- Innlogging vellykket
- Du blir sendt til Home siden
- "Login" knappen endres til "Logout"

### 10.4 Profile Management

1. Gå til Profile siden
2. Fyll ut profil informasjon
3. Klikk "Save Profile"

**Forventet resultat:**
- Success melding vises
- Profil lagres i database

### 10.5 CV Upload

1. På Profile siden, scroll ned til "CV Management"
2. Klikk "Choose File"
3. Velg PDF eller Word dokument (maks 5MB)
4. Klikk "Upload CV"

**Forventet resultat:**
- CV lastes opp
- Filnavn vises
- Download og Delete knapper vises

### 10.6 Job Listings

1. Gå til "Jobs" siden
2. Se liste over jobber
3. Klikk "View Details" på en jobb
4. På job detail siden, klikk "Apply with AI Cover Letter"

**Forventet resultat:**
- Jobb detaljer vises
- Apply knapp fungerer (krever innlogging)

### 10.7 AI Generate Cover Letter

1. Gå til "AI Generate" siden
2. Velg en jobb fra dropdown
3. Klikk "Generate Cover Letter"

**Forventet resultat:**
- Cover letter genereres (hvis OpenAI key er satt)
- Match score vises
- Du kan kopiere cover letter til clipboard

### 10.8 Applications

1. Gå til "Applications" siden
2. Se dine søknader
3. Test oppdatering av status

---

## 🔍 Feilsøking

### Backend starter ikke

**Problem:** "JWT_SECRET must be set"
**Løsning:** Sjekk at `backend/env` inneholder `JWT_SECRET=...`

**Problem:** Port 3000 er opptatt
**Løsning:**
```powershell
# Finn prosess som bruker port 3000
netstat -ano | findstr :3000
# Stop prosess (erstatt PID med faktisk prosess-ID)
taskkill /PID <PID> /F
```

**Problem:** Database connection error
**Løsning:**
1. Sjekk at PostgreSQL kjører
2. Verifiser DATABASE_URL i `backend/env`
3. Test connection:
```powershell
psql -U postgres -d jobcrawl -c "SELECT 1;"
```

### Frontend kobler ikke til backend

**Problem:** CORS errors
**Løsning:** Sjekk at `FRONTEND_URL` i `backend/env` matcher frontend URL

**Problem:** "Network error"
**Løsning:**
1. Sjekk at backend kjører på port 3000
2. Sjekk at `frontend/.env` har riktig `VITE_API_URL`
3. Restart frontend dev server

### Email sendes ikke

**Problem:** Email kommer ikke frem
**Løsning:**
1. Sjekk backend konsoll for SMTP konfigurasjon
2. Sjekk at Gmail app password er korrekt
3. For development: Sjekk backend konsoll for verifiseringslink (logges alltid)

### CV Upload feiler

**Problem:** "No file uploaded"
**Løsning:** 
1. Sjekk at fil er PDF eller Word
2. Sjekk at fil er under 5MB
3. Verifiser at `backend/uploads/cvs` eksisterer

---

## ⚡ Performance Optimering

### Backend
- ✅ Rate limiting er implementert (100 requests/minutt)
- ✅ Error handling middleware er på plass
- ✅ Database queries er optimaliserte med Prisma

### Frontend
- ✅ Error Boundary er implementert
- ✅ Loading states er på plass
- ✅ Axios interceptors for error handling

---

## 📊 Status Checklist

Kryss av hvert element når det er fullført:

- [ ] Node.js og npm installert
- [ ] PostgreSQL installert og kjører
- [ ] Database `jobcrawl` opprettet
- [ ] Prisma migrations kjørt
- [ ] `backend/env` konfigurert
- [ ] `frontend/.env` opprettet
- [ ] Uploads directory eksisterer
- [ ] Backend bygget (`npm run build`)
- [ ] Backend starter uten feil
- [ ] Frontend starter uten feil
- [ ] Health endpoint fungerer
- [ ] Registrering fungerer
- [ ] Email verifisering fungerer
- [ ] Login fungerer
- [ ] Profile oppdatering fungerer
- [ ] CV upload fungerer
- [ ] Job listings vises
- [ ] AI generate fungerer (hvis OpenAI key er satt)
- [ ] Applications fungerer

---

## 🎉 Når alt fungerer

Når alle punkter over er krysset av, er applikasjonen 100% klar og funksjonell!

**Tips for optimal ytelse:**
- Bruk `npm run build` før produksjon
- Sjekk database regular backups
- Monitor backend logs for errors
- Roter JWT_SECRET regelmessig

---

## 📞 Support

Hvis du støter på problemer:
1. Sjekk backend konsoll for error messages
2. Sjekk browser console (F12) for frontend errors
3. Verifiser alle environment variabler
4. Sjekk at alle dependencies er installert

