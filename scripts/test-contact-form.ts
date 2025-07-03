#!/usr/bin/env tsx
/**
 * Test the contact form API directly
 */

async function testContactForm() {
  // Try different production URLs
  const urls = [
    'https://www.learn-agentic-ai.com',
    'https://learn-agentic-ai.com',
    process.env.NEXT_PUBLIC_APP_URL
  ].filter(Boolean)

  for (const baseUrl of urls) {
    console.log(`\n🧪 Testing contact form at: ${baseUrl}\n`)
    
    try {
      // Test 1: Basic submission
      console.log('1️⃣ Testing basic contact form submission...')
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          reason: 'Testing Production',
          message: 'This is a test message from the debugging script.',
          honeypot: '', // Empty honeypot (not a bot)
          pageLoadTime: Date.now() - 15000, // 15 seconds ago
        })
      })

      const result = await response.text()
      console.log(`Status: ${response.status}`)
      console.log(`Response: ${result}`)
      
      if (response.ok) {
        console.log('✅ Contact form is working!')
        return
      }

      // Test 2: Check what specific validation might be failing
      console.log('\n2️⃣ Testing with minimal data...')
      const minimalResponse = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test',
          email: 'test@test.com',
          reason: 'Test',
          message: 'Test message'
        })
      })

      const minimalResult = await minimalResponse.text()
      console.log(`Minimal test status: ${minimalResponse.status}`)
      console.log(`Minimal test response: ${minimalResult}`)

      // Test 3: Check if it's rate limiting
      console.log('\n3️⃣ Checking rate limit headers...')
      console.log('Rate limit headers:', {
        'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
        'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-reset': response.headers.get('x-ratelimit-reset'),
      })

    } catch (error) {
      console.error('❌ Error testing contact form:', error)
    }
  }
}

// Also test the email health endpoint
async function testEmailHealth() {
  console.log('\n📧 Testing email health endpoint...\n')
  
  const urls = [
    'https://www.learn-agentic-ai.com',
    'https://learn-agentic-ai.com',
  ]

  for (const baseUrl of urls) {
    try {
      const response = await fetch(`${baseUrl}/api/email-health`)
      if (response.ok) {
        const data = await response.json()
        console.log(`Email health at ${baseUrl}:`)
        console.log(JSON.stringify(data, null, 2))
        break
      }
    } catch (error) {
      // Continue to next URL
    }
  }
}

async function main() {
  console.log('🚀 Contact Form Production Test\n')
  
  await testEmailHealth()
  await testContactForm()
  
  console.log('\n💡 Debugging tips:')
  console.log('1. Check Vercel function logs at: https://vercel.com/dashboard/[project]/functions')
  console.log('2. Look for [EMAIL ERROR] or [EMAIL DEBUG] messages')
  console.log('3. Verify rate limiting is not blocking requests')
  console.log('4. Check if spam protection is too aggressive')
}

main().catch(console.error)