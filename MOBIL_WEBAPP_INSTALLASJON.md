# 📱 Mobil WebApp Installasjon - JobCrawl

## 🎯 Mål
Installer JobCrawl som en webapp på mobilen din slik at den kan åpnes som en app direkte fra hjemmeskjermen.

---

## ✅ Forutsetninger
- ✅ Mobil med Brave Browser installert
- ✅ Appen er deployet (eller kjører lokalt)
- ✅ Mobil og PC er på samme Wi-Fi (hvis lokal testing)

---

## 🚀 Rask Installasjon (3 enkle steg)

### Steg 1: Åpne appen i Brave på mobil
- Gå til appens URL i Brave Browser
- F.eks: `https://ditt-brukernavn.github.io/JobCrawl/`
- ELLER: `http://192.168.1.100:5173/JobCrawl/` (lokal testing)

### Steg 2: Se etter install-prompt
- En **install-prompt** vil dukke opp nederst på skjermen
- Den viser: "Installer JobCrawl - Installer appen for raskere tilgang"
- Klikk **"Installer"**

### Steg 3: Bekreft installasjon
- Brave vil spørre om du vil installere appen
- Klikk **"Legg til"** eller **"Install"**
- **Ferdig!** Appen er nå på hjemmeskjermen

---

## 📋 Detaljert Installasjon

### Metode 1: Automatisk Install-prompt (Enklest)

1. **Åpne appen i Brave**
   ```
   Gå til appens URL i Brave Browser
   ```

2. **Vent på prompt**
   - En install-prompt dukker automatisk opp
   - Den vises nederst på skjermen
   - Hvis den ikke vises, se "Troubleshooting" nedenfor

3. **Klikk "Installer"**
   - Klikk på **"Installer"** knappen
   - Bekreft installasjonen

4. **Ferdig!**
   - Appen vil nå vises på hjemmeskjermen
   - Du kan åpne den som en app

---

### Metode 2: Via Brave Meny (Manuell)

#### Android
1. **Åpne Brave meny**
   - Trykk på **tre prikker** (⋮) øverst til høyre
   - ELLER swipe ned fra toppen

2. **Velg "Add to Home screen"**
   - Scroll ned til **"Add to Home screen"**
   - ELLER **"Legg til på hjemmeskjerm"**

3. **Bekreft**
   - Trykk **"Add"** eller **"Legg til"**
   - Appen vil nå vises på hjemmeskjermen

#### iOS (iPhone/iPad)
1. **Åpne Brave meny**
   - Trykk på **delningsikonet** (firkant med pil oppover)
   - Det er nederst i skjermen

2. **Velg "Add to Home Screen"**
   - Scroll ned til **"Add to Home Screen"**
   - ELLER **"Legg til på hjemmeskjerm"**

3. **Bekreft**
   - Trykk **"Add"** eller **"Legg til"**
   - Appen vil nå vises på hjemmeskjermen

---

### Metode 3: Via Adresselinjen

1. **Se etter install-ikon**
   - I adresselinjen, se etter et **install-ikon**
   - Dette kan være en **pil nedover** (↓) eller **pluss-ikon** (+)

2. **Klikk på ikonet**
   - Trykk på install-ikonet
   - Bekreft installasjonen

---

## ✅ Verifisere Installasjon

### Sjekk at appen er installert

1. **Sjekk hjemmeskjermen**
   - Appen skal vises som et ikon på hjemmeskjermen
   - Ikonet skal ha JobCrawl-logo (briefcase med søkeglass)

2. **Åpne appen**
   - Trykk på ikonet
   - Appen skal åpne i **standalone mode** (uten nettleser-chrome)
   - Det skal se ut som en native app

3. **Test funksjonalitet**
   - Logg inn
   - Søk etter jobber
   - Alt skal fungere som normalt

---

## 🎨 Funksjoner når installert

Når appen er installert som webapp på mobil, får du:

