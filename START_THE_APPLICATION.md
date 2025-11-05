# Slik starter du hele JobCrawl-applikasjonen

## Du trenger 2 terminaler som kjører samtidig

### Terminal 1: Backend
```powershell
cd backend
npm run dev
```
Backend skal nå kjøre på http://localhost:3000

### Terminal 2: Frontend  
```powershell
cd frontend  
npm run dev
```
Frontend skal nå kjøre på http://localhost:5173

---

## Når begge kjører:

1. **Verifiser kontoen din:**
   - Åpne denne lenken i nettleseren:
   - http://localhost:5173/verify-email?token=9990e231e288ac3456a92445b4a5f9981fe12bb6eb6444352ed30774f95de5fe

2. **Logg inn:**
   - Gå til http://localhost:5173
   - Klikk "Login"
   - Skriv inn ms.tery@icloud.com og passordet du brukte

Ferdig! ✅

