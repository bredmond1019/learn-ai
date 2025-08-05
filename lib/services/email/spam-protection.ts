// Spam protection utilities

export interface SpamCheckResult {
  isSpam: boolean
  reason?: string
}

// Check for honeypot field (a hidden field that bots might fill out)
export function checkHoneypot(honeypotValue: string | undefined): SpamCheckResult {
  if (honeypotValue && honeypotValue.trim() !== '') {
    return {
      isSpam: true,
      reason: 'Honeypot field was filled'
    }
  }
  return { isSpam: false }
}

// Check for suspicious patterns in the message
export function checkMessagePatterns(message: string): SpamCheckResult {
  const spamPatterns = [
    // Common spam phrases
    /\b(viagra|cialis|pharmacy|casino|lottery|winner|congratulations)\b/i,
    // Excessive URLs
    /(https?:\/\/[^\s]+){5,}/i,
    // Excessive capital letters (more than 50% of the message)
    /^[A-Z\s]{50,}$/,
    // Phone numbers in specific formats that are commonly spam
    /\b1-800-\d{3}-\d{4}\b/i,
    // Cryptocurrency spam
    /\b(bitcoin|crypto|ethereum|binance)\s+(wallet|investment|opportunity)\b/i,
  ]

  for (const pattern of spamPatterns) {
    if (pattern.test(message)) {
      return {
        isSpam: true,
        reason: `Message contains suspicious patterns`
      }
    }
  }

  // Check for excessive capital letters
  const capitals = (message.match(/[A-Z]/g) || []).length
  const letters = (message.match(/[a-zA-Z]/g) || []).length
  if (letters > 20 && capitals / letters > 0.7) {
    return {
      isSpam: true,
      reason: 'Excessive capital letters'
    }
  }

  return { isSpam: false }
}

// Check submission timing (too fast might be a bot)
export function checkSubmissionTiming(
  pageLoadTime: number | undefined,
  submissionTime: number = Date.now()
): SpamCheckResult {
  if (!pageLoadTime) {
    return { isSpam: false } // Can't check without load time
  }

  const timeDiff = submissionTime - pageLoadTime
  
  // If form was submitted in less than 3 seconds, likely a bot
  if (timeDiff < 3000) {
    return {
      isSpam: true,
      reason: 'Form submitted too quickly'
    }
  }

  return { isSpam: false }
}

// Verify reCAPTCHA token
export async function verifyRecaptcha(token: string): Promise<SpamCheckResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  
  if (!secretKey) {
    console.warn('reCAPTCHA secret key not configured')
    return { isSpam: false } // Don't block if not configured
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()

    if (!data.success) {
      return {
        isSpam: true,
        reason: 'reCAPTCHA verification failed'
      }
    }

    // Check score for reCAPTCHA v3 (0.0 - 1.0, where 1.0 is very likely a good interaction)
    if (data.score !== undefined && data.score < 0.5) {
      return {
        isSpam: true,
        reason: 'Low reCAPTCHA score'
      }
    }

    return { isSpam: false }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return { isSpam: false } // Don't block on error
  }
}

// Main spam check function that combines all checks
export async function performSpamChecks(data: {
  message: string
  honeypot?: string
  recaptchaToken?: string
  pageLoadTime?: number
}): Promise<SpamCheckResult> {
  // Check honeypot
  const honeypotResult = checkHoneypot(data.honeypot)
  if (honeypotResult.isSpam) {
    return honeypotResult
  }

  // Check message patterns
  const patternResult = checkMessagePatterns(data.message)
  if (patternResult.isSpam) {
    return patternResult
  }

  // Check submission timing
  const timingResult = checkSubmissionTiming(data.pageLoadTime)
  if (timingResult.isSpam) {
    return timingResult
  }

  // Verify reCAPTCHA if token provided
  if (data.recaptchaToken) {
    const recaptchaResult = await verifyRecaptcha(data.recaptchaToken)
    if (recaptchaResult.isSpam) {
      return recaptchaResult
    }
  }

  return { isSpam: false }
}