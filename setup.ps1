# setup.ps1 - Windows PowerShell setup script for Book Review API

Write-Host "📚 Book Review API - Setup Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Create environment file if it doesn't exist
if (-Not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
NODE_ENV=development
PORT=5000
SESSION_SECRET=development_session_secret
JWT_SECRET=development_jwt_secret
"@ | Out-File -FilePath .env -Encoding UTF8
    Write-Host ".env file created" -ForegroundColor Green
} else {
    Write-Host ".env file already exists" -ForegroundColor Cyan
}

# Start the server
Write-Host "Starting server..." -ForegroundColor Yellow
npm run dev