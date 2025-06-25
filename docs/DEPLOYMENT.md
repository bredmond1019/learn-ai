# Deployment Guide

This document provides comprehensive instructions for deploying the portfolio application to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
- [Production Deployment](#production-deployment)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

## Prerequisites

### Required Tools

- **Node.js**: Version 18+ (check with `node --version`)
- **Docker**: Latest stable version
- **Docker Compose**: Version 2.0+
- **kubectl**: For Kubernetes deployments
- **Git**: For version control

### Environment Requirements

- **CPU**: Minimum 1 vCPU, recommended 2+ vCPUs
- **Memory**: Minimum 1GB RAM, recommended 2GB+ RAM
- **Storage**: Minimum 10GB available disk space
- **Network**: Internet access for pulling dependencies

## Environment Setup

### 1. Environment Variables

Copy the environment template and configure:

```bash
cp .env.example .env.production
```

Configure the following required variables:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME="Brandon Redmond - AI Engineer"

# Email Service (Required for contact form)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@your-domain.com
RESEND_TO_EMAIL=your-email@domain.com

# Security (Generate secure random strings)
CSRF_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# Optional: Analytics and Monitoring
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn
```

### 2. SSL Certificates

For production deployments, ensure you have valid SSL certificates:

```bash
# For Let's Encrypt certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to ssl directory
mkdir -p ssl
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

## Deployment Options

### Option 1: Docker Compose (Recommended for VPS/Dedicated Servers)

Best for: Small to medium deployments, VPS hosting, development staging

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f portfolio
```

### Option 2: Kubernetes (Recommended for Cloud/Enterprise)

Best for: Scalable cloud deployments, high availability requirements

```bash
# Apply Kubernetes manifests
kubectl apply -k k8s/

# Check deployment status
kubectl get pods -n portfolio
kubectl rollout status deployment/portfolio -n portfolio

# View logs
kubectl logs -f deployment/portfolio -n portfolio
```

### Option 3: Vercel (Easiest for Serverless)

Best for: Quick deployments, automatic scaling, zero-ops

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 4: Manual Deployment Script

For custom deployments:

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy with Docker Compose
DEPLOYMENT_TYPE=docker-compose \
IMAGE_NAME=portfolio \
APP_URL=https://your-domain.com \
./scripts/deploy.sh

# Deploy to Kubernetes
DEPLOYMENT_TYPE=kubernetes \
IMAGE_NAME=ghcr.io/your-username/portfolio \
APP_URL=https://your-domain.com \
./scripts/deploy.sh
```

## Production Deployment

### Step-by-Step Production Deployment

1. **Pre-deployment Checklist**

   ```bash
   # Verify environment configuration
   npm run build  # Ensure build works locally
   
   # Check environment variables
   grep -v '^#' .env.production | grep -v '^$'
   
   # Validate Docker configuration
   docker-compose -f docker-compose.prod.yml config
   ```

2. **Build and Deploy**

   ```bash
   # Option A: Using Docker Compose
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   
   # Option B: Using deployment script
   ./scripts/deploy.sh -e production -d docker-compose
   ```

3. **Verify Deployment**

   ```bash
   # Check health endpoint
   curl -f https://your-domain.com/api/health
   
   # Check metrics endpoint
   curl -f https://your-domain.com/api/metrics
   
   # Verify SSL certificate
   openssl s_client -servername your-domain.com -connect your-domain.com:443
   ```

### CI/CD Pipeline Deployment

The GitHub Actions workflow automatically:

1. Runs tests and quality checks
2. Builds Docker image
3. Pushes to container registry
4. Deploys to staging (develop branch)
5. Deploys to production (main branch)

Configure secrets in GitHub repository settings:

```
DOCKER_REGISTRY_URL=ghcr.io
DOCKER_USERNAME=your-username
DOCKER_PASSWORD=your-token
SLACK_WEBHOOK_URL=your-slack-webhook
```

## Monitoring and Health Checks

### Health Check Endpoints

- **Application Health**: `GET /api/health`
- **Metrics**: `GET /api/metrics`
- **Prometheus Metrics**: `GET /api/metrics?format=prometheus`

### Example Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "responseTime": 45,
  "version": "1.0.0",
  "checks": {
    "memory": {
      "status": "healthy",
      "details": {
        "heapUsed": 128,
        "heapTotal": 256,
        "usagePercent": 50
      }
    },
    "emailService": {
      "status": "configured",
      "provider": "Resend"
    }
  }
}
```

### Monitoring Setup

1. **Prometheus + Grafana** (included in docker-compose.prod.yml)

   ```bash
   # Access Grafana dashboard
   open http://localhost:3001
   # Login: admin / (check GRAFANA_PASSWORD in .env)
   ```

2. **External Monitoring Services**

   - Uptime Robot: For uptime monitoring
   - Sentry: For error tracking
   - DataDog/New Relic: For APM

### Log Management

Logs are structured JSON format in production:

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f portfolio

# Filter error logs
docker-compose -f docker-compose.prod.yml logs portfolio | grep '"level":"error"'

# View Nginx access logs
docker-compose -f docker-compose.prod.yml logs nginx
```

