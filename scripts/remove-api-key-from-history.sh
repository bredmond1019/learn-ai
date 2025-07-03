#!/bin/bash

# Script to remove exposed API key from git history
# This preserves all commits but modifies only the files containing the key

echo "🔍 Creating backup branch..."
git branch backup-before-cleanup

echo "📝 Creating file with the exposed key to replace..."
echo "re_ZSyxf1Pz_Mi226SjzLgSJh3F6ZbauqiHW==>[REDACTED_API_KEY]" > .git/api-key-replacement.txt

echo "🧹 Removing API key from specific files in history..."
# Use git filter-repo (more efficient than filter-branch)
# First, check if git-filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo not found. Installing..."
    echo "Run: pip install git-filter-repo"
    echo "Or: brew install git-filter-repo"
    exit 1
fi

# Create a patterns file for git-filter-repo
cat > .git/filter-patterns.txt << EOF
regex:re_ZSyxf1Pz_Mi226SjzLgSJh3F6ZbauqiHW==>[REDACTED_API_KEY]
EOF

echo "🚀 Running git-filter-repo to clean history..."
git filter-repo --replace-text .git/filter-patterns.txt --force

echo "✅ Cleanup complete!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Review the changes: git log --oneline -n 20"
echo "2. Check specific commits: git show c09459f"
echo "3. If everything looks good, force push:"
echo "   git push origin main --force"
echo "   git push origin --tags --force"
echo "4. Delete the backup branch: git branch -D backup-before-cleanup"
echo ""
echo "🔐 DON'T FORGET:"
echo "- Revoke the exposed API key in Resend dashboard"
echo "- Update Vercel with the new API key"

# Clean up temporary files
rm -f .git/api-key-replacement.txt .git/filter-patterns.txt