# Mailhog Setup - Email Testing

## Mailhog er nå opplastet!

**Mailhog kjører på:**
- SMTP Server: `localhost:1025`
- Web UI: `http://localhost:8025`

## Hvordan bruke det

1. **Åpne Mailhog Web UI:**
   - Gå til: http://localhost:8025
   - Her vil du se alle emails som blir "sendt" i applikasjonen

2. **Test registrering:**
   - Registrer deg på JobCrawl
   - Gå tilbake til http://localhost:8025
   - Du vil se verification emailen der!
   - Klikk på emailen for å se innholdet
   - Kopier verification linken og klikk på den

## Hvordan starte Mailhog manuelt (hvis den ikke kjører)

```powershell
.\backend\mailhog.exe
```

Eller hvis mailhog.exe er i prosjektroot:
```powershell
.\mailhog.exe
```

## Avbryte

Hvis du vil stoppe Mailhog, trykk `Ctrl+C` i terminalen der den kjører.

## Test nå!

1. Gå til http://localhost:5173 (eller 5174)
2. Registrer deg med en email
3. Åpne http://localhost:8025 i et nytt tab
4. Du vil se emailen der!

