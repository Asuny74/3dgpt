#!/usr/bin/env bash

# Automatic installation script for the Fersch 3D web platform.
# This script installs Node.js, optional Wine for the PreForm CLI, clones
# the project repository, installs dependencies, builds the application,
# and sets up a process manager (PM2) and Nginx.

set -e

echo "=== Fersch 3D installation script ==="

### Variables ###
# Edit these variables as needed before running the script.
REPO_URL="${REPO_URL:-https://github.com/Asuny74/fersch-3d-deploy.git}"
APP_DIR="${APP_DIR:-/var/www/fersch-3d}"
NODE_VERSION="20"

echo "Installing prerequisites..."
sudo apt-get update -y
sudo apt-get install -y curl gnupg ca-certificates build-essential

### Install Node.js ###
if ! command -v node >/dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

### Install Wine (required for PreForm CLI) ###
if ! command -v wine >/dev/null; then
  echo "Installing Wine (for PreForm CLI)..."
  sudo dpkg --add-architecture i386
  sudo apt-get update -y
  sudo apt-get install -y wine64 wine32
fi

### Install PM2 ###
if ! command -v pm2 >/dev/null; then
  echo "Installing PM2 process manager..."
  sudo npm install -g pm2
fi

### Clone repository ###
if [ ! -d "$APP_DIR" ]; then
  echo "Cloning repository into $APP_DIR..."
  sudo git clone "$REPO_URL" "$APP_DIR"
else
  echo "Repository already exists at $APP_DIR"
fi

cd "$APP_DIR"

### Install dependencies ###
echo "Installing npm dependencies..."
npm install

### Build application ###
echo "Building Next.js application..."
npm run build

### Environment configuration ###
if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
  echo "Please edit the .env file with your real credentials (Stripe, SMTP, PreForm CLI path)."
fi

### Start application with PM2 ###
echo "Starting application with PM2..."
pm2 start npm --name fersch-3d -- start
pm2 save

### Set up PM2 startup on boot ###
pm2 startup systemd -u $USER --hp $HOME

### Configure Nginx (optional) ###
if command -v nginx >/dev/null; then
  echo "Configuring Nginx..."
  sudo bash -c 'cat > /etc/nginx/sites-available/fersch-3d <<"NGINX_CONF"
server {
    listen 80;
    server_name fersch-3d.com 3d.fersch.fr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_CONF'
  sudo ln -sf /etc/nginx/sites-available/fersch-3d /etc/nginx/sites-enabled/fersch-3d
  sudo nginx -t && sudo systemctl reload nginx
else
  echo "Nginx not installed. Skipping web server configuration."
fi

echo "Installation complete! The application should now be running under PM2."