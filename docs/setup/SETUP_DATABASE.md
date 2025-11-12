# Database Setup - JobCrawl

## Steg 1: Refresh Environment

I PowerShell-vinduet hvor PostgreSQL ble installert:

```powershell
refreshenv
```

## Steg 2: Opprett Database

```powershell
# Bruk passordet som ble generert: 93c4c664f8c9440ca3258f921df2cdd3
psql -U postgres
```

## Steg 3: I psql terminalen

```sql
CREATE DATABASE jobcrawl;
\q
```

## Steg 4: Konfigurer Backend

Rediger `backend/.env` (eller opprett den):

```env
DATABASE_URL=postgresql://postgres:93c4c664f8c9440ca3258f921df2cdd3@localhost:5432/jobcrawl
JWT_SECRET=min_superhemmelige_jwt_secret_key_2024
PORT=3000
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=din_api_key_hvis_du_har
```

## Steg 5: Kjør Migrations

```powershell
cd backend
npm run db:migrate
npm run db:seed
```

## Steg 6: Start Applikasjonen

```powershell
# Fra root av prosjektet
npm run dev
```

ELLER i separate terminaler:

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

