# JobCrawl - Quick Start (Uten Database)

## Test Frontend og Backend uten Database

Siden PostgreSQL krever administratorrettigheter, kan vi starte med å teste UI og backend uten database.

### 1. Installer Frontend Dependencies

```powershell
cd frontend
npm install
```

### 2. Installer Backend Dependencies

```powershell
cd ../backend
npm install
```

### 3. Start Backend (Mock Mode)

```powershell
cd backend
npm run dev
```

Backend vil nå kjøre på http://localhost:3000

### 4. Start Frontend

I nytt terminalvindu:

```powershell
cd frontend
npm run dev
```

Frontend vil nå kjøre på http://localhost:5173

## Åpne i Nettleser

Gå til: http://localhost:5173

Du vil nå se JobCrawl UI med:
- ✅ Mocca/Champagne fargepalett
- ✅ Navigation
- ✅ Home page
- ✅ Jobs, Profile, Applications sider

## Neste Steg

### For å teste med Database:

1. **Åpne PowerShell som Administrator**
2. Kjør: `choco install postgresql -y`
3. Opprett database: `createdb jobcrawl`
4. Kjør migrasjoner: `cd backend && npm run db:migrate`

Eller kontakt meg så hjelper jeg deg videre!

