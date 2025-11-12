# ⚠️ SIKKERHET - API-NØKLER OG PASSORD

## Status
✅ **GOOD NEWS**: `backend/env` filen er **IKKE** committet til git repository.
- Filen er korrekt ignorert i `.gitignore`
- Filen har aldri vært i git historie
- Lokal fil inneholder fortsatt sensitive data

## ⚠️ VIKTIG: Roter nøkler hvis filen noen gang har vært delt

Hvis `backend/env` filen noen gang har blitt delt (via e-post, chat, USB, etc.), må alle nøkler roteres:

### 1. ROTER API-NØKLER
- **OpenAI API Key**: Deaktiver på https://platform.openai.com/api-keys
- **OpenRouter API Key**: Deaktiver på https://openrouter.ai/keys  
- **Gemini API Key**: Deaktiver på https://aistudio.google.com/app/apikey

### 2. ROTER SMTP-PASSORD
- **Gmail SMTP**: Generer ny app password på https://myaccount.google.com/apppasswords
- **iCloud SMTP**: Generer ny app password i iCloud innstillinger

### 3. OPPRETT NYE NØKLER
Etter rotasjon, opprett nye nøkler og legg dem i `backend/env` lokalt.
**ALDRI commit `backend/env` filen til git!**

## Best Practices

### ✅ DO:
- Bruk `backend/env.example` som mal
- Lagre ekte nøkler kun i `backend/env` lokalt
- Sjekk at `.gitignore` inneholder `backend/env`
- Bruk environment variables i produksjon (ikke filer)

### ❌ DON'T:
- Commit `backend/env` til git
- Del `backend/env` via e-post/chat
- Lagre nøkler i kode
- Push sensitive data til GitHub/GitLab

## Verifisering

```bash
# Sjekk at env ikke er tracked
git ls-files | findstr env
# Skal ikke returnere backend/env

# Sjekk git historie
git log --all --full-history -- backend/env
# Skal være tom (ingen commits)
```

## Hvis filen allerede er committet

Hvis filen allerede er i git historie, må den fjernes:

```bash
# Fjern fra git tracking (behold lokalt)
git rm --cached backend/env

# Commit endringen
git commit -m "Remove sensitive credentials from repository"

# Push til remote
git push

# VIKTIG: Roter alle nøkler umiddelbart!
```

