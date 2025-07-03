#!/usr/bin/env tsx
/**
 * Test email functionality locally
 */

import { sendContactFormEmails } from '../lib/email'

async function testLocalEmail() {
  console.log('🧪 Testing Email Service Locally\n')
  
  console.log('Environment:')
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`)
  console.log(`- RESEND_API_KEY: ${process.env.RESEND_API_KEY?.slice(0, 10)}...${process.env.RESEND_API_KEY?.slice(-4)}`)
  console.log(`- CONTACT_EMAIL: ${process.env.CONTACT_EMAIL}`)
  console.log(`- RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL}\n`)
  
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    reason: 'Testing Email Service',
    message: 'This is a test of the email service with the new API key.',
  }
  
  console.log('Sending test email with data:')
  console.log(JSON.stringify(testData, null, 2))
  console.log('')
  
  try {
    const result = await sendContactFormEmails(testData)
    
    if (result.success) {
      console.log('✅ Email sent successfully!')
      console.log('Check your inbox at:', process.env.CONTACT_EMAIL)
    } else {
      console.log('❌ Email failed to send')
      console.log('Error:', result.error)
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.development.local' })

testLocalEmail()