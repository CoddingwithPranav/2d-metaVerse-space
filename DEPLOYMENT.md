# Nginx & SSL Setup for Metaverse Application

This directory contains Nginx configuration and setup scripts for deploying the Metaverse application with SSL.

## 📋 Prerequisites

1. **Domain Configuration**: Ensure DNS A record for `metaverse.pranavmisrhra.dev` points to your server's IP
2. **Server Access**: Root/sudo access to Ubuntu/Debian server
3. **Ports Open**: Ensure ports 80, 443, 3000, and 8080 are accessible
4. **Application Built**: Frontend should be built before running

## 🚀 Quick Setup

### Step 1: Build the Application

```bash
# Navigate to project root
cd /home/pranav/Documents/learning/2d-metaVerse-space/metaverse

# Install dependencies (if not already done)
npm install

# Build all services
npm run build

# Or build individually:
cd apps/frontend && npm run build
cd ../http && npm run build
cd ../ws && npm run build
```

### Step 2: Run the Setup Script

```bash
# From project root
cd /home/pranav/Documents/learning/2d-metaVerse-space

# Run the setup script with sudo
sudo ./setup-nginx.sh
```

The script will:
- ✅ Install Nginx
- ✅ Install Certbot
- ✅ Obtain SSL certificate from Let's Encrypt
- ✅ Configure Nginx with proper settings
- ✅ Enable auto-renewal for SSL certificate

### Step 3: Start Application Services

You need to keep the backend services running. Use PM2 or systemd:

#### Option A: Using PM2 (Recommended)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Navigate to project
cd /home/pranav/Documents/learning/2d-metaVerse-space/metaverse

# Start HTTP API server
cd apps/http
pm2 start npm --name "metaverse-http" -- start

# Start WebSocket server
cd ../ws
pm2 start npm --name "metaverse-ws" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Option B: Using systemd

Create service files in `/etc/systemd/system/`:

**metaverse-http.service:**
```ini
[Unit]
Description=Metaverse HTTP API
After=network.target

[Service]
Type=simple
User=pranav
WorkingDirectory=/home/pranav/Documents/learning/2d-metaVerse-space/metaverse/apps/http
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**metaverse-ws.service:**
```ini
[Unit]
Description=Metaverse WebSocket Server
After=network.target

[Service]
Type=simple
User=pranav
WorkingDirectory=/home/pranav/Documents/learning/2d-metaVerse-space/metaverse/apps/ws
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then enable and start:
```bash
sudo systemctl enable metaverse-http metaverse-ws
sudo systemctl start metaverse-http metaverse-ws
```

## 🔍 Verify Installation

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check SSL Certificate
```bash
sudo certbot certificates
```

### Check Application Services
```bash
# If using PM2
pm2 status

# If using systemd
sudo systemctl status metaverse-http
sudo systemctl status metaverse-ws
```

### Test Endpoints
```bash
# Frontend
curl -I https://metaverse.pranavmisrhra.dev

# API
curl https://metaverse.pranavmisrhra.dev/api/health

# WebSocket (using wscat)
npm install -g wscat
wscat -c wss://metaverse.pranavmisrhra.dev/ws
```

## 📁 File Locations

- **Nginx Config**: `/etc/nginx/sites-available/metaverse.pranavmisrhra.dev`
- **SSL Certificates**: `/etc/letsencrypt/live/metaverse.pranavmisrhra.dev/`
- **Access Logs**: `/var/log/nginx/metaverse.pranavmisrhra.dev.access.log`
- **Error Logs**: `/var/log/nginx/metaverse.pranavmisrhra.dev.error.log`

## 🔄 Common Operations

### Reload Nginx Configuration
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### View Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/metaverse.pranavmisrhra.dev.access.log

# Error logs
sudo tail -f /var/log/nginx/metaverse.pranavmisrhra.dev.error.log
```

### Renew SSL Certificate (Manual)
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Test SSL Certificate Renewal
```bash
sudo certbot renew --dry-run
```

### Restart Services
```bash
# Restart Nginx
sudo systemctl restart nginx

# Restart application services (PM2)
pm2 restart all

# Restart application services (systemd)
sudo systemctl restart metaverse-http metaverse-ws
```

## 🐛 Troubleshooting

### Nginx won't start
```bash
# Check configuration
sudo nginx -t

# Check port conflicts
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### SSL certificate issues
```bash
# Check certificate status
sudo certbot certificates

# Re-obtain certificate
sudo certbot certonly --nginx -d metaverse.pranavmisrhra.dev --force-renewal
```

### Application not accessible
```bash
# Check if services are running
pm2 status  # or sudo systemctl status metaverse-*

# Check if ports are listening
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8080

# Check application logs
pm2 logs  # or sudo journalctl -u metaverse-*
```

### WebSocket connection fails
- Ensure WebSocket server is running on port 8080
- Check firewall rules: `sudo ufw status`
- Verify Nginx WebSocket proxy settings
- Check browser console for errors

## 🔐 Security Notes

1. **Environment Variables**: Ensure `.env` files contain production secrets
2. **Database**: Use strong passwords and enable SSL for database connections
3. **Firewall**: Only expose necessary ports (80, 443)
4. **Updates**: Keep Nginx and system packages updated
5. **Monitoring**: Set up log monitoring and alerts

## 📚 Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Let's Encrypt](https://letsencrypt.org/)

## ✨ Success!

Once everything is set up, your metaverse application will be available at:

🌐 **https://metaverse.pranavmisrhra.dev**

Enjoy your fully secured metaverse! 🎮🔐
