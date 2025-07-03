#!/usr/bin/env tsx
/**
 * Verify Vercel environment variables
 * Run this on your production URL to check if env vars are properly set
 */

import https from 'https'

async function verifyProductionEnv() {
  // Try multiple possible URLs
  const urls = [
    'https://www.learn-agentic-ai.com',
    'https://learn-agentic-ai.com',
    'https://brandon-redmond.vercel.app',
    'https://portfolio-phi-vert-51.vercel.app'
  ]
  
  console.log('🔍 Finding the correct production URL...\n')
  
  let PROD_URL = ''
  
  // Test each URL to find the working one
  for (const url of urls) {
    try {
      console.log(`Testing ${url}...`)
      const response = await fetch(`${url}/api/email-health`, {
        method: 'GET',
        headers: { 'User-Agent': 'verify-script' }
      }).catch(() => null)
      
      if (response && response.ok) {
        PROD_URL = url
        console.log(`✅ Found working URL: ${url}\n`)
        break
      }
    } catch (e) {
      // Ignore SSL or connection errors
    }
  }
  
  if (!PROD_URL) {
    console.error('❌ Could not find a working production URL')
    console.log('\n📋 Please check your Vercel dashboard for the correct URL')
    return
  }
  
  console.log('🔍 Verifying production environment variables...\n')
  
  // Test 1: Check email health endpoint
  console.log('1️⃣ Testing email health endpoint...')
  try {
    const healthResponse = await fetch(`${PROD_URL}/api/email-health`)
    const healthData = await healthResponse.json()
    
    console.log('Email Health Check:')
    console.log(JSON.stringify(healthData, null, 2))
    
    if (!healthData.config?.hasResendApiKey) {
      console.error('\n❌ CRITICAL: RESEND_API_KEY is not set in production!')
      console.log('\n📋 To fix this:')
      console.log('1. Go to https://vercel.com/dashboard')
      console.log('2. Select your project: brandon-redmond')
      console.log('3. Go to Settings → Environment Variables')
      console.log('4. Add these variables:')
      console.log('   - RESEND_API_KEY: [YOUR_RESEND_API_KEY]')
      console.log('   - CONTACT_EMAIL: bredmond1019@gmail.com')
      console.log('   - RESEND_FROM_EMAIL: onboarding@resend.dev')
      console.log('5. Redeploy your project')
      return
    }
  } catch (error) {
    console.error('Failed to check email health:', error)
  }
  
  // Test 2: Try sending a test email through contact form
  console.log('\n2️⃣ Testing contact form submission...')
  try {
    const contactResponse = await fetch(`${PROD_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Production Test',
        email: 'test@example.com',
        reason: 'Testing production email',
        message: 'This is a test message from the verification script.',
        honeypot: '',
        pageLoadTime: Date.now() - 10000, // 10 seconds ago
      })
    })
    
    const contactResult = await contactResponse.json()
    console.log('Contact Form Response:')
    console.log(JSON.stringify(contactResult, null, 2))
    
    if (contactResponse.ok) {
      console.log('\n✅ Contact form is working in production!')
    } else {
      console.error('\n❌ Contact form failed:', contactResult.error)
    }
  } catch (error) {
    console.error('Failed to test contact form:', error)
  }
  
  console.log('\n📌 Next Steps:')
  console.log('1. Check Vercel dashboard for environment variables')
  console.log('2. View function logs at: https://vercel.com/brandon-redmond/brandon-redmond/functions')
  console.log('3. Look for logs with [EMAIL ERROR] or [EMAIL DEBUG] prefixes')
}

verifyProductionEnv().catch(console.error)