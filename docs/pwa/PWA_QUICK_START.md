# 🚀 PWA Quick Start Guide

## Hva er satt opp?

Grunnstrukturen for Progressive Web App (PWA) er nå på plass:

✅ **Vite PWA Plugin** - Installert og konfigurert
✅ **Manifest.json** - Opprettet med app-metadata
✅ **Service Worker** - Automatisk generert av Vite PWA plugin
✅ **PWA Meta Tags** - Lagt til i index.html
✅ **PWA Utilities** - Opprettet `src/utils/pwa.ts`
✅ **Service Worker Registrering** - Lagt til i main.tsx

## Neste steg

### 1. Generer App Ikoner (KRITISK)

Du må opprette app-ikoner i flere størrelser. Se `frontend/public/icons/README.md` for detaljer.

**Rask løsning:**
1. Ta JobCrawl logo/favicon
2. Bruk [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) eller [RealFaviconGenerator](https://realfavicongenerator.net/)
3. Last ned alle størrelser og legg dem i `frontend/public/icons/`

**Nødvendige størrelser:**
- 16x16, 32x32 (favicon)
- 72x72, 96x96, 128x128, 144x144, 152x152 (Android/iOS)
- 192x192, 384x384, 512x512 (Android - maskable)

### 2. Test PWA i Development

```powershell
cd frontend
npm run dev
```

PWA er aktivert i development mode. Sjekk:
- Service Worker er registrert (DevTools → Application → Service Workers)
- Manifest.json lastes korrekt (DevTools → Application → Manifest)

### 3. Test PWA i Production

```powershell
cd frontend
npm run build
npm run preview
```

Test installasjon:
- **Chrome/Edge**: Se install-ikon i adresselinjen
- **Android**: "Add to Home Screen" prompt
- **iOS Safari**: Share → Add to Home Screen

### 4. Følg Utviklingsplanen

Se `PWA_UTVIKLING_TODO.md` for omfattende utviklingsplan med:
- 7 faser med detaljerte oppgaver
- Prioritering (kritisk, medium, lav)
- Testing-checklist
- Suksess-kriterier

## Hvordan fungerer det?

### Service Worker
- Automatisk generert av Vite PWA plugin
- Cacher statiske assets (JS, CSS, HTML)
- Cacher API-kall med Network-first strategi
- Oppdateres automatisk når ny versjon deployes

### Cache Strategier
- **Statiske assets**: Cache-first (rask lasting)
- **HTML**: Network-first (alltid fersk)
- **API-kall**: Network-first med cache fallback (offline-støtte)
- **Bilder**: Cache-first (30 dager)

### Offline Support
- App fungerer offline med cached data
- API-kall bruker cache hvis nettverk ikke tilgjengelig
- Automatisk sync når nettverk kommer tilbake

## Testing

### Chrome DevTools
1. Åpne DevTools (F12)
2. Gå til **Application** tab
3. Sjekk:
   - **Service Workers**: Service worker er registrert
   - **Manifest**: Manifest.json lastes korrekt
   - **Cache Storage**: Caches er opprettet
   - **Lighthouse**: Kjør PWA audit

### Lighthouse PWA Audit
1. Åpne DevTools → **Lighthouse**
2. Velg **Progressive Web App**
3. Kjør audit
4. Sjekk score og fikse problemer

## Feilsøking

### Service Worker registreres ikke
- Sjekk at du kjører fra HTTP/HTTPS (ikke file://)
- Sjekk console for errors
- Sjekk at vite.config.ts har riktig konfigurasjon

### Manifest lastes ikke
- Sjekk at manifest.json er i `public/` mappen
- Sjekk at path i index.html er korrekt (`/JobCrawl/manifest.json`)
- Sjekk console for 404 errors

### Ikoner vises ikke
- Sjekk at ikoner er i `public/icons/` mappen
- Sjekk at paths i manifest.json er korrekte
- Sjekk at ikoner har riktig størrelser

## Ressurser

- [PWA Utviklingsplan](PWA_UTVIKLING_TODO.md) - Omfattende to-do liste
- [Ikoner Guide](frontend/public/icons/README.md) - Hvordan generere ikoner
- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)

## Status

✅ Grunnstruktur: Ferdig
⏳ App Ikoner: Trengs
⏳ Testing: Trengs
⏳ Offline UI: Trengs
⏳ Push Notifications: Trengs

---

**Neste steg:** Generer app-ikoner og test PWA i development!

