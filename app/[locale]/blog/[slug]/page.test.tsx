import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import BlogPostPage, { generateMetadata, generateStaticParams } from './page';
import { getPostBySlug, getAllPostSlugs } from '@/lib/content/blog/mdx.server';

// Mock dependencies
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('@/lib/mdx.server', () => ({
  getPostBySlug: jest.fn(),
  getAllPostSlugs: jest.fn(),
}));

jest.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source, components }: { source: string; components: any }) => (
    <div data-testid="mdx-content">
      <div data-testid="mdx-source">{source}</div>
      <div data-testid="mdx-components">{Object.keys(components).join(',')}</div>
    </div>
  ),
}));

// Mock components
jest.mock('@/components/BlogPost', () => ({
  BlogPost: ({ post, children }: { post: any; children: React.ReactNode }) => (
    <div data-testid="blog-post" data-post-slug={post.slug}>
      <h1 data-testid="post-title">{post.title}</h1>
      <time data-testid="post-date" dateTime={post.date}>{post.date}</time>
      <span data-testid="post-reading-time">{post.readingTime} min</span>
      {post.tags && post.tags.map((tag: string) => (
        <span key={tag} data-testid="post-tag">{tag}</span>
      ))}
      <div data-testid="post-content">{children}</div>
    </div>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
}));

jest.mock('@/components/ui/callout', () => ({
  Callout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="callout">{children}</div>
  ),
}));

jest.mock('@/components/mdx/TabsWrapper', () => ({
  TabsWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-wrapper">{children}</div>
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  TabsContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-content">{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="tabs-trigger">{children}</button>
  ),
}));

jest.mock('@/components/mdx/CodeBlockWrapper', () => ({
  CodeBlockWrapper: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="code-block-wrapper" data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}));

const mockGetPostBySlug = getPostBySlug as jest.MockedFunction<typeof getPostBySlug>;
const mockGetAllPostSlugs = getAllPostSlugs as jest.MockedFunction<typeof getAllPostSlugs>;
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;

// Mock blog post data
const mockPost = {
  slug: 'test-post',
  title: 'Test Blog Post',
  date: '2024-01-15',
  excerpt: 'This is a test blog post excerpt.',
  readingTime: 5,
  tags: ['ai', 'testing'],
  author: 'Brandon',
  content: 'This is the MDX content of the post.',
};

