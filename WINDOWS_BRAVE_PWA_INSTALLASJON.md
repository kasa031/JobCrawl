# 🪟 Windows PC - Installer JobCrawl PWA i Brave Browser

## Steg-for-steg guide for Windows PC

### Forutsetninger
- ✅ Windows PC
- ✅ Brave Browser installert
- ✅ Appen kjører på localhost (development) eller HTTPS (produksjon)

---

## 🚀 Rask Installasjon (3 steg)

### Steg 1: Start appen
```powershell
# I PowerShell, gå til prosjektmappen
cd C:\Users\Karina\Desktop\Egenlagde_programmer\JobCrawl\frontend

# Start frontend
npm run dev
```

### Steg 2: Åpne i Brave
1. Åpne **Brave Browser**
2. Gå til: `http://localhost:5173/JobCrawl/`
3. Vent 2-3 sekunder for at service worker skal registreres

### Steg 3: Installer på hjemmeskjerm
**Metode A: Automatisk prompt (anbefalt)**
- En install-prompt vil dukke opp nederst på skjermen
- Klikk **"Installer"** knappen
- Bekreft i dialogboksen

**Metode B: Via adresselinjen**
- Se etter **install-ikonet** (pil nedover eller pluss) i adresselinjen
- Klikk på ikonet
- Bekreft installasjonen

**Metode C: Via Brave-meny**
1. Klikk på **hamburger-menyen** (tre linjer) øverst til høyre
2. Eller trykk `Alt + F`
3. Se etter **"Install JobCrawl"** eller **"Legg til på hjemmeskjerm"**
4. Klikk og bekreft

---

## 📍 Hvor finner du appen etter installasjon?

### Windows Start-meny
1. Trykk **Windows-tasten** (eller klikk Start-knappen)
2. Søk etter **"JobCrawl"**
3. Klikk på JobCrawl-ikonet

### Desktop (hvis valgt)
- Appen kan vises som et ikon på skrivebordet
- Dobbeltklikk for å åpne

### Taskbar (hvis festet)
- Høyreklikk på appen i Start-menyen
- Velg **"Pin to taskbar"** for rask tilgang

---

## ✅ Verifisere installasjon

### Sjekk at appen er installert:
1. Gå til `brave://apps/` i Brave
2. Se etter **"JobCrawl"** i listen
3. Appen skal vises med ikon og navn

### Sjekk at appen fungerer:
1. Åpne appen (fra Start-meny eller desktop)
2. Appen skal åpne i **eget vindu** (standalone mode)
3. Ingen nettleser-chrome skal vises (ingen adresselinje, tabs, etc.)
4. Appen skal fungere som en native app

---

## 🔧 Troubleshooting

### Install-prompt vises ikke

**Løsning 1: Sjekk Service Worker**
```
1. Åpne DevTools (F12)
2. Gå til "Application" tab
3. Se under "Service Workers"
4. Sjekk at service worker er "activated and running"
```

**Løsning 2: Tøm cache**
```
1. Trykk Ctrl+Shift+Delete
2. Velg "Cached images and files"
3. Velg "Last hour" eller "All time"
4. Klikk "Clear data"
5. Reload siden (F5)
```

**Løsning 3: Sjekk manifest**
```
1. DevTools → Application → Manifest
2. Sjekk at alle felter er fylt ut
3. Sjekk at ikoner lastes (ingen 404 errors)
```

**Løsning 4: Deaktiver Brave Shields midlertidig**
```
1. Klikk på Brave Shields-ikonet (løve) i adresselinjen
2. Deaktiver shields for denne siden
3. Reload siden
4. Prøv installasjon igjen
```

### Appen installeres ikke

**Sjekkliste:**
- ✅ Er appen kjørt på HTTPS eller localhost?
- ✅ Er service worker registrert? (DevTools → Application → Service Workers)
- ✅ Er manifest.json tilgjengelig? (DevTools → Application → Manifest)
- ✅ Har du besøkt siden minst én gang før?

**Løsning:**
1. Sjekk console for errors (F12 → Console)
2. Sjekk at alle ikoner lastes korrekt
3. Prøv å deaktivere Brave Shields
4. Restart Brave Browser

### Appen åpnes ikke etter installasjon

**Løsning:**
1. Gå til `brave://apps/`
2. Finn JobCrawl
3. Høyreklikk → "Remove"
4. Installer på nytt

---

## 🎯 Funksjoner når installert

Når appen er installert som PWA på Windows, får du:
- ✅ **Standalone mode** - Appen åpner i eget vindu uten nettleser-chrome
- ✅ **Offline-støtte** - Appen fungerer uten nettverk (med cached data)
- ✅ **Rask tilgang** - Åpne appen direkte fra Start-menyen
- ✅ **Native opplevelse** - Føles som en native Windows-app
- ✅ **Taskbar-pinning** - Fest appen til taskbar for enda raskere tilgang

---

## 📱 Deploy til produksjon

For å deploye appen slik at den kan installeres fra produksjon:

### Steg 1: Build appen
```powershell
cd frontend
npm run build
```

### Steg 2: Deploy til GitHub Pages
```powershell
# Følg instruksjoner i README.md for GitHub Pages deployment
```

### Steg 3: Test i produksjon
1. Gå til din produksjons-URL (f.eks. `https://username.github.io/JobCrawl/`)
2. Følg samme installasjonsprosess som over
3. Appen vil nå være tilgjengelig fra produksjon

---

## 🔍 Avansert feilsøking

### Service Worker registreres ikke

**Test manuelt i console:**
```javascript
// Åpne DevTools → Console
navigator.serviceWorker.register('/JobCrawl/sw.js')
  .then(reg => console.log('SW registered:', reg))
  .catch(err => console.error('SW registration failed:', err));
```

### Manifest lastes ikke

**Sjekk network tab:**
1. DevTools → Network
2. Reload siden
3. Se etter `manifest.json` request
4. Sjekk at den returnerer 200 OK

### Ikoner vises ikke

**Sjekk:**
1. DevTools → Application → Manifest
2. Se etter ikoner i listen
3. Klikk på hvert ikon for å se om det laster
4. Sjekk at alle ikoner er i `frontend/public/icons/` mappen

---

## 📚 Ytterligere ressurser

- [Brave PWA Support](https://brave.com/privacy-features/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Windows PWA Guide](https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps/)

---

**Oppdatert:** 2024
**Testet med:** Windows 10/11, Brave Browser (latest version)

