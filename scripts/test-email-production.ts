#!/usr/bin/env tsx
/**
 * Test email configuration in production
 * Usage: npx tsx scripts/test-email-production.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load production environment
config({ path: resolve(process.cwd(), '.env.production') })

const API_KEY = process.env.RESEND_API_KEY
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://brandon-redmond.vercel.app'

async function testEmailDiagnostics() {
  console.log('🔍 Testing email configuration in production...\n')
  
  if (!API_KEY) {
    console.error('❌ No RESEND_API_KEY found in .env.production')
    return
  }

  console.log('📧 Email Configuration:')
  console.log(`   API Key: ${API_KEY.slice(0, 10)}...${API_KEY.slice(-4)}`)
  console.log(`   Contact Email: ${process.env.CONTACT_EMAIL}`)
  console.log(`   From Email: ${process.env.RESEND_FROM_EMAIL}`)
  console.log(`   Base URL: ${BASE_URL}\n`)

  // Test the diagnostic endpoint
  console.log('🧪 Running diagnostics...')
  try {
    const diagResponse = await fetch(`${BASE_URL}/api/test-email`, {
      headers: {
        'Authorization': `Bearer ${API_KEY.slice(-10)}`
      }
    })

    if (!diagResponse.ok) {
      console.error(`❌ Diagnostic endpoint returned ${diagResponse.status}`)
      const text = await diagResponse.text()
      console.error('Response:', text)
      return
    }

    const diagnostics = await diagResponse.json()
    console.log('\n📊 Diagnostic Results:')
    console.log(JSON.stringify(diagnostics, null, 2))

    // Test sending an email
    console.log('\n📮 Testing email send...')
    const sendResponse = await fetch(`${BASE_URL}/api/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: process.env.CONTACT_EMAIL,
        testFrom: 'onboarding@resend.dev' // Use Resend's test domain
      })
    })

    const sendResult = await sendResponse.json()
    console.log('\n📬 Send Result:')
    console.log(JSON.stringify(sendResult, null, 2))

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Test using the Resend API directly
async function testResendDirectly() {
  console.log('\n🔧 Testing Resend API directly...')
  
  try {
    // Test different from addresses
    const fromAddresses = [
      'onboarding@resend.dev',
      process.env.RESEND_FROM_EMAIL,
      'Brandon Redmond <onboarding@resend.dev>',
    ].filter(Boolean)

    for (const from of fromAddresses) {
      console.log(`\n📤 Testing with from: ${from}`)
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: from,
          to: process.env.CONTACT_EMAIL || 'bredmond1019@gmail.com',
          subject: `Production Test - ${new Date().toISOString()}`,
          html: `<p>Test email from production environment. From: ${from}</p>`,
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        console.log(`✅ Success! Email ID: ${result.id}`)
        console.log('Full response:', JSON.stringify(result, null, 2))
        break
      } else {
        console.log(`❌ Failed: ${response.status}`)
        console.log('Error:', JSON.stringify(result, null, 2))
      }
    }

    // Get domain information
    console.log('\n🌐 Checking domains...')
    const domainsResponse = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      }
    })

    if (domainsResponse.ok) {
      const domains = await domainsResponse.json()
      console.log('Domains:', JSON.stringify(domains, null, 2))
    } else {
      console.log('Failed to get domains:', domainsResponse.status)
    }

  } catch (error) {
    console.error('❌ Direct API Error:', error)
  }
}

// Main execution
async function main() {
  console.log('🚀 Email Production Test Suite\n')
  
  // First test the production endpoints
  await testEmailDiagnostics()
  
  // Then test Resend API directly
  await testResendDirectly()
  
  console.log('\n✨ Test complete!')
  console.log('\n💡 Recommendations:')
  console.log('1. If using a custom domain, verify it in Resend dashboard')
  console.log('2. Use "onboarding@resend.dev" for testing')
  console.log('3. Check Vercel environment variables match .env.production')
  console.log('4. Ensure RESEND_API_KEY is added to Vercel project settings')
}

main().catch(console.error)