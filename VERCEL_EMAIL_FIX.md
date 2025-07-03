# Vercel Email Configuration Fix

## Problem
Your email service works locally but fails in production because environment variables are not properly set in Vercel.

## Solution Steps

### 1. Add Environment Variables to Vercel

Go to your Vercel dashboard and add these environment variables:

1. Navigate to: https://vercel.com/dashboard
2. Select your project (likely named "portfolio" or similar)
3. Go to **Settings** → **Environment Variables**
4. Add these variables for **Production** environment:

```
RESEND_API_KEY=[YOUR_RESEND_API_KEY_HERE]
CONTACT_EMAIL=bredmond1019@gmail.com
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 2. Redeploy Your Application

After adding the environment variables:

1. Go to the **Deployments** tab in Vercel
2. Click on the three dots (...) next to your latest deployment
3. Select **Redeploy**
4. Choose **Use existing Build Cache** → **No** (to ensure env vars are loaded)
5. Click **Redeploy**

### 3. Verify the Fix

Once redeployed, test your contact form:

```bash
# Run the verification script
npx tsx scripts/verify-vercel-env.ts

# Or manually test the contact form on your website
```

### 4. Alternative: Using Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project
vercel link

# Set environment variables
vercel env add RESEND_API_KEY production
vercel env add CONTACT_EMAIL production  
vercel env add RESEND_FROM_EMAIL production

# Redeploy
vercel --prod
```

## Why This Happened

- Local `.env` files are not automatically uploaded to Vercel
- Environment variables must be explicitly set in the Vercel dashboard
- The `.env.production` file is only used during local builds, not on Vercel's servers

## Testing Checklist

After redeployment:

- [ ] Contact form submits successfully
- [ ] You receive admin notification email
- [ ] User receives confirmation email
- [ ] No errors in Vercel function logs

## Monitoring

Check your Vercel function logs for any issues:
1. Go to **Functions** tab in Vercel dashboard
2. Click on `api/contact`
3. View real-time logs for debugging

## Next Steps

Consider setting up:
1. Custom domain email (e.g., noreply@learn-agentic-ai.com)
2. Email templates in Resend dashboard
3. Monitoring alerts for failed emails