# Email Verification - JobCrawl

## ✅ Hva er implementert

### 1. **Database**
- `emailVerified` boolean field
- `emailVerificationToken` for unik token
- Token genereres automatisk ved registrering

### 2. **Backend**
- Email verification API endpoint (`GET /api/auth/verify-email`)
- Resend verification endpoint (`POST /api/auth/resend-verification`)
- Login blokk for ikke-verifiserte kontoer
- Email sender med verifiserings-link

### 3. **Funksjonalitet**
- Ved registrering: Bruker får token, email sendes
- Ved login: Sjekker om email er verifisert
- Verifisering: Klikk på link i email
- Resend: Kan sende ny email hvis den ikke kom frem

## 📧 Email Setup

For å sende faktiske emails, legg til i `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Uten email setup:** Systemet logger linken til konsollen for testing.

## 🔗 Verifiserings-Link Format

```
http://localhost:5174/verify-email?token=<token>
```

## 🧪 Testing

1. **Registrer bruker** → Får beskjed om å sjekke email
2. **Sjekk backend konsoll** → Se verification link
3. **Klikk på link** → Email blir verifisert
4. **Prøv å logge inn** → Nå bør det fungere

## 🎓 Sikkerhet

- ✅ Token utløper ikke (kan legges til hvis ønskelig)
- ✅ En bruker per email
- ✅ Password hashing med bcrypt
- ✅ Unike verification tokens
- ✅ Email verifisering før login

