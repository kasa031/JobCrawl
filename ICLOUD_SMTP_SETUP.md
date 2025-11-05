# Slik setter du opp iCloud Mail for JobCrawl

## iCloud SMTP-innstillinger

```
Host: smtp.mail.me.com
Port: 587
TLS: Ja
```

## Steg 1: Generer App-Specific Password for iCloud

1. Gå til: https://appleid.apple.com
2. Logg inn med Apple ID
3. Gå til "Security" seksjonen
4. Under "App-Specific Passwords", klikk "Generate Password"
5. Skriv et navn (f.eks. "JobCrawl")
6. Kopier passordet du får

## Steg 2: Oppdater backend/env

Åpne `backend/env` og endre email-konfigurasjonen:

```env
# Email Configuration - iCloud SMTP
SMTP_HOST=smtp.mail.me.com
SMTP_PORT=587
SMTP_USER=din_icloud@icloud.com
SMTP_PASSWORD=app-specific_password_her
```

## Steg 3: Restart backend

Stop backend (Ctrl+C) og start på nytt.

**Test:** Registrer en ny bruker på JobCrawl, og sjekk din iCloud e-post for verifiseringslenken!

