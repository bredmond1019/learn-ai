#!/usr/bin/env tsx

/**
 * Email Testing Utility
 * 
 * This script provides utilities for testing email functionality manually
 * and verifying email delivery in production.
 * 
 * Usage:
 *   npx tsx scripts/test-email.ts send-test
 *   npx tsx scripts/test-email.ts send-contact-form
 *   npx tsx scripts/test-email.ts send-to-all
 */

import { program } from 'commander'
import { sendEmail, sendContactFormEmails, ContactFormData } from '../lib/services/email/email'

// Test email addresses
const TEST_EMAILS = [
  'bredmond1019@gmail.com',
  'bj.redmond19@gmail.com',
  'brandon@gethealthie.com'
]

// Configure commander
program
  .name('test-email')
  .description('Email testing utilities for production verification')
  .version('1.0.0')

program
  .command('send-test')
  .description('Send a simple test email')
  .option('-t, --to <email>', 'Email address to send to', 'bredmond1019@gmail.com')
  .action(async (options) => {
    console.log('🚀 Sending test email...')
    
    const result = await sendEmail({
      to: options.to,
      subject: `Email Test - ${new Date().toISOString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #007bff;">Email Service Test</h1>
          <p>This is a test email to verify the email service is working correctly.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Test Details:</h3>
            <ul>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
              <li><strong>Recipient:</strong> ${options.to}</li>
              <li><strong>API Key:</strong> ${process.env.RESEND_API_KEY ? 'Configured' : 'Missing'}</li>
            </ul>
          </div>
          <p>If you received this email, the email service is working correctly! 🎉</p>
        </div>
      `,
      text: `Email Service Test

This is a test email to verify the email service is working correctly.

Test Details:
- Timestamp: ${new Date().toISOString()}
- Environment: ${process.env.NODE_ENV || 'development'}
- Recipient: ${options.to}
- API Key: ${process.env.RESEND_API_KEY ? 'Configured' : 'Missing'}

If you received this email, the email service is working correctly!`
    })

    if (result.success) {
      console.log('✅ Test email sent successfully!')
      console.log(`📧 Email sent to: ${options.to}`)
    } else {
      console.error('❌ Failed to send test email:')
      console.error(result.error)
      process.exit(1)
    }
  })

program
  .command('send-contact-form')
  .description('Send a test contact form submission')
  .option('-e, --email <email>', 'Email address for the contact form', 'bredmond1019@gmail.com')
  .option('-n, --name <name>', 'Name for the contact form', 'Test User')
  .option('-r, --reason <reason>', 'Reason for contact', 'Email Testing')
  .action(async (options) => {
    console.log('🚀 Sending contact form test...')
    
    const contactData: ContactFormData = {
      name: options.name,
      email: options.email,
      reason: options.reason,
      message: `This is a test contact form submission sent at ${new Date().toISOString()}.

This test verifies that both admin notification and user confirmation emails are working correctly.

Test Details:
- Environment: ${process.env.NODE_ENV || 'development'}
- API Key Status: ${process.env.RESEND_API_KEY ? 'Configured' : 'Missing'}
- Admin Email: ${process.env.CONTACT_EMAIL || 'bredmond1019@gmail.com'}

Please ignore this test message.`
    }

    const result = await sendContactFormEmails(contactData)

    if (result.success) {
      console.log('✅ Contact form emails sent successfully!')
      console.log(`📧 Admin notification sent to: ${process.env.CONTACT_EMAIL || 'bredmond1019@gmail.com'}`)
      console.log(`📧 User confirmation sent to: ${options.email}`)
    } else {
      console.error('❌ Failed to send contact form emails:')
      console.error(result.error)
      process.exit(1)
    }
  })

