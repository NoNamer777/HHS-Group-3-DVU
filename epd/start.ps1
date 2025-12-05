# EPD Docker Setup Script

Write-Host ""
Write-Host "EPD Docker Setup"
Write-Host "================"
Write-Host ""

# Check Docker
docker info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running"
    exit 1
}

# Build containers
$build = Read-Host "Build new Docker containers? (y/n)"
if ($build -eq "y") {
    Write-Host ""
    Write-Host "Building Docker containers..."
    docker-compose down -v
    docker-compose build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker build failed"
        exit 1
    }
    
    Write-Host ""
    Write-Host "SUCCESS: Containers built"
    Write-Host "Check Docker Desktop to see them"
    Write-Host ""
}

# Start containers
Write-Host "Starting containers..."
docker-compose up -d

Write-Host ""
Write-Host "Waiting for database..."
Start-Sleep -Seconds 10

# Setup environment
Copy-Item .env.docker .env -Force

# Seed database
$seed = Read-Host "Seed database? (y/n)"
if ($seed -eq "y") {
    Write-Host ""
    Write-Host "Installing dependencies..."
    npm install --silent
    
    Write-Host "Setting up Prisma..."
    npx prisma generate
    npx prisma migrate deploy
    
    if ($LASTEXITCODE -ne 0) {
        npx prisma migrate dev --name init
    }
    
    Write-Host "Seeding database..."
    npm run prisma:seed
}

# Start backend
Write-Host ""
Write-Host "Starting backend at http://localhost:3001"
Write-Host ""
Write-Host "Logins:"
Write-Host "  jan.devries@ziekenhuis.nl / password123"
Write-Host ""

npm run dev
