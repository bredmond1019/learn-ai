import Link from 'next/link';
import { Card } from './Card';
import { formatDate, BlogPostMeta } from '@/lib/content/blog/mdx';

interface BlogCardProps {
  post: BlogPostMeta
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <Card variant="interactive" className="h-full">
        <article className="flex flex-col h-full">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>{post.readingTime} min read</span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-100 mb-3 group-hover:text-blue-400 transition-colors">
            {post.title}
          </h3>
          
          <p className="text-gray-300 mb-4 flex-grow line-clamp-3">
            {post.excerpt}
          </p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </Card>
    </Link>
  )
}