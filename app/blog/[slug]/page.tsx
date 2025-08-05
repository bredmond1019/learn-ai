import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogPost } from '@/components/BlogPost'
import { getPostBySlug, getAllPostSlugs } from '@/lib/content/blog/mdx.server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Callout } from '@/components/ui/callout'
import { TabsWrapper } from '@/components/mdx/TabsWrapper'
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlockWrapper } from '@/components/mdx/CodeBlockWrapper'
import { CodeExample } from '@/components/blog/CodeExample'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  
  return slugs.map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | Brandon - AI Engineer`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const components = {
    // UI Components
    Badge,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Callout,
    CodeExample,
    Tabs: TabsWrapper,
    TabsContent,
    TabsList,
    TabsTrigger,
    
    // Typography overrides for better readability
    h1: (props: any) => (
      <h1 className="text-4xl font-bold text-gray-100 mb-8 mt-12" {...props} />
    ),
    h2: (props: any) => (
      <h2 className="text-3xl font-semibold text-gray-100 mb-6 mt-10" {...props} />
    ),
    h3: (props: any) => (
      <h3 className="text-2xl font-semibold text-gray-100 mb-4 mt-8" {...props} />
    ),
    h4: (props: any) => (
      <h4 className="text-xl font-semibold text-gray-100 mb-3 mt-6" {...props} />
    ),
    p: (props: any) => (
      <p className="text-gray-300 mb-4 leading-relaxed text-lg" {...props} />
    ),
    ul: (props: any) => (
      <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2 text-lg ml-4" {...props} />
    ),
    ol: (props: any) => (
      <ol className="list-decimal list-inside text-gray-300 mb-6 space-y-2 text-lg ml-4" {...props} />
    ),
    li: (props: any) => (
      <li className="text-gray-300" {...props} />
    ),
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 mb-6" {...props} />
    ),
    a: (props: any) => (
      <a className="text-blue-400 hover:text-blue-300 underline transition-colors" {...props} />
    ),
    
    // Add spacing after cards and other components
    div: (props: any) => {
      // Add extra margin bottom to Card components
      if (props.className?.includes('bg-gray-800')) {
        return <div className={`${props.className} mb-8`} {...props} />
      }
      return <div {...props} />
    },
    
    // Code blocks with syntax highlighting
    pre: ({ children, ...props }: any) => {
      const codeElement = children?.props
      return <CodeBlockWrapper {...codeElement} />
    },
    code: ({ className, children, ...props }: any) => {
      // If it's an inline code block (no className), render as inline
      if (!className) {
        return (
          <code className="bg-gray-800 text-blue-300 px-2 py-1 rounded text-sm font-mono" {...props}>
            {children}
          </code>
        )
      }
      // Otherwise, it's handled by the pre element
      return <code className={className} {...props}>{children}</code>
    },
  }

  return (
    <BlogPost post={post}>
      <MDXRemote source={post.content} components={components} />
    </BlogPost>
  )
}