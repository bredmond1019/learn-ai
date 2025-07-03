import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      hasResendApiKey: !!process.env.RESEND_API_KEY,
      resendApiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      contactEmail: process.env.CONTACT_EMAIL || 'not set',
      resendFromEmail: process.env.RESEND_FROM_EMAIL || 'not set',
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL || 'false',
    }
  })
}