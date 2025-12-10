# Mail Service Docker Setup Script

Write-Host ""
Write-Host "Mail Service Docker Setup"
Write-Host "========================="
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
    Write-Host ""
}

# Start containers
Write-Host "Starting containers..."
docker-compose up -d

Write-Host ""
Write-Host "Waiting for database..."
Start-Sleep -Seconds 5

# Setup database
$setup = Read-Host "Setup database? (y/n)"
if ($setup -eq "y") {
    Write-Host ""
    Write-Host "Installing dependencies..."
    npm install
    
    Write-Host "Setting up Prisma..."
    npm run prisma:generate
    npm run prisma:migrate
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Database setup failed"
        exit 1
    }
    
    Write-Host ""
    Write-Host "SUCCESS: Database setup complete"
}

# Start service
Write-Host ""
$start = Read-Host "Start mail service? (y/n)"
if ($start -eq "y") {
    Write-Host ""
    Write-Host "Starting mail service..."
    npm run dev
} else {
    Write-Host ""
    Write-Host "Mail Service Ready"
    Write-Host "==================="
    Write-Host ""
    Write-Host "Database: http://localhost:5433"
    Write-Host ""
    Write-Host "To start the service: npm run dev"
    Write-Host "Service will run at: http://localhost:3001"
    Write-Host ""
    Write-Host "To view database: npm run prisma:studio"
    Write-Host "To stop database: docker-compose down"
    Write-Host ""
}
