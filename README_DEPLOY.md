# 🚀 Skavtech Platform - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Skavtech ICT hardware distribution platform to production using Docker and Docker Compose.

## 🏗️ Architecture

```
Internet
    ↓
   Nginx (Port 80/443)
     ↓
   ┌─────────────────┐
   │   Frontend      │  ← React SPA (Port 80 internal)
   │   (nginx:alpine)│
   └─────────────────┘
          ↓
   ┌─────────────────┐    ┌─────────────────┐
   │   Backend       │    │   Redis         │  ← Session storage & caching
   │   (node:alpine) │    │   (redis:alpine)│
   └─────────────────┘    └─────────────────┘
          ↓                        ↓
   ┌─────────────────┐
   │   Database      │  ← PostgreSQL (Port 5432 internal)
   │ (postgres:alpine)│
   └─────────────────┘
```

## ✨ Key Production Features

### 🔐 Security Enhancements
- **CORS Protection**: Configured with allowed origins for production domains
- **Session Security**: Redis-based session storage with secure cookies (HttpOnly, Secure, SameSite)
- **Rate Limiting**: API rate limiting with different limits for auth vs general endpoints
- **Security Headers**: Comprehensive security headers via Nginx and Helmet middleware

### 🚀 Performance Optimizations
- **Redis Caching**: Session storage and future caching capabilities
- **Persistent Storage**: Docker volumes for database, uploads, and logs
- **Health Checks**: Comprehensive health monitoring for all services
- **Optimized Builds**: Production-optimized Docker images with multi-stage builds

### 🔧 Configuration Management
- **Environment Variables**: Production-ready environment configuration
- **Frontend API Integration**: Configurable API URLs for different environments
- **Database Persistence**: Persistent PostgreSQL with proper initialization
- **File Upload Management**: Dedicated volume for secure file storage

##  Prerequisites

- **Docker**: Version 20.10 or later
- **Docker Compose**: Version 2.0 or later
- **Domain Name**: Pointed to your server (consider .co.ke domains)
- **SSL Certificate**: Let's Encrypt or commercial certificate
- **Server**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+ with at least 2GB RAM
- **Kenyan Hosting**: Consider Nairobi-based providers (Safaricom Cloud, Liquid Telecom, etc.)

## 🔄 Replit vs Production Differences

### Key Differences Addressed

| Aspect | Replit (Development) | Production (Docker) |
|--------|---------------------|-------------------|
| **Networking** | Auto-exposed ports | Nginx reverse proxy on ports 80/443 |
| **Environment** | Replit secrets | `.env.production` file |
| **Database** | Replit's default DB | Persistent PostgreSQL with Docker volumes |
| **File Storage** | Ephemeral `/tmp` | Persistent Docker volumes (`/app/uploads`) |
| **Sessions** | Single-instance memory | Redis-backed multi-instance sessions |
| **API Routing** | Direct backend access | Nginx proxies `/api/*` to backend |
| **CORS** | Replit's CORS handling | Explicit CORS configuration |
| **Frontend API** | Hardcoded Replit URLs | Environment-based API URLs |

### Migration Benefits
- **Scalability**: Redis sessions support horizontal scaling
- **Persistence**: Data survives container restarts
- **Security**: Proper HTTPS, security headers, and CORS
- **Performance**: Optimized Docker images and caching
- **Reliability**: Health checks and proper error handling

## 🧪 Testing

### Running Tests

The application includes comprehensive test suites for different levels of testing:

#### Unit Tests
```bash
# Run unit tests for client
npm run test:client

# Run unit tests for server
npm run test:server

# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:client:watch
npm run test:server:watch
```

#### Integration Tests
```bash
# Run backend integration tests
npm run test:server:int

# Integration tests cover:
# - API endpoints (/api/auth/signup, /api/auth/login, /api/products, /api/tradein)
# - Database operations
# - Authentication middleware
# - Input validation
```

#### End-to-End Tests
```bash
# Run E2E tests with Cypress
npm run test:e2e

# Open Cypress test runner (interactive)
npm run test:e2e:open

# E2E tests cover:
# - User signup/login flow
# - Product browsing and comparison
# - Trade-in tool estimate submission
# - Admin dashboard functionality
# - Security features and validation
```

#### Test Configuration
```bash
# Clear test cache
npm run test:clear-cache

# Run tests with coverage
npm run test:client -- --coverage
npm run test:server -- --coverage
```

