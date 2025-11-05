# ✅ Setup Checklist - JobCrawl

## 📋 Komplett sjekkliste for å få nettsiden opp og gående

### Steg 1: Prerequisites (5 minutter)
- [ ] **Node.js installert** (versjon 18 eller nyere)
  ```powershell
  node --version
  ```
- [ ] **PostgreSQL installert og kjører**
  ```powershell
  psql --version
  ```

### Steg 2: Database Setup (10 minutter)
- [ ] **Opprett database**
  ```powershell
  psql -U postgres
  CREATE DATABASE jobcrawl;
  \q
  ```
- [ ] **Kjør Prisma migrations**
  ```powershell
  cd backend
  npm run db:generate
  npm run db:migrate
  ```
- [ ] **(Valgfritt) Seed database med demo-data**
  ```powershell
  npm run db:seed
  ```

### Steg 3: Environment Variables (2 minutter)
- [x] **Backend/env** - ✅ Allerede konfigurert
  - DATABASE_URL ✅
  - JWT_SECRET ✅
  - PORT ✅
  - FRONTEND_URL ✅
  - SMTP konfigurasjon ✅
  
- [x] **Frontend/.env** - ✅ Opprettet
  - VITE_API_URL=http://localhost:3000/api ✅

### Steg 4: Dependencies (5 minutter)
- [x] **Backend packages** - ✅ Alle installert
- [x] **Frontend packages** - ✅ Alle installert

### Steg 5: Directory Structure (1 minutt)
- [x] **backend/uploads/cvs** - ✅ Opprettet
- [x] **backend/logs** - ✅ Vil opprettes automatisk

### Steg 6: Build (2 minutter)
- [ ] **Build backend**
  ```powershell
  cd backend
  npm run build
  ```
- [ ] **Build frontend**
  ```powershell
  cd frontend
  npm run build
  ```

### Steg 7: Verification (5 minutter)
- [ ] **Sjekk setup**
  ```powershell
  cd backend
  npm run check-setup
  ```
  Dette verifiserer:
  - Environment variabler
  - Database tilkobling
  - Directory structure
  - Migrations status

### Steg 8: Start Applikasjon (1 minutt)
- [ ] **Start både frontend og backend**
  ```powershell
  # Fra root
  npm run dev
  ```
  
  ELLER i separate terminaler:
  ```powershell
  # Terminal 1
  cd backend
  npm run dev
  
  # Terminal 2
  cd frontend
  npm run dev
  ```

### Steg 9: Test (15 minutter)

#### 9.1 Backend Health Check
- [ ] Åpne http://localhost:3000/api/health
- [ ] Skal returnere JSON med status OK

#### 9.2 Frontend
- [ ] Åpne http://localhost:5173
- [ ] Skal vise JobCrawl landing page

#### 9.3 Registrering
- [ ] Klikk "Login" → "Sign Up"
- [ ] Fyll ut:
  - Full Name: Test Bruker
  - Email: test@example.com
  - Password: Test1234! (minst 8 karakterer, stor bokstav, liten bokstav, tall)
- [ ] Klikk "Register"
- [ ] Skal se: "Account created! Check your email to verify."

#### 9.4 Email Verifisering
- [ ] Sjekk backend konsoll for verifiseringslink
- [ ] ELLER sjekk email inbox
- [ ] Klikk på verifiseringslink
- [ ] Skal se: "Email verified successfully"

#### 9.5 Login
- [ ] Klikk "Login"
- [ ] Skriv inn email og password
- [ ] Skal logge inn og vise Home page

#### 9.6 Profile
- [ ] Gå til "Profile"
- [ ] Fyll ut profil info
- [ ] Klikk "Save Profile"
- [ ] Skal se success melding

#### 9.7 CV Upload
- [ ] Scroll ned til "CV Management"
- [ ] Klikk "Choose File"
- [ ] Velg PDF eller Word dokument
- [ ] Klikk "Upload CV"
- [ ] Skal se CV navn og download/delete knapper

#### 9.8 Jobs
- [ ] Gå til "Jobs"
- [ ] Skal se liste over jobber
- [ ] Test søkefunksjon
- [ ] Test filtre (location, source)
- [ ] Klikk "View Details" på en jobb

#### 9.9 Apply
- [ ] På job detail side
- [ ] Klikk "Apply with AI Cover Letter"
- [ ] Skal generere cover letter og opprette application
- [ ] Skal redirect til Applications siden

#### 9.10 Applications
- [ ] Gå til "Applications"
- [ ] Skal se dine søknader
- [ ] Test oppdater status
- [ ] Test delete application

#### 9.11 AI Generate
- [ ] Gå til "AI Generate"
- [ ] Velg jobb fra dropdown
- [ ] Klikk "Generate Cover Letter"
- [ ] Skal generere cover letter (hvis OpenAI key er satt, ellers mock)

---

## 🚨 Vanlige Feil og Løsninger

### Database Connection Error
**Problem:** `Can't reach database server`
**Løsning:**
1. Sjekk at PostgreSQL kjører
2. Verifiser DATABASE_URL i backend/env
3. Test connection: `psql -U postgres -d jobcrawl -c "SELECT 1;"`

### JWT_SECRET Error
**Problem:** `JWT_SECRET must be set`
**Løsning:** Sjekk at backend/env inneholder JWT_SECRET

### Frontend Network Error
**Problem:** Frontend kan ikke koble til backend
**Løsning:**
1. Sjekk at backend kjører på port 3000
2. Sjekk frontend/.env har riktig VITE_API_URL
3. Sjekk CORS settings i backend

### No Migrations Found
**Problem:** `Migration not found`
**Løsning:**
```powershell
cd backend
npm run db:migrate
# Hvis det feiler, prøv:
npx prisma migrate dev --name init
```

### Email Sendes Ikke
**Problem:** Ingen email mottatt
**Løsning:**
1. Sjekk SMTP konfigurasjon i backend/env
2. For development: Se backend konsoll for verifiseringslink
3. Sjekk spam folder

---

## ✅ Når Alt Fungerer

Når alle steg over er fullført og testet, er nettsiden 100% funksjonell og klar for bruk!

**Tips:**
- Bruk `npm run check-setup` for å verifisere setup
- Sjekk backend/logs for detaljert logging
- Frontend/.env er valgfritt (har fallback til localhost:3000)

---

## 📊 Status Oversikt

**Kode:** ✅ 100% komplett
**Setup:** ⏳ Trenger manuell konfigurasjon (database, migrations, testing)
**Funksjonalitet:** ✅ Alle features implementert og klar

