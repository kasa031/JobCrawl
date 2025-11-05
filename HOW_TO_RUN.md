# Hvordan kjøre JobCrawl

## Start prosjektet

Åpne en **ny terminal** i Cursor (VS Code):

1. Gå til toppen av Cursor, klikk **Terminal** → **New Terminal**
2. Skriv:
```powershell
npm run dev
```

3. La denne terminalen være åpen! Den viser output fra både frontend og backend.

## Status

Fra outputen kan du se:
- `🚀 JobCrawl Backend running on http://localhost:3000` = Backend OK
- `➜ Local: http://localhost:5174/` = Frontend OK

## Hvis de stopper

Hvis frontend/backend stopper av en grunn:
1. Gå tilbake til terminalen
2. Trykk `Ctrl+C` for å stoppe
3. Skriv `npm run dev` igjen

## Viktig

**Ikke lukk terminalen!** Den må være åpen mens du utvikler.

Ordet "stopper" her betyr ikke at prosessene faktisk stopper - de kjører i bakgrunnen. Det du må gjøre er å:

1. **Åpne en ny terminal** i Cursor
2. **Kjør `npm run dev`** der
3. **La den stå åpen**

Si ifra hvis prosessene faktisk stopper!

