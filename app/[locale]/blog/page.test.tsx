import { render, screen } from '@testing-library/react';
import BlogPage from './page';
import { getAllPostsMeta } from '@/lib/mdx.server';
import { createTranslator } from '@/lib/translations';

// Mock the server-side dependencies
jest.mock('@/lib/mdx.server', () => ({
  getAllPostsMeta: jest.fn(),
}));

jest.mock('@/lib/translations', () => ({
  createTranslator: jest.fn(),
}));

// Mock the components
jest.mock('@/components/Container', () => ({
  Container: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <div data-testid="container" data-size={size}>{children}</div>
  ),
}));

jest.mock('@/components/Section', () => ({
  Section: ({ children, spacing }: { children: React.ReactNode; spacing?: string }) => (
    <div data-testid="section" data-spacing={spacing}>{children}</div>
  ),
}));

jest.mock('@/components/BlogCardServer', () => ({
  BlogCardServer: ({ post }: { post: any }) => (
    <article data-testid="blog-card" data-slug={post.slug}>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      <time dateTime={post.date}>{post.date}</time>
      <span>Reading time: {post.readingTime} min</span>
      {post.tags && post.tags.map((tag: string) => (
        <span key={tag} data-testid="tag">{tag}</span>
      ))}
    </article>
  ),
}));

const mockGetAllPostsMeta = getAllPostsMeta as jest.MockedFunction<typeof getAllPostsMeta>;
const mockCreateTranslator = createTranslator as jest.MockedFunction<typeof createTranslator>;

// Mock blog posts data
const mockPosts = [
  {
    slug: 'latest-post',
    title: 'Latest AI Developments',
    date: '2024-01-15',
    excerpt: 'Exploring the newest trends in artificial intelligence.',
    readingTime: 5,
    tags: ['ai', 'fundamentals'],
    author: 'Brandon',
  },
  {
    slug: 'mcp-guide',
    title: 'MCP Implementation Guide',
    date: '2024-01-10',
    excerpt: 'A comprehensive guide to Model Context Protocol.',
    readingTime: 8,
    tags: ['mcp', 'advanced'],
    author: 'Brandon',
  },
  {
    slug: 'mlops-best-practices',
    title: 'MLOps Best Practices',
    date: '2024-01-05',
    excerpt: 'Production deployment strategies for ML systems.',
    readingTime: 6,
    tags: ['mlops', 'production'],
    author: 'Brandon',
  },
];

// Mock translations
const mockTranslations = {
  'blog.title': 'Blog',
  'blog.subtitle': 'Thoughts on AI Engineering',
  'meta.title': 'Brandon J. Redmond',
  'blog.noResults': 'No blog posts found.',
};

const mockTranslator = (key: string) => mockTranslations[key as keyof typeof mockTranslations] || key;

describe('BlogPage', () => {
  beforeEach(() => {
    mockCreateTranslator.mockReturnValue(mockTranslator);
    mockGetAllPostsMeta.mockReturnValue(mockPosts);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should display blog posts for current locale', async () => {
    const params = Promise.resolve({ locale: 'en' });
    render(await BlogPage({ params }));
    
    // Check that getAllPostsMeta was called with the correct locale
    expect(mockGetAllPostsMeta).toHaveBeenCalledWith('en');
    
    // Check that all blog posts are displayed
    expect(screen.getByText('Latest AI Developments')).toBeInTheDocument();
    expect(screen.getByText('MCP Implementation Guide')).toBeInTheDocument();
    expect(screen.getByText('MLOps Best Practices')).toBeInTheDocument();
  });

  it('should sort by category (MCP, AI Fundamentals, Production)', async () => {
    const params = Promise.resolve({ locale: 'en' });
    render(await BlogPage({ params }));
    
    const blogCards = screen.getAllByTestId('blog-card');
    
    // Check that posts are in category order (MCP -> AI Fundamentals -> Production)
    expect(blogCards[0]).toHaveAttribute('data-slug', 'mcp-guide'); // MCP category
    expect(blogCards[1]).toHaveAttribute('data-slug', 'latest-post'); // AI Fundamentals category
    expect(blogCards[2]).toHaveAttribute('data-slug', 'mlops-best-practices'); // Production category
  });

  it('should show correct excerpts', async () => {
    const params = Promise.resolve({ locale: 'en' });
    render(await BlogPage({ params }));
    
    // Check that excerpts are displayed
    expect(screen.getByText('Exploring the newest trends in artificial intelligence.')).toBeInTheDocument();
    expect(screen.getByText('A comprehensive guide to Model Context Protocol.')).toBeInTheDocument();
    expect(screen.getByText('Production deployment strategies for ML systems.')).toBeInTheDocument();
  });

  it('should link to individual blog posts', async () => {
    const params = Promise.resolve({ locale: 'en' });
    render(await BlogPage({ params }));
    
    // BlogCardServer component should receive the post data
    // The actual link generation is tested in BlogCardServer component tests
    const blogCards = screen.getAllByTestId('blog-card');
    expect(blogCards).toHaveLength(3);
    
    // Check that cards have the correct slug data in category order
    expect(blogCards[0]).toHaveAttribute('data-slug', 'mcp-guide');
    expect(blogCards[1]).toHaveAttribute('data-slug', 'latest-post');
    expect(blogCards[2]).toHaveAttribute('data-slug', 'mlops-best-practices');
  });

  it('should handle Portuguese locale', async () => {
    const params = Promise.resolve({ locale: 'pt-BR' });
    render(await BlogPage({ params }));
    
    // Check that getAllPostsMeta was called with Portuguese locale
    expect(mockGetAllPostsMeta).toHaveBeenCalledWith('pt-BR');
    expect(mockCreateTranslator).toHaveBeenCalledWith('pt-BR');
  });

  it('should categorize posts correctly', async () => {
    const params = Promise.resolve({ locale: 'en' });
    render(await BlogPage({ params }));
    
    // Check that category sections are rendered (using getAllBy since text appears in nav and headers)
    expect(screen.getAllByText('Model Context Protocol (MCP)')).toHaveLength(2); // nav + section header
    expect(screen.getAllByText('AI Engineering Fundamentals')).toHaveLength(2); // nav + section header
    expect(screen.getAllByText('Production & Operations')).toHaveLength(2); // nav + section header
    
    // Check category post counts are displayed
    expect(screen.getAllByText('(1)')).toHaveLength(3); // Each category has 1 post
  });

  it('should show empty state when no posts exist', async () => {
    mockGetAllPostsMeta.mockReturnValue([]);
    
    const params = Promise.resolve({ locale: 'en' });
    render(await BlogPage({ params }));
    
    expect(screen.getByText('No blog posts found.')).toBeInTheDocument();
    expect(screen.queryByTestId('blog-card')).not.toBeInTheDocument();
  });

  it('should display navigation sections for categories', async () => {
    const params = Promise.resolve({ locale: 'en' });
    render(await BlogPage({ params }));
    
    // Check that jump-to navigation is rendered
    expect(screen.getByText('Jump to Section')).toBeInTheDocument();
    
    // Check that category navigation links are present
    const navLinks = screen.getAllByRole('link');
    const mcpLink = navLinks.find(link => link.textContent?.includes('Model Context Protocol'));
    expect(mcpLink).toHaveAttribute('href', '#mcp-advanced');
  });
});