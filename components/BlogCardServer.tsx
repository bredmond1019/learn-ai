import Link from 'next/link';
import { Card } from './Card';
import { formatDate, BlogPostMeta } from '@/lib/mdx';

interface BlogCardServerProps {
  post: BlogPostMeta;
}

export function BlogCardServer({ post }: BlogCardServerProps) {
  const href = `/blog/${post.slug}`;
  
  return (
    <Link href={href} className="block group h-full">
      <Card variant="interactive" className="h-full flex flex-col">
        <article className="p-2 flex flex-col h-full">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>{post.readingTime} min read</span>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-100 mb-4 group-hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
          
          <p className="text-gray-300 mb-4 text-base leading-relaxed flex-grow">
            {post.excerpt}
          </p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm font-medium bg-gray-800 text-gray-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </Card>
    </Link>
  );
}