## Troubleshooting

### Common Issues

1. **Application Won't Start**

   ```bash
   # Check environment variables
   docker-compose -f docker-compose.prod.yml exec portfolio env | grep -E "(RESEND|NODE_ENV)"
   
   # Check application logs
   docker-compose -f docker-compose.prod.yml logs portfolio
   
   # Verify health check
   docker-compose -f docker-compose.prod.yml exec portfolio curl -f http://localhost:3000/api/health
   ```

2. **High Memory Usage**

   ```bash
   # Check memory metrics
   curl -s https://your-domain.com/api/health | jq '.checks.memory'
   
   # Restart application
   docker-compose -f docker-compose.prod.yml restart portfolio
   ```

3. **SSL Certificate Issues**

   ```bash
   # Verify certificate validity
   openssl x509 -in ssl/cert.pem -text -noout
   
   # Check certificate expiration
   openssl x509 -in ssl/cert.pem -noout -dates
   
   # Renew Let's Encrypt certificate
   sudo certbot renew
   ```

4. **Email Service Not Working**

   ```bash
   # Test email configuration
   curl -X POST https://your-domain.com/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
   
   # Check Resend API key
   curl -X GET "https://api.resend.com/domains" \
     -H "Authorization: Bearer your_api_key"
   ```

### Performance Issues

1. **Slow Response Times**

   ```bash
   # Check response times
   curl -w "@curl-format.txt" -o /dev/null https://your-domain.com/
   
   # Monitor metrics
   curl -s https://your-domain.com/api/metrics | jq '.histograms'
   ```

2. **High CPU Usage**

   ```bash
   # Check container resources
   docker stats portfolio_portfolio_1
   
   # Scale up if using Docker Compose
   docker-compose -f docker-compose.prod.yml up -d --scale portfolio=2
   ```

## Rollback Procedures

### Automatic Rollback

The deployment script includes automatic rollback on failure:

```bash
# Deploy with auto-rollback enabled (default)
ROLLBACK_ON_FAILURE=true ./scripts/deploy.sh
```

### Manual Rollback

1. **Docker Compose Rollback**

   ```bash
   # Stop current deployment
   docker-compose -f docker-compose.prod.yml down
   
   # Restore from backup
   docker tag portfolio:previous portfolio:latest
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Kubernetes Rollback**

   ```bash
   # Rollback to previous version
   kubectl rollout undo deployment/portfolio -n portfolio
   
   # Check rollback status
   kubectl rollout status deployment/portfolio -n portfolio
   
   # Rollback to specific revision
   kubectl rollout undo deployment/portfolio --to-revision=2 -n portfolio
   ```

3. **Git-based Rollback**

   ```bash
   # Find the commit to rollback to
   git log --oneline -10
   
   # Create rollback commit
   git revert HEAD
   git push origin main
   
   # Trigger deployment pipeline
   ```

### Rollback Verification

After rollback, verify:

1. Application health: `curl -f https://your-domain.com/api/health`
2. Core functionality: Test key pages and features
3. Metrics collection: `curl -f https://your-domain.com/api/metrics`
4. Error rates: Check logs and monitoring dashboards

## Security Considerations

### Production Security Checklist

- [ ] All secrets stored in environment variables, not code
- [ ] HTTPS enabled with valid SSL certificates
- [ ] Security headers configured in Nginx
- [ ] Rate limiting enabled
- [ ] Container running as non-root user
- [ ] Network policies configured (Kubernetes)
- [ ] Regular security updates applied
- [ ] Monitoring and alerting configured

### Security Headers

The Nginx configuration includes:

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: ...`

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Review application logs for errors
   - Check SSL certificate expiration
   - Monitor resource usage trends

2. **Monthly**
   - Update dependencies: `npm audit fix`
   - Review and rotate secrets
   - Test backup and recovery procedures

3. **Quarterly**
   - Update base Docker images
   - Review and update security policies
   - Performance optimization review

### Getting Help

- Check logs: Application and infrastructure logs
- Health checks: Use `/api/health` and `/api/metrics` endpoints
- Documentation: This guide and inline code comments
- Issue tracking: GitHub issues for bug reports and features

### Emergency Contacts

- **On-call Engineer**: [Your contact information]
- **Infrastructure Team**: [Team contact]
- **External Services**: Resend, Sentry, Monitoring providers