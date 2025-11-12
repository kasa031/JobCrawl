# App Icons

Dette mappen skal inneholde app-ikoner i forskjellige størrelser for PWA.

## Nødvendige ikoner

Følgende ikoner må opprettes:

- `icon-16x16.png` - Favicon (16x16)
- `icon-32x32.png` - Favicon (32x32)
- `icon-72x72.png` - Android (72x72)
- `icon-96x96.png` - Android (96x96)
- `icon-128x128.png` - Chrome (128x128)
- `icon-144x144.png` - Android (144x144)
- `icon-152x152.png` - iOS (152x152)
- `icon-192x192.png` - Android (192x192) - **Maskable icon**
- `icon-384x384.png` - Android (384x384)
- `icon-512x512.png` - Android (512x512) - **Maskable icon**

## Maskable Icons

Ikoner på 192x192 og 512x512 skal være "maskable icons" - de skal ha en "safe zone" på 80% av ikonet hvor viktig innhold skal være, med 10% padding på alle sider.

## Design Guidelines

- Bruk JobCrawl logo/favicon
- Farge: Orange (#f97316) eller blå (#3b82f6) som hovedfarge
- Bakgrunn: Hvit eller transparent
- Format: PNG med transparent bakgrunn
- Stil: Flat design, enkel og gjenkjennelig

## Verktøy for å generere ikoner

1. **PWA Asset Generator**: https://github.com/elegantapp/pwa-asset-generator
2. **RealFaviconGenerator**: https://realfavicongenerator.net/
3. **Figma/Photoshop**: Design manuelt og eksporter i riktige størrelser

## Installasjon

Etter at ikonene er generert, legg dem i denne mappen. Vite PWA plugin vil automatisk inkludere dem i build.