- ✅ **Standalone mode** - Appen åpner uten nettleser-chrome
- ✅ **Rask tilgang** - Åpne direkte fra hjemmeskjermen
- ✅ **Native opplevelse** - Føles som en native app
- ✅ **Offline-støtte** - Fungerer uten nettverk (med cached data)
- ✅ **Automatisk oppdatering** - Oppdateres automatisk

---

## 🔧 Troubleshooting

### Install-prompt vises ikke

**Løsning 1: Sjekk at appen er installable**
```
1. Åpne DevTools (hvis mulig)
2. Gå til "Application" → "Manifest"
3. Sjekk at alle felter er fylt ut
4. Sjekk at ikoner lastes (ingen 404 errors)
```

**Løsning 2: Tøm cache**
```
1. Brave meny → Settings → Privacy
2. Clear browsing data
3. Velg "Cached images and files"
4. Clear data
5. Reload siden
```

**Løsning 3: Sjekk Brave Shields**
```
1. Klikk på Brave Shields-ikonet (løve)
2. Deaktiver shields for denne siden
3. Prøv installasjon igjen
```

### Appen installeres ikke

**Mulige årsaker:**
- Appen er allerede installert
- Brave Shields blokkerer installasjon
- Manifest har feil

**Løsninger:**

1. **Fjern eksisterende installasjon**
   - Hold inne på app-ikonet på hjemmeskjermen
   - Velg "Fjern" eller "Delete"
   - Prøv installasjon igjen

2. **Deaktiver Brave Shields**
   - Klikk på Brave Shields-ikonet
   - Deaktiver shields
   - Prøv installasjon igjen

3. **Sjekk for errors**
   - Åpne DevTools (hvis mulig)
   - Se etter røde feilmeldinger
   - Fiks eventuelle feil

### Appen åpner ikke

**Løsning:**
```
1. Fjern appen fra hjemmeskjermen
2. Installer på nytt
3. Hvis problemet vedvarer, sjekk at URL er korrekt
```

---

## 📱 Testing Lokalt på Mobil

### Steg 1: Start backend og frontend
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Steg 2: Finn nettverks-IP
- Backend vil vise nettverks-IP (f.eks. `192.168.1.100:3000`)
- Frontend vil vise nettverks-IP (f.eks. `192.168.1.100:5173`)

### Steg 3: Åpne på mobil
- På mobil: Gå til `http://192.168.1.100:5173/JobCrawl/`
- Sørg for at mobil er på samme Wi-Fi

### Steg 4: Installer
- Følg installasjonsinstruksjonene over

---

## 🚀 Deploy til Produksjon

### For å deploye slik at appen kan installeres:

1. **Build appen**
   ```powershell
   cd frontend
   npm run build
   ```

2. **Deploy til GitHub Pages**
   - Push `dist/` mappen til GitHub Pages
   - Eller deploy til annen hosting (Netlify, Vercel, etc.)

3. **Sørg for HTTPS**
   - PWA krever HTTPS (eller localhost)
   - GitHub Pages gir automatisk HTTPS

4. **Test installasjon**
   - Gå til din produksjons-URL på mobil
   - Følg installasjonsprosess

---

## ✅ Checklist

- [ ] Appen er deployet (eller kjører lokalt)
- [ ] HTTPS er aktivert (eller localhost)
- [ ] Manifest.json er korrekt
- [ ] Ikoner er generert og tilgjengelige
- [ ] Service Worker er registrert
- [ ] Testet installasjon på mobil
- [ ] Appen åpner i standalone mode
- [ ] Funksjonalitet fungerer

---

## 🆘 Hjelp

Hvis du fortsatt har problemer:

1. **Sjekk dokumentasjon**
   - `WINDOWS_BRAVE_PWA_GUIDE.md` - For Windows PC
   - `BRAVE_PWA_INSTALLASJON.md` - Generell guide
   - `PWA_QUICK_START.md` - Quick start

2. **Test i annen nettleser**
   - Prøv Chrome eller Safari
   - Se om problemet er Brave-spesifikt

3. **Sjekk console**
   - Åpne DevTools (hvis mulig)
   - Se etter errors

---

**Oppdatert:** 2024  
**Testet med:** Brave Browser på Android og iOS

