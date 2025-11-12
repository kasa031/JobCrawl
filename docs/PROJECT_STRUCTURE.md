# 📁 Prosjektstruktur - JobCrawl

Dette dokumentet beskriver den organiserte mappestrukturen for JobCrawl-prosjektet.

## 🗂️ Rot-mappe

```
JobCrawl/
├── backend/              # Backend Node.js/Express applikasjon
├── frontend/             # Frontend React applikasjon
├── database/             # Database migrations og scrapers
├── docs/                 # All dokumentasjon (organisert i undermapper)
├── scripts/              # Utility scripts
├── TODO_SAMLET.md        # Samlet TODO-liste
├── README.md             # Hoved README
└── nixpacks.toml        # Deployment konfigurasjon
```

## 📚 Dokumentasjon (docs/)

All dokumentasjon er organisert i logiske undermapper:

### `docs/getting-started/`
Oppstartsguider og quick start-instruksjoner
- START_HERE.md
- QUICK_START.md
- HOW_TO_RUN.md
- osv.

### `docs/setup/`
Setup og konfigurasjonsguider
- SETUP_GUIDE.md
- EMAIL_SETUP_GUIDE.md
- DATABASE_SETUP.md
- osv.

### `docs/deployment/`
Deployment og produksjonssetup
- DEPLOY_INSTRUKSJONER.md
- GITHUB_SETUP.md
- PRODUKSJON_API_SETUP.md
- osv.

### `docs/pwa/`
Progressive Web App guider
- PWA_QUICK_START.md
- MOBIL_WEBAPP_INSTALLASJON.md
- WINDOWS_BRAVE_PWA_GUIDE.md
- osv.

### `docs/security/`
Sikkerhetsrelaterte dokumenter
- SIKKERHETSREGLER.md
- ROTER_NOKLER.md
- API_NØKLER_OVERSIKT.md
- osv.

### `docs/testing/`
Testing-guider og testresultater
- TESTING_GUIDE.md
- MOBIL_TESTING_GUIDE.md
- TEST_RESULTS.md
- osv.

### `docs/troubleshooting/`
Feilsøkingsguider
- TROUBLESHOOTING_JOBS.md
- FIX_PORT_3000.md
- FEILMELDINGER_FIX.md
- osv.

### `docs/status/`
Statusrapporter og oppsummeringer
- KODE_GJENNOMGANG.md
- STATUS_OPPSUMMERING.md
- FINAL_STATUS.md
- osv.

### `docs/api/`
API-dokumentasjon og rapporter
- API_DOKUMENTASJON.md
- AUDIT_RAPPORT.md
- FORBEDRINGER.md
- osv.

### `docs/development/`
Utviklingsrelaterte dokumenter
- PROJECT_ARCHITECTURE.md
- FULLTEXT_SEARCH_GUIDE.md

## 🛠️ Scripts (scripts/)

Utility scripts for prosjektet:
- `check-secrets.ps1` - Sjekk for sensitive data før commit
- `generate-icons.js` - Generer app-ikoner
- `CREATE_DATABASE.ps1` - Opprett database
- `START_TESTING.bat` / `START_TESTING.sh` - Start testing

## 🖼️ Bilder

Bilder er flyttet til `frontend/public/images/` for enklere tilgang i frontend-applikasjonen.

## 📝 Viktige filer i rot

- **README.md** - Hoveddokumentasjon
- **TODO_SAMLET.md** - Samlet TODO-liste
- **nixpacks.toml** - Deployment konfigurasjon

## 🔒 Sikkerhet

Sensitive filer som `ICLOUD_PASSWORD_BACKUP.txt` er lagt til i `.gitignore` og skal ikke committes.

## 📖 Hvordan finne dokumentasjon

1. Start med [docs/README.md](README.md) for oversikt
2. Naviger til relevant undermappe basert på hva du leter etter
3. Hver undermappe har en README.md med oversikt over innhold

