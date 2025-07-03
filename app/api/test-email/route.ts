import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(request: NextRequest) {
  // Check if this is a test request with proper authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.RESEND_API_KEY?.slice(-10)}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const diagnostics = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    emailConfig: {
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 10) + '...',
      contactEmail: process.env.CONTACT_EMAIL,
      fromEmail: process.env.RESEND_FROM_EMAIL,
      defaultFrom: process.env.RESEND_FROM_EMAIL || 'Brandon Redmond <bredmond1019@gmail.com>',
    },
    testResults: {
      domainVerification: null as any,
      apiKeyValidation: null as any,
      sendTest: null as any,
    }
  }

  try {
    // Test 1: Validate API key
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      try {
        // Try to get domains to validate API key
        const domains = await resend.domains.list()
        diagnostics.testResults.apiKeyValidation = {
          success: true,
          domainCount: domains.data?.data?.length || 0,
          domains: domains.data?.data?.map((d: any) => ({
            name: d.name,
            status: d.status,
            region: d.region,
          })) || []
        }
      } catch (error: any) {
        diagnostics.testResults.apiKeyValidation = {
          success: false,
          error: error.message || 'Failed to validate API key',
          statusCode: error.statusCode,
        }
      }

      // Test 2: Try different from addresses
      const fromAddresses = [
        process.env.RESEND_FROM_EMAIL,
        'onboarding@resend.dev', // Resend's test address
        'Brandon Redmond <bredmond1019@gmail.com>',
        'noreply@learn-agentic-ai.com', // Your domain
      ].filter(Boolean)

      for (const from of fromAddresses) {
        try {
          const result = await resend.emails.send({
            from: from!,
            to: process.env.CONTACT_EMAIL || 'bredmond1019@gmail.com',
            subject: `Production Email Test - ${new Date().toISOString()}`,
            html: `
              <h1>Production Email Test</h1>
              <p>This is a test email from your production environment.</p>
              <p><strong>From:</strong> ${from}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
            `,
          })

          diagnostics.testResults.sendTest = {
            success: true,
            from,
            result: {
              id: (result as any)?.data?.id || (result as any)?.id,
              ...result
            }
          }
          break // Stop on first success
        } catch (error: any) {
          if (!diagnostics.testResults.sendTest) {
            diagnostics.testResults.sendTest = {
              success: false,
              attempts: []
            }
          }
          diagnostics.testResults.sendTest.attempts.push({
            from,
            error: error.message,
            statusCode: error.statusCode,
            name: error.name,
          })
        }
      }
    }
  } catch (error: any) {
    diagnostics.testResults.apiKeyValidation = {
      success: false,
      error: error.message || 'Unexpected error',
    }
  }

  return NextResponse.json(diagnostics, { status: 200 })
}

export async function POST(request: NextRequest) {
  // Simple test email endpoint
  try {
    const { to, testFrom } = await request.json()
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 500 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const from = testFrom || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    
    const result = await resend.emails.send({
      from,
      to: to || process.env.CONTACT_EMAIL || 'bredmond1019@gmail.com',
      subject: `Test Email - ${new Date().toLocaleString()}`,
      html: `
        <h1>Test Email</h1>
        <p>This is a test email sent at ${new Date().toLocaleString()}</p>
        <p>From: ${from}</p>
        <p>Environment: ${process.env.NODE_ENV}</p>
      `,
    })

    return NextResponse.json({
      success: true,
      result,
      from,
      to: to || process.env.CONTACT_EMAIL,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      name: error.name,
    }, { status: 500 })
  }
}