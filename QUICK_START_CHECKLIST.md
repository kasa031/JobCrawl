# ⚡ Quick Start Checklist - JobCrawl

## 🎯 Snarvei til å få nettsiden opp og gående

### Steg 1: Database (5 minutter)
```powershell
# 1. Opprett database
psql -U postgres
# I psql: CREATE DATABASE jobcrawl; \q

# 2. Kjør migrations
cd backend
npm run db:generate
npm run db:migrate
```

### Steg 2: Environment (2 minutter)
```powershell
# Backend/env eksisterer allerede ✅
# Opprett frontend/.env:
cd ..\frontend
# Lag fil med: VITE_API_URL=http://localhost:3000/api
```

### Steg 3: Start (1 minutt)
```powershell
cd ..
npm run dev
```

### Steg 4: Test (2 minutter)
1. Åpne http://localhost:5173
2. Klikk "Login" → "Sign Up"
3. Registrer ny bruker
4. Sjekk backend konsoll for verifiseringslink
5. Klikk linken
6. Logg inn

**Total tid: ~10 minutter** ⏱️

---

## ✅ Sjekkliste før du starter

- [ ] PostgreSQL kjører
- [ ] Database `jobcrawl` eksisterer
- [ ] Backend migrations er kjørt
- [ ] `backend/env` er konfigurert
- [ ] `frontend/.env` er opprettet
- [ ] `backend/uploads/cvs` eksisterer
- [ ] Node modules er installert (`npm run install:all`)

---

## 🚨 Vanlige Feil

**"Cannot connect to database"**
→ Sjekk at PostgreSQL kjører og DATABASE_URL er korrekt

**"JWT_SECRET must be set"**
→ Sjekk backend/env filen

**Frontend viser "Network error"**
→ Sjekk at backend kjører på port 3000
→ Sjekk frontend/.env har riktig VITE_API_URL

**Email sendes ikke**
→ Sjekk SMTP konfigurasjon i backend/env
→ For development: Se backend konsoll for verifiseringslink

---

For detaljert guide, se **OPPSETT_GUIDE.md**

