# 🚀 Enkel Start Instruksjon

## 📋 4 Enkle Steg til Fullt Fungerende Applikasjon

### Steg 1: Database (2 min)
```powershell
psql -U postgres
CREATE DATABASE jobcrawl;
\q
```

### Steg 2: Migrations (1 min)
```powershell
cd backend
npm run db:migrate
```

### Steg 3: Start Servers (2 min)
```powershell
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend  
npm run dev
```

### Steg 4: Test (1 min)
1. Åpne http://localhost:5173
2. Registrer deg
3. Klikk verifiseringslink fra backend konsoll
4. Logg inn

**Ferdig!** ✅

---

## ✅ Verifisering

**Test at backend kjører:**
```powershell
cd backend
npm run test:health
```

**Test at frontend kobler til backend:**
```powershell
cd frontend
npm run test:connection
```

---

## ❓ Problemer?

**Database feil?**
- Sjekk at PostgreSQL kjører
- Verifiser DATABASE_URL i backend/env

**Backend starter ikke?**
- Sjekk JWT_SECRET i backend/env
- Sjekk at port 3000 er ledig

**Frontend kobler ikke til?**
- Sjekk at backend kjører
- Sjekk VITE_API_URL i frontend/.env

---

**Se HVAD_GJENSTAR.md for detaljert guide!**

