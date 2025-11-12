# Full-Text Search Migration Guide

## Oversikt
Full-text search gir raskere og bedre søk i jobbeskrivelser ved å bruke PostgreSQL's innebygde full-text search funksjonalitet.

## Steg 1: Kjør SQL-migrasjonen

### Metode 1: Via psql (anbefalt)
```bash
# Koble til databasen
psql -U postgres -d jobcrawl

# Kjør migrasjonen
\i backend/prisma/migrations/add_fulltext_search.sql

# Eller direkte fra kommandolinjen:
psql -U postgres -d jobcrawl -f backend/prisma/migrations/add_fulltext_search.sql
```

### Metode 2: Via Prisma Studio
1. Åpne Prisma Studio: `npm run db:studio`
2. Gå til "Raw SQL" tab
3. Kopier innholdet fra `add_fulltext_search.sql`
4. Kjør SQL-en

### Metode 3: Via database GUI
- Bruk pgAdmin, DBeaver, eller annet database-verktøy
- Åpne `backend/prisma/migrations/add_fulltext_search.sql`
- Kjør SQL-en mot jobcrawl-databasen

## Steg 2: Verifiser at indeksene er opprettet

```sql
-- Sjekk at indeksene eksisterer
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'job_listings' 
AND indexname LIKE '%_fts';
```

Du skal se 3 indekser:
- `idx_job_listings_description_fts`
- `idx_job_listings_title_fts`
- `idx_job_listings_title_description_fts`

## Steg 3: Test full-text search

Etter at migrasjonen er kjørt, vil `jobController.ts` automatisk bruke full-text search når den detekterer at indeksene eksisterer.

Test via API:
```bash
# Søk etter "utvikler" i jobbeskrivelser
curl "http://localhost:3000/api/jobs?search=utvikler"

# Søk med flere ord
curl "http://localhost:3000/api/jobs?search=react%20typescript"
```

## Hvordan det fungerer

### Før migrasjonen:
- Bruker `ILIKE` søk (langsomt på store datasett)
- Søker i title, company, og description separat
- Ingen optimalisering for norsk tekst

### Etter migrasjonen:
- Bruker PostgreSQL full-text search (raskt)
- Støtter norsk språk (stemming, stop words)
- Søker i title og description samtidig
- Bedre relevans-sortering

## Feilsøking

### Indeksene ble ikke opprettet
```sql
-- Sjekk om tabellen eksisterer
SELECT * FROM information_schema.tables WHERE table_name = 'job_listings';

-- Sjekk om description-kolonnen eksisterer
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'job_listings' AND column_name = 'description';
```

### Full-text search fungerer ikke
- Sjekk at indeksene er opprettet (se Steg 2)
- Sjekk at PostgreSQL har norsk språkstøtte: `SELECT * FROM pg_ts_config WHERE cfgname = 'norwegian';`
- Hvis norsk ikke finnes, installer: `CREATE TEXT SEARCH CONFIGURATION norwegian ...`

## Rollback (hvis nødvendig)

```sql
-- Fjern indeksene
DROP INDEX IF EXISTS idx_job_listings_description_fts;
DROP INDEX IF EXISTS idx_job_listings_title_fts;
DROP INDEX IF EXISTS idx_job_listings_title_description_fts;
```

## Ytelse

Full-text search indekser gir:
- **10-100x raskere** søk på store datasett
- **Bedre relevans** basert på tekstinnhold
- **Støtte for norsk** språk (stemming, stop words)

## Notater

- Migrasjonen er **ikke-destruktiv** (kan kjøres flere ganger)
- Indeksene tar litt plass, men gir betydelig bedre ytelse
- Full-text search fungerer best med norsk tekst

