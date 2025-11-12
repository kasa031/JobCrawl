# Quick Fix - Email Verification

## Problem
Du får "No token provided" feilmelding når du prøver å lagre profil.

## Løsning

Du må først verifisere emailen din. Vi så i backend-konsollen at en verification link ble generert:

```
🔗 Verification link would be: http://localhost:5174/verify-email?token=ce223942103ca40fa1fbf6cc788b2b0b600adcdd2c58085ae388e7949650dfb8
```

### Steg 1: Klikk på verifiseringslinken
Kopier og lim inn denne linken i nettleseren:

```
http://localhost:5174/verify-email?token=ce223942103ca40fa1fbf6cc788b2b0b600adcdd2c58085ae388e7949650dfb8
```

### Steg 2: Logg inn
Etter at email er verifisert, kan du logge inn og lagre profilen.

## Alternativ løsning (for testing)

Hvis du vil teste uten email-verifisering, kan vi bygge backend slik at verifisering ikke kreves:

1. Gå til `backend/src/controllers/authController.ts`
2. Kommenter ut email-verifiseringssjekken i `login`-funksjonen

Eller vi kan teste med en eldre versjon av koden før email-verifisering ble lagt til.

Vil du at jeg skal fjerne email-verifisering for testing?

