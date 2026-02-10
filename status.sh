#!/bin/bash

# Quick status dashboard for Metaverse Application

echo "🎮 Metaverse Application Status Dashboard"
echo "=========================================="
echo ""

# PM2 Status
if command -v pm2 &> /dev/null; then
    echo "📊 PM2 Services:"
    pm2 status
    echo ""
fi

# Nginx Status
if systemctl list-unit-files | grep -q nginx; then
    echo "🌐 Nginx Status:"
    systemctl status nginx --no-pager -l | head -10
    echo ""
fi

# Port Listeners
echo "🔌 Active Ports:"
echo "   Port 3000 (HTTP API):"
netstat -tuln 2>/dev/null | grep ":3000 " || echo "   Not listening"
echo "   Port 8080 (WebSocket):"
netstat -tuln 2>/dev/null | grep ":8080 " || echo "   Not listening"
echo ""

# Quick Links
echo "🔗 Quick Access:"
echo "   PM2 Logs:        pm2 logs"
echo "   PM2 Monitor:     pm2 monit"
echo "   Nginx Logs:      sudo tail -f /var/log/nginx/metaverse.pranavmisrhra.dev.access.log"
echo "   Health Check:    ./health-check.sh"
echo ""
