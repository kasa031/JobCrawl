# Slik setter du opp e-post-verifisering for JobCrawl

## 📧 Hva er MailHog?

**MailHog** er en test-SMTP-server som fanger opp alle e-poster lokalt uten å sende dem ut. Den brukes for testing under utvikling.

MailHog sender IKKE faktiske e-poster til brukere. For å sende e-poster som faktisk kan mottas, må du sette opp en ekstern SMTP-server (f.eks. Gmail).

## 🎯 Hva vil du ha?

### Alternativ 1: Test med MailHog (lettest)
- Funksjonen virker, men e-post sendes ikke ut
- Verifiseringslenke vises i backend-konsollen
- Kopier lenken og åpne i nettleseren

### Alternativ 2: Faktisk e-post med Gmail (anbefalt for produksjon)
- E-poster sendes til brukerens innboks
- Brukere får faktisk verifiseringslenke på e-post

---

## 🚀 Sette opp Gmail SMTP

### Steg 1: Generer App Password for Gmail

1. Gå til: https://myaccount.google.com/apppasswords
2. Velg app: "Mail"
3. Velg device: "Other (Custom name)"
4. Skriv inn: "JobCrawl"
5. Klikk "Generate"
6. Kopier passordet (ser ut som: "abcd efgh ijkl mnop")
   - **VIKTIG:** Fjern mellomrommene: `abcdefghijklmnop`

### Steg 2: Legg til i backend/env

Åpne `backend/env` og endre:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=din_gmail@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
```

**Eksempel:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=karina@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

### Steg 3: Restart backend

Stopp backend (Ctrl+C) og start på nytt.

### Steg 4: Test!

1. Registrer en ny bruker på JobCrawl
2. Sjekk e-posten din
3. Klikk på verifiseringslenken
4. Logg inn med e-post og passord

---

## 🛠️ Hvis du vil bruke MailHog i stedet

Hvis du vil bytte til MailHog for testing, endre `backend/env`:

```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
```

Og start MailHog:
```powershell
.\backend\mailhog.exe
```

Åpne MailHog Web UI: http://localhost:8025

---

## ❓ Hvorfor bruker vi MailHog?

MailHog er **kun for testing** - det tillater deg å teste e-postfunksjoner uten å faktisk sende e-poster ut. Det er nyttig for utvikling, men for faktisk bruk trenger du en ekstern SMTP-server.

---

## ✅ E-post-verifisering virker nå!

Når en bruker registrerer seg:
1. ✅ En verifiseringslenke sendes til e-posten
2. ✅ Brukeren klikker på lenken
3. ✅ E-posten blir verifisert
4. ✅ Brukeren kan nå logge inn

**Alle deler av systemet er klar!**

