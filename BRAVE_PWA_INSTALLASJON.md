# 📱 Installer JobCrawl PWA i Brave Browser

## Steg-for-steg guide for å installere JobCrawl som PWA i Brave

### Forutsetninger
- Brave Browser installert
- Appen kjører på localhost (development) eller HTTPS (produksjon)

---

## Metode 1: Automatisk Install-prompt (Anbefalt)

1. **Åpne appen i Brave**
   - Gå til `http://localhost:5173/JobCrawl/` (development)
   - Eller din produksjons-URL

2. **Vent på install-prompt**
   - En install-prompt vil automatisk dukke opp nederst på skjermen
   - Klikk på **"Installer"** knappen

3. **Bekreft installasjon**
   - Brave vil spørre om du vil installere appen
   - Klikk **"Installer"** i dialogboksen

4. **Ferdig!**
   - Appen er nå installert og vil vises på hjemmeskjermen
   - Du kan åpne den som en standalone app

---

## Metode 2: Manuell installasjon via meny

Hvis install-prompt ikke vises, kan du installere manuelt:

### På Desktop (Windows/Mac/Linux)

1. **Åpne Brave meny**
   - Klikk på **hamburger-menyen** (tre linjer) øverst til høyre
   - Eller trykk `Alt + F`

2. **Finn "Install JobCrawl"**
   - Se etter **"Install JobCrawl"** eller **"Legg til på hjemmeskjerm"** i menyen
   - Hvis du ikke ser det, se "Troubleshooting" nedenfor

3. **Klikk på install**
   - Klikk på install-alternativet
   - Bekreft installasjonen

### På Mobil (Android/iOS)

#### Android
1. **Åpne Brave meny**
   - Trykk på **tre prikker** (⋮) øverst til høyre

2. **Velg "Add to Home screen"**
   - Scroll ned til **"Add to Home screen"**
   - Eller **"Legg til på hjemmeskjerm"**

3. **Bekreft**
   - Trykk **"Add"** eller **"Legg til"**
   - Appen vil nå vises på hjemmeskjermen

#### iOS (iPhone/iPad)
1. **Åpne Brave meny**
   - Trykk på **delningsikonet** (firkant med pil oppover)

2. **Velg "Add to Home Screen"**
   - Scroll ned til **"Add to Home Screen"**
   - Eller **"Legg til på hjemmeskjerm"**

3. **Bekreft**
   - Trykk **"Add"** eller **"Legg til"**
   - Appen vil nå vises på hjemmeskjermen

---

## Metode 3: Via Adresselinjen (Desktop)

1. **Se etter install-ikon**
   - I adresselinjen (URL-baren), se etter et **install-ikon** (vanligvis en pil nedover eller pluss-ikon)
   - Dette vises når appen er installable

2. **Klikk på ikonet**
   - Klikk på install-ikonet
   - Bekreft installasjonen

---

## Troubleshooting

### Install-prompt vises ikke

**Sjekkliste:**
- ✅ Er appen kjørt på HTTPS eller localhost? (PWA krever sikker tilkobling)
- ✅ Er service worker registrert? (Sjekk DevTools → Application → Service Workers)
- ✅ Er manifest.json tilgjengelig? (Sjekk DevTools → Application → Manifest)
- ✅ Har du besøkt siden minst én gang før? (Noen nettlesere krever dette)

**Løsninger:**

1. **Sjekk Service Worker**
   ```
   - Åpne DevTools (F12)
   - Gå til "Application" tab
   - Se under "Service Workers"
   - Sjekk at service worker er "activated and running"
   ```

2. **Sjekk Manifest**
   ```
   - I DevTools → Application → Manifest
   - Sjekk at alle felter er fylt ut korrekt
   - Sjekk at ikoner lastes (ingen 404 errors)
   ```

3. **Tøm cache og reload**
   ```
   - Trykk Ctrl+Shift+Delete (Windows) eller Cmd+Shift+Delete (Mac)
   - Velg "Cached images and files"
   - Klikk "Clear data"
   - Reload siden (F5)
   ```

4. **Sjekk Brave innstillinger**
   ```
   - Gå til brave://settings/
   - Søk etter "PWA" eller "Progressive Web App"
   - Sjekk at PWA-støtte er aktivert
   ```

### Appen installeres ikke

**Mulige årsaker:**
- Appen er allerede installert (sjekk hjemmeskjermen)
- Brave blokkerer installasjon (sjekk Brave Shields)
- Manifest har feil (sjekk DevTools console for errors)

**Løsninger:**

1. **Deaktiver Brave Shields midlertidig**
   - Klikk på **Brave Shields-ikonet** (løve) i adresselinjen
   - Deaktiver shields for denne siden
   - Prøv installasjon igjen

2. **Sjekk for errors i console**
   - Åpne DevTools (F12)
   - Gå til "Console" tab
   - Se etter røde feilmeldinger
   - Fiks eventuelle feil

3. **Fjern eksisterende installasjon**
   - Hvis appen allerede er installert, fjern den først
   - Gå til `brave://apps/`
   - Finn JobCrawl og fjern den
   - Prøv installasjon igjen

---

## Verifisere installasjon

### Desktop
1. **Sjekk at appen er installert**
   - Gå til `brave://apps/`
   - Se etter "JobCrawl" i listen

2. **Åpne appen**
   - Klikk på JobCrawl-ikonet
   - Appen skal åpne i eget vindu (standalone mode)

### Mobil
1. **Sjekk hjemmeskjermen**
   - Appen skal vises som et ikon på hjemmeskjermen
   - Ikonet skal ha JobCrawl-logo

2. **Åpne appen**
   - Trykk på ikonet
   - Appen skal åpne uten nettleser-chrome (standalone mode)

---

## Funksjoner når installert

Når appen er installert som PWA, får du:
- ✅ **Standalone mode** - Appen åpner i eget vindu uten nettleser-chrome
- ✅ **Offline-støtte** - Appen fungerer uten nettverk (med cached data)
- ✅ **Rask tilgang** - Åpne appen direkte fra hjemmeskjermen
- ✅ **Native opplevelse** - Føles som en native app

---

## Feilsøking - Avansert

### Service Worker registreres ikke

Hvis service worker ikke registreres, sjekk:

1. **Sjekk console for errors**
   ```javascript
   // Åpne DevTools → Console
   // Se etter errors relatert til service worker
   ```

2. **Sjekk network tab**
   - DevTools → Network
   - Reload siden
   - Se etter `sw.js` request
   - Sjekk at den returnerer 200 OK

3. **Manuell registrering (for testing)**
   ```javascript
   // I DevTools Console:
   navigator.serviceWorker.register('/JobCrawl/sw.js')
     .then(reg => console.log('SW registered:', reg))
     .catch(err => console.error('SW registration failed:', err));
   ```

### Manifest lastes ikke

1. **Sjekk manifest URL**
   - DevTools → Application → Manifest
   - Sjekk at URL er korrekt: `/JobCrawl/manifest.json`

2. **Sjekk manifest innhold**
   - Sjekk at alle felter er fylt ut
   - Sjekk at ikoner har korrekte paths
   - Sjekk at ingen felter har null eller undefined

---

## Support

Hvis du fortsatt har problemer:
1. Sjekk DevTools console for errors
2. Sjekk DevTools → Application → Service Workers
3. Sjekk DevTools → Application → Manifest
4. Prøv i en annen nettleser (Chrome, Edge) for å se om problemet er Brave-spesifikt

---

**Oppdatert:** 2024
**Testet med:** Brave Browser (latest version)

