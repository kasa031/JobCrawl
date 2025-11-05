# 📋 Kommandoer for PowerShell (din terminal)

## Steg 1: Start backend og frontend

Åpne en **PowerShell terminal** (din normale - ingen admin nødvendig).

Gå til prosjektmappen:
```powershell
cd C:\Users\Karina\Desktop\Egenlagde_programmer\JobCrawl
```

Start prosjektet:
```powershell
npm run dev
```

## Hva skal du se?

Du skal se:
```
[0] 🚀 JobCrawl Backend running on http://localhost:3000
[1] ➜ Local: http://localhost:5174/
```

**LA DENNE TERMINALEN STÅ ÅPEN!**

## Steg 2: Test

1. Åpne nettleser: http://localhost:5174
2. Registrer deg med ms.tery@icloud.com
3. Du skal se: "Account created! Check your email to verify."
4. Åpne Mailhog: http://localhost:8025
5. Du vil se emailen der!

## Hvis du får "Something went wrong"

1. Trykk `Ctrl+C` i terminalen (stopp servere)
2. Kjør `npm run dev` igjen
3. Prøv registrering på nytt

## Hvis backend ikke starter

Sjekk at du er i riktig mappe:
```powershell
pwd
```
Skal vise: `C:\Users\Karina\Desktop\Egenlagde_programmer\JobCrawl`

## Hvis alt feiler

Slett alle Node-prosesser og start på nytt:
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
npm run dev
```

## Test Mailhog

Mailhog skal også kjøre (du startet den tidligere). Hvis ikke:
- Finne `mailhog.exe` i prosjektmappen eller `backend` mappen
- Høyreklikk → "Run as administrator"
- Eller dobbelt-klikk for å starte

## Når du er ferdig

Trykk `Ctrl+C` i terminalen for å stoppe serverne.

