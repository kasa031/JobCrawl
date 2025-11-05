# JobCrawl Database Setup Script

Write-Host "🔧 Setting up JobCrawl database..." -ForegroundColor Cyan

# Try to find psql
$psqlPath = "$env:ProgramFiles\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "❌ PostgreSQL not found at expected location" -ForegroundColor Red
    Write-Host "Please make sure PostgreSQL 18 is installed" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found PostgreSQL at: $psqlPath" -ForegroundColor Green

# Create database
Write-Host "📝 Creating database 'jobcrawl'..." -ForegroundColor Cyan
& $psqlPath -U postgres -c "CREATE DATABASE jobcrawl;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database 'jobcrawl' created successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database might already exist or there was an error" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Database info:" -ForegroundColor Cyan
Write-Host "   Name: jobcrawl"
Write-Host "   User: postgres"
Write-Host "   Password: 93c4c664f8c9440ca3258f921df2cdd3"
Write-Host "   Connection: postgresql://postgres:93c4c664f8c9440ca3258f921df2cdd3@localhost:5432/jobcrawl"
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Create backend/.env file with the connection string above"
Write-Host "   2. Run: cd backend && npm run db:migrate"
Write-Host "   3. Start backend: npm run dev"

