# Hvordan Jobb-Crawleren Fungerer

## Oversikt

Jobb-crawleren bruker **web scraping** (ikke API), noe som betyr at den ikke trenger API-nøkler fra Finn.no, Manpower eller andre jobbsider.

## Hvordan Det Fungerer

### 1. Puppeteer - Automatisk Browser

Systemet bruker **Puppeteer**, som er en Node.js-bibliotek som styrer en ekte Chrome/Chromium-nettleser:

```
┌─────────────────┐
│   Backend       │
│   (Node.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Puppeteer     │
│   (Browser API) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Chrome        │  ← Ekte browser i bakgrunnen
│   (Headless)    │    (uten grafisk interface)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Finn.no       │
│   (HTML-sider)  │
└─────────────────┘
```

### 2. Prosessen

1. **Start browser**: Puppeteer starter en usynlig Chrome-nettleser
2. **Besøk side**: Går til f.eks. `https://www.finn.no/job/fulltime/search.html?q=IT&location=Oslo`
3. **Vent på innlasting**: Vent til siden er ferdig lastet
4. **Finn elementer**: Bruker CSS-selectors for å finne jobbannonser
   - `article.ads__unit` = finner alle jobbannonser
   - `h2` inni = finner jobbtittel
   - `div.ads__unit__content__subtitle` = finner selskap og lokasjon
5. **Hent data**: Leser tekstinnholdet fra HTML-elementene
6. **Lagre**: Lagrer i databasen

### 3. Eksempel: Finn.no

```typescript
// URL vi besøker
baseUrl: 'https://www.finn.no/job/fulltime/search.html?q=IT&location=Oslo'

// CSS-selectors vi bruker for å finne data
selectors: {
  jobList: 'article.ads__unit',        // Alle jobbannonser
  title: 'a.ads__unit__link h2',        // Jobbtittel
  company: 'div.ads__unit__content__subtitle',  // Selskap
  location: 'div.ads__unit__content__subtitle', // Lokasjon
  link: 'a.ads__unit__link',            // Lenke til annonsen
  description: 'div.ads__unit__content__details', // Beskrivelse
}
```

### 4. Rate Limiting

- **2 sekunder venting** mellom requests
- Dette for å:
  - Ikke overbelaste serverne
  - Unngå å bli blokkert
  - Være respektfull mot tjenestene

### 5. Hvorfor Ikke API?

**API** (Application Programming Interface):
- ✅ Raskt og strukturert
- ✅ Offisielt støttet
- ❌ Krever ofte API-nøkkel
- ❌ Kan koste penger
- ❌ Ikke alle sider har API

**Web Scraping** (det vi bruker):
- ✅ Trenger ingen API-nøkkel
- ✅ Gratis
- ✅ Fungerer på alle sider
- ❌ Kan bli langsom hvis sider endrer seg
- ❌ Må oppdateres hvis HTML endres
- ⚠️  Kan bli blokkert hvis man scraper for mye

## Juridisk og Etisk

**Viktig**: Web scraping er generelt lovlig, MEN:
- Respekter `robots.txt` (noen sider sier nei til scraping)
- Ikke scrape for ofte eller for mye
- Ikke del informasjon ulovlig
- Sjekk vilkårene til hver jobb-side

## Hva Skjer Hvis Sider Endrer Seg?

Hvis Finn.no endrer HTML-strukturen (f.eks. endrer CSS-klasser), må vi:
1. Oppdatere selectors i koden
2. Teste at det fungerer
3. Deploye ny versjon

Dette er en ulempe med scraping vs API, men det er vanligvis ikke så ofte det skjer.

