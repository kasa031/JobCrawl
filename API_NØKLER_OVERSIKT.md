# 🔑 API Nøkler og Konfigurasjoner - Oversikt

## 📋 Oversikt over alle API-nøkler og secrets i prosjektet

**⚠️ VIKTIG:** Denne filen inneholder IKKE faktiske nøkler. Alle faktiske nøkler ligger i `backend/env` (som er ekskludert fra Git).

---

## ✅ **AI API Nøkler** (for Cover Letter generering og jobb-søk)

### 1. **OpenRouter API Key** ⭐ **AKTIV**
- **Status:** ✅ Satt opp og aktiv
- **Variabel:** `OPENROUTER_API_KEY`
- **Verdi:** `[LAGRET I backend/env - IKKE I GIT]`
- **Provider:** OpenRouter (GRATIS tier)
- **Hvor:** https://openrouter.ai/keys
- **Brukt for:** AI-funksjoner (cover letter generering, jobb-søk utvidelse)
- **Aktiv:** ✅ Ja (AI_PROVIDER=openrouter)

### 2. **OpenAI API Key** 
- **Status:** ⚠️ Satt opp, men IKKE aktiv
- **Variabel:** `OPENAI_API_KEY`
- **Verdi:** `[LAGRET I backend/env - IKKE I GIT]`
- **Provider:** OpenAI
- **Hvor:** https://platform.openai.com/api-keys
- **Brukt for:** AI-funksjoner (hvis AI_PROVIDER=openai)
- **Aktiv:** ❌ Nei (AI_PROVIDER er satt til openrouter, ikke openai)
- **Note:** Du har en nøkkel, men den brukes ikke siden OpenRouter er aktiv

### 3. **Gemini API Key**
- **Status:** ❌ Ikke satt opp
- **Variabel:** `GEMINI_API_KEY`
- **Verdi:** (tom)
- **Provider:** Google Gemini (GRATIS tier)
- **Hvor:** https://aistudio.google.com/app/apikey
- **Brukt for:** AI-funksjoner (hvis AI_PROVIDER=gemini)
- **Aktiv:** ❌ Nei

---

## 🔐 **Sikkerhetsnøkler**

### 4. **JWT Secret**
- **Status:** ✅ Satt opp
- **Variabel:** `JWT_SECRET`
- **Verdi:** `[LAGRET I backend/env - IKKE I GIT]`
- **Brukt for:** Autentisering (JWT tokens)
- **Hvor:** Generert internt
- **Viktig:** ⚠️ Endre denne i produksjon!

---

## 📧 **Email API Nøkler**

### 5. **Gmail SMTP**
- **Status:** ⚠️ Konfigurert, men IKKE aktiv (overstyrt av MailHog)
- **Variabel:** `SMTP_USER`, `SMTP_PASSWORD`
- **Brukernavn:** `[LAGRET I backend/env - IKKE I GIT]`
- **Passord:** `[LAGRET I backend/env - IKKE I GIT]` (App Password)
- **Provider:** Gmail SMTP
- **Hvor:** Gmail → Kontoinnstillinger → App-passord
- **Aktiv:** ❌ Nei (MailHog brukes i stedet for development)

### 6. **iCloud SMTP**
- **Status:** ⚠️ Konfigurert, men kommentert ut (ikke aktiv)
- **Variabel:** (kommentert ut i env-filen)
- **Brukernavn:** `[LAGRET I backend/env - IKKE I GIT]`
- **Passord:** `[LAGRET I backend/env - IKKE I GIT]` (App Password)
- **Provider:** iCloud SMTP
- **Aktiv:** ❌ Nei (kommentert ut)

### 7. **MailHog**
- **Status:** ✅ Aktiv for development
- **Host:** `localhost`
- **Port:** `1026`
- **Brukt for:** Email testing (lokalt)
- **Aktiv:** ✅ Ja (overstyrer Gmail/iCloud)

---

## 🗄️ **Database**

### 8. **Database URL**
- **Status:** ✅ Satt opp
- **Variabel:** `DATABASE_URL`
- **Verdi:** `[LAGRET I backend/env - IKKE I GIT]`
- **Type:** PostgreSQL
- **Brukernavn:** `[LAGRET I backend/env - IKKE I GIT]`
- **Passord:** `[LAGRET I backend/env - IKKE I GIT]`
- **Database:** `jobcrawl`
- **Aktiv:** ✅ Ja

---

## 📊 **Sammendrag**

### ✅ **Aktive Nøkler:**
1. ✅ OpenRouter API Key (AI-funksjoner)
2. ✅ JWT Secret (autentisering)
3. ✅ Database URL (PostgreSQL)
4. ✅ MailHog (email testing)

### ⚠️ **Ikke-aktive (men konfigurert):**
1. ⚠️ OpenAI API Key (har nøkkel, men OpenRouter brukes i stedet)
2. ⚠️ Gmail SMTP (har credentials, men MailHog brukes i development)
3. ⚠️ iCloud SMTP (kommentert ut)

### ❌ **Ikke satt opp:**
1. ❌ Gemini API Key

---

## 🔄 **Hvordan bytte AI Provider**

Hvis du vil bytte fra OpenRouter til OpenAI:

1. Endre i `backend/env`:
   ```
   AI_PROVIDER=openai
   ```

2. OpenRouter vil da IKKE brukes, OpenAI vil brukes i stedet.

Hvis du vil bruke Gemini:

1. Få en nøkkel fra: https://aistudio.google.com/app/apikey
2. Legg den i `backend/env`:
   ```
   GEMINI_API_KEY=din_nøkkel_her
   AI_PROVIDER=gemini
   ```

---

## ⚠️ **Sikkerhetsnotater**

1. **Aldri commit `.env` eller `env` filer** til Git
2. **Roter API-nøkler** regelmessig (spesielt hvis de blir eksponert)
3. **Bruk forskjellige nøkler** for development og produksjon
4. **JWT_SECRET** må endres i produksjon
5. **Database passord** skal være sterkere i produksjon
6. **Aldri inkluder faktiske nøkler** i dokumentasjonsfiler som committes til Git

---

## 📝 **Hvor finnes informasjonen?**

- **Alle nøkler:** `backend/env` filen (IKKE i Git)
- **Eksempel:** `backend/env.example` (uten faktiske nøkler)
- **Kode:** `backend/src/services/ai/AIService.ts` (bruker AI-nøkler)
