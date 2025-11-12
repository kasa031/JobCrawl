# 📝 Error Logging Service - Implementert

## ✅ Hva er implementert

### 1. Winston Logger Service
- ✅ Installert `winston` package
- ✅ Opprettet `backend/src/config/logger.ts` med komplett logging service
- ✅ Logger til både filer og console
- ✅ Separate log filer for errors (`error.log`) og all logging (`combined.log`)
- ✅ Automatic log rotation (max 5MB per fil, 5 filer)
- ✅ Development/production format differentiation

### 2. Logging Integrert i Alle Controllers
- ✅ **authController.ts**: Alle auth operasjoner logges
- ✅ **jobController.ts**: Job scraping og queries logges
- ✅ **profileController.ts**: Profile oppdateringer og CV operasjoner logges
- ✅ **applicationController.ts**: Application CRUD logges
- ✅ **aiController.ts**: AI operasjoner logges

### 3. Error Handler Middleware
- ✅ Oppdatert `errorHandler.ts` til å bruke Winston
- ✅ Logger alle errors med full kontekst (path, method, IP, user-agent, body, params, query)
- ✅ Behøver ikke lenger console.error

### 4. Process Error Handling
- ✅ Uncaught exceptions logges
- ✅ Unhandled promise rejections logges
- ✅ Server startup logges

### 5. Email Logging
- ✅ Email sending success/failure logges
- ✅ Integrert i `email.ts`

## 📁 Log Filer

Logger skrives til `backend/logs/`:
- `combined.log` - Alle log entries
- `error.log` - Kun error level entries

**Log format:**
```json
{
  "timestamp": "2025-10-29 17:20:15",
  "level": "error",
  "message": "Registration error",
  "service": "jobcrawl-backend",
  "error": "Error message",
  "stack": "Error stack trace",
  "email": "user@example.com"
}
```

## 🔧 Konfigurasjon

### Environment Variabel (valgfritt):
```env
LOG_LEVEL=debug  # debug, info, warn, error (default: info i production, debug i development)
```

### Log Levels:
- **debug**: Detaljert debugging informasjon
- **info**: Generell informasjon (default i development)
- **warn**: Advarsler
- **error**: Errors

## 📊 Hva som logges

### Info Level (Suksessfylte operasjoner):
- User registration
- User login
- Profile updates
- CV uploads/downloads/deletes
- Application creation/updates/deletes
- Job matching
- Cover letter generation
- Email sending

### Error Level (Feil):
- All errors med full stack trace
- Database errors
- Validation errors
- Network errors
- AI service errors

### Automatisk Logging:
- Server startup med konfigurasjon
- Uncaught exceptions
- Unhandled promise rejections
- Request errors (via error handler middleware)

## 🚀 Forbedringer

1. **Structured Logging**: Alle logs er i JSON format for enkel parsing
2. **Context Information**: Hver log entry inkluderer relevant kontekst (userId, jobId, etc.)
3. **File Rotation**: Automatisk rotasjon for å forhindre store log filer
4. **Production Ready**: Separate formats for development og production
5. **Error Tracking**: Full stack traces for alle errors

## 📝 Eksempel Bruk

```typescript
import { logInfo, logError, logWarn } from '../config/logger';

// Info logging
logInfo('User logged in', { userId, email });

// Error logging
logError('Login failed', error, { email });

// Warning logging
logWarn('Rate limit approaching', { ip });
```

## ✅ TODO Status

- [x] Installere Winston
- [x] Opprette logger service
- [x] Integrere i error handler
- [x] Erstatte alle console.error med logError
- [x] Legge til info logging for viktige operasjoner
- [x] Konfigurere log rotation
- [x] Teste kompilering

---

**Status: ✅ Fullstendig implementert og testet**

