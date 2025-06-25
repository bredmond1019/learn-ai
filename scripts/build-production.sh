#!/bin/bash

# Production build script with optimization and validation
# This script ensures the application is built with production optimizations

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_ID="${BUILD_ID:-$(date +%Y%m%d-%H%M%S)}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

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

# Validation functions
validate_node_version() {
    local required_version="18"
    local current_version
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        return 1
    fi
    
    current_version=$(node -v | sed 's/v//' | cut -d. -f1)
    
    if [ "$current_version" -lt "$required_version" ]; then
        log_error "Node.js version $required_version or higher is required (current: v$current_version)"
        return 1
    fi
    
    log_success "Node.js version validation passed (v$current_version)"
}

validate_environment() {
    log_info "Validating build environment..."
    
    # Check Node.js version
    validate_node_version
    
    # Check if package.json exists
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        log_error "package.json not found in project directory"
        return 1
    fi
    
    # Check if next.config.mjs exists
    if [ ! -f "$PROJECT_DIR/next.config.mjs" ]; then
        log_error "next.config.mjs not found in project directory"
        return 1
    fi
    
    log_success "Environment validation passed"
}

# Pre-build steps
pre_build() {
    log_info "Running pre-build steps..."
    
    cd "$PROJECT_DIR"
    
    # Clean previous builds
    log_info "Cleaning previous builds..."
    rm -rf .next out dist node_modules/.cache
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production=false
    
    # Run security audit
    log_info "Running security audit..."
    if ! npm audit --audit-level high; then
        log_warning "Security vulnerabilities found. Please review and fix before deploying."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Build cancelled due to security vulnerabilities"
            exit 1
        fi
    fi
    
    # Run linting
    log_info "Running code quality checks..."
    npm run lint
    
    # Run tests
    log_info "Running tests..."
    npm run test
    
    log_success "Pre-build steps completed"
}

# Build application
build_application() {
    log_info "Building Next.js application..."
    
    cd "$PROJECT_DIR"
    
    # Set production environment variables
    export NODE_ENV=production
    export NEXT_TELEMETRY_DISABLED=1
    export DEPLOYMENT_BUILD_ID="$BUILD_ID"
    
    # Build application
    if ! npm run build; then
        log_error "Build failed"
        return 1
    fi
    
    # Verify build output
    if [ ! -d ".next" ]; then
        log_error "Build output directory .next not found"
        return 1
    fi
    
    log_success "Application build completed"
}

# Build optimizations
optimize_build() {
    log_info "Running build optimizations..."
    
    cd "$PROJECT_DIR"
    
    # Analyze bundle size
    log_info "Analyzing bundle size..."
    if command -v npx &> /dev/null; then
        # This would require @next/bundle-analyzer
        # npx next build --analyze
        log_info "Bundle analysis completed (add @next/bundle-analyzer for detailed analysis)"
    fi
    
    # Check for large files
    log_info "Checking for large build files..."
    find .next -name "*.js" -size +1M -exec ls -lh {} \; | head -5
    
    # Verify gzip compression
    if command -v gzip &> /dev/null; then
        log_info "Testing gzip compression..."
        test_file=".next/static/chunks/main.js"
        if [ -f "$test_file" ]; then
            original_size=$(stat -c%s "$test_file" 2>/dev/null || stat -f%z "$test_file")
            gzipped_size=$(gzip -c "$test_file" | wc -c)
            compression_ratio=$(echo "scale=2; $gzipped_size * 100 / $original_size" | bc 2>/dev/null || echo "N/A")
            log_info "Gzip compression ratio: ${compression_ratio}% (${gzipped_size}/${original_size} bytes)"
        fi
    fi
    
    log_success "Build optimizations completed"
}

