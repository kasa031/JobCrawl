# Email Setup for JobCrawl

## For å få email-verifisering til å virkelig fungere

Når du registrerer deg, får du en link i en alert fordi email ikke er satt opp enda.

For å få faktisk email-funksjonalitet:

### Med Gmail

1. Gå til: https://myaccount.google.com/apppasswords
2. Generer en "App Password" for Gmail
3. Legg til i `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ditt_gmail@gmail.com
SMTP_PASSWORD=din_app_password_her
```

### Eller bruk en email service

- SendGrid
- Mailgun  
- AWS SES

## Nåværende status

- Email-verifisering fungerer teknisk
- Link genereres
- Men sendes ikke faktisk (mangler SMTP)
- Vises i alert for testing

## For production

Du må konfigurere SMTP slik at emails sendes automatisk til brukerens innboks.

