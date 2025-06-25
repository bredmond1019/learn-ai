# Operations Runbook

This document provides operational procedures and troubleshooting guides for the portfolio application in production.

## Table of Contents

- [System Overview](#system-overview)
- [Monitoring and Alerting](#monitoring-and-alerting)
- [Incident Response](#incident-response)
- [Common Operations](#common-operations)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Maintenance Procedures](#maintenance-procedures)
- [Emergency Procedures](#emergency-procedures)

## System Overview

### Architecture Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   Nginx Proxy   │────│   Next.js App   │
│   (Cloud/LB)    │    │   (Rate Limit)  │    │   (Portfolio)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                        ┌─────────────────┐    ┌─────────────────┐
                        │     Redis       │    │   External APIs │
                        │   (Cache/RL)    │    │  (Resend/etc.)  │
                        └─────────────────┘    └─────────────────┘
```

### Service Dependencies

- **Core Services**: Next.js application, Nginx proxy
- **Supporting Services**: Redis (optional), monitoring stack
- **External Dependencies**: Resend (email), Anthropic (translation), CDN
- **Infrastructure**: Docker/Kubernetes, SSL certificates, DNS

### Key Metrics

- **Response Time**: < 500ms for 95th percentile
- **Uptime**: > 99.9% availability
- **Memory Usage**: < 80% of allocated memory
- **CPU Usage**: < 70% average
- **Error Rate**: < 1% of total requests

## Monitoring and Alerting

### Health Check Endpoints

```bash
# Primary health check
curl -f https://your-domain.com/api/health

# Detailed metrics
curl -f https://your-domain.com/api/metrics

# Prometheus format metrics
curl -f https://your-domain.com/api/metrics?format=prometheus
```

### Key Performance Indicators (KPIs)

1. **Application Health**
   - HTTP response codes (2xx, 4xx, 5xx)
   - Response time percentiles
   - Request rate and throughput

2. **System Resources**
   - CPU utilization
   - Memory usage and heap size
   - Disk I/O and network traffic

3. **Business Metrics**
   - Contact form submissions
   - Page views and user sessions
   - Translation API usage

### Alerting Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Response Time P95 | > 1s | > 2s | Scale up / investigate |
| Error Rate | > 2% | > 5% | Immediate response |
| Memory Usage | > 80% | > 90% | Restart / scale |
| CPU Usage | > 80% | > 90% | Scale horizontally |
| Disk Space | > 80% | > 95% | Clean up / expand |
| SSL Expiry | < 30 days | < 7 days | Renew certificate |

### Monitoring Dashboards

1. **Grafana Dashboard**: `http://monitoring-host:3001`
   - System overview and resource usage
   - Application performance metrics
   - Error tracking and alerts

2. **Application Logs**: Structured JSON logs
   ```bash
   # View recent errors
   docker-compose logs portfolio | grep '"level":"error"' | tail -20
   
   # Monitor real-time logs
   docker-compose logs -f portfolio
   ```

## Incident Response

### Incident Severity Levels

**SEV-1 (Critical)**
- Complete service outage
- Data loss or corruption
- Security breach
- Response time: < 15 minutes

**SEV-2 (High)**
- Partial service degradation
- High error rates (> 5%)
- Performance issues affecting users
- Response time: < 1 hour

**SEV-3 (Medium)**
- Minor functionality issues
- Non-critical feature unavailable
- Performance degradation
- Response time: < 4 hours

**SEV-4 (Low)**
- Cosmetic issues
- Documentation updates
- Enhancement requests
- Response time: Next business day

### Incident Response Process

1. **Detection**
   - Automated monitoring alerts
   - User reports
   - Health check failures

2. **Initial Response** (within 15 minutes for SEV-1)
   ```bash
   # Quick health assessment
   curl -f https://your-domain.com/api/health
   
   # Check service status
   docker-compose ps  # or kubectl get pods -n portfolio
   
   # Review recent logs
   docker-compose logs --tail=100 portfolio
   ```

3. **Investigation**
   - Analyze logs and metrics
   - Identify root cause
   - Document findings

4. **Resolution**
   - Apply immediate fixes
   - Test resolution
   - Monitor for stability

5. **Post-Incident**
   - Document incident
   - Post-mortem analysis
   - Preventive measures

### Emergency Contacts

- **On-Call Engineer**: [Primary contact]
- **Backup Engineer**: [Secondary contact]
- **Infrastructure Team**: [Team contact]
- **External Vendors**: Resend, CDN provider

## Common Operations

### Deployment Operations

1. **Deploy New Version**
   ```bash
   # Using deployment script
   ./scripts/deploy.sh -e production -t v1.2.3
   
   # Manual Docker Compose
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Rollback to Previous Version**
   ```bash
   # Kubernetes rollback
   kubectl rollout undo deployment/portfolio -n portfolio
   
   # Docker Compose rollback
   docker tag portfolio:previous portfolio:latest
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Scale Application**
   ```bash
   # Scale up replicas
   docker-compose -f docker-compose.prod.yml up -d --scale portfolio=3
   
   # Kubernetes scaling
   kubectl scale deployment portfolio --replicas=5 -n portfolio
   ```

### Configuration Management

1. **Update Environment Variables**
   ```bash
   # Edit configuration
   nano .env.production
   
   # Restart services to apply changes
   docker-compose -f docker-compose.prod.yml restart portfolio
   ```

2. **SSL Certificate Renewal**
   ```bash
   # Check certificate expiration
   openssl x509 -in ssl/cert.pem -noout -dates
   
   # Renew Let's Encrypt certificate
   sudo certbot renew
   
   # Restart Nginx to load new certificate
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

3. **Update Rate Limiting**
   ```bash
   # Update Nginx configuration
   nano nginx.conf
   
   # Test configuration
   docker-compose -f docker-compose.prod.yml exec nginx nginx -t
   
   # Reload configuration
   docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
   ```

### Database Operations (if applicable)

1. **Backup Data**
   ```bash
   # Create backup directory
   mkdir -p backups/$(date +%Y%m%d)
   
   # Backup content files
   tar -czf backups/$(date +%Y%m%d)/content-backup.tar.gz content/
   
   # Backup configuration
   cp .env.production backups/$(date +%Y%m%d)/
   ```

2. **Restore from Backup**
   ```bash
   # Stop application
   docker-compose -f docker-compose.prod.yml stop portfolio
   
   # Restore content
   tar -xzf backups/20240115/content-backup.tar.gz
   
   # Restart application
   docker-compose -f docker-compose.prod.yml start portfolio
   ```

## Troubleshooting Guide

### Application Issues

**Issue**: Application won't start
```bash
# Check logs for startup errors
docker-compose logs portfolio

# Verify environment variables
docker-compose exec portfolio env | grep NODE_ENV

# Check file permissions
docker-compose exec portfolio ls -la /app

# Test build locally
npm run build
```

**Issue**: High memory usage
```bash
# Check memory metrics
curl -s https://your-domain.com/api/health | jq '.checks.memory'

# Monitor memory over time
watch -n 5 'curl -s https://your-domain.com/api/health | jq .checks.memory.details.usagePercent'

# Restart if memory leak suspected
docker-compose restart portfolio
```

**Issue**: Slow response times
```bash
# Check response time metrics
curl -w "%{time_total}\n" -o /dev/null https://your-domain.com/

# Analyze slow queries in logs
docker-compose logs portfolio | grep -E "(slow|timeout|error)"

# Check CPU usage
docker stats portfolio_portfolio_1
```

### Network and Connectivity Issues

**Issue**: SSL certificate errors
```bash
# Verify certificate validity
openssl s_client -servername your-domain.com -connect your-domain.com:443

# Check certificate files
openssl x509 -in ssl/cert.pem -text -noout

# Verify certificate chain
curl -vI https://your-domain.com
```

**Issue**: Rate limiting issues
```bash
# Check rate limit configuration
curl -I https://your-domain.com/api/health

# Monitor rate limit metrics
curl -s https://your-domain.com/api/metrics | jq '.counters | with_entries(select(.key | contains("rate_limit")))'

# Adjust rate limits in nginx.conf if needed
```

**Issue**: External API failures
```bash
# Test Resend API connection
curl -X GET "https://api.resend.com/domains" \
  -H "Authorization: Bearer $RESEND_API_KEY"

# Check API quotas and limits
# Review external service status pages

# Implement circuit breakers if needed
```

### Infrastructure Issues

**Issue**: Container startup failures
```bash
# Check Docker daemon status
systemctl status docker

# Verify image exists
docker images | grep portfolio

# Check resource constraints
df -h  # Disk space
free -h  # Memory
```

**Issue**: Load balancer health check failures
```bash
# Test health endpoint directly
curl -f http://localhost:3000/api/health

# Check health check configuration
# Verify firewall rules
# Check security groups (cloud deployments)
```

## Maintenance Procedures

### Regular Maintenance Schedule

**Daily**
- Monitor dashboard review (5 minutes)
- Check error logs for anomalies
- Verify backup completion

**Weekly**
- Review performance metrics trends
- Check SSL certificate expiration
- Update security patches
- Test alerting mechanisms

**Monthly**
- Dependency updates and security patches
- Performance optimization review
- Capacity planning assessment
- Disaster recovery test

**Quarterly**
- Full security audit
- Infrastructure cost optimization
- Documentation updates
- Team training and knowledge transfer

### Maintenance Procedures

1. **System Updates**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Update Docker images
   docker-compose -f docker-compose.prod.yml pull
   
   # Update Node.js dependencies
   npm audit fix
   npm update
   ```

2. **Log Rotation and Cleanup**
   ```bash
   # Clean up old Docker logs
   docker system prune -f
   
   # Rotate application logs
   docker-compose -f docker-compose.prod.yml exec portfolio logrotate /etc/logrotate.conf
   
   # Clean up old backup files
   find backups/ -type f -mtime +30 -delete
   ```

3. **Performance Optimization**
   ```bash
   # Analyze bundle size
   npm run build -- --analyze
   
   # Check image optimization
   docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
   
   # Review database queries (if applicable)
   # Optimize static asset caching
   ```

### Backup Procedures

1. **Application Backup**
   ```bash
   #!/bin/bash
   # backup-app.sh
   
   BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
   mkdir -p "$BACKUP_DIR"
   
   # Backup content
   tar -czf "$BACKUP_DIR/content.tar.gz" content/
   
   # Backup configuration
   cp .env.production "$BACKUP_DIR/"
   cp docker-compose.prod.yml "$BACKUP_DIR/"
   
   # Upload to cloud storage
   aws s3 sync "$BACKUP_DIR" s3://your-backup-bucket/portfolio/
   ```

2. **Database Backup** (if applicable)
   ```bash
   # Export database
   docker-compose exec db pg_dump -U postgres dbname > backup.sql
   
   # Compress and store
   gzip backup.sql
   mv backup.sql.gz backups/db-$(date +%Y%m%d).sql.gz
   ```

## Emergency Procedures

### Service Outage Response

1. **Immediate Actions** (0-5 minutes)
   ```bash
   # Check service status
   curl -f https://your-domain.com/api/health || echo "Service DOWN"
   
   # Quick restart attempt
   docker-compose -f docker-compose.prod.yml restart
   
   # Notify stakeholders
   # Post status update
   ```

2. **Investigation** (5-15 minutes)
   ```bash
   # Gather diagnostics
   docker-compose logs --tail=200 > incident-logs.txt
   curl -s https://your-domain.com/api/metrics > incident-metrics.json
   
   # Check external dependencies
   curl -I https://api.resend.com
   
   # Review recent changes
   git log --oneline -10
   ```

3. **Resolution** (15-60 minutes)
   - Apply immediate fixes
   - Rollback if necessary
   - Scale resources if needed
   - Implement workarounds

### Disaster Recovery

1. **Complete Infrastructure Loss**
   ```bash
   # Provision new infrastructure
   # Restore from backups
   # Update DNS records
   # Verify service restoration
   ```

2. **Data Corruption**
   ```bash
   # Stop affected services
   # Restore from last known good backup
   # Verify data integrity
   # Resume operations
   ```

### Security Incident Response

1. **Suspected Security Breach**
   ```bash
   # Isolate affected systems
   docker-compose -f docker-compose.prod.yml stop
   
   # Preserve evidence
   cp -r logs/ security-incident-$(date +%Y%m%d)/
   
   # Notify security team
   # Change all secrets and passwords
   ```

2. **DDoS Attack**
   ```bash
   # Enable rate limiting
   # Contact CDN provider
   # Scale infrastructure
   # Monitor attack patterns
   ```

## Documentation and Knowledge Base

### Log Analysis Queries

```bash
# Find all errors in the last hour
docker-compose logs --since 1h portfolio | grep '"level":"error"'

# Count requests by status code
docker-compose logs nginx | awk '{print $9}' | sort | uniq -c

# Monitor real-time performance
watch -n 5 'curl -s https://your-domain.com/api/metrics | jq .system.memory.usagePercent'
```

### Useful Commands Reference

```bash
# Docker Compose Management
docker-compose -f docker-compose.prod.yml ps        # Status
docker-compose -f docker-compose.prod.yml logs -f   # Logs
docker-compose -f docker-compose.prod.yml restart   # Restart
docker-compose -f docker-compose.prod.yml pull      # Update

# Kubernetes Management
kubectl get pods -n portfolio                        # Status
kubectl logs -f deployment/portfolio -n portfolio   # Logs
kubectl rollout restart deployment/portfolio -n portfolio  # Restart
kubectl rollout status deployment/portfolio -n portfolio   # Rollout status

# System Monitoring
htop                    # CPU and memory usage
df -h                   # Disk usage
ss -tulpn              # Network connections
journalctl -u docker   # Docker service logs
```

### Escalation Matrix

| Issue Type | Primary | Secondary | Manager |
|------------|---------|-----------|---------|
| Application | DevOps Engineer | Senior Developer | Tech Lead |
| Infrastructure | SRE Team | Platform Team | Infrastructure Manager |
| Security | Security Team | CISO | CTO |
| Business Critical | On-call Engineer | Engineering Manager | VP Engineering |

Remember: When in doubt, escalate early and communicate clearly with all stakeholders.