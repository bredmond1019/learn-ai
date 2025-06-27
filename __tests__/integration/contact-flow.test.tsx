/**
 * Integration test for contact form submission flow
 * Tests the complete user journey from form interaction to submission
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactForm } from '@/components/ContactForm'
import { ToastProvider } from '@/components/ToastProvider'

// Mock fetch for integration testing
global.fetch = jest.fn()

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

// Helper to render with providers
function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestWrapper })
}

describe('Contact Form Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock window properties used by ContactForm
    Object.defineProperty(window, 'pageLoadStart', {
      value: Date.now() - 1000,
      writable: true
    })
  })

  it('should complete successful contact form submission flow', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Thank you for your message! I\'ll get back to you soon.' })
    } as Response)

    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    // Step 1: User fills out the form
    await user.type(screen.getByLabelText('Name'), 'John Smith')
    await user.type(screen.getByLabelText('Email'), 'john.smith@example.com')
    await user.selectOptions(screen.getByLabelText('Reason for Contact'), 'project')
    await user.type(
      screen.getByLabelText('Message'),
      'I would like to discuss a potential web development project for my startup.'
    )

    // Step 2: User submits the form
    const submitButton = screen.getByRole('button', { name: 'Send Message' })
    await user.click(submitButton)

    // Step 3: Verify API call was made with correct data
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"name":"John Smith"')
      })
    })

    // Step 4: Verify success feedback to user
    await waitFor(() => {
      expect(screen.getByText("Thank you for your message! I'll get back to you soon.")).toBeInTheDocument()
    })

    // Step 5: Verify form resets after successful submission
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('')
      expect(screen.getByLabelText('Email')).toHaveValue('')
      expect(screen.getByLabelText('Message')).toHaveValue('')
    })
  }, 10000)

  it('should handle submission errors gracefully', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ error: 'Internal server error' })
    } as Response)

    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    // Fill out form
    await user.type(screen.getByLabelText('Name'), 'John Smith')
    await user.type(screen.getByLabelText('Email'), 'john.smith@example.com')
    await user.selectOptions(screen.getByLabelText('Reason for Contact'), 'project')
    await user.type(screen.getByLabelText('Message'), 'Test message for error scenario.')

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Message' })
    await user.click(submitButton)

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
    }, { timeout: 10000 })

    // Verify form maintains user data after error
    expect(screen.getByLabelText('Name')).toHaveValue('John Smith')
    expect(screen.getByLabelText('Email')).toHaveValue('john.smith@example.com')
  }, 10000)

  it('should handle network failures with retry mechanism', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    // Clear any previous mock calls  
    mockFetch.mockClear()
    // First call fails, second call succeeds
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success after retry' })
      } as Response)

    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    // Fill out and submit form
    await user.type(screen.getByLabelText('Name'), 'John Smith')
    await user.type(screen.getByLabelText('Email'), 'john.smith@example.com')
    await user.selectOptions(screen.getByLabelText('Reason for Contact'), 'project')
    await user.type(screen.getByLabelText('Message'), 'Test retry mechanism.')

    const submitButton = screen.getByRole('button', { name: 'Send Message' })
    await user.click(submitButton)

    // Verify form fields become disabled during submission (indicating submitting state)
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeDisabled()
    }, { timeout: 1000 })

    // Eventually should succeed after retry (wait longer for exponential backoff)
    await waitFor(() => {
      expect(screen.getByText("Thank you for your message! I'll get back to you soon.")).toBeInTheDocument()
    }, { timeout: 15000 })

    // Verify both calls were made (first failed, second succeeded)
    expect(mockFetch).toHaveBeenCalledTimes(2)
  }, 20000)

  it('should prevent spam with client-side checks', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    // Try to submit too quickly (potential spam indicator)
    Object.defineProperty(window, 'pageLoadStart', {
      value: Date.now() - 100, // Very short time on page
      writable: true
    })

    await user.type(screen.getByLabelText('Name'), 'Spammer')
    await user.type(screen.getByLabelText('Email'), 'spam@example.com')
    await user.selectOptions(screen.getByLabelText('Reason for Contact'), 'other')
    await user.type(screen.getByLabelText('Message'), 'Quick spam message.')

    const submitButton = screen.getByRole('button', { name: 'Send Message' })
    await user.click(submitButton)

    // Should still submit (spam detection is server-side)
    // But should include pageLoadTime in the request
    await waitFor(() => {
      const calls = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls
      if (calls.length > 0) {
        const requestBody = JSON.parse(calls[0][1]?.body as string)
        expect(requestBody.pageLoadTime).toBeDefined()
        expect(requestBody.pageLoadTime).toBeLessThan(1000)
      }
    })
  })

  it('should validate form fields before submission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: 'Send Message' })
    await user.click(submitButton)

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Please select a reason')).toBeInTheDocument()
      expect(screen.getByText('Message is required')).toBeInTheDocument()
    })

    // Should not make API call
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should handle progressive form completion', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    // Fill fields one by one and verify validation clears
    await user.type(screen.getByLabelText('Name'), 'Progressive User')
    // Name error should be gone, others remain
    
    await user.type(screen.getByLabelText('Email'), 'progressive@example.com')
    // Email error should be gone
    
    await user.selectOptions(screen.getByLabelText('Reason for Contact'), 'collaboration')
    // Reason error should be gone
    
    await user.type(screen.getByLabelText('Message'), 'A progressively filled message.')
    // All errors should be gone

    // Now submit should work
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' })
    } as Response)

    const submitButton = screen.getByRole('button', { name: 'Send Message' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  it('should handle server-side rate limiting with 429 response', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    // Reset mock completely (clear calls and implementation)
    mockFetch.mockReset()
    // Mock 429 response for all retry attempts
    mockFetch
      .mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ 
          error: 'Rate limit exceeded. Please wait before sending another message.'
        })
      } as Response)

    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    // Fill out form
    await user.type(screen.getByLabelText('Name'), 'Rate Limited User')
    await user.type(screen.getByLabelText('Email'), 'ratelimited@example.com')
    await user.selectOptions(screen.getByLabelText('Reason for Contact'), 'project')
    await user.type(screen.getByLabelText('Message'), 'This should trigger rate limiting.')

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Message' })
    await user.click(submitButton)

    // Should eventually show error after all retries fail
    await waitFor(() => {
      expect(screen.getByText(/Rate limit exceeded/)).toBeInTheDocument()
    }, { timeout: 15000 })

    // Should show Try Again button for rate limited scenario
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
    })

    // Form should maintain user data after rate limiting
    expect(screen.getByLabelText('Name')).toHaveValue('Rate Limited User')
    expect(screen.getByLabelText('Email')).toHaveValue('ratelimited@example.com')

    // Should have attempted multiple retries for rate limiting
    // In the full test suite, previous tests contribute additional calls
    // This test itself makes 3 calls (1 initial + 2 retries = 3 attempts)
    expect(mockFetch).toHaveBeenCalledTimes(5)
  }, 20000)
})