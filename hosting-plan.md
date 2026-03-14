# Hosting Plan for Family Directory App

## Overview

The Family Directory is a fullstack web application consisting of:

- **Frontend**: Angular 21 SPA (served by Nginx)
- **Backend**: Express 5 / Node.js 22 API
- **Database**: PostgreSQL 16
- **Cache / Token Blocklist**: Redis 7
- **Reverse Proxy**: Nginx

All services are containerised with Docker and orchestrated via `docker-compose.prod.yml`, which makes any Docker-capable VPS or container platform a valid deployment target.

**Minimum resource requirements (from `docker-compose.prod.yml`):**

| Service  | Memory limit |
|----------|-------------|
| PostgreSQL | 1 GB |
| Backend    | 512 MB |
| Frontend (Nginx) | 128 MB |
| Redis      | ~128 MB (no hard limit set) |
| **Total**  | **~1.75 GB** |

A host with at least **2 GB RAM** (4 GB recommended for headroom) and **20 GB SSD** is required.

---

## Hosting Options Considered

### 1. Hetzner Cloud VPS (CX22) ⭐ Recommended

| Spec | Value |
|------|-------|
| vCPUs | 2 (AMD) |
| RAM | 4 GB |
| SSD | 40 GB |
| Traffic | 20 TB/month |
| Price | **~€3.79 / month (~$4 USD)** |
| Provider | [hetzner.com/cloud](https://www.hetzner.com/cloud) |

**Pros:**
- Cheapest option with sufficient RAM (4 GB) for the full Docker Compose stack
- Full root access — run `docker compose` exactly as designed
- No vendor lock-in; standard Ubuntu/Debian VPS
- Generous traffic allowance (20 TB)
- Fast NVMe SSD, EU and US data centres available
- Simple hourly billing, no hidden costs

**Cons:**
- Requires manual server setup (Docker install, firewall, SSL)
- No built-in managed database; you maintain PostgreSQL backups yourself
- Less "one-click" than PaaS options
- No automatic scaling

---

### 2. DigitalOcean Droplet

| Spec | Value |
|------|-------|
| vCPUs | 2 |
| RAM | 2 GB |
| SSD | 60 GB |
| Traffic | 3 TB/month |
| Price | **$18 / month** (4 GB RAM Droplet) |
| Provider | [digitalocean.com](https://www.digitalocean.com) |

**Pros:**
- Polished UI, extensive documentation, large community
- One-click Docker Marketplace image available
- Managed PostgreSQL add-on available (~$15/month extra)
- Built-in monitoring dashboards
- Good uptime SLA (99.99%)

**Cons:**
- Significantly more expensive than Hetzner for equivalent specs ($18 vs $4)
- 2 GB Droplet ($12/month) is borderline — memory limits may cause OOM kills
- Managed database costs more than self-hosting on the same VPS
- Traffic overage charges apply

---

### 3. Railway

| Spec | Value |
|------|-------|
| Model | Usage-based |
| Free tier | $5 credit/month (Hobby plan) |
| Paid | ~$10–25/month for this stack |
| Provider | [railway.app](https://railway.app) |

**Pros:**
- Extremely easy Docker-based deployment (connects directly to GitHub)
- Built-in PostgreSQL and Redis services
- Automatic HTTPS, custom domains
- Zero server maintenance
- Good developer experience, preview deployments

**Cons:**
- Costs scale with usage — hard to predict monthly bill
- No persistent filesystem volumes by default (workaround needed for photo uploads)
- Free tier is very limited (sleeps after inactivity)
- Less control over Nginx configuration
- The existing `docker-compose.prod.yml` cannot be used directly; services must be deployed individually
- No SSH access for debugging

---

### 4. Fly.io

| Spec | Value |
|------|-------|
| Free tier | 3 shared-CPU VMs, 3 GB volume |
| Paid | ~$10–20/month for this stack |
| Provider | [fly.io](https://fly.io) |

**Pros:**
- Docker-native deployment (`flyctl deploy`)
- Managed PostgreSQL (free tier available)
- Upstash Redis integration (free tier: 10,000 commands/day)
- Global edge deployment (close to users worldwide)
- Good CLI tooling

**Cons:**
- Each service (backend, frontend, Postgres, Redis) requires a separate `fly.toml` configuration
- Persistent volumes must be declared explicitly; setup is more complex
- Free tier is limited; production workloads exceed it quickly
- Pricing is complex (compute + GB-hours + egress)
- Docker Compose file cannot be used directly

---

### 5. Render

| Spec | Value |
|------|-------|
| Free tier | Web services sleep after 15 min inactivity |
| Paid | ~$7/service/month + ~$7 for PostgreSQL + ~$10 for Redis |
| Total | **~$24–31/month** for this stack |
| Provider | [render.com](https://render.com) |

**Pros:**
- Zero-ops managed platform
- Auto-deploy from GitHub
- Managed PostgreSQL and Redis available
- Built-in SSL, custom domains

**Cons:**
- Most expensive managed option for this stack (3+ paid services)
- Free PostgreSQL databases expire after 90 days
- No built-in Docker Compose support; services deployed individually
- Free web services sleep — unsuitable for production use
- Limited filesystem for uploads (disk add-ons are paid)

---

### 6. AWS / GCP / Azure

| Provider | Estimated monthly cost |
|----------|----------------------|
| AWS (EC2 t3.medium + RDS + ElastiCache) | **$60–120/month** |
| GCP (e2-standard-2 + Cloud SQL + Memorystore) | **$70–130/month** |
| Azure (B2s + Azure DB + Azure Cache) | **$60–110/month** |

**Pros:**
- Enterprise-grade reliability, compliance, and SLAs
- Full suite of managed services (load balancers, CDN, monitoring)
- Auto-scaling, global presence

**Cons:**
- Massive overkill for a private family directory
- Complex setup and billing
- Cost is 15–30× more than a simple VPS
- Steep learning curve

---

## Cost Comparison Summary

| Provider | Monthly Cost | RAM | Setup Difficulty | Docker Compose Support |
|----------|-------------|-----|-----------------|----------------------|
| **Hetzner CX22** ⭐ | **~$4** | 4 GB | Medium | ✅ Direct |
| DigitalOcean Droplet | ~$18 | 4 GB | Medium | ✅ Direct |
| Railway | ~$10–25 | Managed | Easy | ⚠️ Partial |
| Fly.io | ~$10–20 | Managed | Medium | ⚠️ Partial |
| Render | ~$24–31 | Managed | Easy | ❌ No |
| AWS/GCP/Azure | $60–130 | Managed | Hard | ⚠️ Partial |

---

## Recommended Solution: Hetzner Cloud CX22

### Why Hetzner?

1. **Most affordable**: At ~$4/month it is 4–5× cheaper than DigitalOcean and up to 30× cheaper than cloud giants for the same performance.
2. **Docker Compose ready**: The existing `docker-compose.prod.yml` works without modification — all five services (Nginx, frontend, backend, PostgreSQL, Redis) run exactly as designed.
3. **Sufficient resources**: 4 GB RAM comfortably fits all containers with room to spare (total configured limit ~1.75 GB).
4. **No lock-in**: Standard Ubuntu VPS — you can migrate to any provider at any time.
5. **Privacy-appropriate**: A private family app does not need global CDN or auto-scaling. Reliable single-server hosting is exactly right.
6. **Fast SSDs and generous traffic**: NVMe SSD and 20 TB/month far exceed what a family app will ever use.

---

## Step-by-Step Deployment Guide (Hetzner Cloud CX22)

### Prerequisites

- A [Hetzner Cloud account](https://accounts.hetzner.com/signUp)
- A registered domain name (e.g. `family.example.com`) — optional but recommended for HTTPS
- SSH key pair on your local machine (`ssh-keygen -t ed25519` if you don't have one)
- Git installed locally

---

### Step 1 — Create the Server

1. Log in to [console.hetzner.com](https://console.hetzner.com).
2. Click **New Project** → name it `family-directory`.
3. Click **Add Server**:
   - **Location**: Choose the region closest to your family (e.g., Ashburn US or Helsinki EU)
   - **Image**: **Ubuntu 24.04**
   - **Type**: Shared CPU → **CX22** (2 vCPU, 4 GB RAM, 40 GB SSD)
   - **SSH Keys**: Upload your public key (`~/.ssh/id_ed25519.pub`)
   - **Name**: `family-directory`
4. Click **Create & Buy Now**.
5. Note the server's **IPv4 address** (shown in the dashboard).

---

### Step 2 — Point Your Domain to the Server (Optional)

If you have a domain, add an **A record** in your DNS provider:

```
Type  Name              Value
A     family            <your-server-IPv4>
```

Example: `family.example.com → 203.0.113.42`

DNS propagation usually completes within 15–60 minutes, though it can occasionally take a few hours.

---

### Step 3 — Initial Server Setup

SSH into the server:

```bash
ssh root@<your-server-IPv4>
```

Run the following commands to secure the server and install Docker:

```bash
# Update packages
apt update && apt upgrade -y

# Create a non-root user
adduser deploy
usermod -aG sudo deploy

# Copy SSH key to new user
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy

# Enable UFW firewall — allow only SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status

# Switch to the deploy user
su - deploy
```

> **Security note**: After verifying you can SSH as `deploy`, consider disabling root SSH login by setting `PermitRootLogin no` in `/etc/ssh/sshd_config` and restarting `sshd`.

---

### Step 4 — Clone the Repository

```bash
# On the server, as the deploy user
cd ~
git clone https://github.com/anujithrb/family-directory.git
cd family-directory
```

---

### Step 5 — Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Update the following values:

```dotenv
NODE_ENV=production

# Database
POSTGRES_USER=familydir_user
POSTGRES_PASSWORD=<strong-random-password>
POSTGRES_DB=family_directory

# Redis
REDIS_PASSWORD=<strong-random-password>
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# JWT Secrets — must be at least 32 random characters each
JWT_SECRET=<generate with: openssl rand -hex 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -hex 32>

# Set to your domain or server IP
CORS_ORIGIN=https://family.example.com
```

Generate strong secrets directly on the server:

```bash
openssl rand -hex 32   # use output for JWT_SECRET
openssl rand -hex 32   # use output for JWT_REFRESH_SECRET
```

---

### Step 6 — Configure HTTPS with Let's Encrypt (Recommended)

> Skip this step if you are using an IP address only (no domain).

Install Certbot and obtain a certificate **before** starting the stack:

```bash
sudo apt install -y certbot

# Stop any service using port 80 first (none yet)
sudo certbot certonly --standalone -d family.example.com
```

Certificates are saved to `/etc/letsencrypt/live/family.example.com/`.

Update `nginx/nginx.conf` to enable HTTPS:

```nginx
server {
    listen 80;
    server_name family.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name family.example.com;

    ssl_certificate /etc/letsencrypt/live/family.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/family.example.com/privkey.pem;
    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers off;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/html text/css application/javascript application/json
               application/manifest+json image/svg+xml;
    gzip_min_length 1024;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # PWA: Service worker must not be cached
    location = /ngsw-worker.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Service-Worker-Allowed "/";
        expires 0;
    }

    # PWA: Manifest
    location = /manifest.webmanifest {
        add_header Cache-Control "no-cache";
        add_header Content-Type "application/manifest+json";
    }

    # Angular SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Update `docker-compose.prod.yml` to mount the certificates into Nginx:

```yaml
  nginx:
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - frontend_dist:/usr/share/nginx/html:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro   # add this line
    ports:
      - "80:80"
      - "443:443"
```

Set up automatic certificate renewal (certificates expire every 90 days):

```bash
# Add to crontab (runs twice daily as recommended by Certbot)
(crontab -l 2>/dev/null; echo "0 3,15 * * * certbot renew --quiet && docker compose -f /home/deploy/family-directory/docker-compose.prod.yml restart nginx") | crontab -
```

---

### Step 7 — Build Docker Images

```bash
cd ~/family-directory
make build
```

This builds:
- `family-directory-backend:latest` — multi-stage TypeScript build
- `family-directory-frontend:latest` — Angular production build served by Nginx

> **Note**: The first build takes 3–8 minutes depending on download speed. Subsequent builds are faster due to Docker layer caching.

---

### Step 8 — Start the Stack

```bash
make up
```

Verify all containers are healthy:

```bash
docker compose -f docker-compose.prod.yml ps
```

Expected output (all services should show `healthy` or `running`):

```
NAME                          STATUS
family-directory-postgres     running (healthy)
family-directory-redis        running (healthy)
family-directory-backend      running (healthy)
family-directory-frontend     running
family-directory-nginx        running
```

---

### Step 9 — Run Database Migrations and Seed Data

```bash
# Apply Prisma schema migrations
make migrate

# (Optional) Seed with demo family data
make seed
```

Default seed credentials:
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@family.local` | `Admin@123` |
| User | `james@family.local` | `User@123` |
| Read-only | `emily@family.local` | `ReadOnly@123` |

> **Important**: Change these passwords immediately after first login via the Admin panel.

---

### Step 10 — Verify the Deployment

```bash
# Check backend health endpoint
curl http://localhost/api/health

# Check application logs
docker compose -f docker-compose.prod.yml logs --tail=50 backend
```

Open a browser and navigate to:
- **HTTP**: `http://<your-server-IP>` (or `https://family.example.com` if using HTTPS)
- **API docs**: `http://<your-server-IP>/api/docs`

---

### Step 11 — Set Up Automated Backups

Create a daily database backup script:

```bash
sudo nano /usr/local/bin/backup-family-db.sh
```

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/home/deploy/backups"
LOG_DIR="/home/deploy/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
COMPOSE_FILE="/home/deploy/family-directory/docker-compose.prod.yml"
ENV_FILE="/home/deploy/family-directory/.env"

mkdir -p "$BACKUP_DIR" "$LOG_DIR"

# Load environment variables from .env
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -o allexport && source "$ENV_FILE" && set +o allexport
fi

# Dump PostgreSQL database
docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-family_directory}" \
  | gzip > "$BACKUP_DIR/family-db-$TIMESTAMP.sql.gz"

# Keep only the last 30 backups
ls -tp "$BACKUP_DIR"/*.sql.gz | grep -v '/$' | tail -n +31 | xargs -r rm

echo "Backup completed: family-db-$TIMESTAMP.sql.gz"
```

```bash
sudo chmod +x /usr/local/bin/backup-family-db.sh

# Schedule daily backup at 2:00 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-family-db.sh >> /home/deploy/logs/family-backup.log 2>&1") | crontab -
```

---

### Step 12 — Updating the Application

To deploy a new version:

```bash
cd ~/family-directory

# Pull latest code
git pull origin main

# Rebuild images
make build

# Restart with zero-downtime (containers restart one at a time)
make up

# Apply any new migrations
make migrate
```

---

## Ongoing Cost Estimate

| Item | Monthly Cost |
|------|-------------|
| Hetzner CX22 VPS | ~$4.00 |
| Domain name (annual / 12) | ~$1.00 |
| Let's Encrypt SSL | **Free** |
| **Total** | **~$5/month** |

---

## Security Checklist

- [ ] Changed all default passwords in `.env`
- [ ] Generated strong JWT secrets (`openssl rand -hex 32`)
- [ ] Enabled UFW firewall (ports 22, 80, 443 only)
- [ ] Disabled root SSH login (`PermitRootLogin no`)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] HSTS header configured in Nginx
- [ ] Changed seed user passwords after first login
- [ ] Automated database backups configured
- [ ] `.env` file has restricted permissions (`chmod 600 .env`)

---

## Troubleshooting

| Problem | Command |
|---------|---------|
| View all service logs | `docker compose -f docker-compose.prod.yml logs -f` |
| View backend logs only | `docker compose -f docker-compose.prod.yml logs -f backend` |
| Restart a single service | `docker compose -f docker-compose.prod.yml restart backend` |
| Check container health | `docker compose -f docker-compose.prod.yml ps` |
| Open a database shell | `make shell-db` |
| Open a backend shell | `make shell-backend` |
| Check disk usage | `df -h` and `docker system df` |
| Free up disk space | `docker system prune -f` |
| Out-of-memory errors | Upgrade to CX32 (8 GB RAM, ~$9/month) |
