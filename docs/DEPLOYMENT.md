# JobCrawl - Deployment Guide

## Production Setup

### Forutsetninger
- Node.js 18+
- PostgreSQL 14+
- PM2 eller lignende process manager
- Domain name og SSL sertifikat

### Steg 1: Production Build

```bash
# Build frontend
cd frontend
npm install
npm run build

# Build backend
cd ../backend
npm install
npm run build
```

### Steg 2: Environment Configuration

**Backend** - Sett opp production `.env`:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/jobcrawl
JWT_SECRET=<strong_secret>
OPENAI_API_KEY=<your_key>
PORT=3000
FRONTEND_URL=https://yourdomain.com
```

### Steg 3: Database Migration

```bash
cd backend
npm run db:migrate deploy
```

### Steg 4: Start Application

```bash
# Med PM2
pm2 start backend/dist/index.js --name jobcrawl-backend

# Eller med Node.js
node backend/dist/index.js
```

## Docker Deployment

Opprett `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: jobcrawl
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/jobcrawl
      NODE_ENV: production
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Start med:
```bash
docker-compose up -d
```

## Security Considerations

1. **Environment Variables**: Aldri commit `.env` filer
2. **API Keys**: Roter regelmessig
3. **Database**: Backup regelmessig
4. **HTTPS**: Bruk alltid HTTPS i production
5. **Rate Limiting**: Implementer rate limiting for API
6. **CORS**: Konfigurer riktige CORS policies

## Monitoring

- Bruk logging (Winston eller lignende)
- Sett opp error tracking (Sentry)
- Monitor API health
- Track scraping success rate

