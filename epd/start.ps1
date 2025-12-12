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

# Seed database
$seed = Read-Host "Seed database? (y/n)"
if ($seed -eq "y") {
    Write-Host ""
    Write-Host "Installing dependencies in container..."
    docker-compose exec backend npm install --silent
    
    Write-Host "Setting up Prisma..."
    docker-compose exec backend npx prisma generate
    docker-compose exec backend npx prisma migrate deploy
    
    if ($LASTEXITCODE -ne 0) {
        docker-compose exec backend npx prisma migrate dev --name init
    }
    
    Write-Host "Seeding database..."
    docker-compose exec backend npm run prisma:seed
}

# Backend is already running in Docker
Write-Host ""
Write-Host "Backend is running at http://localhost:3001"
Write-Host "API Documentation: http://localhost:3001/api-docs"
Write-Host ""
Write-Host "Logins:"
Write-Host "  jan.devries@ziekenhuis.nl / password123"
Write-Host ""
Write-Host "To view logs: docker-compose logs -f backend"
Write-Host "To stop: docker-compose down"
Write-Host ""
