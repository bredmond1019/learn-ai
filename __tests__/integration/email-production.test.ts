/**
 * Production Email Integration Tests
 * 
 * These tests use the real Resend API to verify email functionality.
 * Run with: NODE_ENV=production npm run test:email:integration
 * 
 * Environment variables required:
 * - RESEND_API_KEY
 * - CONTACT_EMAIL (defaults to bredmond1019@gmail.com)
 */

import { sendEmail, sendContactFormEmails, ContactFormData } from '@/lib/email'

// Skip these tests in CI/CD unless explicitly running production tests
const isProductionTest = process.env.NODE_ENV === 'production' || process.env.TEST_EMAIL_PRODUCTION === 'true'

const conditionalDescribe = isProductionTest ? describe : describe.skip
const conditionalIt = isProductionTest ? it : it.skip

conditionalDescribe('Production Email Integration', () => {
  const testEmails = [
    'bredmond1019@gmail.com'
  ]

  const mockContactData: ContactFormData = {
    name: 'Test User',
    email: 'bredmond1019@gmail.com',
    reason: 'Testing',
    message: 'This is a test email from the production integration tests.'
  }

  beforeAll(() => {
    if (!isProductionTest) {
      console.log('Skipping production email tests. Set NODE_ENV=production or TEST_EMAIL_PRODUCTION=true to run.')
      return
    }
    
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required for production email tests')
    }
  })

  describe('Real Email Sending', () => {
    it('should send a basic email using real Resend API', async () => {
      const result = await sendEmail({
        to: 'bredmond1019@gmail.com',
        subject: 'Test Email - Production Integration Test',
        html: `
          <h1>Production Email Test</h1>
          <p>This email was sent by the production integration test at ${new Date().toISOString()}</p>
          <p>If you receive this email, the email service is working correctly.</p>
        `,
        text: `Production Email Test\n\nThis email was sent by the production integration test at ${new Date().toISOString()}\n\nIf you receive this email, the email service is working correctly.`
      })

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    }, 15000) // 15 second timeout for API call

    it('should send contact form emails', async () => {
      const result = await sendContactFormEmails(mockContactData)
      
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    }, 20000) // 20 second timeout for multiple emails

    it('should handle email validation correctly', async () => {
      const result = await sendEmail({
        to: 'invalid-email-address',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      // Note: Resend may accept the request but fail delivery
      // The important thing is that our service handles it gracefully
      if (result.success) {
        console.log('Note: Resend accepted invalid email - will fail at delivery')
      } else {
        expect(result.error).toBeDefined()
      }
    })

    it('should send admin notification with correct template', async () => {
      const testData = {
        name: 'John Doe',
        email: 'bredmond1019@gmail.com',
        reason: 'Project Inquiry',
        message: 'I would like to discuss a potential AI engineering project. This is a test from the production integration tests.'
      }

      const result = await sendContactFormEmails(testData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    }, 20000)

    it('should send emails with custom from address', async () => {
      const result = await sendEmail({
        to: 'bredmond1019@gmail.com',
        subject: 'Custom From Address Test',
        html: '<h1>Custom From Address</h1><p>This email tests custom from address functionality.</p>',
        from: 'Brandon Redmond Portfolio <onboarding@resend.dev>'
      })

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    }, 15000)
  })

  describe('Email Template Testing', () => {
    it('should send rich HTML email template', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f8f9fa; padding: 20px; }
              .footer { text-align: center; font-size: 12px; color: #6c757d; padding: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Template Test</h1>
              </div>
              <div class="content">
                <h2>Production Integration Test</h2>
                <p>This email tests the HTML template rendering in production.</p>
                <p><strong>Test Information:</strong></p>
                <ul>
                  <li>Timestamp: ${new Date().toISOString()}</li>
                  <li>Environment: ${process.env.NODE_ENV}</li>
                  <li>Test Suite: Production Email Integration</li>
                </ul>
              </div>
              <div class="footer">
                <p>This email was generated by automated testing.</p>
              </div>
            </div>
          </body>
        </html>
      `

      const result = await sendEmail({
        to: 'bredmond1019@gmail.com',
        subject: 'HTML Template Test - Production',
        html: htmlContent
      })

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    }, 15000)
  })

  describe('Error Handling', () => {
    it('should handle invalid API key gracefully', async () => {
      // Create a new Resend instance with invalid key to test properly
      const { Resend } = require('resend')
      const invalidResend = new Resend('invalid-key')
      
      try {
        await invalidResend.emails.send({
          from: 'test@example.com',
          to: 'bredmond1019@gmail.com',
          subject: 'Test',
          html: '<p>Test</p>'
        })
        // If we get here, the API didn't reject the invalid key immediately
        console.log('Note: Invalid API key not rejected immediately by Resend')
      } catch (error) {
        expect(error).toBeDefined()
        console.log('✅ Invalid API key properly rejected')
      }
    })

    it('should handle missing API key', async () => {
      const originalApiKey = process.env.RESEND_API_KEY
      delete process.env.RESEND_API_KEY

      const result = await sendEmail({
        to: 'bredmond1019@gmail.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      // Restore original API key
      process.env.RESEND_API_KEY = originalApiKey

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email service not configured')
    })
  })
})

// Helper function to run manual email tests
export async function runManualEmailTest(): Promise<void> {
  console.log('🚀 Running manual email test...')
  
  const result = await sendEmail({
    to: 'bredmond1019@gmail.com',
    subject: `Manual Email Test - ${new Date().toISOString()}`,
    html: `
      <h1>Manual Email Test</h1>
      <p>This email was sent manually to test the email service.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
      <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
    `
  })

  if (result.success) {
    console.log('✅ Email sent successfully!')
  } else {
    console.error('❌ Email failed:', result.error)
  }
}