# Slik starter du MailHog og tester JobCrawl

## Start MailHog

1. Åpne en **NY** PowerShell-terminal
2. Kjør denne kommandoen:
```powershell
.\backend\mailhog.exe
```

MailHog skal nå vise at den kjører på:
- SMTP: localhost:1025
- Web UI: http://localhost:8025

## Test e-post-verifisering

1. ✅ Backend kjører allerede (localhost:3000)
2. ✅ MailHog kjører (localhost:1025)
3. Start frontend (i en tredje terminal):
```powershell
cd frontend
npm run dev
```

4. Gå til http://localhost:5173

5. **Registrer en ny bruker:**
   - Klikk "Login" → "Register"
   - Fyll inn navn, e-post, passord
   - Klikk "Create Account"

6. **Sjekk MailHog Web UI:**
   - Åpne http://localhost:8025 i nettleseren
   - Du vil se e-posten der!
   - Klikk på e-posten for å se innholdet
   - Kopier verifiseringslenken

7. **Verifiser e-posten:**
   - Åpne lenken i en ny fane
   - E-post er nå verifisert!

8. **Logg inn:**
   - Gå tilbake til JobCrawl
   - Klikk "Login"
   - Skriv inn e-post og passord
   - Klikk "Sign In"

## Ferdig! ✅

E-post-verifisering virker nå med MailHog!

