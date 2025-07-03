#!/usr/bin/env tsx
/**
 * Test Resend API key directly
 * This helps verify if the key works outside of your app
 */

console.log('🔍 Direct Resend API Test\n')
console.log('This script will help you test your API key locally.\n')

const API_KEY = process.env.RESEND_API_KEY || ''

if (!API_KEY) {
  console.log('📝 Instructions:')
  console.log('1. Copy your new API key from Resend dashboard')
  console.log('2. Run this command with your key:')
  console.log('   RESEND_API_KEY="your-key-here" npx tsx scripts/test-resend-direct.ts')
  console.log('\nExample:')
  console.log('   RESEND_API_KEY="re_abc123..." npx tsx scripts/test-resend-direct.ts')
  process.exit(1)
}

console.log(`Testing API key: ${API_KEY.slice(0, 10)}...${API_KEY.slice(-4)}`)
console.log(`Key length: ${API_KEY.length} characters\n`)

async function testResendAPI() {
  console.log('1️⃣ Testing API key validation...')
  
  try {
    // Test 1: Validate the API key
    const response = await fetch('https://api.resend.com/api-keys', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      }
    })
    
    console.log(`Response status: ${response.status}`)
    
    if (response.status === 401) {
      console.log('❌ API key is invalid!')
      console.log('\nPossible issues:')
      console.log('- Wrong API key')
      console.log('- Key was revoked')
      console.log('- Extra spaces in the key')
      console.log('- Old key instead of new one')
      return
    }
    
    if (response.ok) {
      console.log('✅ API key is valid!')
      const data = await response.json()
      console.log(`Found ${data.data?.length || 0} API keys in your account`)
    }
    
    // Test 2: Try sending an email
    console.log('\n2️⃣ Testing email sending...')
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'bredmond1019@gmail.com',
        subject: 'Test from Direct API Script',
        html: '<p>This is a test email sent directly via Resend API.</p>',
      })
    })
    
    const emailResult = await emailResponse.json()
    
    if (emailResponse.ok) {
      console.log('✅ Email sent successfully!')
      console.log(`Email ID: ${emailResult.id}`)
      console.log('\n🎉 Your API key is working correctly!')
      console.log('\nNext steps:')
      console.log('1. Make sure this exact key is in Vercel')
      console.log('2. Redeploy your application')
      console.log('3. Wait for deployment to complete')
    } else {
      console.log('❌ Email failed to send')
      console.log('Error:', emailResult)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testResendAPI()