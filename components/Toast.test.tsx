import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Toast } from './Toast'

const mockOnClose = jest.fn()

describe('Toast Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders toast with title and message', () => {
    render(
      <Toast
        id="test-toast"
        type="success"
        title="Test Title"
        message="Test message"
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('renders toast without message', () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test Title"
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.queryByText('Test message')).not.toBeInTheDocument()
  })

  it('renders success toast with correct styles and icon', () => {
    render(
      <Toast
        id="test-toast"
        type="success"
        title="Success"
        onClose={mockOnClose}
      />
    )

    const toast = screen.getByRole('generic')
    expect(toast).toHaveClass('bg-green-900/90', 'border-green-500/30', 'text-green-100')
    
    // Check for success icon (checkmark in circle)
    const icon = toast.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('text-green-400')
  })

  it('renders error toast with correct styles and icon', () => {
    render(
      <Toast
        id="test-toast"
        type="error"
        title="Error"
        onClose={mockOnClose}
      />
    )

    const toast = screen.getByRole('generic')
    expect(toast).toHaveClass('bg-red-900/90', 'border-red-500/30', 'text-red-100')
    
    const icon = toast.querySelector('svg')
    expect(icon).toHaveClass('text-red-400')
  })

  it('renders warning toast with correct styles and icon', () => {
    render(
      <Toast
        id="test-toast"
        type="warning"
        title="Warning"
        onClose={mockOnClose}
      />
    )

    const toast = screen.getByRole('generic')
    expect(toast).toHaveClass('bg-yellow-900/90', 'border-yellow-500/30', 'text-yellow-100')
    
    const icon = toast.querySelector('svg')
    expect(icon).toHaveClass('text-yellow-400')
  })

  it('renders info toast with correct styles and icon', () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Info"
        onClose={mockOnClose}
      />
    )

    const toast = screen.getByRole('generic')
    expect(toast).toHaveClass('bg-blue-900/90', 'border-blue-500/30', 'text-blue-100')
    
    const icon = toast.querySelector('svg')
    expect(icon).toHaveClass('text-blue-400')
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test"
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByLabelText('Close notification')
    fireEvent.click(closeButton)

    // Should call onClose after animation delay
    jest.advanceTimersByTime(300)
    expect(mockOnClose).toHaveBeenCalledWith('test-toast')
  })

  it('auto-dismisses after default duration', () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test"
        onClose={mockOnClose}
      />
    )

    // Fast-forward time to default duration (5000ms) + animation (300ms)
    jest.advanceTimersByTime(5300)
    
    expect(mockOnClose).toHaveBeenCalledWith('test-toast')
  })

  it('auto-dismisses after custom duration', () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test"
        duration={2000}
        onClose={mockOnClose}
      />
    )

    // Fast-forward time to custom duration (2000ms) + animation (300ms)
    jest.advanceTimersByTime(2300)
    
    expect(mockOnClose).toHaveBeenCalledWith('test-toast')
  })

  it('has correct accessibility attributes', () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test"
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByLabelText('Close notification')
    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification')
  })

  it('applies correct animation classes', async () => {
    render(
      <Toast
        id="test-toast"
        type="info"
        title="Test"
        onClose={mockOnClose}
      />
    )

    const toast = screen.getByRole('generic')
    
    // Should start with animation in
    await waitFor(() => {
      expect(toast).toHaveClass('translate-x-0', 'opacity-100')
    })

    // Click close button
    const closeButton = screen.getByLabelText('Close notification')
    fireEvent.click(closeButton)

    // Should animate out
    await waitFor(() => {
      expect(toast).toHaveClass('translate-x-full', 'opacity-0')
    })
  })
})