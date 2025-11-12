@echo off
echo ========================================
echo   JobCrawl - Start Testing Servers
echo   Using REAL data from job sites
echo ========================================
echo.

echo Starting Backend Server (REAL data mode)...
echo This will scrape REAL jobs from:
echo   - Finn.no
echo   - Manpower
echo   - Adecco
echo   - Arbeidsplassen.no
echo   - Karriere.no
echo.
start "JobCrawl Backend - REAL DATA" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "JobCrawl Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:3000/api
echo Frontend: http://localhost:5173/JobCrawl/
echo.
echo IMPORTANT: This uses REAL job scraping from actual websites.
echo Use "Refresh Jobs" button in the app to scrape new jobs.
echo.
echo Check the terminal windows for network IP addresses
echo for mobile/tablet testing.
echo.
echo Press any key to exit...
pause >nul

