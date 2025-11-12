# 📱 Testing Guide - JobCrawl på Mobil, Nettbrett og PC

## 🚀 Rask Start

### 1. Start Backend
```bash
cd backend
npm run dev
```

Du skal se:
```
🚀 JobCrawl Backend Server Started!
   Local:   http://localhost:3000/api
   Network: http://192.168.1.252:3000/api

📱 For mobile/tablet testing, use: http://192.168.1.252:3000/api
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

Du skal se:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/JobCrawl/
  ➜  Network: http://192.168.1.252:5173/JobCrawl/
```

## 📱 Tilgang fra Mobil og Nettbrett

### Viktig: Alle enheter må være på samme Wi-Fi nettverk!

### Steg 1: Finn din PC's IP-adresse
Backend serveren viser automatisk IP-adressen når den starter. Se etter:
```
Network: http://192.168.x.x:3000/api
```

Eller kjør manuelt:
```powershell
# Windows
ipconfig | findstr IPv4

# Mac/Linux
ifconfig | grep "inet "
```

### Steg 2: Åpne på mobil/nettbrett

**På mobil/nettbrett nettleser:**
```
http://[DIN-IP-ADRESSE]:5173/JobCrawl/
```

Eksempel:
```
http://192.168.1.252:5173/JobCrawl/
```

### Steg 3: Konfigurer API URL (hvis nødvendig)

Hvis frontend ikke kobler til backend automatisk, opprett `frontend/.env`:
```env
VITE_API_URL=http://[DIN-IP-ADRESSE]:3000/api
```

Eksempel:
```env
VITE_API_URL=http://192.168.1.252:3000/api
```

**Viktig:** Restart frontend serveren etter å ha lagt til `.env` filen!

## 🖥️ Testing på PC

### Lokalt (localhost)
```
http://localhost:5173/JobCrawl/
```

### Fra nettverket (samme som mobil)
```
http://[DIN-IP-ADRESSE]:5173/JobCrawl/
```

## ✅ Sjekkliste før Testing

- [ ] Backend server kjører (se terminal)
- [ ] Frontend server kjører (se terminal)
- [ ] Mobil/nettbrett er på samme Wi-Fi som PC
- [ ] Firewall tillater tilkoblinger (se nedenfor)
- [ ] IP-adresse er notert ned

## 🔥 Windows Firewall Konfigurasjon

Hvis du ikke kan koble til fra mobil/nettbrett:

### Automatisk (Anbefalt)
```powershell
# Tillat Node.js gjennom firewall
netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Node.js Frontend" dir=in action=allow protocol=TCP localport=5173
```

### Manuelt
1. Åpne "Windows Defender Firewall"
2. Klikk "Advanced settings"
3. Klikk "Inbound Rules" → "New Rule"
4. Velg "Port" → Next
5. Velg "TCP" og spesifiser portene: `3000` og `5173`
6. Velg "Allow the connection"
7. Apply til alle profiler
8. Gi regelen et navn (f.eks. "JobCrawl Development")

## 📋 Testing Scenarios

### 1. Basic Funksjonalitet
- [ ] Last inn jobbliste
- [ ] Søk etter jobber
- [ ] Filtrer på lokasjon
- [ ] Se jobbdetaljer

### 2. Autentisering
- [ ] Registrer ny bruker
- [ ] Logg inn
- [ ] "Husk meg" funksjonalitet
- [ ] Glemt passord

### 3. Profil
- [ ] Oppdater profil
- [ ] Last opp CV
- [ ] Aktiver/deaktiver e-postvarsler

### 4. AI Funksjonalitet
- [ ] Generer søknadsbrev
- [ ] Se match score
- [ ] Få forbedringsforslag

### 5. Søknader
- [ ] Opprett søknad
- [ ] Oppdater status
- [ ] Bulk operasjoner
- [ ] Eksporter til PDF/Word

### 6. Responsive Design
- [ ] Test på mobil (portrett)
- [ ] Test på nettbrett (landskap)
- [ ] Test på PC (desktop)
- [ ] Sjekk at alle knapper er klikkbare
- [ ] Sjekk at tekst er lesbar

## 🐛 Troubleshooting

### "Cannot connect" på mobil/nettbrett
1. Sjekk at alle enheter er på samme Wi-Fi
2. Sjekk Windows Firewall (se over)
3. Sjekk at backend/frontend kjører
4. Prøv å ping PC fra mobil: `ping [IP-ADRESSE]`

### "CORS error" i nettleser
- Backend er konfigurert til å tillate alle origins i development
- Hvis du fortsatt får CORS-feil, sjekk at backend kjører

### "API URL not found"
- Sjekk at `VITE_API_URL` i `frontend/.env` matcher backend IP
- Restart frontend serveren etter endringer

### Port allerede i bruk
Se `FIX_PORT_3000.md` for løsning

## 📊 Test på Forskjellige Enheter

### iPhone/iPad
1. Åpne Safari
2. Gå til `http://[IP]:5173/JobCrawl/`
3. Test alle funksjoner

### Android
1. Åpne Chrome
2. Gå til `http://[IP]:5173/JobCrawl/`
3. Test alle funksjoner

### Nettbrett
1. Test både portrett og landskap
2. Sjekk at UI tilpasser seg skjermstørrelse

## 🔒 Sikkerhet i Development

**Viktig:** Denne konfigurasjonen er kun for development/testing!

- CORS tillater alle origins (kun i development)
- Serveren lytter på alle nettverksgrensesnitt
- Ikke bruk denne konfigurasjonen i produksjon!

## 📝 Notater

- IP-adressen kan endre seg hvis du kobler til et annet nettverk
- Hvis IP endrer seg, oppdater `frontend/.env` og restart frontend
- Backend logger automatisk IP-adressen når den starter

## 🎯 Quick Reference

**Backend:**
- Lokalt: `http://localhost:3000/api`
- Nettverk: `http://[IP]:3000/api`

**Frontend:**
- Lokalt: `http://localhost:5173/JobCrawl/`
- Nettverk: `http://[IP]:5173/JobCrawl/`

**Health Check:**
- `http://[IP]:3000/api/health`
