#!/bin/bash

echo "🔒 Removing exposed API key from git history (Simple method)"
echo "================================================"

# Create backup
echo "📦 Creating backup tag..."
git tag backup-$(date +%Y%m%d-%H%M%S)

# The files that contained the API key
FILES_TO_CLEAN=(
    "VERCEL_EMAIL_FIX.md"
    "scripts/verify-vercel-env.ts"
    ".env.production"
)

echo "🔍 Files to clean:"
for file in "${FILES_TO_CLEAN[@]}"; do
    echo "  - $file"
done

# Get the current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo ""
echo "⚠️  This will rewrite history starting from commit c09459f"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Use sed to replace the API key in the specific files
echo "🧹 Cleaning repository history..."

# For each file that might contain the key
for file in "${FILES_TO_CLEAN[@]}"; do
    echo "Processing $file..."
    
    # Use filter-branch to modify the file in history
    git filter-branch --force --tree-filter "
        if [ -f '$file' ]; then
            sed -i.bak 's/re_ZSyxf1Pz_Mi226SjzLgSJh3F6ZbauqiHW/[REDACTED_API_KEY]/g' '$file' 2>/dev/null || true
            rm -f '${file}.bak'
        fi
    " --tag-name-filter cat -- --all
done

echo "✅ History cleaned!"
echo ""
echo "📋 Next steps:"
echo "1. Verify the cleanup worked:"
echo "   git log -p -S 're_ZSyxf1Pz' --all"
echo ""
echo "2. If no results appear, force push to remote:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. Clean up local references:"
echo "   rm -rf .git/refs/original/"
echo "   git reflog expire --expire=now --all"
echo "   git gc --prune=now --aggressive"
echo ""
echo "⚠️  CRITICAL: "
echo "- Go to Resend and revoke the exposed key immediately!"
echo "- Generate a new key and update it in Vercel"