// Mock Resend before importing the email module
jest.mock('resend')

import { sendEmail, sendContactFormEmails, emailTemplates, ContactFormData } from './email'
// @ts-expect-error - accessing mock from manual mock
import { mockSend } from 'resend'

describe('Email Service', () => {
  const mockContactData: ContactFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    reason: 'Project Inquiry',
    message: 'I would like to discuss a potential project.'
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Set up environment variables
    process.env.RESEND_API_KEY = 'test-api-key'
    process.env.CONTACT_EMAIL = 'admin@example.com'
    process.env.RESEND_FROM_EMAIL = 'noreply@example.com'
  })

  afterEach(() => {
    // Clean up environment variables
    delete process.env.RESEND_API_KEY
    delete process.env.CONTACT_EMAIL
    delete process.env.RESEND_FROM_EMAIL
  })

  describe('emailTemplates', () => {
    it('should generate admin notification template with correct data', () => {
      const template = emailTemplates.adminNotification(mockContactData)
      
      expect(template.subject).toBe('New Contact Form Submission: Project Inquiry')
      expect(template.html).toContain('John Doe')
      expect(template.html).toContain('john@example.com')
      expect(template.html).toContain('Project Inquiry')
      expect(template.html).toContain('I would like to discuss a potential project.')
      expect(template.text).toContain('Name: John Doe')
      expect(template.text).toContain('Email: john@example.com')
    })

    it('should generate user confirmation template with correct data', () => {
      const template = emailTemplates.userConfirmation(mockContactData)
      
      expect(template.subject).toBe('Thank you for contacting me')
      expect(template.html).toContain('Hi John Doe')
      expect(template.html).toContain('Project Inquiry')
      expect(template.html).toContain('I would like to discuss a potential project.')
      expect(template.text).toContain('Hi John Doe')
      expect(template.text).toContain('Reason: Project Inquiry')
    })
  })

  describe('sendEmail', () => {
    it('should validate required fields', async () => {
      const result = await sendEmail({ to: '', subject: '', html: '' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Missing required email fields')
    })

    it('should check for API key configuration', async () => {
      // Temporarily set NODE_ENV to production to test API key validation
      const originalNodeEnv = process.env.NODE_ENV
      const originalApiKey = process.env.RESEND_API_KEY
      
      process.env.NODE_ENV = 'production'
      delete process.env.RESEND_API_KEY
      
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })
      
      // Restore environment
      process.env.NODE_ENV = originalNodeEnv
      process.env.RESEND_API_KEY = originalApiKey
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Email service not configured')
    })

    it('should successfully send email with valid data', async () => {
      // Mock successful response
      mockSend.mockResolvedValue({ id: 'email-123' })

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content',
        replyTo: 'reply@example.com'
      })

      expect(mockSend).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        replyTo: 'reply@example.com'
      })
      expect(result.success).toBe(true)
    })

    it('should handle Resend API errors', async () => {
      mockSend.mockResolvedValue({
        error: { message: 'Invalid API key' }
      })

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid API key')
    })

    it('should handle unexpected errors', async () => {
      mockSend.mockRejectedValue(new Error('Network error'))

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('sendContactFormEmails', () => {
    it('should send both admin and user emails successfully', async () => {
      mockSend
        .mockResolvedValueOnce({ id: 'admin-email' })
        .mockResolvedValueOnce({ id: 'user-email' })

      const result = await sendContactFormEmails(mockContactData)

      expect(mockSend).toHaveBeenCalledTimes(2)
      expect(result.success).toBe(true)
      
      // Check admin email
      const adminCall = mockSend.mock.calls[0][0]
      expect(adminCall.to).toBe('admin@example.com')
      expect(adminCall.replyTo).toBe('john@example.com')
      expect(adminCall.subject).toContain('New Contact Form Submission')
      
      // Check user email
      const userCall = mockSend.mock.calls[1][0]
      expect(userCall.to).toBe('john@example.com')
      expect(userCall.replyTo).toBe('admin@example.com')
      expect(userCall.subject).toBe('Thank you for contacting me')
    })

    it('should return error if admin email fails', async () => {
      mockSend.mockResolvedValue({
        error: { message: 'Failed to send' }
      })

      const result = await sendContactFormEmails(mockContactData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to send')
      expect(mockSend).toHaveBeenCalledTimes(1) // Only tried admin email
    })

    it('should still return success if user confirmation fails', async () => {
      mockSend
        .mockResolvedValueOnce({ id: 'admin-email' })
        .mockResolvedValueOnce({ error: { message: 'User email failed' } })

      const result = await sendContactFormEmails(mockContactData)

      expect(mockSend).toHaveBeenCalledTimes(2)
      expect(result.success).toBe(true) // Still success since admin email was sent
    })

    it('should use default email if CONTACT_EMAIL not set', async () => {
      delete process.env.CONTACT_EMAIL
      
      mockSend
        .mockResolvedValueOnce({ id: 'admin-email' })
        .mockResolvedValueOnce({ id: 'user-email' })

      await sendContactFormEmails(mockContactData)

      const adminCall = mockSend.mock.calls[0][0]
      expect(adminCall.to).toBe('bredmond1019@gmail.com')
    })
  })
})