# 🔧 Sjekkliste for å få nettsiden opp og verifiseringsmail til å fungere

## 📋 Steg 1: Sjekk Database-tilkobling

Sjekk om database finnes og migrasjoner er kjørt:

```powershell
cd backend
npm run db:generate
```

Hvis du får feil, kan du prøve å kjøre migrasjonene på nytt:

```powershell
npm run db:migrate
```

Eller hvis databasen ikke finnes:
```powershell
# Åpne PowerShell som Administrator
# Sjekk om PostgreSQL kjører
& "$env:ProgramFiles\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT 1;"
```

## 📧 Steg 2: Verifiser Email-konfigurasjon

Email-konfigurasjonen er allerede satt opp i `backend/env` med Gmail SMTP:
- SMTP_HOST=smtp.gmail.com ✅
- SMTP_PORT=587 ✅
- SMTP_USER=k30991043@gmail.com ✅
- SMTP_PASSWORD er satt ✅

**Viktig:** Hvis e-posten ikke sendes, sjekk:
1. At Gmail app-passordet fortsatt er gyldig
2. At backend logger ut SMTP-konfigurasjon ved oppstart (sjekk konsollen)

## 🚀 Steg 3: Start Backend og Frontend

### Alternativ 1: Start begge samtidig (anbefalt)
```powershell
# Fra root-mappen
npm run dev
```

### Alternativ 2: Start i separate terminaler

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

## ✅ Steg 4: Test Registrering og Verifisering

1. **Gå til:** http://localhost:5173 (eller porten som vises i terminalen)

2. **Klikk "Login"** i navigasjonen

3. **Registrer ny bruker:**
   - Fullt navn: Test Bruker
   - Email: din@email.com
   - Passord: minst 6 tegn

4. **Sjekk backend-konsollen** for:
   - SMTP-konfigurasjon ved oppstart
   - Verifiseringslink ved registrering (logges alltid til konsollen)

5. **Sjekk e-posten din** for verifiseringsmail (eller sjekk spam-mappen)

6. **Klikk på verifiseringslinken** i e-posten

7. **Prøv å logge inn** - nå skal det fungere!

## 🔍 Feilsøking

### Problem: Backend starter ikke
- Sjekk om port 3000 er ledig
- Sjekk om database-tilkobling fungerer
- Se etter feilmeldinger i konsollen

### Problem: Ingen e-post mottas
- **Sjekk backend-konsollen:** Verifiseringslinken logges alltid der
- Sjekk at SMTP_HOST er satt i `backend/env`
- Hvis Gmail ikke fungerer, kan du kommentere ut Gmail-linjene og uncomment iCloud-linjene i `backend/env`

### Problem: Database-feil
```powershell
# Prøv å regenerere Prisma client
cd backend
npm run db:generate

# Hvis det ikke fungerer, sjekk DATABASE_URL i backend/env
```

### Problem: Frontend kan ikke koble til backend
- Sjekk at backend kjører på http://localhost:3000
- Sjekk at FRONTEND_URL i `backend/env` matcher frontend-porten
- Sjekk CORS-konfigurasjon i `backend/src/index.ts`

## 📝 Viktig å huske

1. **Verifiseringslink logges alltid i backend-konsollen** - selv hvis e-post ikke sendes
2. **Bruker kan ikke logge inn før e-post er verifisert** - dette er tiltenkt
3. **Frontend URL:** Sjekk at `FRONTEND_URL` i `backend/env` matcher frontend-porten (vanligvis 5173 eller 5174)

## 🎯 Når alt fungerer:

Du skal se:
- ✅ Backend starter uten feilmeldinger
- ✅ Frontend kobler seg til backend
- ✅ Ved registrering logges verifiseringslink i konsollen
- ✅ E-post sendes til din e-postadresse (hvis SMTP er konfigurert)
- ✅ Klikk på linken verifiserer e-posten
- ✅ Innlogging fungerer etter verifisering

