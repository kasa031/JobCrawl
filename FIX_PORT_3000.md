# 🔧 Fix: Port 3000 Already in Use

## Problem
```
Error: listen EADDRINUSE: address already in use :::3000
```

Dette betyr at port 3000 allerede er i bruk av en annen prosess.

## Løsning

### Metode 1: Stopp eksisterende prosess (Anbefalt)

**Windows:**
```powershell
# Finn prosess som bruker port 3000
netstat -ano | findstr :3000

# Stopp prosessen (erstatt PID med faktisk prosess ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Finn prosess som bruker port 3000
lsof -ti:3000

# Stopp prosessen
kill -9 $(lsof -ti:3000)
```

### Metode 2: Bruk en annen port

Endre port i `backend/env`:
```env
PORT=3001
```

Og oppdater `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### Metode 3: Restart alle Node prosesser

**Windows:**
```powershell
taskkill /F /IM node.exe
```

**Mac/Linux:**
```bash
pkill node
```

## Verifisering

Etter å ha stoppet prosessen, start backend på nytt:
```bash
cd backend
npm run dev
```

Du skal se:
```
Server started on http://localhost:3000
```

## Hvorfor skjer dette?

- En tidligere backend server kjører fortsatt
- En annen applikasjon bruker port 3000
- Serveren crashet men prosessen kjører fortsatt

## Forebygging

- Alltid stopp serveren riktig (Ctrl+C)
- Sjekk at ingen andre applikasjoner bruker port 3000
- Vurder å bruke en annen port hvis konflikter oppstår ofte

