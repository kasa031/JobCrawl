# 🧪 Komplett Testing Plan - JobCrawl

## 📋 Testing Checklist

### Fase 1: Setup Verifisering (5 minutter)

#### 1.1 Database Setup
```powershell
cd backend
npm run verify:database
```

**Forventet:**
- ✅ Database connection successful
- ✅ Database schema verified
- ✅ All tables accessible

**Hvis feil:**
- Kjør: `npm run db:migrate`
- Eller: Følg feilmeldingen

#### 1.2 Backend Health
```powershell
cd backend
npm run dev  # Start backend
# I ny terminal:
npm run test:health
```

**Forventet:**
- ✅ Health Check PASSED
- Status: 200

#### 1.3 SMTP Configuration
```powershell
cd backend
npm run test:smtp
```

**Forventet:**
- ✅ SMTP Configuration VALID
- Connection test passed

---

### Fase 2: Frontend Connection (2 minutter)

#### 2.1 Start Both Servers
```powershell
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

#### 2.2 Test Connection
```powershell
# I ny terminal
cd frontend
npm run test:connection
```

**Forventet:**
- ✅ Connection TEST PASSED
- Frontend can successfully connect to backend

---

### Fase 3: Authentication Flow (10 minutter)

#### 3.1 User Registration
1. Gå til http://使用者localhost:5173
2. Klikk "Login" → "Sign Up"
3. Fyll ut:
   - Full Name: Test User
   - Email: test@example.com
   - Password: Test1234!
4. Klikk "Register"

**Forventet:**
- ✅ Se: "Account created! Check your email to verify."
- ✅ Backend konsoll viser verifiseringslink

#### 3.2 Email Verification
**Metode 1: Backend Konsoll**
- Kopier verifiseringslink fra backend konsoll
- Åpne i browser

**Metode 2: Email**
- Sjekk email inbox
- Klikk på verifiseringslink

**Forventet:**
- ✅ "Email verified successfully! You can now log in."
- ✅ Redirect til login

#### 3.3 User Login
1. Klikk "Login"
2. Skriv: test@example.com
3. Skriv: Test1234!
4. Klikk "Login"

**Forventet:**
- ✅ Login successful
- ✅ Redirect til Home page
- ✅ Navn vises i header

---

### Fase 4: Profile Management (10 minutter)

#### 4.1 Create Profile
1. Gå til "My Profile"
2. Fyll ut:
   - Skills: JavaScript, React, Node.js
   - Experience: 3
   - Education: Bachelor in Computer Science
   - Location: Oslo, Norway
   - Phone: +47 123 45 678
   - Bio: Test bio text
3. Klikk "Save Profile"

**Forventet:**
- ✅ Success melding
- ✅ Data lagret og vises

#### 4.2 CV Upload
1. Scroll ned til "CV Management"
2. Klikk "Choose File"
3. Velg PDF fil (max 5MB)
4. Klikk "Upload CV"

**Forventet:**
- ✅ "CV uploaded successfully"
- ✅ CV navn vises
- ✅ Download og Delete knapper vises

#### 4.3 CV Download
1. Klikk "Download CV"
2. **Forventet:**
   - ✅ Fil lastes ned
   - ✅ Riktig filnavn

#### 4.4 CV Delete
1. Klikk "Delete CV"
2. Bekreft sletting
3. **Forventet:**
   - ✅ CV deleted successfully
   - ✅ Upload form vises igjen

---

### Fase 5: Job Browsing (10 minutter)

#### 5.1 View Jobs
1. Gå til "Jobs"
2. **Forventet:**
   - ✅ Liste med jobber vises
   - ✅ Job cards viser title, company, location
   - ✅ Filter forms vises

#### 5.2 Search Jobs
1. I søkefelt, skriv: "developer"
2. **Forventet:**
   - ✅ Liste filtreres
   - ✅ Kun relevante jobber vises

#### 5.3 Filter by Location
1. I location filter, skriv: "Oslo"
2. **Forventet:**
   - ✅ Liste filtreres på location

#### 5.4 Filter by Source
1. Velg "finn.no" i source dropdown
2. **Forventet:**
   - ✅ Kun Finn.no jobber vises

#### 5.5 View Job Details
1. Klikk "View Details" på en jobb
2. **Forventet:**
   - ✅ Full job description vises
   - ✅ Requirements vises
   - ✅ "Apply with AI Cover Letter" knapp vises
   - ✅ "Open Original" knapp vises

#### 5.6 Open Original Job
1. Klikk "Open Original"
2. **Forventet:**
   - ✅ Original job posting åpnes i ny fane
   - ✅ Riktig URL

---

### Fase 6: Application Management (15 minutter)

#### 6.1 Apply to Job
1. På job detail side
2. Klikk "Apply with AI Cover Letter"
3. **Forventet:**
   - ✅ Cover letter genereres (eller mock hvis ingen OpenAI key)
   - ✅ Application opprettes
   - ✅ Redirect til Applications siden
   - ✅ Success melding

#### 6.2 View Applications
1. Gå til "Applications"
2. **Forventet:**
   - ✅ Liste med søknader vises
   - ✅ Status badges vises
   - ✅ Job info vises

#### 6.3 Update Application Status
1. Velg ny status fra dropdown (f.eks. "SENT")
2. **Forventet:**
   - ✅ Status oppdateres
   - ✅ Success melding

#### 6.4 Delete Application
1. Klikk "Delete" på en søknad
2. Bekreft sletting
3. **Forventet:**
   - ✅ Application deleted
   - ✅ Fjernes fra listen

---

### Fase 7: AI Features (10 minutter)

#### 7.1 AI Generate Page
1. Gå til "AI Generate"
2. **Forventet:**
   - ✅ Job selector dropdown vises
   - ✅ "Generate Cover Letter" knapp vises

#### 7.2 Generate Cover Letter
1. Velg jobb fra dropdown
2. Klikk "Generate Cover Letter"
3. **Forventet:**
   - ✅ Cover letter genereres
   - ✅ Text area fylles med cover letter
   - ✅ "Copy to Clipboard" knapp vises

#### 7.3 Job Matching
1. Velg jobb
2. **Forventet:**
   - ✅ Match score vises
   - ✅ Explanation vises

#### 7.4 Copy to Clipboard
1. Klikk "Copy to Clipboard"
2. **Forventet:**
   - ✅ Cover letter kopieres
   - ✅ Success feedback (hvis implementert)

---

## 📊 Test Isolation

Hver test bør være uavhengig. Bruk:
- Unike email addresses per test
- Cleanup etter hver test (valgfritt)
- Tydelig feilmeldinger for debugging

---

## 🐛 Feilsøking under Testing

### Backend starter ikke
- ✅ Sjekk JWT_SECRET i backend/env
- ✅ Sjekk DATABASE_URL
- ✅ Sjekk at port 3000 er ledig

### Frontend kan ikke koble til backend
- ✅ Sjekk at backend kjører
- ✅ Sjekk CORS settings
- ✅ Sjekk VITE_API_URL i frontend/.env

### Email sendes ikke如火如荼
- ✅ Test SMTP: `npm run test:smtp`
- ✅ Sjekk backend konsoll for link (development)
- ✅ Sjekk spam folder

### Database errors
- ✅ Test connection: `npm run verify:database`
- ✅ Kjør migrations: `npm run db:migrate`
- ✅ Sjekk PostgreSQL kjører

---

## ✅ Completion Criteria

Alle tests pass når:
- ✅ Alle API endpoints responderer
- ✅ Alle UI flows fungerer
- ✅ Alle CRUD operasjoner fungerer
- ✅ Error handling viser brukervennlige meldinger
- ✅ Loading states vises korrekt
- ✅ Ingen console errors

---

## 📝 Test Documentation

**Fyll ut TEST_RESULTS.md med:**
- ✅ Dato og tid
- ✅ Test environment
- ✅ Test results per fase
- ✅ Issues funnet
- ✅ Screenshots av bugs (hvis noen)

---

**Total testingstid: ~60 minutter**

**God testing!** 🚀

