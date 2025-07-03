import { Resend } from 'resend'

// Lazy initialization of Resend client to ensure env vars are loaded
let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    console.log('[EMAIL INIT] Creating Resend client with API key:', {
      apiKeyPrefix: process.env.RESEND_API_KEY.slice(0, 10) + '...',
      nodeEnv: process.env.NODE_ENV
    })
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

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

  // Validate required environment variables
  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'test') {
    console.error('[EMAIL ERROR] RESEND_API_KEY is not configured in environment variables', {
      nodeEnv: process.env.NODE_ENV,
      hasKey: !!process.env.RESEND_API_KEY,
      vercel: process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('RESEND') || k.includes('CONTACT') || k.includes('EMAIL'))
    })
    return { success: false, error: 'Email service not configured' }
  }
  
  // Get resend client (lazy initialization)
  const resendClient = getResendClient()
  
  if (!resendClient) {
    console.error('[EMAIL ERROR] No Resend client available - API key missing', {
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV
    })
    return { success: false, error: 'Email service not configured' }
  }

  // Set default from address - use a proper verified domain or fallback that won't fail
  const from = options.from || process.env.RESEND_FROM_EMAIL || 'Brandon Redmond <bredmond1019@gmail.com>'

  // Enhanced logging for production debugging
  console.log('[EMAIL DEBUG] Attempting to send email:', {
    from,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    hasHtml: !!options.html,
    hasText: !!options.text,
    replyTo: options.replyTo,
    environment: process.env.NODE_ENV,
    hasApiKey: !!process.env.RESEND_API_KEY,
    fromEnvVar: !!process.env.RESEND_FROM_EMAIL
  })

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
      console.error('[EMAIL ERROR] Resend API returned error:', {
        error: result.error,
        from,
        to: options.to,
        subject: options.subject
      })
      return { success: false, error: result.error.message || 'Failed to send email' }
    }

    console.log('[EMAIL SUCCESS] Email sent successfully:', {
      id: (result as any)?.data?.id || (result as any)?.id || 'unknown',
      from,
      to: options.to,
      subject: options.subject
    })
    return { success: true }
  } catch (error) {
    console.error('[EMAIL ERROR] Exception during email sending:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      from,
      to: options.to,
      subject: options.subject,
      errorType: error?.constructor?.name || typeof error
    })
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
      console.error('[EMAIL ERROR] Failed to send admin notification:', {
        error: adminResult.error,
        to: adminEmail,
        contactData: { name: data.name, email: data.email, reason: data.reason }
      })
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
      console.error('[EMAIL ERROR] Failed to send user confirmation:', {
        error: userResult.error,
        to: data.email,
        contactData: { name: data.name, email: data.email, reason: data.reason }
      })
      // Still return success since admin notification was sent
    }

    return { success: true }
  } catch (error) {
    console.error('[EMAIL ERROR] Exception in sendContactFormEmails:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      contactData: { name: data.name, email: data.email, reason: data.reason },
      adminEmail,
      errorType: error?.constructor?.name || typeof error
    })
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send emails' 
    }
  }
}