import { NextRequest, NextResponse } from 'next/server'
import { sendContactFormEmails } from '@/lib/email'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import { performSpamChecks } from '@/lib/spam-protection'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  return rateLimitMiddleware(request, async () => {
    try {
      const data = await request.json()

      // Validate required fields
      const { name, email, reason, message, honeypot, recaptchaToken, pageLoadTime } = data
      
      if (!name || !email || !reason || !message) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Validate field lengths
      if (name.length > 100 || email.length > 100 || reason.length > 200 || message.length > 5000) {
        return NextResponse.json(
          { error: 'Field length exceeded' },
          { status: 400 }
        )
      }

      // Email validation regex
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        )
      }

      // Perform spam checks
      const spamCheck = await performSpamChecks({
        message,
        honeypot,
        recaptchaToken,
        pageLoadTime
      })

      if (spamCheck.isSpam) {
        console.warn('Spam detected:', spamCheck.reason, { email, name })
        // Return success to avoid revealing spam detection to bots
        return NextResponse.json(
          { message: 'Contact form submitted successfully' },
          { status: 200 }
        )
      }

      // Send emails using the email service
      const emailResult = await sendContactFormEmails({
        name,
        email,
        reason,
        message
      })

      if (!emailResult.success) {
        console.error('Failed to send contact form emails:', emailResult.error)
        
        // Check if it's a configuration issue
        if (emailResult.error === 'Email service not configured') {
          return NextResponse.json(
            { error: 'Email service is not properly configured. Please try again later.' },
            { status: 503 }
          )
        }
        
        return NextResponse.json(
          { error: 'Failed to send email. Please try again later.' },
          { status: 500 }
        )
      }

      // Log successful submission
      console.log('Contact form submitted successfully:', {
        name,
        email,
        reason,
        timestamp: new Date().toISOString()
      })

      // Return success response
      return NextResponse.json(
        { message: 'Thank you for your message! I\'ll get back to you soon.' },
        { status: 200 }
      )
    } catch (error) {
      console.error('Contact form error:', error)
      
      // Check for JSON parsing errors
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid request format' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'An unexpected error occurred. Please try again later.' },
        { status: 500 }
      )
    }
  })
}