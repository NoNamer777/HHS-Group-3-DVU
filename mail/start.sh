#!/bin/bash

# Mail Service Docker Setup Script

echo ""
echo "Mail Service Docker Setup"
echo "========================="
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
    echo ""
fi

# Start containers
echo "Starting containers..."
docker-compose up -d

echo ""
echo "Waiting for database..."
sleep 5

# Setup database
read -p "Setup database? (y/n) " setup
if [ "$setup" = "y" ]; then
    echo ""
    echo "Installing dependencies..."
    npm install
    
    echo "Setting up Prisma..."
    npm run prisma:generate
    npm run prisma:migrate
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Database setup failed"
        exit 1
    fi
    
    echo ""
    echo "SUCCESS: Database setup complete"
    
    # Seed database
    echo ""
    read -p "Add mock data? (y/n) " seed
    if [ "$seed" = "y" ]; then
        echo ""
        echo "Seeding database with test data..."
        npm run prisma:seed
        
        if [ $? -ne 0 ]; then
            echo "WARNING: Database seeding failed"
        else
            echo ""
            echo "SUCCESS: Database seeded with test data"
        fi
    fi
fi

# Start service
echo ""
read -p "Start mail service? (y/n) " start
if [ "$start" = "y" ]; then
    echo ""
    echo "Starting mail service..."
    npm run dev
else
    echo ""
    echo "Mail Service Ready"
    echo "==================="
    echo ""
    echo "Database: http://localhost:5433"
    echo ""
    echo "To start the service: npm run dev"
    echo "Service will run at: http://localhost:3001"
    echo ""
    echo "To view database: npm run prisma:studio"
    echo "To stop database: docker-compose down"
    echo ""
fi
