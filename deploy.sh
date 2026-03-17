#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🎮 Metaverse Application - Quick Deploy"
echo "========================================"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 is not installed."
    read -p "Would you like to install PM2? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
         npm install -g pm2
    else
        echo "❌ PM2 is required. Please install it manually: sudo npm install -g pm2"
        exit 1
    fi
fi

echo "📦 Building application..."
echo ""

# Navigate to metaverse directory
cd metaverse

# Build all applications
echo "🔨 Building frontend..."
cd apps/frontend
npm run build

echo "🔨 Building HTTP API..."
cd ../http
npm run build

echo "🔨 Building WebSocket server..."
cd ../ws
npm run build

cd "$PROJECT_DIR"

echo ""
echo "✅ Build completed!"
echo ""

# Stop existing PM2 processes if running
echo "🛑 Stopping existing services..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

echo "🚀 Starting services with PM2..."
pm2 start ecosystem.config.js

echo ""
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "✅ All services started successfully!"
echo ""
echo "📊 Service Status:"
pm2 status

echo ""
echo "📝 Useful Commands:"
echo "   View logs:       pm2 logs"
echo "   Restart all:     pm2 restart all"
echo "   Stop all:        pm2 stop all"
echo "   Monitor:         pm2 monit"
echo ""
echo "🌐 Access your application:"
echo "   Local:           http://localhost:5173 (frontend dev)"
echo "   Production:      https://metaverse.pranavmisrhra.dev"
echo "   API:             http://localhost:3000 (or via /api in production)"
echo "   WebSocket:       ws://localhost:8080 (or via /ws in production)"
echo ""
echo "✨ Deployment complete!"
