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

### 3. Hostinger VPS

| Spec (VPS 1 plan) | Value |
|---|---|
| vCPUs | 2 (AMD) |
| RAM | 4 GB |
| SSD | 50 GB NVMe |
| Traffic | Unlimited |
| Price | **~$5–6/month** (promotional) |
| Provider | [hostinger.com/vps-hosting](https://www.hostinger.com/vps-hosting) |

Hostinger provides standard KVM VPS instances with root access and Docker pre-installed as an optional template. The setup process is identical to Hetzner.

**Pros:**
- Price-competitive with Hetzner (~$4–6/month for 4 GB RAM)
- Docker pre-install template available — saves setup time
- Slightly more storage than Hetzner CX22 (50 GB vs 40 GB)
- Unlimited traffic allowance
- 24/7 live chat support (including for server issues)
- Familiar brand for those who already use Hostinger for web hosting
- Data centres in US, EU, Asia, South America

**Cons:**
- Promotional pricing is for the first billing cycle only; renews at the regular rate (~$9/month for 4 GB tier on annual billing)
- Less well-known in the DevOps/self-hosting community than Hetzner or DigitalOcean
- Support quality for Linux/Docker troubleshooting can be inconsistent
- Hetzner is still cheaper at the regular (non-promo) rate

#### Docker on Hostinger — Does It Work?

Yes. Hostinger VPS plans run KVM virtualisation with Ubuntu or Debian support. You can:
1. Select the **Docker** application template during server creation (Docker Engine is pre-installed), **or**
2. Install Docker manually with `curl -fsSL https://get.docker.com | sh` (same as any Ubuntu VPS)

Once Docker is installed, the deployment steps are **identical to the Hetzner guide** in this document. Hostinger is a drop-in alternative to Hetzner.

**Summary**: Hostinger is a valid and affordable choice, especially at promotional prices. At regular rates, Hetzner is slightly cheaper and has a stronger reputation among self-hosters. Choose Hostinger if you already have an account there or prefer their support channel.

---

### 4. Railway

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

### 5. Fly.io

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

### 6. Render

| Spec | Value |
|------|-------|
| Free / Hobby tier | Web services sleep after 15 min inactivity; 512 MB RAM each |
| Paid (Starter) | ~$7/service/month + ~$7 for PostgreSQL + external Redis |
| Total (paid) | **~$17–22/month** for this stack |
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

#### Will Render's Hobby Tier Work?

**Short answer: No — the free/Hobby tier does not meet the app's requirements. The paid Starter tier is feasible but expensive.**

| Requirement | Hobby (Free) | Starter ($7/service) |
|---|---|---|
| Backend RAM (needs 512 MB) | 512 MB — right at limit, risks OOM | 512 MB — still tight |
| PostgreSQL RAM (needs ~256 MB+) | 256 MB — too small for Prisma + active queries | 256 MB Starter — still tight |
| Redis | ❌ Not available | ❌ Must use external (e.g. Upstash free tier) |
| Always-on (no sleep) | ❌ Sleeps after 15 min — first request takes 30+ seconds | ✅ Yes |
| Persistent disk for uploads | ❌ Ephemeral — photo uploads are lost on restart | ✅ Paid disk add-on ($0.25/GB) |
| Docker Compose | ❌ Not supported | ❌ Not supported |

**What the paid Render setup would cost:**

| Service | Plan | Monthly |
|---------|------|---------|
| Backend (Node.js web service) | Starter | $7 |
| Frontend (Static Site) | Free | $0 |
| PostgreSQL | Starter | $7 |
| Redis | External Upstash (free 10K cmds/day) | $0–5 |
| Persistent disk (uploads) | 10 GB | $2.50 |
| **Total** | | **~$17–22/month** |

**Key limitations that make Render a poor fit:**
1. **No Docker Compose**: Each service must be configured separately on Render's dashboard — the existing `docker-compose.prod.yml` cannot be used at all.
2. **RAM is borderline**: The 512 MB Starter RAM cap for the backend leaves almost no headroom. Node.js + Express + Prisma alone can consume 250–350 MB at idle, leaving very little for request handling.
3. **PostgreSQL Starter is 256 MB RAM**: Prisma's connection pooler and active queries may hit this ceiling under modest family usage.
4. **No native Redis**: Render does not offer Redis as a managed service. You must integrate [Upstash](https://upstash.com) (free tier: 10,000 commands/day) or pay for an external provider.
5. **File uploads**: The backend uploads directory is ephemeral — photo uploads are lost every time Render redeploys the service unless you add a paid persistent disk.

**Verdict**: Render can technically run the app on paid Starter plans, but it requires significant restructuring (no Compose), costs more than a Hetzner VPS, and has tighter resource constraints. The Hobby (free) tier is not viable.

---

### 7. AWS / GCP / Azure

| Provider | Estimated monthly cost (post-trial) |
|----------|----------------------|
| AWS (EC2 t3.medium + RDS + ElastiCache) | **$60–120/month** |
| GCP (e2-medium + Cloud SQL + Memorystore) | **$50–100/month** |
| Azure (B2s VM + Azure DB + Azure Cache) | **$60–110/month** |

**Pros:**
- Enterprise-grade reliability, compliance, and SLAs
- Full suite of managed services (load balancers, CDN, monitoring)
- Auto-scaling, global presence

**Cons:**
- Massive overkill for a private family directory
- Complex setup and billing
- Cost is 10–25× more than a simple VPS after the trial ends
- Steep learning curve

#### Do Free Trials Cover This App?

Each cloud giant offers new-account credits, but they differ significantly in what they cover and for how long.

##### Google Cloud Platform (GCP) — Best Free Trial for This App ✅

| Detail | Value |
|--------|-------|
| Trial credit | **$300 USD** |
| Trial duration | **90 days** |
| Suitable instance | `e2-medium` (2 vCPU, 4 GB RAM) |
| Estimated trial cost | ~$25/month on e2-medium + managed services |
| Trial covers | Full stack: VM + Cloud SQL + Memorystore |

GCP's $300 / 90-day trial is the most generous of the three. An `e2-medium` instance (2 vCPU, 4 GB RAM) costs roughly $25–35/month. With the $300 credit you can run the entire app for the full 90 days and still have credit remaining.

**Running the app on GCP (during trial):**
- **Compute**: `e2-medium` Compute Engine VM running Docker Compose (same setup as Hetzner) — ~$25/month
- **Or managed services**: Cloud SQL for PostgreSQL (db-f1-micro, ~$7/month) + Memorystore Redis (basic 1 GB, ~$16/month) + Cloud Run for the backend (~$5/month) — more complex but fully managed
- **Simplest approach**: Run `docker-compose.prod.yml` on an `e2-medium` VM exactly like the Hetzner guide — the $300 credit covers ~8–10 months of this

**After the trial**: ~$50–100/month for managed services, or ~$25/month for a VM-only approach (comparable to DigitalOcean).

> **Note**: You must add a credit card to activate the trial, but GCP will not charge it until you explicitly upgrade to a paid account.

##### Amazon Web Services (AWS) — Free Tier Does Not Cover This App ⚠️

| Detail | Value |
|--------|-------|
| Always-Free tier | EC2 `t2.micro` / `t3.micro` — 1 vCPU, **1 GB RAM only** |
| 12-month free | Same `t2.micro` / `t3.micro` — still only 1 GB RAM |
| RDS Free tier | `db.t3.micro` — 1 GB RAM, 20 GB SSD (✅ usable for PostgreSQL) |
| ElastiCache Free tier | ❌ Not included |

The AWS **always-free** and **12-month** tiers cap compute at `t2.micro` / `t3.micro` with only 1 GB RAM — far below the 2 GB minimum this app needs. Running PostgreSQL (1 GB limit in Compose) alongside the backend (512 MB) on a 1 GB machine will result in constant OOM kills.

There is **no blanket AWS free trial with sufficient RAM** for new accounts. However:
- **AWS Activate** (startup program): Offers $1,000–$5,000 in credits — requires applying as a startup/company.
- **AWS Free Tier workaround**: You could use RDS Free Tier for PostgreSQL (saves ~$15/month) and pay only for a `t3.small` (2 GB RAM, ~$15/month) + ElastiCache `cache.t3.micro` (~$12/month) = ~$27/month. This is more expensive than Hetzner and more complex to set up.

**Verdict for AWS**: The free tier is inadequate for this stack. Not recommended unless you have Activate credits.

##### Microsoft Azure — Short Trial, Useful for Testing ⚠️

| Detail | Value |
|--------|-------|
| Trial credit | **$200 USD** |
| Trial duration | **30 days** |
| 12-month free services | `B1s` VM (1 vCPU, **1 GB RAM**) — too small |
| Suitable paid VM | `B2s` (2 vCPU, 4 GB RAM) — ~$35/month |
| PostgreSQL free tier | `B1ms` — 1 vCPU, 2 GB RAM, 32 GB (✅ 750 hours/month for 12 months) |
| Redis free tier | ❌ Not included in 12-month free services |

The $200 / 30-day credit is enough to test the full app for a month on a `B2s` VM (running Docker Compose). After 30 days, costs jump to ~$60–110/month for managed services.

The 12-month free `B1s` VM (1 GB RAM) is too small. The free PostgreSQL Flexible Server (12 months) is useful if you choose Azure long-term.

**Verdict for Azure**: Good for a 30-day test drive, not practical for ongoing use.

##### Cloud Free Trial Summary

| Provider | Trial Value | Duration | Covers This App? | After Trial |
|---|---|---|---|---|
| **GCP** | $300 | 90 days | ✅ Yes — e2-medium + full stack | ~$50–100/month |
| **Azure** | $200 | 30 days | ✅ Yes — B2s VM for testing | ~$60–110/month |
| **AWS** | 12-month free | Always | ❌ No — VM RAM too small (1 GB) | ~$60–120/month |

**If you want to try the app on a major cloud for free, use GCP** — the $300 credit over 90 days gives you the most runway. Spin up an `e2-medium` VM, follow the same Hetzner deployment steps (they are identical for any Ubuntu VPS), and you will not be charged during the trial.

---

## Cost Comparison Summary

| Provider | Monthly Cost | RAM | Setup Difficulty | Docker Compose Support |
|----------|-------------|-----|-----------------|----------------------|
| **Hetzner CX22** ⭐ | **~$4** | 4 GB | Medium | ✅ Direct |
| Hostinger VPS 1 | ~$5–6 (promo), ~$9 (regular) | 4 GB | Medium | ✅ Direct |
| DigitalOcean Droplet | ~$18 | 4 GB | Medium | ✅ Direct |
| Railway | ~$10–25 | Managed | Easy | ⚠️ Partial |
| Fly.io | ~$10–20 | Managed | Medium | ⚠️ Partial |
| Render (paid Starter) | ~$17–22 | 512 MB/service | Easy | ❌ No |
| Render (Hobby/Free) | **Free but unusable** | 512 MB/service | Easy | ❌ No |
| GCP (trial) | Free for 90 days ($300 credit) | 4 GB (e2-medium) | Hard | ✅ On VM |
| Azure (trial) | Free for 30 days ($200 credit) | 4 GB (B2s) | Hard | ✅ On VM |
| AWS (free tier) | ❌ Insufficient RAM (1 GB max) | 1 GB | Hard | ⚠️ Partial |
| AWS/GCP/Azure (post-trial) | $50–130 | Managed | Hard | ⚠️ Partial |

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
