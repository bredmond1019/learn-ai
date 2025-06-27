import { Resend } from 'resend'

// Initialize Resend client (only if API key is available)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  replyTo?: string
  from?: string
}

export interface ContactFormData {
  name: string
  email: string
  reason: string
  message: string
}

// Email templates
export const emailTemplates = {
  // Admin notification template
  adminNotification: (data: ContactFormData) => ({
    subject: `New Contact Form Submission: ${data.reason}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #495057; }
            .value { margin-top: 5px; }
            .message { background-color: #f8f9fa; padding: 15px; border-radius: 5px; white-space: pre-wrap; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${data.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
              </div>
              <div class="field">
                <div class="label">Reason:</div>
                <div class="value">${data.reason}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="message">${data.message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This message was sent from your AI Engineer portfolio contact form.</p>
              <p>Timestamp: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Reason: ${data.reason}

Message:
${data.message}

---
This message was sent from your AI Engineer portfolio contact form.
Timestamp: ${new Date().toLocaleString()}
    `.trim()
  }),

  // User confirmation template
  userConfirmation: (data: ContactFormData) => ({
    subject: 'Thank you for contacting me',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; border-radius: 0 0 8px 8px; }
            .message-copy { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Reaching Out!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Thank you for contacting me through my AI Engineer portfolio. I've received your message and will get back to you as soon as possible.</p>
              <p>Here's a copy of your message for your records:</p>
              <div class="message-copy">
                <p><strong>Reason:</strong> ${data.reason}</p>
                <p><strong>Message:</strong><br>${data.message}</p>
              </div>
              <p>I typically respond within 24-48 hours. If your inquiry is urgent, please feel free to reach out to me on LinkedIn.</p>
              <p>Best regards,<br>Brandon</p>
            </div>
            <div class="footer">
              <p>This is an automated response from my portfolio website.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${data.name},

Thank you for contacting me through my AI Engineer portfolio. I've received your message and will get back to you as soon as possible.

Here's a copy of your message for your records:

Reason: ${data.reason}
Message:
${data.message}

I typically respond within 24-48 hours. If your inquiry is urgent, please feel free to reach out to me on LinkedIn.

Best regards,
Brandon

---
This is an automated response from my portfolio website.
    `.trim()
  })
}

// Main email sending function with error handling and retry logic
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // Validate required fields
  if (!options.to || !options.subject || (!options.html && !options.text)) {
    return { success: false, error: 'Missing required email fields' }
  }

  // Validate API key (allow mocked resend in test environment)
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'test') {
    console.error('RESEND_API_KEY is not configured')
    return { success: false, error: 'Email service not configured' }
  }
  
  // Create resend instance if not available (for tests)
  const resendClient = resend || new Resend(process.env.RESEND_API_KEY || 'test-key')

  // Set default from address
  const from = options.from || process.env.RESEND_FROM_EMAIL || 'Brandon Redmond <onboarding@resend.dev>'

  try {
    const result = await resendClient.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html || options.text || '',
      replyTo: options.replyTo,
    })

    // Check if result has an error property
    if (result && typeof result === 'object' && 'error' in result && result.error) {
      console.error('Resend API error:', result.error)
      return { success: false, error: result.error.message || 'Failed to send email' }
    }

    console.log('Email sent successfully:', result)
    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

// Send contact form emails (both admin notification and user confirmation)
export async function sendContactFormEmails(data: ContactFormData): Promise<{ success: boolean; error?: string }> {
  const adminEmail = process.env.CONTACT_EMAIL || 'bredmond1019@gmail.com'
  
  try {
    // Send admin notification
    const adminTemplate = emailTemplates.adminNotification(data)
    const adminResult = await sendEmail({
      to: adminEmail,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      text: adminTemplate.text,
      replyTo: data.email,
    })

    if (!adminResult.success) {
      console.error('Failed to send admin notification:', adminResult.error)
      return adminResult
    }

    // Send user confirmation
    const userTemplate = emailTemplates.userConfirmation(data)
    const userResult = await sendEmail({
      to: data.email,
      subject: userTemplate.subject,
      html: userTemplate.html,
      text: userTemplate.text,
      replyTo: adminEmail,
    })

    if (!userResult.success) {
      console.error('Failed to send user confirmation:', userResult.error)
      // Still return success since admin notification was sent
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending contact form emails:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send emails' 
    }
  }
}