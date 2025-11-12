# 🔧 Troubleshooting: Jobs Not Loading

## Problem
Jobs are not loading in the frontend application.

## Possible Causes & Solutions

### 1. Backend Server Not Running
**Check:**
- Is the backend server running on `http://localhost:3000`?
- Check terminal for errors

**Solution:**
```bash
cd backend
npm run dev
```

### 2. CORS Issues
**Check:**
- Browser console for CORS errors
- `FRONTEND_URL` in backend `.env` matches frontend URL

**Solution:**
- Ensure `FRONTEND_URL` in `backend/env` is set to `http://localhost:5173`
- Check CORS configuration in `backend/src/index.ts`

### 3. Helmet.js Blocking Requests
**Check:**
- Browser console for CSP (Content Security Policy) errors

**Solution:**
- CSP is disabled in Helmet configuration for API endpoints
- If still having issues, check `backend/src/index.ts` Helmet configuration

### 4. Database Connection Issues
**Check:**
- Database is running
- `DATABASE_URL` is correct in `backend/env`

**Solution:**
```bash
cd backend
npx prisma db pull  # Test connection
```

### 5. No Jobs in Database
**Check:**
- Are there any jobs in the database?

**Solution:**
- Use "Refresh Jobs" button in frontend to scrape new jobs
- Or manually scrape via API: `POST /api/jobs/refresh`

### 6. API Endpoint Issues
**Check:**
- Test API directly: `GET http://localhost:3000/api/jobs`
- Check browser Network tab for failed requests

**Solution:**
- Check backend logs for errors
- Verify route is registered in `backend/src/index.ts`

### 7. Frontend API URL Configuration
**Check:**
- `VITE_API_URL` in `frontend/.env` (if exists)
- Default is `http://localhost:3000/api`

**Solution:**
- Create `frontend/.env` if missing:
```env
VITE_API_URL=http://localhost:3000/api
```

### 8. Rate Limiting
**Check:**
- Too many requests causing rate limit

**Solution:**
- Wait a few seconds and try again
- Check rate limit headers in Network tab

## Debugging Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

2. **Check Backend Logs:**
   - Look at terminal where backend is running
   - Check `backend/logs/` directory for log files

3. **Test API Directly:**
   ```bash
   # Test health endpoint
   curl http://localhost:3000/api/health
   
   # Test jobs endpoint
   curl http://localhost:3000/api/jobs
   ```

4. **Check Database:**
   ```bash
   cd backend
   npx prisma studio  # Open Prisma Studio to view data
   ```

## Common Error Messages

### "Failed to fetch"
- Backend server not running
- CORS issue
- Network connectivity issue

### "Network Error"
- Backend server not accessible
- Wrong API URL in frontend

### "401 Unauthorized"
- Not an issue for GET /api/jobs (no auth required)
- Check if route requires authentication incorrectly

### "500 Internal Server Error"
- Check backend logs
- Database connection issue
- Error in jobController

### Empty Jobs Array
- No jobs in database
- Use "Refresh Jobs" to scrape new jobs
- Check filters are not too restrictive

## Quick Fix Checklist

- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Database is running and connected
- [ ] CORS is configured correctly
- [ ] Helmet CSP is disabled for API
- [ ] API URL is correct in frontend
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Jobs exist in database (or scrape new ones)

## Still Not Working?

1. Check `backend/logs/` for detailed error logs
2. Check browser Network tab for request/response details
3. Verify all environment variables are set correctly
4. Try restarting both frontend and backend servers

