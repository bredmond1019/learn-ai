#!/bin/bash

echo "🚀 Forcing Vercel Redeployment"
echo "=============================="
echo ""
echo "Sometimes Vercel needs a code change to pick up new env vars."
echo ""

# Create a small change to force redeployment
echo "// Deployment timestamp: $(date)" >> lib/email.ts

# Commit and push
git add lib/email.ts
git commit -m "chore: Force redeployment to pick up new environment variables

- Added timestamp comment to trigger new build
- This ensures new RESEND_API_KEY is loaded"

git push origin main

echo ""
echo "✅ Pushed changes to trigger redeployment"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Watch for the new deployment to complete"
echo "3. Once done, test with:"
echo "   curl -X POST https://www.learn-agentic-ai.com/api/test-email \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"to\": \"bredmond1019@gmail.com\"}'"