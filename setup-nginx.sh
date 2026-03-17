#!/bin/bash

# Complete Nginx and SSL setup script for Metaverse Application
# This script installs dependencies, obtains SSL certificate, and configures Nginx

set -e

DOMAIN="metaverse.pranavmisrhra.dev"
EMAIL="pranavmishra2101@gmail.com"
NGINX_CONFIG_FILE="nginx.conf"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Nginx and SSL setup for $DOMAIN"
echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Check if nginx config file exists
if [ ! -f "$PROJECT_DIR/$NGINX_CONFIG_FILE" ]; then
    echo "❌ Nginx config file not found: $PROJECT_DIR/$NGINX_CONFIG_FILE"
    exit 1
fi

# Install nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get update
    apt-get install -y nginx
else
    echo "✅ Nginx already installed"
fi

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot already installed"
fi

echo ""
echo "🔐 Obtaining SSL certificate..."
echo ""

# Temporary nginx config for certificate verification
cat > /etc/nginx/sites-available/$DOMAIN.temp << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 200 'Metaverse server is being configured...';
        add_header Content-Type text/plain;
    }
}
EOF

# Enable temporary config
ln -sf /etc/nginx/sites-available/$DOMAIN.temp /etc/nginx/sites-enabled/$DOMAIN

# Remove default site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "🗑️  Removing default site..."
    rm /etc/nginx/sites-enabled/default
fi

# Test and reload nginx
nginx -t && systemctl reload nginx

# Obtain SSL certificate
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "📜 Requesting new SSL certificate..."
    certbot certonly --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
else
    echo "✅ SSL certificate already exists"
fi

echo ""
echo "📝 Applying final Nginx configuration..."
echo ""

# Replace $USER placeholder with actual username
ACTUAL_USER=$(logname 2>/dev/null || echo $SUDO_USER)
if [ -z "$ACTUAL_USER" ]; then
    echo "❌ Could not determine user. Please set manually in nginx.conf"
    exit 1
fi

sed "s/\$USER/$ACTUAL_USER/g" "$PROJECT_DIR/$NGINX_CONFIG_FILE" > /etc/nginx/sites-available/$DOMAIN

# Enable the site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Remove temporary config
rm -f /etc/nginx/sites-available/$DOMAIN.temp

# Test nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Reload nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# Enable nginx to start on boot
systemctl enable nginx

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "   🌐 Domain: $DOMAIN"
echo "   🔐 SSL: Enabled"
echo "   📝 Config: /etc/nginx/sites-available/$DOMAIN"
echo "   📊 Access logs: /var/log/nginx/$DOMAIN.access.log"
echo "   🚨 Error logs: /var/log/nginx/$DOMAIN.error.log"
echo ""
echo "🔄 Service Endpoints:"
echo "   🎮 Frontend: https://$DOMAIN/"
echo "   🔌 WebSocket: wss://$DOMAIN/ws"
echo "   🔗 API: https://$DOMAIN/api"
echo ""
echo "⚙️  Before accessing your site, make sure to:"
echo "   1. Build the frontend: cd metaverse/apps/frontend && npm run build"
echo "   2. Start HTTP server: cd metaverse/apps/http && npm start"
echo "   3. Start WebSocket server: cd metaverse/apps/ws && npm start"
echo ""
echo "🔄 SSL Certificate Auto-renewal:"
echo "   Certbot automatically sets up renewal."
echo "   Test with: sudo certbot renew --dry-run"
echo ""
echo "✨ Your metaverse is now live at: https://$DOMAIN"
echo ""
