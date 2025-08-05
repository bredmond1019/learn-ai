import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { cache } from 'react';
import React from 'react';
import matter from 'gray-matter';
import { logError } from '@/lib/core/monitoring/error-logger';
import { mdxCache, cacheKeys } from '@/lib/core/caching/cache-manager';

// Custom components for MDX content
const mdxComponents = {
  // Add custom components here as needed
  pre: ({ children, ...props }: any) => 
    React.createElement('pre', { 
      className: "overflow-x-auto rounded-lg bg-gray-900 p-4", 
      ...props 
    }, children),
  code: ({ children, ...props }: any) => 
    React.createElement('code', { 
      className: "rounded bg-gray-800 px-1 py-0.5 text-sm", 
      ...props 
    }, children),
  // Stub components for learning modules
  CodeExample: ({ children, ...props }: any) => 
    React.createElement('div', { 
      className: "my-4 rounded-lg border border-gray-700 bg-gray-900 p-4", 
      ...props 
    }, children),
  Callout: ({ type = 'info', children, ...props }: any) => 
    React.createElement('div', { 
      className: `my-4 rounded-lg border-l-4 p-4 ${
        type === 'info' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
        type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 
        'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
      }`, 
      ...props 
    }, children),
  Exercise: ({ children, ...props }: any) => 
    React.createElement('div', { 
      className: "my-6 rounded-lg border border-green-500 bg-green-50 p-6 dark:bg-green-900/20", 
      ...props 
    }, children),
};

export interface ParsedMDX {
  content: React.ReactElement;
  frontmatter: Record<string, any>;
  tableOfContents?: Array<{ id: string; title: string; level: number }>;
  wordCount?: number;
  readingTime?: number;
}

export interface MDXParseError {
  type: 'frontmatter' | 'compilation' | 'syntax' | 'component' | 'unknown';
  message: string;
  lineNumber?: number;
  column?: number;
  source?: string;
}

// Enhanced frontmatter schema validation
const FRONTMATTER_SCHEMA = {
  required: ['title'],
  optional: ['description', 'author', 'date', 'tags', 'category', 'slug', 'excerpt'],
  types: {
    title: 'string',
    description: 'string',
    author: 'string',
    date: ['string', 'object'], // Date can be string or Date object
    tags: 'array',
    category: 'string',
    slug: 'string',
    excerpt: 'string',
  }
};

/**
 * Validate frontmatter against schema
 */
