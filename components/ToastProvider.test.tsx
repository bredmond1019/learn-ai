import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from './ToastProvider'

// Test component to use the toast context
function TestComponent() {
  const toast = useToast()
  
  return (
    <div>
      <button onClick={() => toast.success('Success!', 'Operation completed')}>
        Success Toast
      </button>
      <button onClick={() => toast.error('Error!', 'Something went wrong')}>
        Error Toast
      </button>
      <button onClick={() => toast.info('Info!', 'Here is some information')}>
        Info Toast
      </button>
      <button onClick={() => toast.warning('Warning!', 'Be careful')}>
        Warning Toast
      </button>
      <button onClick={() => toast.addToast({ type: 'success', title: 'Custom Toast', duration: 1000 })}>
        Custom Toast
      </button>
    </div>
  )
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('throws error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useToast must be used within a ToastProvider')
    
    consoleSpy.mockRestore()
  })

  it('renders children correctly', () => {
    render(
      <ToastProvider>
        <div>Test Content</div>
      </ToastProvider>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('adds and displays success toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const successButton = screen.getByText('Success Toast')
    fireEvent.click(successButton)

    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('Operation completed')).toBeInTheDocument()
  })

  it('adds and displays error toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const errorButton = screen.getByText('Error Toast')
    fireEvent.click(errorButton)

    expect(screen.getByText('Error!')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('adds and displays info toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const infoButton = screen.getByText('Info Toast')
    fireEvent.click(infoButton)

    expect(screen.getByText('Info!')).toBeInTheDocument()
    expect(screen.getByText('Here is some information')).toBeInTheDocument()
  })

  it('adds and displays warning toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const warningButton = screen.getByText('Warning Toast')
    fireEvent.click(warningButton)

    expect(screen.getByText('Warning!')).toBeInTheDocument()
    expect(screen.getByText('Be careful')).toBeInTheDocument()
  })

  it('handles multiple toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Success Toast'))
    fireEvent.click(screen.getByText('Error Toast'))
    fireEvent.click(screen.getByText('Info Toast'))

    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('Error!')).toBeInTheDocument()
    expect(screen.getByText('Info!')).toBeInTheDocument()
  })

  it('removes toast when close button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Success Toast'))
    expect(screen.getByText('Success!')).toBeInTheDocument()

    const closeButton = screen.getByLabelText('Close notification')
    fireEvent.click(closeButton)

    // Fast-forward animation time
    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(screen.queryByText('Success!')).not.toBeInTheDocument()
  })

  it('auto-removes toasts after duration', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Custom Toast'))
    expect(screen.getByText('Custom Toast')).toBeInTheDocument()

    // Fast-forward past custom duration (1000ms) + animation (300ms)
    act(() => {
      jest.advanceTimersByTime(1300)
    })

    expect(screen.queryByText('Custom Toast')).not.toBeInTheDocument()
  })

  it('generates unique IDs for toasts', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Success Toast'))
    fireEvent.click(screen.getByText('Success Toast'))

    // Both toasts should be present (different IDs)
    const successToasts = screen.getAllByText('Success!')
    expect(successToasts).toHaveLength(2)
  })

  it('has correct toast container attributes', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const toastContainer = screen.getByLabelText('Notifications')
    expect(toastContainer).toHaveAttribute('aria-live', 'polite')
    expect(toastContainer).toHaveClass('fixed', 'top-4', 'right-4', 'z-50')
  })

  it('uses addToast method correctly', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    fireEvent.click(screen.getByText('Custom Toast'))
    
    expect(screen.getByText('Custom Toast')).toBeInTheDocument()
  })

  it('handles toast removal correctly', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    // Add multiple toasts
    fireEvent.click(screen.getByText('Success Toast'))
    fireEvent.click(screen.getByText('Error Toast'))

    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('Error!')).toBeInTheDocument()

    // Close one toast
    const closeButtons = screen.getAllByLabelText('Close notification')
    fireEvent.click(closeButtons[0])

    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Only one toast should remain
    expect(screen.getAllByLabelText('Close notification')).toHaveLength(1)
  })
})