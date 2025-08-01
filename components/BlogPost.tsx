"use client"

import Link from 'next/link'
import { MDXProvider } from '@mdx-js/react'
import { useSearchParams, useParams } from 'next/navigation'
import { CodeBlock } from './ui/code-block'
import { Container } from './Container'
import { Section } from './Section'
import { formatDate } from '@/lib/utils/date'
import { BlogPost as BlogPostType } from '@/lib/types/blog'

interface BlogPostProps {
  post: BlogPostType
  children: React.ReactNode
}

// Custom components for MDX
const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-3xl font-bold text-gray-100 mb-6 mt-8" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-2xl font-semibold text-gray-100 mb-4 mt-6" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-4" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="text-gray-300 mb-4 leading-relaxed" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2" {...props} />,
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="text-gray-300" {...props} />,
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 mb-4" {...props} />
  ),
  a: (props: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-blue-400 hover:text-blue-300 underline transition-colors" {...props} />
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pre: ({ children, ...props }: any) => {
    const child = children?.props
    const language = child?.className?.replace('language-', '') || 'text'
    const code = child?.children || ''

    return (
      <div className="mb-4">
        <CodeBlock
          code={code.trim()}
          language={language}
          showLineNumbers={true}
          {...props}
        />
      </div>
    )
  },
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-gray-800 text-gray-300 px-1 py-0.5 rounded text-sm" {...props} />
  ),
}

export function BlogPost({ post, children }: BlogPostProps) {
  const searchParams = useSearchParams()
  const params = useParams()
  
  // Get locale from params
  const locale = params.locale || 'en'
  
  // Preserve filter state when going back to blog list
  const filter = searchParams.get('filter') || 'category'
  const backUrl = `/${locale}/blog?filter=${filter}`
  
  return (
    <main className="min-h-screen pt-24">
      <Section spacing="lg">
        <Container size="md">
          <Link 
            href={backUrl}
            className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors mb-6"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>
          
          <article>
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-100 mb-4">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>•</span>
                <span>{post.readingTime} min read</span>
                {post.author && (
                  <>
                    <span>•</span>
                    <span>By {post.author}</span>
                  </>
                )}
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm font-medium bg-gray-800 text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div className="prose prose-invert max-w-none">
              <MDXProvider components={components}>
                {children}
              </MDXProvider>
            </div>
          </article>
        </Container>
      </Section>
    </main>
  )
}