### Test Environments

- **Development**: Tests run against local SQLite database
- **CI/CD**: Tests run in isolated containers
- **Production**: Integration tests validate production deployments

## 🔧 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd skavtech-platform

# Copy environment template
cp .env.production .env.production.local
```

### 2. Configure Environment

Edit `.env.production.local` with your production values:

```bash
# Generate strong passwords
openssl rand -base64 32

# Edit the file
nano .env.production.local
```

**Required Changes:**
- `POSTGRES_PASSWORD`: Set to a strong password
- `SESSION_SECRET`: Generate a 64+ character random string
- `JWT_SECRET`: Generate a different 64+ character random string
- `ALLOWED_ORIGINS`: Set to your domain(s)

### 3. Database Migrations

The application uses Drizzle ORM with safe SQL migrations for database schema management.

#### Migration Workflow

```bash
# Generate new migration (when schema changes)
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Check migration status
npx drizzle-kit check
```

#### Production Migration Setup

```bash
# For production deployment, ensure migrations run during container startup
# The docker-compose.prod.yaml includes migration execution in the backend service

# Manual migration in production
docker compose -f docker/docker-compose.prod.yaml exec backend npm run db:migrate

# Check migration status
docker compose -f docker/docker-compose.prod.yaml exec backend npx drizzle-kit check
```

#### Migration Files

- **Location**: `./migrations/` directory
- **Naming**: `0001_init.sql`, `0002_add_user_roles.sql`, etc.
- **Safety**: Migrations are forward-only and should be tested in staging first
- **Backup**: Always backup database before running migrations in production

#### Example Migration File Structure

```sql
-- migrations/0001_init.sql
CREATE TABLE "users" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "username" text NOT NULL,
  "password" text NOT NULL,
  "role" text DEFAULT 'customer' NOT NULL,
  "email" text,
  "first_name" text,
  "last_name" text,
  "phone_number" text,
  "country_code" text,
  "city" text,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
-- Add more tables and constraints...
```

#### Migration Best Practices

1. **Test migrations** in development environment first
2. **Backup database** before running migrations in production
3. **Use descriptive names** for migration files
4. **Avoid destructive changes** in production migrations
5. **Run migrations during low-traffic periods**
6. **Monitor migration execution** and rollback if necessary
```

### 4. SSL Certificate Setup (Optional but Recommended)

```bash
# Create SSL directory
mkdir -p docker/ssl

# Option 1: Let's Encrypt (Recommended)
sudo apt update
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/key.pem

# Option 2: Self-signed (Development only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/ssl/key.pem \
  -out docker/ssl/cert.pem
```

### 5. Deploy

```bash
# Build and start all services
docker compose -f docker/docker-compose.prod.yaml up -d

# View logs
docker compose -f docker/docker-compose.prod.yaml logs -f

# Check service status
docker compose -f docker/docker-compose.prod.yaml ps
```

## 🇰🇪 Kenyan Deployment Guide

### Regional Hosting Options

**Recommended Nairobi-based providers:**
- **Safaricom Cloud**: Local cloud infrastructure with good connectivity
- **Liquid Telecom**: Regional connectivity with data centers in Nairobi
- **AWS Africa (Cape Town)**: Use eu-south-1 region for better latency
- **Azure**: South Africa North region
- **Neon DB**: Serverless PostgreSQL with global edge network

### SSL Certificate Setup (Kenya)

```bash
# Install Certbot for Let's Encrypt
sudo apt update
sudo apt install certbot

# For standalone verification (recommended for initial setup)
sudo certbot certonly --standalone -d skavtech.co.ke -d www.skavtech.co.ke

# Copy certificates to Docker directory
sudo cp /etc/letsencrypt/live/skavtech.co.ke/fullchain.pem docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/skavtech.co.ke/privkey.pem docker/ssl/key.pem

# Set proper permissions
sudo chown $(whoami):$(whoami) docker/ssl/*.pem
```

### Database Configuration (Kenya)

**Option 1: Local PostgreSQL (Recommended for control)**
```bash
# Use the included docker-compose.prod.yaml
# Database will be hosted locally with persistent volumes
```

**Option 2: Neon DB (Serverless PostgreSQL)**
```bash
# Create account at neon.tech
# Choose Nairobi region for better performance
# Update DATABASE_URL in .env.production:
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
```

### Time Zone Configuration

