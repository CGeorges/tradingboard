#!/bin/bash

# TradingBoard Deployment Script
# Usage: ./deploy.sh [dev|prod] [--pull]

set -e

ENVIRONMENT=${1:-dev}
PULL_IMAGES=${2}

echo "🚀 TradingBoard Deployment Script"
echo "Environment: $ENVIRONMENT"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Check if .env file exists
ENV_FILE=".env"
if [ "$ENVIRONMENT" = "prod" ]; then
    ENV_FILE=".env.prod"
fi

if [ ! -f "$ENV_FILE" ]; then
    print_warning "$ENV_FILE file not found."
    if [ "$ENVIRONMENT" = "prod" ]; then
        print_status "Creating $ENV_FILE from .env.example..."
        cp .env.example "$ENV_FILE"
        print_warning "Please edit $ENV_FILE with your production configuration before continuing."
        read -p "Press Enter to continue after editing $ENV_FILE..."
    else
        print_status "Creating $ENV_FILE from .env.example..."
        cp .env.example "$ENV_FILE"
        print_success "Created $ENV_FILE. You can edit it with your configuration."
    fi
fi

# Set compose file based on environment
COMPOSE_FILE="docker-compose.yml"
if [ "$ENVIRONMENT" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

print_status "Using compose file: $COMPOSE_FILE"
print_status "Using environment file: $ENV_FILE"

# Pull latest images for production
if [ "$ENVIRONMENT" = "prod" ] || [ "$PULL_IMAGES" = "--pull" ]; then
    print_status "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
    print_success "Images pulled successfully"
fi

# Create external volume if it doesn't exist
print_status "Ensuring postgres data volume exists..."
if ! docker volume ls -q | grep -q "tradingboard_postgres_data"; then
    docker volume create tradingboard_postgres_data
    print_success "Created postgres data volume"
else
    print_status "Postgres data volume already exists"
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down

# Start services
print_status "Starting services..."
if [ "$ENVIRONMENT" = "dev" ]; then
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
else
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
fi

print_success "Services started successfully!"

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check service status
print_status "Checking service status..."
docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

# Display URLs
echo ""
print_success "🎉 TradingBoard deployed successfully!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend:  http://localhost:8080"
echo "   Backend:   http://localhost:3001"
echo "   API Docs:  http://localhost:3001/health"
echo "   Database:  localhost:5432"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs -f"
echo "   Stop:      docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down"
echo "   Status:    docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE ps"
echo ""

# Check if services are responding
print_status "Testing service health..."

# Test backend health
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "✅ Backend API is responding"
else
    print_warning "⚠️  Backend API not responding yet (may still be starting up)"
fi

# Test frontend
if curl -s http://localhost:8080 > /dev/null; then
    print_success "✅ Frontend is responding"
else
    print_warning "⚠️  Frontend not responding yet (may still be starting up)"
fi

echo ""
print_success "Deployment complete! 🚀" 