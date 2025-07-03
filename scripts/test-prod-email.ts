#!/usr/bin/env tsx
/**
 * Test production email setup with the new API key
 */

async function testProductionEmail() {
  const urls = [
    'https://www.learn-agentic-ai.com',
    'https://learn-agentic-ai.com',
  ]
  
  console.log('🔍 Testing Production Email Setup\n')
  console.log('This will test your new Resend API key configuration.\n')
  
  let workingUrl = ''
  
  // Find the working URL
  for (const url of urls) {
    try {
      console.log(`Testing ${url}...`)
      const response = await fetch(`${url}/api/email-health`)
      if (response.ok) {
        workingUrl = url
        const data = await response.json()
        console.log('\n✅ Email Health Check Response:')
        console.log(JSON.stringify(data, null, 2))
        
        // Check if API key is configured
        if (!data.config?.hasResendApiKey) {
          console.error('\n❌ RESEND_API_KEY is not detected in production!')
          console.log('\nTroubleshooting steps:')
          console.log('1. Verify the environment variable is set in Vercel')
          console.log('2. Check that you redeployed after adding the new key')
          console.log('3. Make sure the variable name is exactly: RESEND_API_KEY')
          return
        }
        
        console.log('\n✅ API key is detected!')
        break
      }
    } catch (error) {
      // Continue to next URL
    }
  }
  
  if (!workingUrl) {
    console.error('❌ Could not connect to any production URL')
    return
  }
  
  // Test the contact form with different scenarios
  console.log('\n📧 Testing Contact Form Scenarios...\n')
  
  const testCases = [
    {
      name: 'Valid submission',
      data: {
        name: 'Test User',
        email: 'test@example.com',
        reason: 'Testing New API Key',
        message: 'This is a test of the new Resend API key configuration.',
        honeypot: '',
        pageLoadTime: Date.now() - 20000, // 20 seconds ago
      }
    },
    {
      name: 'Minimal fields',
      data: {
        name: 'Min Test',
        email: 'min@test.com',
        reason: 'Quick Test',
        message: 'Testing minimal fields',
      }
    },
    {
      name: 'Without timing fields',
      data: {
        name: 'No Timing Test',
        email: 'timing@test.com',
        reason: 'Testing without spam fields',
        message: 'This tests without honeypot or timing',
        honeypot: '',
      }
    }
  ]
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Test: ${testCase.name}`)
    console.log('Request data:', JSON.stringify(testCase.data, null, 2))
    
    try {
      const response = await fetch(`${workingUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ProductionTest/1.0'
        },
        body: JSON.stringify(testCase.data)
      })
      
      const responseText = await response.text()
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = responseText
      }
      
      console.log(`Status: ${response.status}`)
      console.log('Response:', responseData)
      
      // Check headers
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        if (key.startsWith('x-ratelimit') || key === 'content-type') {
          headers[key] = value
        }
      })
      console.log('Headers:', headers)
      
      if (response.ok) {
        console.log('✅ Test passed!')
      } else {
        console.log('❌ Test failed!')
        
        // Provide specific troubleshooting
        if (response.status === 500) {
          console.log('\n🔍 500 Error Troubleshooting:')
          console.log('1. Check Vercel Function Logs:')
          console.log('   https://vercel.com/dashboard/[your-project]/functions')
          console.log('2. Look for [EMAIL ERROR] messages')
          console.log('3. Common issues:')
          console.log('   - API key not properly set')
          console.log('   - Wrong "from" email address')
          console.log('   - Rate limiting from Resend')
        }
      }
      
      // Don't spam the API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('❌ Request failed:', error)
    }
  }
  
  console.log('\n\n📋 Summary & Next Steps:')
  console.log('1. If all tests show 500 errors, check your Vercel logs')
  console.log('2. Verify in Vercel dashboard:')
  console.log('   - Environment variable RESEND_API_KEY is set')
  console.log('   - It\'s set for "Production" environment')
  console.log('   - You\'ve redeployed after adding it')
  console.log('3. Check your Resend dashboard:')
  console.log('   - The new API key is active')
  console.log('   - You have remaining quota')
  console.log('4. Try the test-email endpoint directly:')
  console.log(`   curl -X POST ${workingUrl}/api/test-email \\`)
  console.log('     -H "Content-Type: application/json" \\')
  console.log('     -d \'{"to": "your-email@example.com"}\'')
}

testProductionEmail().catch(console.error)