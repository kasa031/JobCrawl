# 🔐 Guide for å rotere API-nøkler og SMTP-passord

Hvis `backend/env` filen har blitt eksponert, må alle nøkler roteres umiddelbart.

## Steg 1: Roter OpenAI API Key

1. Gå til https://platform.openai.com/api-keys
2. Logg inn med din OpenAI-konto
3. Finn nøkkelen som starter med `sk-proj-vP_dx1GJd...`
4. Klikk "Revoke" eller "Delete"
5. Opprett en ny API key
6. Oppdater `backend/env` med den nye nøkkelen

## Steg 2: Roter OpenRouter API Key

1. Gå til https://openrouter.ai/keys
2. Logg inn med din OpenRouter-konto
3. Finn nøkkelen som starter med `sk-or-v1-eb3bea85...`
4. Klikk "Delete" eller "Revoke"
5. Opprett en ny API key
6. Oppdater `backend/env` med den nye nøkkelen

## Steg 3: Roter Gmail SMTP Password

1. Gå til https://myaccount.google.com/apppasswords
2. Logg inn med Gmail-kontoen (`k30991043@gmail.com`)
3. Hvis 2FA ikke er aktivert, aktiver det først
4. Klikk "Select app" → "Mail"
5. Klikk "Select device" → "Other (Custom name)" → Skriv "JobCrawl"
6. Klikk "Generate"
7. Kopier det nye 16-tegns passordet
8. Oppdater `backend/env` med det nye passordet

## Steg 4: Roter iCloud SMTP Password (hvis brukt)

1. Gå til https://appleid.apple.com/
2. Logg inn med din Apple ID
3. Gå til "Sign-In and Security" → "App-Specific Passwords"
4. Finn passordet for "JobCrawl" eller "Mail"
5. Klikk "Revoke"
6. Opprett et nytt app-specific password
7. Oppdater `backend/env` med det nye passordet

## Steg 5: Verifiser

1. Test at backend starter uten feil
2. Test at AI-generering fungerer
3. Test at e-post sending fungerer
4. Sjekk at ingen nye commits inneholder sensitive data

## Viktig

- **Rotér nøkler umiddelbart** hvis filen har blitt delt
- **Ikke commit** den oppdaterte `backend/env` filen
- **Bruk environment variables** i produksjon
- **Ikke del** nøkler via e-post, chat eller andre usikre kanaler

