# Setup script for API Endpoint Testing

Write-Host ""
Write-Host "?? Setting up API Endpoint Testing" -ForegroundColor Cyan
Write-Host "???????????????????????????????????" -ForegroundColor Blue
Write-Host ""

# Check if Node.js is installed
$nodeVersion = $null
try {
    $nodeVersion = node -v
    Write-Host "? Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "? Node.js not found. Please install Node.js v24 or higher." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "?? Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "? Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "? Dependencies installed" -ForegroundColor Green
Write-Host ""

# Create .env if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "?? Creating .env file from template..." -ForegroundColor Cyan
    Copy-Item .env.example .env
    Write-Host "??  Please edit .env and add your Auth0 credentials" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "? .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Check if Docker is running
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "? Docker is running" -ForegroundColor Green
        Write-Host ""
        Write-Host "?? Current Docker containers:" -ForegroundColor Cyan
        $containers = docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}" | Select-String -Pattern "epd|mail|backend|frontend"
        if ($containers) {
            $containers
        } else {
            Write-Host "   No project containers running" -ForegroundColor Gray
        }
    } else {
        Write-Host "??  Docker installed but not running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "??  Docker not found (optional for local development)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "???????????????????????????????????" -ForegroundColor Blue
Write-Host "? Setup complete!" -ForegroundColor Green
Write-Host "???????????????????????????????????" -ForegroundColor Blue
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edit .env with your Auth0 credentials:"
Write-Host "   notepad .env  # or use your preferred editor"
Write-Host ""
Write-Host "2. Ensure services are running:"
Write-Host "   - FastAPI Backend: http://localhost:8000"
Write-Host "   - EPD Backend:     http://localhost:3002"
Write-Host "   - Mail Service:    http://localhost:3001"
Write-Host ""
Write-Host "3. Run the tests:"
Write-Host "   npm run test:endpoints" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Check the results:"
Write-Host "   cat TEST_REPORT.md"
Write-Host ""
Write-Host "?? Documentation:" -ForegroundColor Cyan
Write-Host "   - Quick Start:  .\TESTING_QUICKSTART.md"
Write-Host "   - Full Guide:   .\API_TESTING_GUIDE.md"
Write-Host ""
