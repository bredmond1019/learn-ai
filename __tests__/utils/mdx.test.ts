/**
 * @jest-environment node
 */

import { calculateReadingTime, generateSlug } from '@/lib/content/blog/mdx'
import { getPostBySlug, getAllPosts, getAllPostSlugs } from '@/lib/content/blog/mdx.server'

// Mock the file system since we're testing server-side functions
jest.mock('fs')
jest.mock('gray-matter')

import fs from 'fs'
import matter from 'gray-matter'

const mockFs = fs as jest.Mocked<typeof fs>
const mockMatter = matter as jest.MockedFunction<typeof matter>

describe('MDX Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('calculateReadingTime', () => {
    it('should calculate reading time correctly', () => {
      // RED: Test reading time calculation at ~200 words per minute
      const shortContent = 'Hello world test content here.'
      expect(calculateReadingTime(shortContent)).toBe(1) // Should round up to 1 minute

      const mediumContent = 'Lorem ipsum '.repeat(100) // ~200 words
      expect(calculateReadingTime(mediumContent)).toBe(1)

      const longContent = 'Lorem ipsum '.repeat(200) // ~400 words
      expect(calculateReadingTime(longContent)).toBe(2)
    })

    it('should handle empty content', () => {
      expect(calculateReadingTime('')).toBe(0)
      expect(calculateReadingTime('   ')).toBe(0)
    })
  })

  describe('generateSlug', () => {
    it('should generate correct slugs from titles', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
      expect(generateSlug('Building AI Agents in Pure Python')).toBe('building-ai-agents-in-pure-python')
      expect(generateSlug('MCP: The Future of AI')).toBe('mcp-the-future-of-ai')
    })

    it('should handle special characters and spaces', () => {
      expect(generateSlug('Test & Development')).toBe('test-development')
      expect(generateSlug('React.js + TypeScript')).toBe('react-js-typescript')
      expect(generateSlug('  Leading & Trailing Spaces  ')).toBe('leading-trailing-spaces')
    })
  })

  describe('MDX Server Functions', () => {
    describe('frontmatter parsing', () => {
      it('should parse frontmatter correctly', () => {
        const mockFileContent = `---
title: "Test Post"
date: "2024-01-15"
excerpt: "This is a test excerpt"
tags: ["AI", "Python"]
author: "Brandon"
---

# Test Content

This is the post content.`

        const mockParsedResult = {
          data: {
            title: 'Test Post',
            date: '2024-01-15',
            excerpt: 'This is a test excerpt',
            tags: ['AI', 'Python'],
            author: 'Brandon'
          },
          content: '# Test Content\n\nThis is the post content.'
        }

        mockFs.existsSync.mockReturnValue(true)
        mockFs.readFileSync.mockReturnValue(mockFileContent)
        mockMatter.mockReturnValue(mockParsedResult)

        const post = getPostBySlug('test-post', 'en')

        expect(post).toEqual({
          slug: 'test-post',
          title: 'Test Post',
          date: '2024-01-15',
          excerpt: 'This is a test excerpt',
          content: '# Test Content\n\nThis is the post content.',
          readingTime: 1,
          tags: ['AI', 'Python'],
          author: 'Brandon'
        })
      })

      it('should handle missing required frontmatter', () => {
        const mockFileContent = `---
title: "Test Post"
# Missing date and excerpt
---

Content here`

        const mockParsedResult = {
          data: {
            title: 'Test Post'
            // Missing required fields: date, excerpt
          },
          content: 'Content here'
        }

        mockFs.existsSync.mockReturnValue(true)
        mockFs.readFileSync.mockReturnValue(mockFileContent)
        mockMatter.mockReturnValue(mockParsedResult)

        const post = getPostBySlug('test-post-invalid', 'en')

        expect(post).toBeNull() // Should return null for invalid frontmatter
      })
    })

    describe('code blocks handling', () => {
      it('should handle code blocks in content', () => {
        const mockFileContent = `---
title: "Code Example Post"
date: "2024-01-15"
excerpt: "Post with code examples"
---

Here's some Python code:

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

And some TypeScript:

\`\`\`typescript
const greeting: string = "Hello, World!"
console.log(greeting)
\`\`\`
`

        const mockParsedResult = {
          data: {
            title: 'Code Example Post',
            date: '2024-01-15',
            excerpt: 'Post with code examples'
          },
          content: `Here's some Python code:

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

And some TypeScript:

\`\`\`typescript
const greeting: string = "Hello, World!"
console.log(greeting)
\`\`\``
        }

        mockFs.existsSync.mockReturnValue(true)
        mockFs.readFileSync.mockReturnValue(mockFileContent)
        mockMatter.mockReturnValue(mockParsedResult)

        const post = getPostBySlug('code-example', 'en')

        expect(post).toBeTruthy()
        expect(post!.content).toContain('```python')
        expect(post!.content).toContain('```typescript')
        expect(post!.content).toContain('def hello_world():')
        expect(post!.content).toContain('const greeting: string')
      })
    })

    describe('custom components processing', () => {
      it('should handle custom components in content', () => {
        const mockFileContent = `---
title: "Custom Components Post"
date: "2024-01-15"
excerpt: "Post with custom components"
---

Here's a callout:

<Callout type="info">
This is an important note!
</Callout>

And a code example:

<CodeExample language="python">
print("Hello from CodeExample!")
</CodeExample>
`

        const mockParsedResult = {
          data: {
            title: 'Custom Components Post',
            date: '2024-01-15',
            excerpt: 'Post with custom components'
          },
          content: `Here's a callout:

<Callout type="info">
This is an important note!
</Callout>

And a code example:

<CodeExample language="python">
print("Hello from CodeExample!")
</CodeExample>`
        }

        mockFs.existsSync.mockReturnValue(true)
        mockFs.readFileSync.mockReturnValue(mockFileContent)
        mockMatter.mockReturnValue(mockParsedResult)

        const post = getPostBySlug('custom-components', 'en')

        expect(post).toBeTruthy()
        expect(post!.content).toContain('<Callout type="info">')
        expect(post!.content).toContain('<CodeExample language="python">')
        expect(post!.content).toContain('This is an important note!')
        expect(post!.content).toContain('print("Hello from CodeExample!")')
      })
    })
  })
})