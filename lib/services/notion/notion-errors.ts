/**
 * Custom error classes for Notion API operations
 */

/**
 * Base error class for all Notion API errors
 */
export class NotionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotionError'
    Object.setPrototypeOf(this, NotionError.prototype)
  }
}

/**
 * Error thrown when API request fails
 */
export class NotionAPIError extends NotionError {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message)
    this.name = 'NotionAPIError'
    Object.setPrototypeOf(this, NotionAPIError.prototype)
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return this.status >= 500 || this.status === 429
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.code) {
      case 'object_not_found':
        return 'The requested page or database could not be found.'
      case 'insufficient_permissions':
        return 'You do not have permission to access this resource.'
      case 'invalid_request':
        return 'The request format is invalid. Please check your input.'
      case 'conflict_error':
        return 'The resource was modified by another user. Please try again.'
      case 'rate_limited':
        return 'Too many requests. Please wait a moment and try again.'
      case 'service_unavailable':
        return 'Notion service is temporarily unavailable. Please try again later.'
      default:
        return this.message || 'An unexpected error occurred.'
    }
  }
}

/**
 * Error thrown when authentication fails
 */
export class NotionAuthError extends NotionError {
  constructor(message = 'Invalid API key or insufficient permissions') {
    super(message)
    this.name = 'NotionAuthError'
    Object.setPrototypeOf(this, NotionAuthError.prototype)
  }
}

/**
 * Error thrown when rate limited
 */
export class NotionRateLimitError extends NotionAPIError {
  constructor(
    message: string,
    public readonly retryAfter: number // milliseconds
  ) {
    super(message, 429, 'rate_limited')
    this.name = 'NotionRateLimitError'
    Object.setPrototypeOf(this, NotionRateLimitError.prototype)
  }

  /**
   * Get retry after as Date
   */
  getRetryAfterDate(): Date {
    return new Date(Date.now() + this.retryAfter)
  }
}

/**
 * Error thrown when validation fails
 */
export class NotionValidationError extends NotionError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any
  ) {
    super(message)
    this.name = 'NotionValidationError'
    Object.setPrototypeOf(this, NotionValidationError.prototype)
  }
}

/**
 * Error thrown when content exceeds limits
 */
export class NotionContentLimitError extends NotionError {
  constructor(
    message: string,
    public readonly limit: number,
    public readonly actual: number
  ) {
    super(message)
    this.name = 'NotionContentLimitError'
    Object.setPrototypeOf(this, NotionContentLimitError.prototype)
  }
}

/**
 * Error thrown when property type mismatch
 */
export class NotionPropertyError extends NotionError {
  constructor(
    message: string,
    public readonly propertyName: string,
    public readonly expectedType: string,
    public readonly actualType?: string
  ) {
    super(message)
    this.name = 'NotionPropertyError'
    Object.setPrototypeOf(this, NotionPropertyError.prototype)
  }
}

/**
 * Type guard to check if error is a Notion error
 */
export function isNotionError(error: unknown): error is NotionError {
  return error instanceof NotionError
}

/**
 * Type guard to check if error is a Notion API error
 */
export function isNotionAPIError(error: unknown): error is NotionAPIError {
  return error instanceof NotionAPIError
}

/**
 * Type guard to check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  return error instanceof NotionAPIError && error.isRetryable()
}

/**
 * Extract error details from various error types
 */
export function extractErrorDetails(error: unknown): {
  message: string
  code?: string
  status?: number
} {
  if (error instanceof NotionAPIError) {
    return {
      message: error.getUserMessage(),
      code: error.code,
      status: error.status,
    }
  }

  if (error instanceof NotionError) {
    return {
      message: error.message,
      code: error.name,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    }
  }

  return {
    message: 'An unknown error occurred',
  }
}

/**
 * Create appropriate error from API response
 */
export function createErrorFromResponse(
  status: number,
  code: string,
  message: string,
  details?: any
): NotionError {
  switch (status) {
    case 401:
      return new NotionAuthError(message)
    case 429:
      const retryAfter = details?.retry_after || 60
      return new NotionRateLimitError(message, retryAfter * 1000)
    case 400:
      if (code === 'validation_error' && details?.field) {
        return new NotionValidationError(message, details.field, details.value)
      }
      return new NotionAPIError(message, status, code, details)
    default:
      return new NotionAPIError(message, status, code, details)
  }
}