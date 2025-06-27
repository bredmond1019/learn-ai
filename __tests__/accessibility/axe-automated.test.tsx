import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Navigation from '@/components/Navigation'
import { ContactForm } from '@/components/ContactForm'
import Hero from '@/components/Hero'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/en'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

describe('Automated Accessibility Tests', () => {
  it('should not have accessibility violations in Navigation component', async () => {
    const { container } = render(<Navigation locale="en" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations in Hero component', async () => {
    const { container } = render(<Hero locale="en" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations in ContactForm component', async () => {
    const { container } = render(<ContactForm />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations with Portuguese locale', async () => {
    const { container } = render(<Navigation locale="pt-BR" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})