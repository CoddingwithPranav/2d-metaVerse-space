#!/bin/bash

# Health check script for Metaverse Application
# Verifies all services are running and accessible

echo "🏥 Metaverse Application Health Check"
echo "======================================"
echo ""

DOMAIN="metaverse.pranavmisrhra.dev"
ALL_HEALTHY=true

# Check if services are local or production
if [ -f "/etc/nginx/sites-available/$DOMAIN" ]; then
    MODE="production"
    BASE_URL="https://$DOMAIN"
    WS_URL="wss://$DOMAIN/ws"
else
    MODE="local"
    BASE_URL="http://localhost"
    WS_URL="ws://localhost:8080"
fi

echo "🔍 Mode: $MODE"
echo ""

# Function to check HTTP endpoint
check_http() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    printf "%-25s" "$name:"
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
        if [ "$response" = "$expected_code" ] || [ "$response" = "200" ] || [ "$response" = "301" ] || [ "$response" = "302" ]; then
            echo "✅ Healthy (HTTP $response)"
        else
            echo "❌ Unhealthy (HTTP $response)"
            ALL_HEALTHY=false
        fi
    else
        echo "⚠️  curl not installed"
    fi
}

# Function to check if port is listening
check_port() {
    local name=$1
    local port=$2
    
    printf "%-25s" "$name:"
    
    if command -v nc &> /dev/null; then
        if nc -z localhost "$port" 2>/dev/null; then
            echo "✅ Listening on port $port"
        else
            echo "❌ Not listening on port $port"
            ALL_HEALTHY=false
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":$port "; then
            echo "✅ Listening on port $port"
        else
            echo "❌ Not listening on port $port"
            ALL_HEALTHY=false
        fi
    else
        echo "⚠️  Cannot check port (nc/netstat not found)"
    fi
}

# Function to check PM2 process
check_pm2() {
    local name=$1
    
    printf "%-25s" "$name:"
    
    if command -v pm2 &> /dev/null; then
        if pm2 jlist 2>/dev/null | grep -q "\"name\":\"$name\""; then
            status=$(pm2 jlist 2>/dev/null | grep -A 5 "\"name\":\"$name\"" | grep "\"status\"" | cut -d'"' -f4)
            if [ "$status" = "online" ]; then
                echo "✅ Running"
            else
                echo "❌ Status: $status"
                ALL_HEALTHY=false
            fi
        else
            echo "❌ Not found in PM2"
            ALL_HEALTHY=false
        fi
    else
        echo "⚠️  PM2 not installed"
    fi
}

# Check Nginx
if [ "$MODE" = "production" ]; then
    echo "🌐 Nginx Service:"
    printf "%-25s" "Nginx:"
    if systemctl is-active --quiet nginx; then
        echo "✅ Running"
    else
        echo "❌ Not running"
        ALL_HEALTHY=false
    fi
    echo ""
fi

# Check backend services
echo "🖥️  Backend Services:"
check_pm2 "metaverse-http"
check_pm2 "metaverse-ws"
echo ""

# Check ports
echo "🔌 Port Status:"
check_port "HTTP API (3000)" 3000
check_port "WebSocket (8080)" 8080
if [ "$MODE" = "production" ]; then
    check_port "Nginx HTTP (80)" 80
    check_port "Nginx HTTPS (443)" 443
fi
echo ""

# Check HTTP endpoints
echo "🌍 HTTP Endpoints:"
if [ "$MODE" = "production" ]; then
    check_http "Frontend" "$BASE_URL"
    check_http "API" "$BASE_URL/api"
else
    check_http "HTTP API" "http://localhost:3000"
fi
echo ""

# Check SSL certificate (production only)
if [ "$MODE" = "production" ]; then
    echo "🔐 SSL Certificate:"
    printf "%-25s" "Certificate:"
    if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        expiry=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" 2>/dev/null | cut -d= -f2)
        if [ -n "$expiry" ]; then
            echo "✅ Valid (expires: $expiry)"
        else
            echo "⚠️  Cannot read expiry"
        fi
    else
        echo "❌ Certificate not found"
        ALL_HEALTHY=false
    fi
    echo ""
fi

# Check database connection (if we can access it)
echo "💾 Database:"
printf "%-25s" "PostgreSQL:"
if command -v psql &> /dev/null; then
    # Try to connect (this assumes env vars are set)
    if psql -c "SELECT 1;" &>/dev/null; then
        echo "✅ Connected"
    else
        echo "⚠️  Cannot connect (check credentials)"
    fi
else
    echo "⚠️  psql not installed (cannot check)"
fi
echo ""

# Check logs for recent errors
echo "📋 Recent Errors (last 10 minutes):"
if [ "$MODE" = "production" ] && [ -f "/var/log/nginx/$DOMAIN.error.log" ]; then
    error_count=$(find /var/log/nginx/$DOMAIN.error.log -mmin -10 -exec wc -l {} \; 2>/dev/null | awk '{print $1}')
    printf "%-25s" "Nginx errors:"
    if [ "$error_count" -gt 0 ]; then
        echo "⚠️  $error_count errors in last 10 min"
    else
        echo "✅ No errors"
    fi
fi

if command -v pm2 &> /dev/null; then
    printf "%-25s" "Application errors:"
    error_count=$(pm2 logs --err --lines 100 --nostream 2>/dev/null | grep -c "error\|Error\|ERROR" || echo 0)
    if [ "$error_count" -gt 10 ]; then
        echo "⚠️  $error_count errors in logs"
    else
        echo "✅ Minimal errors"
    fi
fi
echo ""

# Overall status
echo "========================================="
if [ "$ALL_HEALTHY" = true ]; then
    echo "✅ All checks passed! System is healthy."
    exit 0
else
    echo "❌ Some checks failed. Review the issues above."
    exit 1
fi
