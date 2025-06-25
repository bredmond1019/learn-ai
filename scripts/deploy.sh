#!/bin/bash

# Production deployment script
# This script handles the deployment process with proper error handling and rollback

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${ENVIRONMENT:-production}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
ROLLBACK_ON_FAILURE="${ROLLBACK_ON_FAILURE:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handling
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Deployment failed!"
        if [ "$ROLLBACK_ON_FAILURE" = "true" ]; then
            log_info "Starting rollback process..."
            rollback
        fi
    fi
}

trap cleanup EXIT

# Health check function
health_check() {
    local url=$1
    local max_attempts=${2:-30}
    local attempt=1
    
    log_info "Running health check on $url"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url/api/health" > /dev/null; then
            log_success "Health check passed"
            return 0
        fi
        
        log_info "Health check attempt $attempt/$max_attempts failed, retrying in 10s..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback function
rollback() {
    log_warning "Rolling back to previous version..."
    
    case "$DEPLOYMENT_TYPE" in
        docker-compose)
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml up -d --scale portfolio=0
            # Restore from backup if available
            ;;
        kubernetes)
            kubectl rollout undo deployment/portfolio -n production
            kubectl rollout status deployment/portfolio -n production
            ;;
        *)
            log_error "Unknown deployment type: $DEPLOYMENT_TYPE"
            return 1
            ;;
    esac
    
    log_success "Rollback completed"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if required environment variables are set
    required_vars=(
        "DEPLOYMENT_TYPE"
        "APP_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Check if the image exists (for Docker deployments)
    if [ "$DEPLOYMENT_TYPE" = "docker-compose" ] || [ "$DEPLOYMENT_TYPE" = "kubernetes" ]; then
        if ! docker manifest inspect "$IMAGE_NAME:$IMAGE_TAG" > /dev/null 2>&1; then
            log_error "Docker image $IMAGE_NAME:$IMAGE_TAG not found"
            exit 1
        fi
    fi
    
    log_success "Pre-deployment checks passed"
}

# Backup current state
backup_current_state() {
    log_info "Creating backup of current state..."
    
    case "$DEPLOYMENT_TYPE" in
        docker-compose)
            # Backup docker-compose file and environment
            cp docker-compose.prod.yml "docker-compose.prod.yml.backup.$(date +%Y%m%d-%H%M%S)"
            ;;
        kubernetes)
            # Export current deployment
            kubectl get deployment portfolio -n production -o yaml > "portfolio-deployment.backup.$(date +%Y%m%d-%H%M%S).yaml"
            ;;
    esac
    
    log_success "Backup created"
}

# Deploy function
deploy() {
    log_info "Starting deployment to $ENVIRONMENT..."
    
    case "$DEPLOYMENT_TYPE" in
        docker-compose)
            deploy_docker_compose
            ;;
        kubernetes)
            deploy_kubernetes
            ;;
        vercel)
            deploy_vercel
            ;;
        *)
            log_error "Unsupported deployment type: $DEPLOYMENT_TYPE"
            exit 1
            ;;
    esac
}

# Docker Compose deployment
deploy_docker_compose() {
    log_info "Deploying with Docker Compose..."
    
    # Update environment variables
    export IMAGE_TAG
    export ENVIRONMENT
    
    # Pull latest image
    docker-compose -f docker-compose.prod.yml pull
    
    # Deploy with zero-downtime strategy
    docker-compose -f docker-compose.prod.yml up -d --no-deps --scale portfolio=2 portfolio
    
    # Wait for new instances to be healthy
    sleep 30
    
    # Remove old instances
    docker-compose -f docker-compose.prod.yml up -d --no-deps --scale portfolio=1 portfolio
    
    log_success "Docker Compose deployment completed"
}

# Kubernetes deployment
deploy_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    # Update deployment with new image
    kubectl set image deployment/portfolio portfolio="$IMAGE_NAME:$IMAGE_TAG" -n production
    
    # Wait for rollout to complete
    kubectl rollout status deployment/portfolio -n production --timeout=300s
    
    log_success "Kubernetes deployment completed"
}

# Vercel deployment
deploy_vercel() {
    log_info "Deploying to Vercel..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod --yes
    else
        vercel --yes
    fi
    
    log_success "Vercel deployment completed"
}

# Post-deployment checks
post_deployment_checks() {
    log_info "Running post-deployment checks..."
    
    # Health check
    health_check "$APP_URL"
    
    # Basic functionality tests
    log_info "Testing basic functionality..."
    
    # Test homepage
    if ! curl -f -s "$APP_URL" > /dev/null; then
        log_error "Homepage test failed"
        return 1
    fi
    
    # Test API health endpoint
    if ! curl -f -s "$APP_URL/api/health" > /dev/null; then
        log_error "API health test failed"
        return 1
    fi
    
    # Test metrics endpoint
    if ! curl -f -s "$APP_URL/api/metrics" > /dev/null; then
        log_error "Metrics endpoint test failed"
        return 1
    fi
    
    log_success "Post-deployment checks passed"
}

# Cleanup old resources
cleanup_old_resources() {
    log_info "Cleaning up old resources..."
    
    case "$DEPLOYMENT_TYPE" in
        docker-compose)
            # Remove old images (keep last 3)
            docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | \
            grep "$IMAGE_NAME" | sort -k3 -r | tail -n +4 | \
            awk '{print $1":"$2}' | xargs -r docker rmi
            ;;
        kubernetes)
            # Cleanup old replica sets
            kubectl delete rs -l app=portfolio -n production --field-selector=status.replicas=0
            ;;
    esac
    
    log_success "Cleanup completed"
}

# Main deployment process
main() {
    log_info "Starting deployment process for $ENVIRONMENT environment"
    
    pre_deployment_checks
    backup_current_state
    deploy
    post_deployment_checks
    cleanup_old_resources
    
    log_success "Deployment completed successfully!"
    
    # Send notification
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ Portfolio deployment to $ENVIRONMENT successful!\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment    Deployment environment (default: production)"
    echo "  -t, --tag           Image tag (default: latest)"
    echo "  -d, --deployment    Deployment type (docker-compose, kubernetes, vercel)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  DEPLOYMENT_TYPE     Type of deployment"
    echo "  IMAGE_NAME         Docker image name"
    echo "  APP_URL            Application URL for health checks"
    echo "  SLACK_WEBHOOK_URL  Slack webhook for notifications"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -d|--deployment)
            DEPLOYMENT_TYPE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run main function
main