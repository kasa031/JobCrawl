# SMTP Setup for JobCrawl

## Hvordan sette opp email sending

For at JobCrawl skal kunne sende faktiske emails, må du sette opp SMTP.

### Steg 1: Generer App Password fra Gmail

1. Gå til: https://myaccount.google.com/apppasswords
2. Velg "Mail" og "Other (Custom name)"
3. Skriv "JobCrawl"
4. Klikk "Generate"
5. Kopier passordet (ser ut som: "abcd efgh ijkl mnop")

### Steg 2: Legg til i backend/.env

Åpne `backend/.env` og legg til:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=din_gmail@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

### Steg 3: Test email sending

Etter at SMTP er konfigurert, vil emails faktisk sendes til brukerens innboks når de registrerer seg!

## Nåværende Status

- Email-verifisering er implementert
- Backend logger verifiseringslinker
- Men sender ikke faktiske emails (mangler SMTP config)
- Linken vises i UI for testing