```bash
# Set server timezone to Nairobi
sudo timedatectl set-timezone Africa/Nairobi

# Verify timezone
timedatectl
```

### Monitoring & Alerting (Kenya)

**Local Options:**
- **Prometheus + Grafana**: Self-hosted monitoring stack
- **Zabbix**: Enterprise monitoring solution
- **Nagios**: Traditional monitoring

**Cloud Options:**
- **DataDog**: Global monitoring with local agents
- **New Relic**: APM with good African coverage
- **Sentry**: Error tracking (configure in .env.production)

### Backup Strategy (Kenya)

```bash
# Create automated backup script
cat > backup-skavtech.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/skavtech/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
docker compose -f /opt/skavtech/docker/docker-compose.prod.yaml exec -T db pg_dump -U skavtech_user skavtech_prod > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://skavtech-backups/

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
EOF

# Make executable and schedule
chmod +x backup-skavtech.sh
(crontab -l ; echo "0 2 * * * /opt/skavtech/backup-skavtech.sh") | crontab -
```

## 🔍 Verification

### Health Checks

```bash
# Check all services
curl -f http://localhost/health

# Check API
curl -f http://localhost/api/health

# Check database connectivity
docker compose -f docker/docker-compose.prod.yaml exec backend curl -f http://localhost:4000/api/health
```

### Application Access

- **Frontend**: `http://your-domain.com` or `https://your-domain.com`
- **API**: `http://your-domain.com/api/*`
- **Admin Login**: Use admin credentials from seeding

## 📊 Monitoring & Maintenance

### Logs

```bash
# View all logs
docker compose -f docker/docker-compose.prod.yaml logs -f

# View specific service logs
docker compose -f docker/docker-compose.prod.yaml logs -f backend
docker compose -f docker/docker-compose.prod.yaml logs -f nginx

# Follow logs with timestamps
docker compose -f docker/docker-compose.prod.yaml logs -f --timestamps
```

### Database Backup

```bash
# Create backup
docker compose -f docker/docker-compose.prod.yaml exec db pg_dump -U skavtech_user skavtech_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker compose -f docker/docker-compose.prod.yaml exec -T db psql -U skavtech_user skavtech_prod < backup_file.sql
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker/docker-compose.prod.yaml up -d --build

# Zero-downtime updates (if using multiple replicas)
docker compose -f docker/docker-compose.prod.yaml up -d backend --scale backend=2
docker compose -f docker/docker-compose.prod.yaml up -d backend --scale backend=1
```

## 🔒 Security Configuration

### Firewall Setup

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### SSL/TLS Configuration

The nginx configuration includes:
- TLS 1.2/1.3 only
- Strong cipher suites
- HSTS headers
- Security headers (CSP, X-Frame-Options, etc.)

### Environment Security

- Never commit `.env.production.local` to version control
- Use strong, unique passwords
- Rotate secrets regularly
- Use environment-specific configurations

## 🚀 Scaling & Performance

### Backend Scaling with Multiple Replicas

#### Docker Compose Scaling
```bash
# Scale backend to 3 replicas
docker compose -f docker/docker-compose.prod.yaml up -d --scale backend=3

# Check replica status
docker compose -f docker/docker-compose.prod.yaml ps backend

# Scale down to 1 replica
docker compose -f docker/docker-compose.prod.yaml up -d --scale backend=1
```

#### Load Balancing Configuration
```yaml
# docker-compose.prod.yaml (modify for scaling)
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    # Nginx automatically load balances to backend replicas
    depends_on:
      - backend
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

#### Redis for Session Management
```yaml
# Redis service configuration (already included)
redis:
  image: redis:7-alpine
  restart: unless-stopped
  volumes:
    - redis_data:/data
  networks:
    - skavtech-network
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 30s
    timeout: 10s
    retries: 3
  # Security: Don't expose Redis port externally
  # ports:
  #   - "6379:6379"
```

#### Session Store Configuration
```javascript
// server/src/index.ts - Redis session store (already configured)
if (process.env.REDIS_URL) {
  const redisClient = createClient({
    url: process.env.REDIS_URL
  });

  redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'skavtech:sess:',
    ttl: 24 * 60 * 60 // 24 hours
  });

  sessionConfig.store = redisStore;
}
```

### Scaling Benefits
- **High Availability**: Multiple backend replicas prevent single points of failure
- **Load Distribution**: Nginx automatically distributes requests across replicas
- **Session Persistence**: Redis ensures sessions work across all replicas
- **Zero Downtime**: Scale up/down without service interruption
- **Resource Optimization**: Allocate resources based on load requirements

### Monitoring Scaled Deployments
```bash
# Monitor all backend replicas
docker compose -f docker/docker-compose.prod.yaml logs -f backend

