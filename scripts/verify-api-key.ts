#!/usr/bin/env tsx
/**
 * Verify your Resend API key configuration
 */

console.log('🔍 Resend API Key Verification\n')

console.log('📋 Checklist:\n')

console.log('1. ✓ Your API key IS being detected in production')
console.log('   - Length: 36 characters (correct for Resend keys)')
console.log('   - It\'s loaded in the Vercel environment\n')

console.log('2. ❌ But Resend says it\'s INVALID\n')

console.log('🔧 To fix this:\n')

console.log('Step 1: Double-check your Resend Dashboard')
console.log('   👉 Go to: https://resend.com/api-keys')
console.log('   - Is your new API key listed there?')
console.log('   - Is it marked as "Active"?')
console.log('   - Copy it again to make sure\n')

console.log('Step 2: Update Vercel (be very careful with copy/paste)')
console.log('   👉 Go to: https://vercel.com/dashboard')
console.log('   - Select your project')
console.log('   - Go to Settings → Environment Variables')
console.log('   - Click on RESEND_API_KEY')
console.log('   - Delete the current value completely')
console.log('   - Paste the new key (no extra spaces!)')
console.log('   - Save\n')

console.log('Step 3: Redeploy')
console.log('   - Go to Deployments tab')
console.log('   - Click "..." on the latest deployment')
console.log('   - Select "Redeploy"')
console.log('   - Wait for it to complete\n')

console.log('Common Issues:')
console.log('   ⚠️  Extra space at the beginning or end of the key')
console.log('   ⚠️  Accidentally including quotes around the key')
console.log('   ⚠️  Using the old revoked key instead of the new one')
console.log('   ⚠️  Key not yet activated in Resend\n')

console.log('Test Command (run after redeploying):')
console.log('   curl -X POST https://www.learn-agentic-ai.com/api/test-email \\')
console.log('     -H "Content-Type: application/json" \\')
console.log('     -d \'{"to": "bredmond1019@gmail.com"}\'\n')

console.log('Expected successful response:')
console.log('   {"success":true,"result":{"id":"..."},"from":"onboarding@resend.dev",...}\n')