program
  .command('send-to-all')
  .description('Send test emails to all configured test addresses')
  .action(async () => {
    console.log('🚀 Sending test emails to all addresses...')
    
    let successCount = 0
    let errorCount = 0

    for (const email of TEST_EMAILS) {
      console.log(`\n📧 Sending to ${email}...`)
      
      const result = await sendEmail({
        to: email,
        subject: `Multi-Address Email Test - ${new Date().toISOString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #28a745;">Multi-Address Email Test</h1>
            <p>This email was sent as part of a multi-address test to verify email delivery across different providers.</p>
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Test Information:</h3>
              <ul>
                <li><strong>Recipient:</strong> ${email}</li>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                <li><strong>Test Type:</strong> Multi-address verification</li>
              </ul>
            </div>
            <p>If you received this email, delivery to ${email} is working! ✅</p>
          </div>
        `
      })

      if (result.success) {
        console.log(`✅ Success: ${email}`)
        successCount++
      } else {
        console.log(`❌ Failed: ${email} - ${result.error}`)
        errorCount++
      }

      // Wait between emails to avoid rate limiting
      if (email !== TEST_EMAILS[TEST_EMAILS.length - 1]) {
        console.log('⏳ Waiting 2 seconds to avoid rate limiting...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log('\n📊 Results:')
    console.log(`✅ Successful: ${successCount}`)
    console.log(`❌ Failed: ${errorCount}`)
    console.log(`📈 Success Rate: ${(successCount / TEST_EMAILS.length * 100).toFixed(1)}%`)

    if (errorCount > 0) {
      process.exit(1)
    }
  })

program
  .command('verify-config')
  .description('Verify email configuration and environment variables')
  .action(() => {
    console.log('🔍 Verifying email configuration...\n')
    
    const checks = [
      {
        name: 'RESEND_API_KEY',
        value: process.env.RESEND_API_KEY,
        required: true,
        display: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 8)}...` : 'Missing'
      },
      {
        name: 'CONTACT_EMAIL',
        value: process.env.CONTACT_EMAIL,
        required: false,
        display: process.env.CONTACT_EMAIL || 'Using default: bredmond1019@gmail.com'
      },
      {
        name: 'RESEND_FROM_EMAIL',
        value: process.env.RESEND_FROM_EMAIL,
        required: false,
        display: process.env.RESEND_FROM_EMAIL || 'Using default: Brandon Redmond <onboarding@resend.dev>'
      },
      {
        name: 'NODE_ENV',
        value: process.env.NODE_ENV,
        required: false,
        display: process.env.NODE_ENV || 'development'
      }
    ]

    let allGood = true

    checks.forEach(check => {
      const status = check.required && !check.value ? '❌' : '✅'
      console.log(`${status} ${check.name}: ${check.display}`)
      
      if (check.required && !check.value) {
        allGood = false
      }
    })

    console.log('\n📧 Test Email Addresses:')
    TEST_EMAILS.forEach(email => {
      console.log(`   • ${email}`)
    })

    if (allGood) {
      console.log('\n✅ All required configuration is present!')
    } else {
      console.log('\n❌ Missing required configuration!')
      process.exit(1)
    }
  })

program
  .command('stress-test')
  .description('Send multiple emails to test rate limiting and reliability')
  .option('-c, --count <number>', 'Number of emails to send', '5')
  .option('-d, --delay <number>', 'Delay between emails in seconds', '3')
  .action(async (options) => {
    const count = parseInt(options.count)
    const delay = parseInt(options.delay) * 1000

    console.log(`🚀 Starting stress test: ${count} emails with ${delay/1000}s delay...`)
    
    let successCount = 0
    let errorCount = 0

    for (let i = 1; i <= count; i++) {
      console.log(`\n📧 Sending email ${i}/${count}...`)
      
      const result = await sendEmail({
        to: 'bredmond1019@gmail.com',
        subject: `Stress Test Email #${i} - ${new Date().toISOString()}`,
        html: `
          <h1>Stress Test Email #${i}</h1>
          <p>This is email ${i} of ${count} in the stress test.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        `
      })

      if (result.success) {
        console.log(`✅ Email ${i} sent successfully`)
        successCount++
      } else {
        console.log(`❌ Email ${i} failed: ${result.error}`)
        errorCount++
      }

      // Wait between emails except for the last one
      if (i < count) {
        console.log(`⏳ Waiting ${delay/1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    console.log('\n📊 Stress Test Results:')
    console.log(`✅ Successful: ${successCount}`)
    console.log(`❌ Failed: ${errorCount}`)
    console.log(`📈 Success Rate: ${(successCount / count * 100).toFixed(1)}%`)

    if (errorCount > 0) {
      process.exit(1)
    }
  })

// Parse command line arguments
program.parse()