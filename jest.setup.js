// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Add jest-axe for accessibility testing
import { configureAxe } from 'jest-axe'

const axe = configureAxe({
  rules: {
    // Disable color-contrast rule for now as we have dark theme
    'color-contrast': { enabled: false },
  },
})

global.axe = axe

// Add global polyfills
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.headers = new Map(Object.entries(options.headers || {}))
    this.body = options.body
  }
}

global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.statusText = options.statusText || 'OK'
    this.headers = new Map(Object.entries(options.headers || {}))
  }
  
  async json() {
    return JSON.parse(this.body)
  }
  
  async text() {
    return this.body
  }
}

// Mock Next.js server-only modules
jest.mock('server-only', () => ({}))

// Mock next/navigation
jest.mock('next/navigation', () => {
  const actual = jest.requireActual('next/navigation')
  return {
    ...actual,
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    })),
    usePathname: jest.fn(() => '/'),
    useSearchParams: jest.fn(() => new URLSearchParams()),
    notFound: jest.fn(),
  }
})

// Mock MDX remote
jest.mock('next-mdx-remote', () => ({
  MDXRemote: ({ children }) => children,
}))

jest.mock('next-mdx-remote/serialize', () => ({
  serialize: jest.fn().mockResolvedValue({ compiledSource: '' }),
}))

// Set test environment variables
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}

// Mock fetch for API tests
global.fetch = jest.fn()