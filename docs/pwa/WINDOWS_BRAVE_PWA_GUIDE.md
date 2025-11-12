# 🪟 Windows PC - Brave Browser PWA Installasjon

## Steg-for-steg guide for å installere JobCrawl som PWA på Windows PC med Brave Browser

### Forutsetninger
- ✅ Windows PC
- ✅ Brave Browser installert
- ✅ Appen kjører på localhost (development) eller HTTPS (produksjon)

---

## 🚀 Rask Installasjon (3 steg)

### Steg 1: Start appen
```powershell
cd frontend
npm run dev
```

### Steg 2: Åpne i Brave
- Gå til: `http://localhost:5173/JobCrawl/`
- Vent til siden er lastet

### Steg 3: Installer
- Se etter **install-ikon** i adresselinjen (pil nedover eller pluss-ikon)
- ELLER se etter **install-prompt** nederst på skjermen
- Klikk **"Installer"** eller **"Install JobCrawl"**

---

## 📋 Detaljert Installasjon

### Metode 1: Via Adresselinjen (Enklest)

1. **Åpne appen i Brave**
   ```
   http://localhost:5173/JobCrawl/
   ```

2. **Se etter install-ikon**
   - I adresselinjen (URL-baren), se etter et **install-ikon**
   - Dette kan være:
     - En **pil nedover** (↓)
     - Et **pluss-ikon** (+)
     - Et **install-ikon** (📱)

3. **Klikk på ikonet**
   - Klikk på install-ikonet i adresselinjen
   - En dialog vil dukke opp

4. **Bekreft installasjon**
   - Klikk **"Installer"** eller **"Install"** i dialogboksen
   - Appen vil nå installeres

5. **Ferdig!**
   - Appen vil åpne i eget vindu (standalone mode)
   - Du kan også finne den i Start-menyen under "JobCrawl"

---

### Metode 2: Via Brave Meny

1. **Åpne Brave meny**
   - Klikk på **hamburger-menyen** (☰) øverst til høyre
   - ELLER trykk `Alt + F`

2. **Finn install-alternativ**
   - Se etter **"Install JobCrawl"**
   - ELLER **"Legg til på hjemmeskjerm"**
   - ELLER **"Install app"**

3. **Klikk på install**
   - Klikk på install-alternativet
   - Bekreft installasjonen

---

### Metode 3: Automatisk Install-prompt

1. **Åpne appen**
   - Gå til `http://localhost:5173/JobCrawl/`
   - Vent noen sekunder

2. **Se etter prompt**
   - En **install-prompt** vil automatisk dukke opp nederst på skjermen
   - Den viser: "Installer JobCrawl - Installer appen for raskere tilgang"

3. **Klikk "Installer"**
   - Klikk på **"Installer"** knappen i prompten
   - Bekreft installasjonen

---

## ✅ Verifisere Installasjon

### Sjekk at appen er installert

1. **Via Brave Apps**
   - Gå til: `brave://apps/`
   - Se etter **"JobCrawl"** i listen
   - Status skal være "Installed"

2. **Via Windows Start-meny**
   - Åpne Start-menyen
   - Søk etter **"JobCrawl"**
   - Appen skal vises som en installert app

3. **Via Desktop**
   - Appen kan også vises på skrivebordet
   - Dobbeltklikk for å åpne

---

## 🎯 Åpne Installert App

### Metode 1: Fra Start-menyen
1. Åpne **Start-menyen** (Windows-tast)
2. Søk etter **"JobCrawl"**
3. Klikk på appen

### Metode 2: Fra Desktop
- Dobbeltklikk på **JobCrawl-ikonet** på skrivebordet

### Metode 3: Fra Brave Apps
1. Gå til: `brave://apps/`
2. Klikk på **JobCrawl**
3. Klikk **"Launch"** eller **"Åpne"**

---

## 🔧 Troubleshooting

### Install-ikon vises ikke

**Løsning 1: Sjekk Service Worker**
```
1. Åpne DevTools (F12)
2. Gå til "Application" tab
3. Se under "Service Workers"
4. Sjekk at service worker er "activated and running"
```

**Løsning 2: Sjekk Manifest**
```
1. DevTools → Application → Manifest
2. Sjekk at alle felter er fylt ut
3. Sjekk at ikoner lastes (ingen 404 errors)
```

**Løsning 3: Tøm cache**
```
1. Trykk Ctrl+Shift+Delete
2. Velg "Cached images and files"
3. Klikk "Clear data"
4. Reload siden (F5)
```

### Appen installeres ikke

**Mulige årsaker:**
- Appen er allerede installert
- Brave Shields blokkerer installasjon
- Manifest har feil

**Løsninger:**

1. **Deaktiver Brave Shields**
   - Klikk på **Brave Shields-ikonet** (løve) i adresselinjen
   - Deaktiver shields for denne siden
   - Prøv installasjon igjen

2. **Sjekk for errors**
   - Åpne DevTools (F12)
   - Gå til "Console" tab
   - Se etter røde feilmeldinger
   - Fiks eventuelle feil

3. **Fjern eksisterende installasjon**
   - Gå til `brave://apps/`
   - Finn JobCrawl
   - Klikk "Remove" eller "Fjern"
   - Prøv installasjon igjen

### Service Worker registreres ikke

**Løsning:**
```javascript
// I DevTools Console, prøv manuell registrering:
navigator.serviceWorker.register('/JobCrawl/sw.js')
  .then(reg => console.log('SW registered:', reg))
  .catch(err => console.error('SW registration failed:', err));
```

---

## 🎨 Funksjoner når installert

Når appen er installert som PWA på Windows, får du:

- ✅ **Standalone vindu** - Appen åpner i eget vindu uten nettleser-chrome
- ✅ **Offline-støtte** - Fungerer uten nettverk (med cached data)
- ✅ **Rask tilgang** - Åpne direkte fra Start-menyen eller Desktop
- ✅ **Native opplevelse** - Føles som en Windows-app
- ✅ **Automatisk oppdatering** - Oppdateres automatisk når ny versjon er tilgjengelig

---

## 📱 Deploy til Produksjon

### For å deploye appen slik at den kan installeres:

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
   - Gå til din produksjons-URL
   - Følg samme installasjonsprosess

---

## 🆘 Hjelp

Hvis du fortsatt har problemer:

1. **Sjekk DevTools**
   - Application → Service Workers
   - Application → Manifest
   - Console for errors

2. **Test i annen nettleser**
   - Prøv Chrome eller Edge
   - Se om problemet er Brave-spesifikt

3. **Sjekk dokumentasjon**
   - Se `BRAVE_PWA_INSTALLASJON.md` for mer detaljer
   - Se `PWA_QUICK_START.md` for generell PWA-info

---

**Oppdatert:** 2024  
**Testet med:** Windows 11, Brave Browser (latest version)

