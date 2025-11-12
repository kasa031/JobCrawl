# 🔒 SIKKERHETSREGLER - MÅ FØLGES STRENG

## ⚠️ KRITISKE REGLER

### 1. ALDRI COMMIT ENV-FILER
- ❌ **ALDRI** commit `backend/env` eller `frontend/env`
- ✅ **KUN** commit `env.example` filer
- ✅ Bruk `.gitignore` for å ignorere env-filer

### 2. ALDRI COMMIT API-NØKLER
- ❌ **ALDRI** commit filer med ekte API-nøkler
- ❌ **ALDRI** commit filer med `sk-proj-`, `sk-or-v1-`, eller lignende
- ✅ Bruk `env.example` med placeholder-verdier

### 3. ALDRI COMMIT PASSORD
- ❌ **ALDRI** commit SMTP-passord
- ❌ **ALDRI** commit database-passord
- ❌ **ALDRI** commit JWT secrets

## 🛡️ SIKKERHETSSJEKK

### Før hver commit:
```powershell
# Kjør sikkerhetssjekk
.\scripts\check-secrets.ps1
```

### Automatisk sjekk:
Git hooks er satt opp for å automatisk blokkere commits med sensitive data:
- `.git/hooks/pre-commit` - Sjekker før commit
- `.git/hooks/pre-push` - Sjekker før push

## 📋 SJEKKLISTE FØR COMMIT

- [ ] Har kjørt `.\scripts\check-secrets.ps1`
- [ ] Ingen `env` filer i staged files
- [ ] Ingen API-nøkler i kode
- [ ] Ingen passord i kode
- [ ] Kun `env.example` filer er committet

## 🔍 HVORDAN SJEKKE

### Sjekk staged files:
```powershell
git diff --cached --name-only
```

### Sjekk for sensitive data:
```powershell
git diff --cached | Select-String -Pattern "sk-|password|secret"
```

### Sjekk git historie:
```powershell
git log --all --full-history -S "sk-proj-" --source --oneline
```

## 🚨 HVIS NOE GÅR GALT

### Hvis env-fil er committet:
```powershell
# Fjern fra git (behold lokalt)
git rm --cached backend/env

# Commit endringen
git commit -m "Remove sensitive credentials"

# Roter alle nøkler umiddelbart!
# Se backend/ROTER_NOKLER.md
```

### Hvis nøkler er eksponert:
1. **ROTER ALLE NØKLER UMIDDELBART**
2. Se `backend/ROTER_NOKLER.md` for detaljert guide
3. Sjekk git historie for eksponerte commits
4. Vurder å rotere alle nøkler som forholdsregel

## ✅ BEST PRACTICES

1. **Bruk alltid `env.example` som mal**
2. **Test lokalt med `backend/env` (ikke commit)**
3. **Bruk environment variables i produksjon**
4. **Kjør sikkerhetssjekk før hver commit**
5. **Review alle filer før commit**

## 🔐 FILER SOM ALDRI SKAL COMMITTES

- `backend/env`
- `frontend/env`
- `*.env` (uten .example)
- `**/env` (uten .example)
- Alle filer med API-nøkler
- Alle filer med passord

## 📝 EKSEMPEL PÅ KORREKT BRUK

### ✅ RIKTIG:
```bash
# backend/env.example (COMMIT DENNE)
OPENAI_API_KEY=your_openai_api_key_here
SMTP_PASSWORD=your_password_here

# backend/env (IKKE COMMIT DENNE - lokalt kun)
OPENAI_API_KEY=sk-proj-abc123...
SMTP_PASSWORD=real_password_here
```

### ❌ FEIL:
```bash
# ALDRI commit backend/env med ekte nøkler!
git add backend/env  # ❌ FEIL!
git commit -m "Update config"  # ❌ FEIL!
```

