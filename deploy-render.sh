#!/bin/bash

# Render.com Deployment Script
# This script prepares your application for Render.com deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

print_status "Preparing for Render.com deployment..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found. Please run this script from the project root."
    exit 1
fi

# Create .render-buildpacks file for better build performance
print_status "Creating Render buildpacks configuration..."
cat > .render-buildpacks << EOF
https://github.com/heroku/heroku-buildpack-nodejs.git
EOF

# Update package.json scripts for Render
print_status "Updating package.json for Render deployment..."

# Backend package.json
if [ -f "task-backend-mcp-node/package.json" ]; then
    print_status "Configuring backend for Render..."
    cd task-backend-mcp-node

    # Ensure start script exists
    if ! grep -q '"start"' package.json; then
        print_error "Backend package.json missing start script"
        exit 1
    fi

    cd ..
fi

# Frontend package.json
if [ -f "task-dashboard-vite-chakra/package.json" ]; then
    print_status "Configuring frontend for Render..."
    cd task-dashboard-vite-chakra

    # Ensure build script exists
    if ! grep -q '"build"' package.json; then
        print_error "Frontend package.json missing build script"
        exit 1
    fi

    cd ..
fi

# Create .renderignore file
print_status "Creating .renderignore file..."
cat > .renderignore << EOF
# Development files
node_modules/
.env
.env.local
.env.development
.env.test

# Build artifacts
dist/
build/
*.log

# Docker files (not needed for Render)
Dockerfile*
docker-compose*
.dockerignore

# Git files
.git/
.gitignore

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Test files
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
EOF

# Create environment template for Render
print_status "Creating environment template..."
cat > render-env-template.md << EOF
# Render.com Environment Variables

## Backend Service Environment Variables

Set these in your Render backend service:

\`\`\`env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
ALLOWED_ORIGINS=https://your-frontend-url.onrender.com,http://localhost:3000
FRONTEND_URL=https://your-frontend-url.onrender.com
MAX_FILE_SIZE=10485760
\`\`\`

## Frontend Service Environment Variables

Set these in your Render frontend service:

\`\`\`env
VITE_API_URL=https://your-backend-url.onrender.com/api
\`\`\`

## Database Setup

1. Create a MongoDB database in Render or use MongoDB Atlas
2. Get the connection string
3. Set MONGODB_URI in your backend service environment variables

## Important Notes

- Replace \`your-frontend-url.onrender.com\` with your actual frontend URL
- Replace \`your-backend-url.onrender.com\` with your actual backend URL
- Replace the MongoDB connection string with your actual database URL
EOF

print_success "Render.com deployment preparation complete!"

echo ""
print_status "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to Render.com and create a new Blueprint"
echo "3. Select your repository"
echo "4. Render will automatically detect render.yaml and deploy"
echo ""
print_status "Or deploy manually:"
echo "1. Create a MongoDB database in Render"
echo "2. Create a Web Service for the backend"
echo "3. Create a Static Site for the frontend"
echo "4. Set environment variables as shown in render-env-template.md"
echo ""
print_warning "Remember to update the URLs in render.yaml with your actual service URLs after deployment!"