# Check Redis connectivity
docker compose -f docker/docker-compose.prod.yaml exec redis redis-cli ping

# Monitor resource usage
docker stats $(docker compose -f docker/docker-compose.prod.yaml ps -q backend)
```

### Database Optimization

```bash
# PostgreSQL configuration
docker compose -f docker/docker-compose.prod.yaml exec db psql -U skavtech_user -d skavtech_prod

# Inside PostgreSQL shell
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
```

### Caching (Redis)

Add Redis service to `docker-compose.prod.yaml`:

```yaml
redis:
  image: redis:7-alpine
  restart: unless-stopped
  volumes:
    - redis_data:/data
  networks:
    - skavtech-network
```

## 🐛 Troubleshooting

### Common Issues

**1. Port 80/443 already in use:**
```bash
# Check what's using the ports
sudo lsof -i :80
sudo lsof -i :443

# Stop conflicting services
sudo systemctl stop apache2
sudo systemctl stop nginx
```

**2. Database connection failed:**
```bash
# Check database logs
docker compose -f docker/docker-compose.prod.yaml logs db

# Test database connectivity
docker compose -f docker/docker-compose.prod.yaml exec backend npx tsx -e "import { storage } from './storage'; console.log('DB connected:', !!(await storage.getUsers()));"
```

**3. SSL certificate issues:**
```bash
# Check certificate validity
openssl x509 -in docker/ssl/cert.pem -text -noout

# Renew Let's Encrypt certificates
sudo certbot renew
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/key.pem
docker compose -f docker/docker-compose.prod.yaml restart nginx
```

**4. Memory issues:**
```bash
# Check container resource usage
docker stats

# Increase Docker memory limit
# Edit /etc/docker/daemon.json
{
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
```

### Service-Specific Issues

**Frontend not loading:**
- Check nginx logs: `docker compose logs nginx`
- Verify build completed: `docker compose exec frontend ls -la /usr/share/nginx/html`

**API returning 500 errors:**
- Check backend logs: `docker compose logs backend`
- Verify environment variables: `docker compose exec backend env | grep -E "(DATABASE|SESSION|JWT)"`

**Database slow/unresponsive:**
- Check disk space: `df -h`
- Monitor PostgreSQL: `docker compose exec db psql -U skavtech_user -d skavtech_prod -c "SELECT * FROM pg_stat_activity;"`

## 📈 Performance Optimization

### Nginx Optimization

```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_devices_status ON devices(status);
```

### Application Optimization

```javascript
// Enable compression in Express
import compression from 'compression';
app.use(compression());

// Use connection pooling for database
import { Pool } from 'pg';
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 🔄 Backup & Recovery

### Automated Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/skavtech/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
docker compose -f /opt/skavtech/docker/docker-compose.prod.yaml exec -T db pg_dump -U skavtech_user skavtech_prod > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
EOF

# Make executable and add to cron
chmod +x backup.sh
(crontab -l ; echo "0 2 * * * /opt/skavtech/backup.sh") | crontab -
```

### Disaster Recovery

```bash
# Stop services
docker compose -f docker/docker-compose.prod.yaml down

# Restore database
docker compose -f docker/docker-compose.prod.yaml up -d db
docker compose -f docker/docker-compose.prod.yaml exec -T db psql -U skavtech_user skavtech_prod < backup_file.sql

# Start all services
docker compose -f docker/docker-compose.prod.yaml up -d
```

## 📞 Support

For issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Review application logs: `docker compose logs`
3. Check system resources: `docker stats`
4. Contact the development team

## 📋 Production Checklist

- [ ] Domain configured and DNS propagated
- [ ] SSL certificates installed and configured
- [ ] Environment variables configured with strong secrets
- [ ] Database initialized with migrations
- [ ] Admin user created and credentials secured
- [ ] Firewall configured (ports 80, 443 open)
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented
- [ ] SSL certificate auto-renewal configured
- [ ] Log aggregation configured
- [ ] Performance monitoring enabled
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Error handling verified

---

**🎉 Your Skavtech platform is now production-ready!**

For additional customization or advanced configurations, refer to the Docker Compose and nginx documentation.