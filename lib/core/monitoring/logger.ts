/**
 * Production-ready logging utility
 * Provides structured logging with different levels and formats
 */

import { env, getLogConfig, isProduction } from '@/lib/core/environment/env';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
}

class Logger {
  private config = getLogConfig();

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    return levels[level] <= levels[this.config.level as LogLevel];
  }

  private formatMessage(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify(entry);
    }

    // Pretty format for development
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const level = entry.level.toUpperCase().padEnd(5);
    let message = `[${timestamp}] ${level} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      message += ` | Context: ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      message += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack && !isProduction()) {
        message += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return message;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    const formattedMessage = this.formatMessage(entry);

    if (this.config.enableConsole) {
      switch (level) {
        case 'error':
          console.error(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'debug':
          console.debug(formattedMessage);
          break;
      }
    }

    // In production, you might want to send logs to external services
    if (isProduction()) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // Placeholder for external logging services like:
    // - Datadog
    // - New Relic
    // - Splunk
    // - CloudWatch
    // - etc.
    
    // Example implementation would go here
    // For now, we'll just ensure it doesn't crash
    try {
      // External service integration would go here
    } catch (error) {
      // Avoid infinite logging loops
      console.error('Failed to send log to external service:', error);
    }
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.log('error', message, context, error);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  // HTTP request logging helper
  logRequest(req: {
    method?: string;
    url?: string;
    headers?: Record<string, any>;
  }, context?: LogContext) {
    this.info('HTTP Request', {
      method: req.method,
      url: req.url,
      userAgent: req.headers?.['user-agent'],
      ip: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
      ...context,
    });
  }

  // HTTP response logging helper
  logResponse(
    req: {
      method?: string;
      url?: string;
    },
    res: {
      status?: number;
    },
    responseTime: number,
    context?: LogContext
  ) {
    const level = res.status && res.status >= 400 ? 'warn' : 'info';
    this.log(level, 'HTTP Response', {
      method: req.method,
      url: req.url,
      statusCode: res.status,
      responseTime: `${responseTime}ms`,
      ...context,
    });
  }

  // Performance logging
  logPerformance(operation: string, duration: number, context?: LogContext) {
    const level = duration > 1000 ? 'warn' : 'info'; // Warn if operation takes > 1s
    this.log(level, `Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...context,
    });
  }

  // Security event logging
  logSecurityEvent(event: string, context?: LogContext) {
    this.warn(`Security Event: ${event}`, {
      severity: 'security',
      ...context,
    });
  }

  // Business logic event logging
  logBusinessEvent(event: string, context?: LogContext) {
    this.info(`Business Event: ${event}`, {
      category: 'business',
      ...context,
    });
  }
}

// Create singleton instance
const logger = new Logger();

export { logger };

// Utility function for measuring performance
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>,
  context?: LogContext
): T | Promise<T> {
  const start = Date.now();
  
  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result
        .then((value) => {
          logger.logPerformance(operation, Date.now() - start, context);
          return value;
        })
        .catch((error) => {
          logger.logPerformance(operation, Date.now() - start, {
            ...context,
            error: true,
          });
          throw error;
        });
    } else {
      logger.logPerformance(operation, Date.now() - start, context);
      return result;
    }
  } catch (error) {
    logger.logPerformance(operation, Date.now() - start, {
      ...context,
      error: true,
    });
    throw error;
  }
}

// Middleware helper for Next.js API routes
export function withRequestLogging<T extends (...args: any[]) => any>(
  handler: T,
  operation?: string
): T {
  return (async (...args: any[]) => {
    const [req, res] = args;
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    logger.logRequest(req, { requestId, operation });

    try {
      const result = await handler(...args);
      const responseTime = Date.now() - start;
      
      logger.logResponse(req, res, responseTime, { requestId, operation });
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - start;
      
      logger.error(`API Error in ${operation || 'handler'}`, {
        requestId,
        method: req?.method,
        url: req?.url,
        responseTime: `${responseTime}ms`,
      }, error as Error);
      
      throw error;
    }
  }) as T;
}