# Security check script - Run before committing
# Checks for sensitive data in staged and modified files

param(
    [switch]$Strict = $false
)

Write-Host "`n🔒 SIKKERHETSSJEKK - Sjekker for sensitive data...`n" -ForegroundColor Yellow

$ERRORS = @()

# Patterns to check for
$SENSITIVE_PATTERNS = @(
    @{ Pattern = "sk-proj-"; Name = "OpenAI API Key" },
    @{ Pattern = "sk-or-v1-"; Name = "OpenRouter API Key" },
    @{ Pattern = "sk-[a-zA-Z0-9]{20,}"; Name = "API Key (generic)" },
    @{ Pattern = "OPENAI_API_KEY=sk-"; Name = "OpenAI API Key in env" },
    @{ Pattern = "OPENROUTER_API_KEY=sk-"; Name = "OpenRouter API Key in env" },
    @{ Pattern = "SMTP_PASSWORD=[a-zA-Z0-9_-]{8,}"; Name = "SMTP Password" },
    @{ Pattern = "JWT_SECRET=[a-zA-Z0-9_-]{16,}"; Name = "JWT Secret" },
    @{ Pattern = "DATABASE_URL=postgresql://[^:]+:[^@]+@"; Name = "Database URL with password" }
)

# Get all files (staged and modified)
$ALL_FILES = @()
$STAGED = git diff --cached --name-only 2>$null
$MODIFIED = git diff --name-only 2>$null

if ($STAGED) { $ALL_FILES += $STAGED }
if ($MODIFIED) { $ALL_FILES += $MODIFIED }

# Also check env files specifically
$ENV_FILES = Get-ChildItem -Recurse -Filter "env" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "\.example" }

foreach ($ENV_FILE in $ENV_FILES) {
    $RELATIVE_PATH = $ENV_FILE.FullName.Replace((Get-Location).Path + "\", "")
    if ($ALL_FILES -notcontains $RELATIVE_PATH) {
        $ALL_FILES += $RELATIVE_PATH
    }
}

# Check each file
foreach ($FILE in $ALL_FILES | Select-Object -Unique) {
    if (-not (Test-Path $FILE)) {
        continue
    }
    
    # Skip binary files
    $EXT = [System.IO.Path]::GetExtension($FILE)
    if ($EXT -in @(".png", ".jpg", ".jpeg", ".gif", ".ico", ".pdf", ".zip", ".exe", ".dll")) {
        continue
    }
    
    # Check if file is named env (without .example)
    if ($FILE -match "(^|/)env$" -and $FILE -notmatch "\.example$") {
        $ERRORS += "❌ ENV FILE DETECTED: $FILE - Env files should NEVER be committed!"
    }
    
    # Read file content
    try {
        $CONTENT = Get-Content $FILE -Raw -ErrorAction Stop
        
        # Check for sensitive patterns
        foreach ($CHECK in $SENSITIVE_PATTERNS) {
            if ($CONTENT -match $CHECK.Pattern) {
                $ERRORS += "❌ SENSITIVE DATA: $FILE contains $($CHECK.Name)"
            }
        }
    } catch {
        # Skip files that can't be read
        continue
    }
}

# Report results
if ($ERRORS.Count -gt 0) {
    Write-Host "`n⚠️  SIKKERHETSPROBLEMER FUNNET:`n" -ForegroundColor Red
    foreach ($ERROR in $ERRORS) {
        Write-Host "  $ERROR" -ForegroundColor Red
    }
    Write-Host "`n❌ IKKE COMMIT! Fjern sensitive data først.`n" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Ingen sensitive data funnet. Trygt å committe.`n" -ForegroundColor Green
    exit 0
}

