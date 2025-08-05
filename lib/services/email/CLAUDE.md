# Email Service Documentation

This service handles all email functionality for the portfolio site using the Resend API.

## Overview

The email service provides:
- Contact form email handling
- Dual email templates (admin + user confirmations)
- Spam protection with multiple validation layers
- Rate limiting (5 requests per minute)
- Comprehensive error handling and logging

## Core Components

### `email.ts`
Main email service with Resend API integration.

**Key Functions:**
- `sendEmail()` - Core email sending function with error handling
- `sendContactFormEmails()` - Sends both admin notification and user confirmation
- `emailTemplates` - HTML email template generators

**Configuration:**
```typescript
// Required environment variables
RESEND_API_KEY        // Resend API authentication
RESEND_FROM_EMAIL     // Verified sender (e.g., "Name <noreply@domain.com>")
CONTACT_EMAIL         // Destination for contact form submissions
```

### `spam-protection.ts`
Multi-layer spam detection system.

**Protection Layers:**
1. **Honeypot Field Detection** - Catches bots filling invisible fields
2. **Content Analysis** - Detects spam keywords and patterns
3. **Link/Email Ratio** - Flags excessive links or email addresses
4. **Submission Timing** - Validates human-like form completion speed
5. **Pattern Matching** - Identifies common spam patterns

**Risk Scoring:**
- Low (< 3): Normal submission
- Medium (3-5): Potential spam, may need review
- High (> 5): Likely spam, should be blocked

## Usage Examples

### Sending Contact Form Emails
```typescript
import { sendContactFormEmails } from '@/lib/services/email/email'

const result = await sendContactFormEmails({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Project Inquiry',
  message: 'I would like to discuss a project...',
  timestamp: Date.now()
})

if (!result.success) {
  console.error('Email failed:', result.error)
}
```

### Spam Protection Check
```typescript
import { performSpamChecks } from '@/lib/services/email/spam-protection'

const spamResult = performSpamChecks({
  email: formData.email,
  subject: formData.subject,
  message: formData.message,
  honeypot: formData.honeypot,
  timestamp: formData.timestamp
})

if (!spamResult.isValid) {
  return { error: 'Spam detected', details: spamResult.reasons }
}
```

## Email Templates

The service uses responsive HTML email templates:

### Admin Notification Template
- Clean, professional design
- All form fields displayed
- Timestamp and metadata included
- Reply-to set to sender's email

### User Confirmation Template
- Friendly acknowledgment message
- Confirms receipt of inquiry
- Professional branding
- No-reply notice

## Error Handling

The service implements comprehensive error handling:

```typescript
try {
  const result = await sendEmail(emailData)
} catch (error) {
  // Errors are logged with [EMAIL ERROR] prefix
  // Safe error messages returned to client
  // Detailed errors logged server-side only
}
```

## Testing

### Local Testing
```bash
npm run email:test          # Send test email
npm run email:test-contact  # Test contact form flow
npm run email:verify        # Verify configuration
```

### Integration Tests
Located in `__tests__/integration/email-production.test.ts`

## Common Issues

### Domain Verification
- Ensure `RESEND_FROM_EMAIL` uses a verified domain
- Free email providers (Gmail, etc.) won't work for sender
- Use format: "Name <noreply@yourdomain.com>"

### Rate Limiting
- Service limited to 5 emails per minute
- Implemented via in-memory rate limiter
- Returns 429 status when limit exceeded

### Debugging
- Check Vercel logs for `[EMAIL ERROR]` entries
- Test configuration with `npm run email:test`
- Verify environment variables are set correctly

## Security Considerations

1. **API Key Protection**: Never expose `RESEND_API_KEY` client-side
2. **Input Validation**: All inputs sanitized before processing
3. **Rate Limiting**: Prevents abuse and API quota exhaustion
4. **Error Messages**: Generic errors shown to users, details logged server-side
5. **Spam Protection**: Multiple layers prevent automated abuse