function validateFrontmatter(frontmatter: Record<string, any>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  for (const field of FRONTMATTER_SCHEMA.required) {
    if (!(field in frontmatter) || frontmatter[field] == null) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Check field types
  for (const [field, value] of Object.entries(frontmatter)) {
    if (value == null) continue;
    
    const expectedType = FRONTMATTER_SCHEMA.types[field as keyof typeof FRONTMATTER_SCHEMA.types];
    if (!expectedType) continue;
    
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    const validTypes = Array.isArray(expectedType) ? expectedType : [expectedType];
    
    if (!validTypes.includes(actualType)) {
      errors.push(`Field '${field}' expected ${validTypes.join(' or ')}, got ${actualType}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize and normalize frontmatter
 */
function sanitizeFrontmatter(frontmatter: Record<string, any>): Record<string, any> {
  const sanitized = { ...frontmatter };
  
  // Normalize date field
  if (sanitized.date && typeof sanitized.date === 'string') {
    try {
      sanitized.date = new Date(sanitized.date).toISOString();
    } catch {
      // Keep original if can't parse
    }
  }
  
  // Ensure tags is array
  if (sanitized.tags && !Array.isArray(sanitized.tags)) {
    sanitized.tags = String(sanitized.tags).split(',').map(tag => tag.trim());
  }
  
  // Trim string fields
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    }
  }
  
  return sanitized;
}

/**
 * Calculate reading statistics
 */
function calculateReadingStats(content: string): { wordCount: number; readingTime: number } {
  const words = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/#{1,6}\s+/g, '') // Remove heading markers
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Replace links with text
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const wordCount = words.length;
  const readingTime = Math.ceil(wordCount / 200); // ~200 words per minute
  
  return { wordCount, readingTime };
}

/**
 * Create detailed error information
 */
function createMDXError(error: unknown, source: string): MDXParseError {
  const errorString = error instanceof Error ? error.message : String(error);
  
  // Parse compilation errors for line numbers
  const lineMatch = errorString.match(/line (\d+)/i);
  const columnMatch = errorString.match(/column (\d+)/i);
  
  let type: MDXParseError['type'] = 'unknown';
  if (errorString.includes('frontmatter') || errorString.includes('yaml')) {
    type = 'frontmatter';
  } else if (errorString.includes('compilation') || errorString.includes('compile')) {
    type = 'compilation';
  } else if (errorString.includes('syntax') || errorString.includes('unexpected')) {
    type = 'syntax';
  } else if (errorString.includes('component') || errorString.includes('element')) {
    type = 'component';
  }
  
  return {
    type,
    message: errorString,
    lineNumber: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
    column: columnMatch ? parseInt(columnMatch[1], 10) : undefined,
    source: source.substring(0, 500), // First 500 chars for context
  };
}

// Parse MDX content with comprehensive error handling
export const parseMDXContent = cache(async (source: string): Promise<ParsedMDX> => {
  const cacheKey = cacheKeys.mdx.parsed(source.substring(0, 100)); // Use first 100 chars for cache key
  
  return (await mdxCache.getOrSet(cacheKey, async () => {
    try {
      // Pre-validate source
      if (!source || typeof source !== 'string') {
        throw new Error('Invalid MDX source: must be a non-empty string');
      }
      
      // Debug log
      console.log('Parsing MDX content, length:', source.length);
      console.log('First 200 chars:', source.substring(0, 200));
      
      // Handle malformed frontmatter by parsing manually first
      let parsedMatter;
      try {
        parsedMatter = matter(source);
      } catch (matterError) {
        const error = createMDXError(matterError, source);
        await logError(new Error(`Frontmatter parsing failed: ${error.message}`), {
          componentName: 'MDXParser',
          errorType: 'frontmatter',
          lineNumber: error.lineNumber,
        });
        
        // Fallback: try to extract content without frontmatter
        parsedMatter = { data: {}, content: source };
      }
      
      // Validate and sanitize frontmatter
      const frontmatterValidation = validateFrontmatter(parsedMatter.data);
      if (!frontmatterValidation.valid) {
        await logError(new Error(`Frontmatter validation failed: ${frontmatterValidation.errors.join(', ')}`), {
          componentName: 'MDXParser',
          errorType: 'validation',
          frontmatterErrors: frontmatterValidation.errors,
        });
        
        // Continue with sanitized frontmatter
      }
      
      const sanitizedFrontmatter = sanitizeFrontmatter(parsedMatter.data);
      
      // Process MDX content to handle component syntax
      let processedContent = parsedMatter.content;
      
      // Remove import statements
      processedContent = processedContent
        .split('\n')
        .filter(line => !line.trim().startsWith('import '))
        .join('\n');
      
      // Remove JSX expressions that might cause parsing issues
      // Replace complex component props with simple markdown
      processedContent = processedContent
        // Replace CodeExample components with code blocks
        .replace(/<CodeExample[^>]*?code=\{`([^`]+)`\}[^>]*?\/>/g, (match, code) => {
          return '```\n' + code + '\n```';
        })
        // Replace other CodeExample patterns
        .replace(/<CodeExample[^>]*?>([\s\S]*?)<\/CodeExample>/g, (match, content) => {
          return '```\n' + content.trim() + '\n```';
        })
        // Keep Callout components but simplify
        .replace(/<Callout([^>]*?)>/g, '<div className="callout"$1>')
        .replace(/<\/Callout>/g, '</div>')
        // Keep Exercise components but simplify  
        .replace(/<Exercise([^>]*?)>/g, '<div className="exercise"$1>')
        .replace(/<\/Exercise>/g, '</div>');
      
      const contentToCompile = `---\n${Object.entries(sanitizedFrontmatter)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n')}\n---\n\n${processedContent}`;
      
      // Compile MDX with enhanced error handling
      const { content, frontmatter } = await compileMDX({
        source: contentToCompile,
        options: {
          parseFrontmatter: true,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeHighlight,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }],
            ],
            // Add development mode error recovery
            development: process.env.NODE_ENV === 'development',
          },
        },
        components: mdxComponents,
      });
      
      // Calculate additional metadata
      const readingStats = calculateReadingStats(parsedMatter.content);
      const tableOfContents = extractTableOfContents(parsedMatter.content);
      
      return { 
        content, 
        frontmatter: sanitizedFrontmatter,
        tableOfContents,
        ...readingStats,
      };
    } catch (error) {
      const mdxError = createMDXError(error, source);
      
      await logError(new Error(`MDX parsing failed: ${mdxError.message}`), {
        componentName: 'MDXParser',
        errorType: mdxError.type,
        lineNumber: mdxError.lineNumber,
        column: mdxError.column,
        sourcePreview: mdxError.source,
      });
      
      // In development, provide more detailed error
      if (process.env.NODE_ENV === 'development') {
        throw new Error(`MDX Parse Error (${mdxError.type}): ${mdxError.message}${
          mdxError.lineNumber ? ` at line ${mdxError.lineNumber}` : ''
        }`);
      }
      
      throw new Error('Failed to parse MDX content');
    }
  })) as ParsedMDX;
});

// Parse MDX with custom components
export const parseMDXWithComponents = cache(
  async (source: string, customComponents?: Record<string, any>): Promise<ParsedMDX> => {
    try {
      const { content, frontmatter } = await compileMDX({
        source,
        options: {
          parseFrontmatter: true,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeHighlight,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }],
            ],
          },
        },
        components: { ...mdxComponents, ...customComponents },
      });

      return { content, frontmatter };
    } catch (error) {
      console.error('Failed to parse MDX content with custom components:', error);
      throw new Error('Failed to parse MDX content');
    }
  }
);

// Extract table of contents from MDX content
export const extractTableOfContents = (content: string): Array<{ id: string; title: string; level: number }> => {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: Array<{ id: string; title: string; level: number }> = [];
  
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2];
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    toc.push({ id, title, level });
  }
  
  return toc;
};

// Validate MDX content
export const validateMDXContent = async (content: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    await parseMDXContent(content);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};