describe('BlogPostPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful rendering', () => {
    beforeEach(() => {
      mockGetPostBySlug.mockReturnValue(mockPost);
    });

    it('should render blog post when post exists', async () => {
      const params = Promise.resolve({ slug: 'test-post', locale: 'en' });
      render(await BlogPostPage({ params }));

      expect(mockGetPostBySlug).toHaveBeenCalledWith('test-post', 'en');
      expect(screen.getByTestId('blog-post')).toHaveAttribute('data-post-slug', 'test-post');
      expect(screen.getByTestId('post-title')).toHaveTextContent('Test Blog Post');
      expect(screen.getByTestId('post-date')).toHaveTextContent('2024-01-15');
      expect(screen.getByTestId('post-reading-time')).toHaveTextContent('5 min');
    });

    it('should render post tags correctly', async () => {
      const params = Promise.resolve({ slug: 'test-post', locale: 'en' });
      render(await BlogPostPage({ params }));

      const tags = screen.getAllByTestId('post-tag');
      expect(tags).toHaveLength(2);
      expect(tags[0]).toHaveTextContent('ai');
      expect(tags[1]).toHaveTextContent('testing');
    });

    it('should render MDX content with custom components', async () => {
      const params = Promise.resolve({ slug: 'test-post', locale: 'en' });
      render(await BlogPostPage({ params }));

      expect(screen.getByTestId('mdx-content')).toBeInTheDocument();
      expect(screen.getByTestId('mdx-source')).toHaveTextContent('This is the MDX content of the post.');
      
      // Check that custom components are available
      const componentsText = screen.getByTestId('mdx-components').textContent;
      expect(componentsText).toContain('Badge');
      expect(componentsText).toContain('Card');
      expect(componentsText).toContain('Callout');
      expect(componentsText).toContain('h1');
      expect(componentsText).toContain('h2');
      expect(componentsText).toContain('p');
    });

    it('should handle Portuguese locale', async () => {
      const params = Promise.resolve({ slug: 'teste-post', locale: 'pt-BR' });
      render(await BlogPostPage({ params }));

      expect(mockGetPostBySlug).toHaveBeenCalledWith('teste-post', 'pt-BR');
      expect(screen.getByTestId('blog-post')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should call notFound when post does not exist', async () => {
      mockGetPostBySlug.mockReturnValue(null);

      const params = Promise.resolve({ slug: 'non-existent', locale: 'en' });
      
      try {
        await BlogPostPage({ params });
      } catch (error) {
        // notFound throws an error in Next.js
      }

      expect(mockGetPostBySlug).toHaveBeenCalledWith('non-existent', 'en');
      expect(mockNotFound).toHaveBeenCalled();
    });

    it('should handle missing post gracefully in different locales', async () => {
      mockGetPostBySlug.mockReturnValue(null);

      const params = Promise.resolve({ slug: 'missing-post', locale: 'pt-BR' });
      
      try {
        await BlogPostPage({ params });
      } catch (error) {
        // notFound throws an error in Next.js
      }

      expect(mockGetPostBySlug).toHaveBeenCalledWith('missing-post', 'pt-BR');
      expect(mockNotFound).toHaveBeenCalled();
    });
  });
});

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate correct metadata for existing post', async () => {
    mockGetPostBySlug.mockReturnValue(mockPost);

    const params = Promise.resolve({ slug: 'test-post', locale: 'en' });
    const metadata = await generateMetadata({ params });

    expect(mockGetPostBySlug).toHaveBeenCalledWith('test-post', 'en');
    expect(metadata).toEqual({
      title: 'Test Blog Post | Brandon - AI Engineer',
      description: 'This is a test blog post excerpt.',
    });
  });

  it('should generate fallback metadata for non-existent post', async () => {
    mockGetPostBySlug.mockReturnValue(null);

    const params = Promise.resolve({ slug: 'non-existent', locale: 'en' });
    const metadata = await generateMetadata({ params });

    expect(metadata).toEqual({
      title: 'Post Not Found',
    });
  });

  it('should handle Portuguese locale in metadata', async () => {
    const portuguesePost = { ...mockPost, title: 'Post de Teste em Português' };
    mockGetPostBySlug.mockReturnValue(portuguesePost);

    const params = Promise.resolve({ slug: 'teste-post', locale: 'pt-BR' });
    const metadata = await generateMetadata({ params });

    expect(mockGetPostBySlug).toHaveBeenCalledWith('teste-post', 'pt-BR');
    expect(metadata.title).toBe('Post de Teste em Português | Brandon - AI Engineer');
  });
});

describe('generateStaticParams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate static params for all locales and slugs', async () => {
    mockGetAllPostSlugs
      .mockReturnValueOnce(['post-1', 'post-2']) // English
      .mockReturnValueOnce(['post-1', 'post-3']); // Portuguese

    const params = await generateStaticParams();

    expect(mockGetAllPostSlugs).toHaveBeenCalledTimes(2);
    expect(mockGetAllPostSlugs).toHaveBeenNthCalledWith(1, 'en');
    expect(mockGetAllPostSlugs).toHaveBeenNthCalledWith(2, 'pt-BR');

    expect(params).toEqual([
      { locale: 'en', slug: 'post-1' },
      { locale: 'en', slug: 'post-2' },
      { locale: 'pt-BR', slug: 'post-1' },
      { locale: 'pt-BR', slug: 'post-3' },
    ]);
  });

  it('should handle empty slug arrays', async () => {
    mockGetAllPostSlugs.mockReturnValue([]);

    const params = await generateStaticParams();

    expect(params).toEqual([]);
  });

  it('should handle different numbers of posts per locale', async () => {
    mockGetAllPostSlugs
      .mockReturnValueOnce(['only-english-post']) // English
      .mockReturnValueOnce([]); // Portuguese (empty)

    const params = await generateStaticParams();

    expect(params).toEqual([
      { locale: 'en', slug: 'only-english-post' },
    ]);
  });
});