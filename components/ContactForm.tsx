"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from './Button'
import { cn } from '@/lib/utils'

type FormData = {
  name: string
  email: string
  reason: string
  message: string
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error' | 'retrying'

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [submitAttempts, setSubmitAttempts] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>()

  const submitFormData = async (data: FormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          // Add metadata for spam protection
          pageLoadTime: Date.now() - ((window as unknown as { pageLoadStart: number }).pageLoadStart || 0),
          submitAttempt: submitAttempts + 1
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to send message`)
      }

      return true
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    }
  }

  const onSubmit = async (data: FormData) => {
    setSubmitAttempts(prev => prev + 1)
    setStatus('submitting')
    setErrorMessage('')

    const maxRetries = 2
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setStatus('retrying')
          setRetryCount(attempt)
          // Show retry toast
          // if (isClient) {
          //   toast.info(`Retrying...`, `Attempt ${attempt + 1} of ${maxRetries + 1}`, 2000)
          // }
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }

        const success = await submitFormData(data)
        
        if (success) {
          setStatus('success')
          setRetryCount(0)
          setSubmitAttempts(0)
          reset()
          
          // Show success toast
          // if (isClient) {
          //   toast.success(
          //     'Message sent successfully!', 
          //     'Thank you for reaching out. I\'ll get back to you soon.',
          //     6000
          //   )
          // }
          
          // Reset form status after showing success state briefly
          setTimeout(() => {
            setStatus('idle')
          }, 2000)
          
          return
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('An error occurred')
        
        // Show error toast for each retry attempt
        if (attempt < maxRetries) {
          const isServiceError = lastError.message.includes('503') || lastError.message.includes('service')
          const retryMessage = isServiceError 
            ? 'Service temporarily unavailable. Retrying...'
            : 'Network error. Retrying...'
          
          // if (isClient) {
          //   toast.warning('Send failed', retryMessage, 3000)
          // }
        }
      }
    }

    // All attempts failed
    setStatus('error')
    setRetryCount(0)
    const finalErrorMessage = lastError?.message || 'Failed to send message'
    setErrorMessage(finalErrorMessage)
    
    // Show final error toast
    // if (isClient) {
    //   toast.error(
    //     'Failed to send message', 
    //     `After ${maxRetries + 1} attempts: ${finalErrorMessage}. Please try again later.`,
    //     8000
    //   )
    // }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
          Name
        </label>
        <input
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters'
            }
          })}
          type="text"
          id="name"
          className={cn(
            "w-full px-4 py-2 bg-gray-800 border rounded-lg",
            "text-gray-100 placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition-colors duration-200",
            errors.name ? "border-red-500" : "border-gray-700"
          )}
          placeholder="John Doe"
          disabled={status === 'submitting' || status === 'retrying'}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
          Email
        </label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          type="email"
          id="email"
          className={cn(
            "w-full px-4 py-2 bg-gray-800 border rounded-lg",
            "text-gray-100 placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition-colors duration-200",
            errors.email ? "border-red-500" : "border-gray-700"
          )}
          placeholder="john@example.com"
          disabled={status === 'submitting' || status === 'retrying'}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-200 mb-2">
          Reason for Contact
        </label>
        <select
          {...register('reason', {
            required: 'Please select a reason'
          })}
          id="reason"
          className={cn(
            "w-full px-4 py-2 bg-gray-800 border rounded-lg",
            "text-gray-100",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition-colors duration-200",
            errors.reason ? "border-red-500" : "border-gray-700"
          )}
          disabled={status === 'submitting' || status === 'retrying'}
        >
          <option value="">Select a reason</option>
          <option value="project">Project Inquiry</option>
          <option value="collaboration">Collaboration</option>
          <option value="other">Other</option>
        </select>
        {errors.reason && (
          <p className="mt-1 text-sm text-red-400">{errors.reason.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-2">
          Message
        </label>
        <textarea
          {...register('message', {
            required: 'Message is required',
            minLength: {
              value: 10,
              message: 'Message must be at least 10 characters'
            },
            maxLength: {
              value: 1000,
              message: 'Message must be less than 1000 characters'
            }
          })}
          id="message"
          rows={6}
          className={cn(
            "w-full px-4 py-2 bg-gray-800 border rounded-lg",
            "text-gray-100 placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition-colors duration-200 resize-none",
            errors.message ? "border-red-500" : "border-gray-700"
          )}
          placeholder="Tell me about your project or inquiry..."
          disabled={status === 'submitting' || status === 'retrying'}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
        )}
      </div>

      {status === 'success' && (
        <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400">Thank you for your message! I&apos;ll get back to you soon.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{errorMessage || 'Failed to send message. Please try again.'}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={status === 'submitting' || status === 'retrying'}
        className="w-full sm:w-auto flex items-center gap-2"
      >
        {(status === 'submitting' || status === 'retrying') && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {status === 'submitting' && 'Sending...'}
        {status === 'retrying' && `Retrying... (${retryCount}/2)`}
        {status === 'idle' && 'Send Message'}
        {status === 'success' && 'Message Sent ✓'}
        {status === 'error' && 'Try Again'}
      </Button>
    </form>
  )
}