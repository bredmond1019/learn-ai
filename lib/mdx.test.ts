import { calculateReadingTime, formatDate, generateSlug } from './mdx'

describe('MDX Utilities', () => {
  describe('calculateReadingTime', () => {
    it('calculates reading time for short content', () => {
      const content = 'This is a short text with about twenty words that should take less than a minute to read completely.'
      expect(calculateReadingTime(content)).toBe(1)
    })

    it('calculates reading time for medium content', () => {
      // Generate ~400 words
      const content = Array(400).fill('word').join(' ')
      expect(calculateReadingTime(content)).toBe(2)
    })

    it('calculates reading time for long content', () => {
      // Generate ~1000 words
      const content = Array(1000).fill('word').join(' ')
      expect(calculateReadingTime(content)).toBe(5)
    })

    it('handles empty content', () => {
      expect(calculateReadingTime('')).toBe(0)
    })

    it('handles content with extra whitespace', () => {
      const content = '   This   has   extra   spaces   '
      expect(calculateReadingTime(content)).toBe(1)
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      expect(formatDate('2024-03-15')).toBe('March 15, 2024')
      expect(formatDate('2024-01-01')).toBe('January 1, 2024')
      expect(formatDate('2024-12-31')).toBe('December 31, 2024')
    })

    it('handles date with time', () => {
      expect(formatDate('2024-03-15T10:30:00')).toBe('March 15, 2024')
    })

    it('handles ISO date format', () => {
      expect(formatDate('2024-03-15T10:30:00.000Z')).toBe('March 15, 2024')
    })
  })

  describe('generateSlug', () => {
    it('converts title to slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
      expect(generateSlug('Building AI Applications')).toBe('building-ai-applications')
    })

    it('handles special characters', () => {
      expect(generateSlug('AI & Machine Learning')).toBe('ai-machine-learning')
      expect(generateSlug('Next.js + TypeScript')).toBe('next-js-typescript')
      expect(generateSlug('100% Better Code')).toBe('100-better-code')
    })

    it('handles multiple spaces and dashes', () => {
      expect(generateSlug('Too   Many   Spaces')).toBe('too-many-spaces')
      expect(generateSlug('---Leading-Dashes')).toBe('leading-dashes')
      expect(generateSlug('Trailing-Dashes---')).toBe('trailing-dashes')
    })

    it('handles edge cases', () => {
      expect(generateSlug('')).toBe('')
      expect(generateSlug('123')).toBe('123')
      expect(generateSlug('!@#$%')).toBe('')
    })
  })
})