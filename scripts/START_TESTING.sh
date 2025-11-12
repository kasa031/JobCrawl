#!/bin/bash

echo "========================================"
echo "  JobCrawl - Start Testing Servers"
echo "  Using REAL data from job sites"
echo "========================================"
echo ""

echo "Starting Backend Server (REAL data mode)..."
echo "This will scrape REAL jobs from:"
echo "  - Finn.no"
echo "  - Manpower"
echo "  - Adecco"
echo "  - Arbeidsplassen.no"
echo "  - Karriere.no"
echo ""
cd backend && npm run dev &
BACKEND_PID=$!

sleep 3

echo "Starting Frontend Server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  Servers are starting..."
echo "========================================"
echo ""
echo "Backend:  http://localhost:3000/api"
echo "Frontend: http://localhost:5173/JobCrawl/"
echo ""
echo "IMPORTANT: This uses REAL job scraping from actual websites."
echo "Use 'Refresh Jobs' button in the app to scrape new jobs."
echo ""
echo "Check the terminal for network IP addresses"
echo "for mobile/tablet testing."
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

