# TradingBoard Deployment Script for Windows PowerShell
# Usage: .\deploy.ps1 [dev|prod] [-Pull]

param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "prod")]
    [string]$Environment = "dev",
    
    [switch]$Pull
)

Write-Host "🚀 TradingBoard Deployment Script" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Function to print colored output
function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

try {
    # Check if Docker is running
    Write-Status "Checking Docker..."
    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker is not running. Please start Docker and try again."
        exit 1
    }

    # Check if docker-compose is available
    Write-Status "Checking docker-compose..."
    docker-compose --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "docker-compose is not installed. Please install it and try again."
        exit 1
    }

    # Check if .env file exists
    $EnvFile = ".env"
    if ($Environment -eq "prod") {
        $EnvFile = ".env.prod"
    }

    if (!(Test-Path $EnvFile)) {
        Write-Warning "$EnvFile file not found."
        if ($Environment -eq "prod") {
            Write-Status "Creating $EnvFile from .env.example..."
            Copy-Item ".env.example" $EnvFile
            Write-Warning "Please edit $EnvFile with your production configuration before continuing."
            Read-Host "Press Enter to continue after editing $EnvFile"
        } else {
            Write-Status "Creating $EnvFile from .env.example..."
            Copy-Item ".env.example" $EnvFile
            Write-Success "Created $EnvFile. You can edit it with your configuration."
        }
    }

    # Set compose file based on environment
    $ComposeFile = "docker-compose.yml"
    if ($Environment -eq "prod") {
        $ComposeFile = "docker-compose.prod.yml"
    }

    Write-Status "Using compose file: $ComposeFile"
    Write-Status "Using environment file: $EnvFile"

    # Pull latest images for production
    if ($Environment -eq "prod" -or $Pull) {
        Write-Status "Pulling latest images..."
        docker-compose -f $ComposeFile --env-file $EnvFile pull
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Images pulled successfully"
        }
    }

    # Stop existing containers
    Write-Status "Stopping existing containers..."
    docker-compose -f $ComposeFile --env-file $EnvFile down

    # Start services
    Write-Status "Starting services..."
    if ($Environment -eq "dev") {
        docker-compose -f $ComposeFile --env-file $EnvFile up -d --build
    } else {
        docker-compose -f $ComposeFile --env-file $EnvFile up -d
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Services started successfully!"
    }

    # Wait for services to be healthy
    Write-Status "Waiting for services to be healthy..."
    Start-Sleep -Seconds 10

    # Check service status
    Write-Status "Checking service status..."
    docker-compose -f $ComposeFile --env-file $EnvFile ps

    # Display URLs
    Write-Host ""
    Write-Success "🎉 TradingBoard deployed successfully!"
    Write-Host ""
    Write-Host "📊 Service URLs:" -ForegroundColor Yellow
    Write-Host "   Frontend:  http://localhost:8080"
    Write-Host "   Backend:   http://localhost:3001"
    Write-Host "   API Docs:  http://localhost:3001/health"
    Write-Host "   Database:  localhost:5432"
    Write-Host ""
    Write-Host "📝 Useful commands:" -ForegroundColor Yellow
    Write-Host "   View logs: docker-compose -f $ComposeFile --env-file $EnvFile logs -f"
    Write-Host "   Stop:      docker-compose -f $ComposeFile --env-file $EnvFile down"
    Write-Host "   Status:    docker-compose -f $ComposeFile --env-file $EnvFile ps"
    Write-Host ""

    # Check if services are responding
    Write-Status "Testing service health..."

    # Test backend health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "✅ Backend API is responding"
        }
    }
    catch {
        Write-Warning "⚠️  Backend API not responding yet (may still be starting up)"
    }

    # Test frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "✅ Frontend is responding"
        }
    }
    catch {
        Write-Warning "⚠️  Frontend not responding yet (may still be starting up)"
    }

    Write-Host ""
    Write-Success "Deployment complete! 🚀"

} catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
} 