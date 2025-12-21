#!/bin/bash

# EPD Docker Setup Script

echo ""
echo "EPD Docker Setup"
echo "================"
echo ""

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running"
    exit 1
fi

# Build containers
read -p "Build new Docker containers? (y/n) " build
if [ "$build" = "y" ]; then
    echo ""
    echo "Building Docker containers..."
    docker-compose down -v
    docker-compose build
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Docker build failed"
        exit 1
    fi
    
    echo ""
    echo "SUCCESS: Containers built"
    echo "Check Docker Desktop to see them"
    echo ""
fi

# Start containers
echo "Starting containers..."
docker-compose up -d

echo ""
echo "Waiting for database..."
sleep 10

# Seed database
read -p "Seed database? (y/n) " seed
if [ "$seed" = "y" ]; then
    echo ""
    echo "Installing dependencies in container..."
    docker-compose exec backend npm install --silent
    
    echo "Setting up Prisma..."
    docker-compose exec backend npx prisma generate
    docker-compose exec backend npx prisma migrate deploy
    
    if [ $? -ne 0 ]; then
        docker-compose exec backend npx prisma migrate dev --name init
    fi
    
    echo "Seeding database..."
    docker-compose exec backend npm run prisma:seed
fi

# Backend is already running in Docker
echo ""
echo "Backend is running at http://localhost:3001"
echo "API Documentation: http://localhost:3001/api-docs"
echo ""
echo "Logins:"
echo "  jan.devries@ziekenhuis.nl / password123"
echo ""
echo "To view logs: docker-compose logs -f backend"
echo "To stop: docker-compose down"
echo ""
