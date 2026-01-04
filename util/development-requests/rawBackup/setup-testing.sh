#!/bin/bash

echo ""
echo "?? Setting up API Endpoint Testing"
echo "???????????????????????????????????"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "? Node.js not found. Please install Node.js v24 or higher."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 24 ]; then
    echo "??  Warning: Node.js version $NODE_VERSION found. Version 24 or higher recommended."
fi

echo "? Node.js $(node -v) found"
echo ""

# Install dependencies
echo "?? Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "? Failed to install dependencies"
    exit 1
fi

echo "? Dependencies installed"
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "?? Creating .env file from template..."
    cp .env.example .env
    echo "??  Please edit .env and add your Auth0 credentials"
    echo ""
else
    echo "? .env file already exists"
    echo ""
fi

# Check if Docker is running
if command -v docker &> /dev/null; then
    if docker info &> /dev/null 2>&1; then
        echo "? Docker is running"
        echo ""
        echo "?? Current Docker containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "epd|mail|backend|frontend" || echo "   No project containers running"
    else
        echo "??  Docker installed but not running"
    fi
else
    echo "??  Docker not found (optional for local development)"
fi

echo ""
echo "???????????????????????????????????"
echo "? Setup complete!"
echo "???????????????????????????????????"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env with your Auth0 credentials:"
echo "   nano .env  # or use your preferred editor"
echo ""
echo "2. Ensure services are running:"
echo "   - FastAPI Backend: http://localhost:8000"
echo "   - EPD Backend:     http://localhost:3002"
echo "   - Mail Service:    http://localhost:3001"
echo ""
echo "3. Run the tests:"
echo "   npm run test:endpoints"
echo ""
echo "4. Check the results:"
echo "   cat TEST_REPORT.md"
echo ""
echo "?? Documentation:"
echo "   - Quick Start:  ./TESTING_QUICKSTART.md"
echo "   - Full Guide:   ./API_TESTING_GUIDE.md"
echo ""
