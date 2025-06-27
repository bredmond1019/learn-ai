import { render, screen } from '@testing-library/react';
import { BlogCardServer } from './BlogCardServer';
import { formatDate } from '@/lib/mdx';

// Mock the dependencies
jest.mock('./Card', () => ({
  Card: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <div data-testid="card" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/lib/mdx', () => ({
  formatDate: jest.fn(),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className} data-testid="blog-card-link">
      {children}
    </a>
  );
});

const mockFormatDate = formatDate as jest.MockedFunction<typeof formatDate>;

// Mock blog post data
const mockPost = {
  slug: 'test-blog-post',
  title: 'Understanding AI Systems',
  date: '2024-01-15',
  excerpt: 'A comprehensive guide to building and deploying AI systems in production environments.',
  readingTime: 8,
  tags: ['ai', 'machine-learning', 'production'],
  author: 'Brandon',
};

const mockPostWithoutTags = {
  slug: 'simple-post',
  title: 'Simple Blog Post',
  date: '2024-01-10',
  excerpt: 'A simple blog post without tags.',
  readingTime: 3,
  tags: [],
  author: 'Brandon',
};

const mockPostWithoutTagsProperty = {
  slug: 'minimal-post',
  title: 'Minimal Blog Post',
  date: '2024-01-05',
  excerpt: 'A minimal blog post.',
  readingTime: 2,
  author: 'Brandon',
  // No tags property
};

describe('BlogCardServer', () => {
  beforeEach(() => {
    mockFormatDate.mockImplementation((date: string) => `Formatted: ${date}`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render blog post with all data', () => {
    render(<BlogCardServer post={mockPost} />);

    // Check that it renders as a link
    const link = screen.getByTestId('blog-card-link');
    expect(link).toHaveAttribute('href', '/blog/test-blog-post');
    expect(link).toHaveClass('block', 'group');

    // Check that Card component is rendered with correct props
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('data-variant', 'interactive');
    expect(card).toHaveClass('h-full');

    // Check post title
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toHaveTextContent('Understanding AI Systems');
    expect(title).toHaveClass('text-2xl', 'font-semibold', 'text-gray-100', 'mb-4', 'group-hover:text-blue-400', 'transition-colors');

    // Check post excerpt
    expect(screen.getByText('A comprehensive guide to building and deploying AI systems in production environments.')).toBeInTheDocument();

    // Check reading time
    expect(screen.getByText('8 min read')).toBeInTheDocument();
  });

  it('should format and display the date correctly', () => {
    render(<BlogCardServer post={mockPost} />);

    // Check that formatDate was called with the correct date
    expect(mockFormatDate).toHaveBeenCalledWith('2024-01-15');
    
    // Check that the formatted date is displayed
    expect(screen.getByText('Formatted: 2024-01-15')).toBeInTheDocument();
    
    // Check the time element attributes
    const timeElement = screen.getByText('Formatted: 2024-01-15');
    expect(timeElement.closest('time')).toHaveAttribute('dateTime', '2024-01-15');
  });

  it('should render tags when present', () => {
    render(<BlogCardServer post={mockPost} />);

    // Check that all tags are rendered
    expect(screen.getByText('ai')).toBeInTheDocument();
    expect(screen.getByText('machine-learning')).toBeInTheDocument();
    expect(screen.getByText('production')).toBeInTheDocument();

    // Check tag styling
    const tags = screen.getAllByText(/^(ai|machine-learning|production)$/);
    tags.forEach(tag => {
      expect(tag).toHaveClass('px-3', 'py-1', 'text-sm', 'font-medium', 'bg-gray-800', 'text-gray-300', 'rounded-full');
    });
  });

  it('should not render tags section when tags array is empty', () => {
    render(<BlogCardServer post={mockPostWithoutTags} />);

    // Should not find any tags
    expect(screen.queryByText('ai')).not.toBeInTheDocument();
    expect(screen.queryByText('machine-learning')).not.toBeInTheDocument();
    
    // The tags container should not be present
    const article = screen.getByRole('article');
    const tagContainers = article.querySelectorAll('.flex.flex-wrap.gap-2');
    expect(tagContainers).toHaveLength(0);
  });

  it('should not render tags section when tags property is undefined', () => {
    render(<BlogCardServer post={mockPostWithoutTagsProperty as any} />);

    // Should not find any tags
    expect(screen.queryByText('ai')).not.toBeInTheDocument();
    
    // The tags container should not be present
    const article = screen.getByRole('article');
    const tagContainers = article.querySelectorAll('.flex.flex-wrap.gap-2');
    expect(tagContainers).toHaveLength(0);
  });

  it('should generate correct link URL from post slug', () => {
    render(<BlogCardServer post={mockPost} />);

    const link = screen.getByTestId('blog-card-link');
    expect(link).toHaveAttribute('href', '/blog/test-blog-post');
  });

  it('should handle different post slugs correctly', () => {
    const postWithDifferentSlug = { ...mockPost, slug: 'advanced-ml-techniques' };
    render(<BlogCardServer post={postWithDifferentSlug} />);

    const link = screen.getByTestId('blog-card-link');
    expect(link).toHaveAttribute('href', '/blog/advanced-ml-techniques');
  });

  it('should have proper hover effects structure', () => {
    render(<BlogCardServer post={mockPost} />);

    // Check that the link has group class for hover effects
    const link = screen.getByTestId('blog-card-link');
    expect(link).toHaveClass('group');

    // Check that the title has group-hover class
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toHaveClass('group-hover:text-blue-400');
  });

  it('should render article with correct semantic structure', () => {
    render(<BlogCardServer post={mockPost} />);

    // Check that it's wrapped in an article element
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
    expect(article).toHaveClass('p-2');

    // Check that the date and reading time are in the metadata section
    const dateTime = screen.getByText('Formatted: 2024-01-15');
    const readingTime = screen.getByText('8 min read');
    
    // Both should be in the same container with metadata styling
    const metadataContainer = dateTime.closest('.flex.items-center.justify-between');
    expect(metadataContainer).toContainElement(readingTime);
    expect(metadataContainer).toHaveClass('text-sm', 'text-gray-400', 'mb-3');
  });

  it('should handle posts with very long titles', () => {
    const postWithLongTitle = {
      ...mockPost,
      title: 'This is a Very Long Blog Post Title That Might Wrap to Multiple Lines and Should Still Be Rendered Correctly'
    };
    
    render(<BlogCardServer post={postWithLongTitle} />);

    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toHaveTextContent(postWithLongTitle.title);
  });

  it('should handle posts with very long excerpts', () => {
    const postWithLongExcerpt = {
      ...mockPost,
      excerpt: 'This is a very long excerpt that goes into great detail about the topic and provides extensive information that might span multiple lines when rendered in the blog card component.'
    };
    
    render(<BlogCardServer post={postWithLongExcerpt} />);

    expect(screen.getByText(postWithLongExcerpt.excerpt)).toBeInTheDocument();
  });

  it('should handle edge case reading times', () => {
    const postWithZeroReadingTime = { ...mockPost, readingTime: 0 };
    render(<BlogCardServer post={postWithZeroReadingTime} />);
    expect(screen.getByText('0 min read')).toBeInTheDocument();

    const { rerender } = render(<BlogCardServer post={mockPost} />);
    
    const postWithLongReadingTime = { ...mockPost, readingTime: 120 };
    rerender(<BlogCardServer post={postWithLongReadingTime} />);
    expect(screen.getByText('120 min read')).toBeInTheDocument();
  });
});