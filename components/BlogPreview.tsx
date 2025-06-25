import Section from './Section';
import Container from './Container';
import Card, { CardHeader, CardTitle, CardContent } from './Card';
import Link from 'next/link';

// Placeholder blog posts - will be integrated with actual blog system later
const recentPosts = [
  {
    title: 'Fine-Tuning LLMs for Domain-Specific Tasks',
    excerpt: 'A comprehensive guide to fine-tuning large language models for specialized applications, including data preparation, training strategies, and evaluation metrics.',
    date: '2024-01-15',
    readTime: '8 min read',
    slug: 'fine-tuning-llms',
    category: 'Deep Learning',
  },
  {
    title: 'Building Scalable RAG Systems in Production',
    excerpt: 'Lessons learned from deploying retrieval-augmented generation systems at scale, covering vector databases, chunking strategies, and performance optimization.',
    date: '2024-01-08',
    readTime: '12 min read',
    slug: 'rag-systems-production',
    category: 'LLMs',
  },
  {
    title: 'The Future of Computer Vision in Healthcare',
    excerpt: 'Exploring cutting-edge applications of computer vision in medical imaging, from early disease detection to surgical assistance systems.',
    date: '2023-12-20',
    readTime: '10 min read',
    slug: 'computer-vision-healthcare',
    category: 'Computer Vision',
  },
];

export default function BlogPreview() {
  return (
    <Section spacing="xl" className="bg-background-secondary/30">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Thought Leadership
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Sharing insights and best practices from the frontlines of AI engineering
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card variant="interactive" className="h-full cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-primary font-medium">
                      {post.category}
                    </span>
                    <span className="text-xs text-foreground/50">
                      {post.readTime}
                    </span>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <p className="text-sm text-foreground/50 mt-2">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3">{post.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-foreground/60">
            More articles coming soon...
          </p>
        </div>
      </Container>
    </Section>
  );
}