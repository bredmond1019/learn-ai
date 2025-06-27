import { DevToAPI, DevToAPIError } from '../../lib/devto-api';

// Mock fetch globally
global.fetch = jest.fn();

describe('DevToAPI', () => {
  let api: DevToAPI;
  const mockApiKey = 'test-api-key-123';
  const mockBaseURL = 'https://dev.to/api';

  beforeEach(() => {
    api = new DevToAPI(mockApiKey);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided API key', () => {
      expect(api).toBeDefined();
    });

    it('should throw error if API key is not provided', () => {
      expect(() => new DevToAPI('')).toThrow('DEV.to API key is required');
    });
  });

  describe('getUserArticles', () => {
    it('should fetch user articles successfully', async () => {
      const mockArticles = [
        {
          id: 1,
          title: 'Test Article 1',
          description: 'Description 1',
          slug: 'test-article-1',
          path: '/user/test-article-1',
          url: 'https://dev.to/user/test-article-1',
          comments_count: 5,
          public_reactions_count: 15,
          published: true,
          published_at: '2024-01-01T00:00:00Z',
          published_timestamp: '2024-01-01T00:00:00Z',
          tag_list: ['javascript', 'react'],
          canonical_url: 'https://example.com/test-article-1',
          cover_image: 'https://example.com/cover1.jpg',
          reading_time_minutes: 5,
          page_views_count: 100,
          positive_reactions_count: 10,
          body_markdown: '# Test Article 1',
          user: {
            name: 'Test User',
            username: 'testuser',
            twitter_username: null,
            github_username: null,
            website_url: null,
            profile_image: 'https://example.com/avatar.jpg',
            profile_image_90: 'https://example.com/avatar_90.jpg'
          }
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockArticles),
      } as unknown as Response);

      const articles = await api.getUserArticles();

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/articles/me?page=1&per_page=30`,
        {
          headers: {
            'api-key': mockApiKey,
          },
        }
      );
      expect(articles).toEqual(mockArticles);
    });

    it('should handle pagination', async () => {
      const mockArticles = Array(100).fill(null).map((_, i) => ({
        id: i + 1,
        title: `Article ${i + 1}`,
        description: `Description ${i + 1}`,
        slug: `article-${i + 1}`,
        path: `/user/article-${i + 1}`,
        url: `https://dev.to/user/article-${i + 1}`,
        comments_count: 0,
        public_reactions_count: 0,
        published: true,
        published_at: '2024-01-01T00:00:00Z',
        published_timestamp: '2024-01-01T00:00:00Z',
        tag_list: ['test'],
        canonical_url: `https://example.com/article-${i + 1}`,
        cover_image: null,
        reading_time_minutes: 1,
        page_views_count: 0,
        positive_reactions_count: 0,
        body_markdown: `# Article ${i + 1}`,
        user: {
          name: 'Test User',
          username: 'testuser',
          twitter_username: null,
          github_username: null,
          website_url: null,
          profile_image: 'https://example.com/avatar.jpg',
          profile_image_90: 'https://example.com/avatar_90.jpg'
        }
      }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockArticles),
      } as unknown as Response);

      const articles = await api.getUserArticles(1, 100);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/articles/me?page=1&per_page=100`,
        expect.any(Object)
      );
      expect(articles).toHaveLength(100);
    });

    it('should throw error on failed request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValueOnce({ error: 'Unauthorized' }),
      } as unknown as Response);

      await expect(api.getUserArticles()).rejects.toThrow(
        'Failed to fetch user articles: Unauthorized'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(api.getUserArticles()).rejects.toThrow('Network error: Error: Network error');
    });
  });

  describe('getArticle', () => {
    it('should fetch a single article by ID', async () => {
      const mockArticle = {
        id: 123,
        title: 'Test Article',
        description: 'Test description',
        slug: 'test-article',
        path: '/user/test-article',
        url: 'https://dev.to/user/test-article',
        comments_count: 10,
        public_reactions_count: 20,
        published: true,
        published_at: '2024-01-01T00:00:00Z',
        published_timestamp: '2024-01-01T00:00:00Z',
        tag_list: ['javascript', 'react'],
        canonical_url: 'https://example.com/test-article',
        cover_image: null,
        reading_time_minutes: 3,
        page_views_count: 50,
        positive_reactions_count: 15,
        body_markdown: '# Test Article\n\nContent here',
        user: {
          name: 'Test User',
          username: 'testuser',
          twitter_username: null,
          github_username: null,
          website_url: null,
          profile_image: 'https://example.com/avatar.jpg',
          profile_image_90: 'https://example.com/avatar_90.jpg'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockArticle),
      } as unknown as Response);

      const article = await api.getArticle(123);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/articles/123`,
        {
          headers: {
            'api-key': mockApiKey,
          },
        }
      );
      expect(article).toEqual(mockArticle);
    });

    it('should throw error for non-existent article', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValueOnce({ error: 'Not Found' }),
      } as unknown as Response);

      await expect(api.getArticle(999)).rejects.toThrow(
        'Failed to fetch article: Not Found'
      );
    });
  });

  describe('createArticle', () => {
    it('should create a new article', async () => {
      const articleData = {
        title: 'New Article',
        body_markdown: '# New Article\n\nContent',
        published: false,
        tags: ['javascript', 'tutorial'],
      };

      const mockResponse = {
        id: 12345,
        ...articleData,
        slug: 'new-article-abc123',
        path: '/user/new-article-abc123',
        url: 'https://dev.to/user/new-article-abc123',
        comments_count: 0,
        public_reactions_count: 0,
        published_at: null,
        published_timestamp: '',
        tag_list: ['javascript', 'tutorial'],
        canonical_url: '',
        cover_image: null,
        reading_time_minutes: 0,
        page_views_count: 0,
        positive_reactions_count: 0,
        description: '',
        user: {
          name: 'Test User',
          username: 'testuser',
          twitter_username: null,
          github_username: null,
          website_url: null,
          profile_image: 'https://example.com/avatar.jpg',
          profile_image_90: 'https://example.com/avatar_90.jpg'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      } as unknown as Response);

      const article = await api.createArticle(articleData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/articles`,
        {
          method: 'POST',
          headers: {
            'api-key': mockApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.forem.api-v1+json',
          },
          body: JSON.stringify({ article: articleData }),
        }
      );
      expect(article).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        body_markdown: 'No title provided',
        published: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: jest.fn().mockResolvedValueOnce({
          error: 'Validation failed',
          status: 422,
        }),
      } as unknown as Response);

      await expect(api.createArticle(invalidData as any)).rejects.toThrow(
        'Failed to create article: Validation failed'
      );
    });

    it('should handle rate limiting', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: jest.fn().mockResolvedValueOnce({ error: 'Too Many Requests' }),
      } as unknown as Response);

      await expect(api.createArticle({} as any)).rejects.toThrow(
        'Failed to create article: Too Many Requests'
      );
    });
  });

  describe('updateArticle', () => {
    it('should update an existing article', async () => {
      const articleId = 123;
      const updates = {
        title: 'Updated Title',
        body_markdown: '# Updated Content',
        published: true,
      };

      const mockResponse = {
        id: articleId,
        ...updates,
        slug: 'updated-title',
        path: '/user/updated-title',
        url: 'https://dev.to/user/updated-title',
        comments_count: 5,
        public_reactions_count: 10,
        published_at: '2024-01-15T00:00:00Z',
        published_timestamp: '2024-01-15T00:00:00Z',
        tag_list: [],
        canonical_url: '',
        cover_image: null,
        reading_time_minutes: 2,
        page_views_count: 25,
        positive_reactions_count: 8,
        description: '',
        user: {
          name: 'Test User',
          username: 'testuser',
          twitter_username: null,
          github_username: null,
          website_url: null,
          profile_image: 'https://example.com/avatar.jpg',
          profile_image_90: 'https://example.com/avatar_90.jpg'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      } as unknown as Response);

      const article = await api.updateArticle(articleId, updates);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/articles/${articleId}`,
        {
          method: 'PUT',
          headers: {
            'api-key': mockApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.forem.api-v1+json',
          },
          body: JSON.stringify({ article: updates }),
        }
      );
      expect(article).toEqual(mockResponse);
    });

    it('should handle partial updates', async () => {
      const articleId = 456;
      const partialUpdate = {
        published: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ id: articleId, ...partialUpdate }),
      } as unknown as Response);

      await api.updateArticle(articleId, partialUpdate);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/articles/${articleId}`,
        expect.objectContaining({
          body: JSON.stringify({ article: partialUpdate }),
        })
      );
    });
  });

  describe('unpublishArticle', () => {
    it('should unpublish an article', async () => {
      const articleId = 789;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as unknown as Response);

      await api.unpublishArticle(articleId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/articles/${articleId}/unpublish`,
        {
          method: 'PUT',
          headers: {
            'api-key': mockApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.forem.api-v1+json',
          },
        }
      );
    });

    it('should throw error if article not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValueOnce({ error: 'Not Found' }),
      } as unknown as Response);

      await expect(api.unpublishArticle(999)).rejects.toThrow(
        'Failed to unpublish article: Not Found'
      );
    });
  });

  describe('error handling', () => {
    it('should handle API errors with error response body', async () => {
      const errorResponse = {
        error: 'Invalid API key',
        status: 401,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValueOnce(errorResponse),
      } as unknown as Response);

      await expect(api.getUserArticles()).rejects.toThrow(
        'Failed to fetch user articles: Invalid API key'
      );
    });

    it('should handle malformed JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      } as unknown as Response);

      await expect(api.getUserArticles()).rejects.toThrow('Network error: Error: Invalid JSON');
    });

    it('should handle timeout errors', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      await expect(api.getUserArticles()).rejects.toThrow('Network error: Error: Request timeout');
    });
  });
});