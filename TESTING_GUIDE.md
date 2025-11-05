# 🧪 Testing Guide - JobCrawl

## 📋 Test Oppgaver

### 1. Backend Health Endpoint Test

**Test backend server status:**
```powershell
cd backend
npm run test:health
```

**Forventet resultat:**
```
✅ Health Check PASSED
   Status: 200
   Response: {
     "status": "OK",
     "message": "JobCrawl API is running",
     "timestamp": "..."
   }
```

**Feilsøking:**
- Hvis `ECONNREFUSED`: Start backend med `npm run dev`
- Hvis `timeout`: Sjekk at backend kjører på port 3000

---

### 2. Frontend til Backend Connection Test

**Test at frontend kan nå backend:**
```powershell
cd frontend
npm run test:connection
```

**Forventet resultat:**
```
✅ Connection TEST PASSED
   Status: 200
```

**Feilsøking:**
- Sjekk at både frontend og backend kjører
- Verifiser `frontend/.env` har riktig `VITE_API_URL`
- Sjekk CORS konfigurasjon i backend

---

### 3. SMTP Configuration Test

**Test email sending konfigurasjon:**
```powershell
cd backend
npm run test:smtp
```

**Forventet resultat:**
```
✅ SMTP Configuration VALID
   Connection test passed
```

**Feilsøking:**
- `EAUTH`: Feil brukernavn/passord
- `ECONNECTION`: Feil SMTP_HOST eller PORT
- For Gmail: Bruk app password, ikke vanlig passord

---

### 4. Database Setup Test

**Test database tilkobling:**
```powershell
cd backend
npm run check-setup
```

**Forventet resultat:**
```
✅ Database accessible (Users: X)
```

---

## 🧪 Manuell Testing Checklist

### Registrering og Login Flow

1. **Registrering**
   - [ ] Gå til http://localhost:5173
   - [ ] Klikk "Login" → "Sign Up"
   - [ ] Fyll ut:
     - Full Name: Test User
     - Email: test@example.com
     - Password: Test1234!
   - [ ] Klikk "Register"
   - [ ] Skal se: "Account created! Check your email to verify."

2. **Email Verifisering**
   - [ ] Sjekk backend konsoll for verifiseringslink
   - [ ] ELLER sjekk email inbox
   - [ ] Klikk på verifiseringslink
   - [ ] Skal se: "Email verified successfully"

3. **Login**
   - [ ] Klikk "Login"
   - [ ] Skriv inn email: test@example.com
   - [ ] Skriv inn password: Test1234!
   - [ ] Klikk "Login"
   - [ ] Skal logge inn og vise Home page
   - [ ] Navn skal vises i header

---

### Profile Management

4. **Oppdater Profile**
   - [ ] Gå til "My Profile"
   - [ ] Fyll ut:
     - Skills: JavaScript, React, Node.js
     - Experience: 3
     - Education: Bachelor in CS
     - Location: Oslo
     - Phone: +47 123 45 678
     - Bio: Test bio
   - [ ] Klikk "Save Profile"
   - [ ] Skal se success melding

5. **CV Upload**
   - [ ] Scroll ned til "CV Management"
   - [ ] Klikk "Choose File"
   - [ ] Velg en PDF fil
   - [ ] Klikk "Upload CV"
   - [ ] Skal se CV navn
   - [ ] Test "Download CV"
   - [ ] Test "Delete CV"

---

### Job Browsing

6. **Se Jobs**
   - [ ] Gå til "Jobs"
   - [ ] Skal se liste over jobber
   - [ ] Test søkefunksjon (skriv "developer")
   - [ ] Test location filter (skriv "Oslo")
   - [ ] Test source filter (velg "finn.no")

7. **Job Details**
   - [ ] Klikk "View Details" på en jobb
   - [ ] Skal se full job description
   - [ ] Skal se requirements
   - [ ] Test "Open Original" knapp
   - [ ] Skal åpne i ny fane

---

### Applications

8. **Apply to Job**
   - [ ] På job detail side
   - [ ] Klikk "Apply with AI Cover Letter"
   - [ ] Skal generere cover letter
   - [ ] Skal opprette application
   - [ ] Skal redirect til Applications siden

9. **View Applications**
   - [ ] Gå til "Applications"
   - [ ] Skal se dine søknader
   - [ ] Skal se status (DRAFT, SENT, etc.)
   - [ ] Test oppdater status dropdown
   - [ ] Test delete application

---

### AI Features

10. **AI Cover Letter Generation**
    - [ ] Gå til "AI Generate"
    - [ ] Velg jobb fra dropdown
    - [ ] Klikk "Generate Cover Letter"
    - [ ] Skal generere cover letter
    - [ ] Test "Copy to Clipboard"
    
    **Note:** Hvis OpenAI key ikke er satt, vil mock data vises

11. **Job Matching**
    - [ ] På AI Generate side
    - [ ] Velg jobb
    - [ ] Skal vise match score
    - [ ] Skal vise explanation

---

## 🐛 Vanlige Testing Issues

### Backend starter ikke
**Problem:** `Error: JWT_SECRET must be set`
**Løsning:** Sjekk at `backend/env` har `JWT_SECRET`

### Frontend kan ikke koble til backend
**Problem:** Network error i browser
**Løsning:** 
1. Sjekk at backend kjører
2. Sjekk `frontend/.env`
3. Test med `npm run test:connection`

### Email sendes ikke
**Problem:** Ingen email mottatt
**Løsning:**
1. Test SMTP: `npm run test:smtp`
2. Sjekk spam folder
3. For development: Se backend konsoll for link

### Database errors
**Problem:** Prisma errors
**Løsning:**
1. Sjekk at database kjører
2. Kjør migrations: `npm run db:migrate`
3. Test med `npm run check-setup`

---

## ✅ Test Status

Etter testing, merk hva som fungerer:

- [ ] Backend health endpoint
- [ ] Frontend connection
- [ ] SMTP configuration
- [ ] Database connection
- [ ] User registration
- [ ] Email verification
- [ ] Login
- [ ] Profile update
- [ ] CV upload/download/delete
- [ ] Job browsing
- [ ] Job details
- [ ] Apply with AI cover letter
- [ ] View applications
- [ ] AI cover letter generation
- [ ] Job matching

---

**Tips:** Kjør test scripts først, så manuell testing. Dette identifiserer konfigurasjonsproblemer raskt!

