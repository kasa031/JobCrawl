# 📱 Mobil Testing Guide

## Problem løst
Frontend prøver nå automatisk å finne riktig backend-URL når du tester på mobil eller nettbrett.

## Hvordan teste på mobil/nettbrett

### Steg 1: Start backend
```powershell
cd backend
npm run dev
```

Backend vil nå vise nettverks-IP (f.eks. `http://192.168.1.100:3000/api`)

### Steg 2: Start frontend
```powershell
cd frontend
npm run dev
```

Frontend vil også vise nettverks-IP (f.eks. `http://192.168.1.100:5173`)

### Steg 3: Åpne på mobil/nettbrett
1. Sørg for at mobil/nettbrett er på samme Wi-Fi som PC-en
2. Åpne nettleseren på mobil/nettbrett
3. Gå til nettverks-IP-en som frontend viser (f.eks. `http://192.168.1.100:5173/JobCrawl/`)

## Automatisk deteksjon
- Hvis du åpner frontend via nettverks-IP (f.eks. `192.168.1.100:5173`), vil frontend automatisk prøve å koble til backend på samme IP (`192.168.1.100:3000`)
- Hvis du åpner via `localhost`, vil frontend prøve `localhost:3000` (fungerer kun på PC, ikke mobil)

## Feilmeldinger
- Feilmeldinger er nå mindre påtrengende - de vises kun i konsollen, ikke som popups
- Hvis backend ikke er tilgjengelig, får du en hjelpsom feilmelding med instruksjoner

## Tips
- Bruk alltid nettverks-IP når du tester på mobil/nettbrett
- Sjekk at både PC og mobil er på samme Wi-Fi-nettverk
- Hvis du fortsatt får feil, sjekk at backend kjører og at firewall tillater tilkoblinger