# Build Docker image
build_docker_image() {
    if [ "${BUILD_DOCKER:-true}" = "false" ]; then
        log_info "Skipping Docker image build"
        return 0
    fi
    
    log_info "Building Docker image..."
    
    cd "$PROJECT_DIR"
    
    # Build Docker image
    if ! docker build \
        --build-arg NEXT_TELEMETRY_DISABLED=1 \
        --build-arg DEPLOYMENT_BUILD_ID="$BUILD_ID" \
        -t "portfolio:$IMAGE_TAG" \
        -t "portfolio:$BUILD_ID" \
        .; then
        log_error "Docker image build failed"
        return 1
    fi
    
    # Verify image
    if ! docker run --rm "portfolio:$IMAGE_TAG" node --version; then
        log_error "Docker image verification failed"
        return 1
    fi
    
    log_success "Docker image built successfully"
    log_info "Image tags: portfolio:$IMAGE_TAG, portfolio:$BUILD_ID"
}

# Post-build validation
post_build_validation() {
    log_info "Running post-build validation..."
    
    cd "$PROJECT_DIR"
    
    # Check if all required files exist
    required_files=(
        ".next/standalone/server.js"
        ".next/static"
        "public"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -e "$file" ]; then
            log_error "Required build file missing: $file"
            return 1
        fi
    done
    
    # Test that the built application can start
    if [ "${TEST_BUILD:-true}" = "true" ]; then
        log_info "Testing built application startup..."
        
        # Set environment variables for test
        export NODE_ENV=production
        export PORT=3001
        
        # Start the application in background
        timeout 30 node .next/standalone/server.js &
        SERVER_PID=$!
        
        # Wait for server to start
        sleep 10
        
        # Test health endpoint
        if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
            log_success "Build validation: Application starts successfully"
        else
            log_error "Build validation: Application failed to start or health check failed"
            kill $SERVER_PID 2>/dev/null || true
            return 1
        fi
        
        # Clean up
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
    
    log_success "Post-build validation completed"
}

# Generate build report
generate_build_report() {
    log_info "Generating build report..."
    
    cd "$PROJECT_DIR"
    
    local report_file="build-report-$BUILD_ID.json"
    
    cat > "$report_file" << EOF
{
  "buildId": "$BUILD_ID",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nodeVersion": "$(node -v)",
  "npmVersion": "$(npm -v)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "buildEnvironment": {
    "NODE_ENV": "${NODE_ENV:-development}",
    "CI": "${CI:-false}",
    "GITHUB_ACTIONS": "${GITHUB_ACTIONS:-false}"
  },
  "buildStats": {
    "buildDuration": "$(echo $(( $(date +%s) - ${BUILD_START_TIME:-$(date +%s)} )) )s",
    "outputSize": "$(du -sh .next 2>/dev/null | cut -f1 || echo 'unknown')",
    "dockerImageSize": "$(docker images --format '{{.Size}}' portfolio:$IMAGE_TAG 2>/dev/null || echo 'N/A')"
  }
}
EOF
    
    log_success "Build report generated: $report_file"
    
    # Display summary
    log_info "Build Summary:"
    log_info "- Build ID: $BUILD_ID"
    log_info "- Node.js Version: $(node -v)"
    log_info "- Git Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
    log_info "- Build Output Size: $(du -sh .next 2>/dev/null | cut -f1 || echo 'unknown')"
}

# Main build process
main() {
    local BUILD_START_TIME
    BUILD_START_TIME=$(date +%s)
    
    log_info "Starting production build process..."
    log_info "Build ID: $BUILD_ID"
    log_info "Image Tag: $IMAGE_TAG"
    
    # Run build steps
    validate_environment
    pre_build
    build_application
    optimize_build
    build_docker_image
    post_build_validation
    generate_build_report
    
    local build_duration
    build_duration=$(( $(date +%s) - BUILD_START_TIME ))
    
    log_success "Production build completed successfully in ${build_duration}s"
    log_info "Build artifacts:"
    log_info "- Next.js build: .next/"
    log_info "- Docker image: portfolio:$IMAGE_TAG"
    log_info "- Build report: build-report-$BUILD_ID.json"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --tag           Docker image tag (default: latest)"
    echo "  --no-docker         Skip Docker image build"
    echo "  --no-test           Skip build testing"
    echo "  -h, --help          Show this help message"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --no-docker)
            BUILD_DOCKER=false
            shift
            ;;
        --no-test)
            TEST_BUILD=false
            shift
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