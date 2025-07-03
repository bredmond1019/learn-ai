#!/bin/bash

echo "🔒 Removing API key from commit c09459f"
echo "======================================"

# Create a backup tag
echo "📦 Creating backup tag..."
git tag backup-api-cleanup-$(date +%Y%m%d-%H%M%S)

echo ""
echo "Current situation:"
echo "- API key was added in commit c09459f"
echo "- API key was removed in commit 90916e8"
echo "- We only need to clean commit c09459f"
echo ""

# Option 1: Interactive rebase (recommended for just 2 commits)
echo "We'll use interactive rebase to edit the problematic commit."
echo "This preserves all your commit messages and history."
echo ""
echo "⚠️  Press Enter to continue or Ctrl+C to cancel..."
read

# Start interactive rebase from the parent of the problematic commit
echo "Starting interactive rebase..."
echo ""
echo "📝 Instructions:"
echo "1. In the editor that opens, change 'pick' to 'edit' for commit c09459f"
echo "2. Save and close the editor"
echo "3. The script will handle the rest"
echo ""
echo "Press Enter when ready..."
read

# Get the parent commit of c09459f
PARENT_COMMIT=$(git rev-parse c09459f^)

# Start the rebase
git rebase -i $PARENT_COMMIT

# Now we're at commit c09459f, let's clean the files
echo "🧹 Cleaning files in commit c09459f..."

# Remove the API key from the files
if [ -f "VERCEL_EMAIL_FIX.md" ]; then
    sed -i '' 's/re_ZSyxf1Pz_Mi226SjzLgSJh3F6ZbauqiHW/[REDACTED_API_KEY]/g' VERCEL_EMAIL_FIX.md
    git add VERCEL_EMAIL_FIX.md
fi

if [ -f "scripts/verify-vercel-env.ts" ]; then
    sed -i '' 's/re_ZSyxf1Pz_Mi226SjzLgSJh3F6ZbauqiHW/[REDACTED_API_KEY]/g' scripts/verify-vercel-env.ts
    git add scripts/verify-vercel-env.ts
fi

# Amend the commit
git commit --amend --no-edit

# Continue the rebase
echo "Continuing rebase..."
git rebase --continue

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Verify the cleanup:"
echo "git show c09459f | grep -i re_ZSyxf1Pz"
echo "(Should return nothing)"
echo ""
echo "If successful, force push:"
echo "git push origin main --force-with-lease"
echo ""
echo "🚨 REMEMBER: Revoke the exposed key in Resend immediately!"