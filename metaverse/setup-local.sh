#!/bin/bash

echo "🔧 Fixing permissions for node_modules directories..."
sudo chown -R $(whoami):$(whoami) .

echo ""
echo "📦 Installing dependencies..."
npm install
docker compose down 
docker compose up 
echo ""
echo "✅ Setup complete!"
