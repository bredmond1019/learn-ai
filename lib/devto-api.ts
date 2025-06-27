/**
 * Dev.to API Client
 * Handles all interactions with the Dev.to (Forem) API
 */

interface DevToArticle {
  id?: number;
  title: string;
  body_markdown: string;
  published: boolean;
  series?: string;
  main_image?: string;
  canonical_url?: string;
  description?: string;
  tags?: string[];
  organization_id?: number;
}

interface DevToArticleResponse {
  id: number;
  title: string;
  description: string;
  published: boolean;
  published_at: string | null;
  slug: string;
  path: string;
  url: string;
  comments_count: number;
  public_reactions_count: number;
  page_views_count: number;
  published_timestamp: string;
  body_markdown: string;
  positive_reactions_count: number;
  cover_image: string | null;
  tag_list: string[];
  canonical_url: string;
  reading_time_minutes: number;
  user: {
    name: string;
    username: string;
    twitter_username: string | null;
    github_username: string | null;
    website_url: string | null;
    profile_image: string;
    profile_image_90: string;
  };
}

export class DevToAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'DevToAPIError';
  }
}

export class DevToAPI {
  private apiKey: string;
  private baseUrl = 'https://dev.to/api';
  private headers: HeadersInit;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('DEV.to API key is required');
    }
    this.apiKey = apiKey;
    this.headers = {
      'api-key': this.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.forem.api-v1+json',
    };
  }

  /**
   * Create a new article
   */
  async createArticle(article: DevToArticle): Promise<DevToArticleResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/articles`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ article }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new DevToAPIError(
          `Failed to create article: ${error.error || response.statusText}`,
          response.status,
          error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof DevToAPIError) throw error;
      throw new DevToAPIError(`Network error: ${error}`);
    }
  }

  /**
   * Update an existing article
   */
  async updateArticle(
    id: number,
    article: Partial<DevToArticle>
  ): Promise<DevToArticleResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/articles/${id}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ article }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new DevToAPIError(
          `Failed to update article: ${error.error || response.statusText}`,
          response.status,
          error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof DevToAPIError) throw error;
      throw new DevToAPIError(`Network error: ${error}`);
    }
  }

  /**
   * Get a specific article by ID
   */
  async getArticle(id: number): Promise<DevToArticleResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/articles/${id}`, {
        headers: {
          'api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new DevToAPIError(
          `Failed to fetch article: ${error.error || response.statusText}`,
          response.status,
          error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof DevToAPIError) throw error;
      throw new DevToAPIError(`Network error: ${error}`);
    }
  }

  /**
   * Get user's articles
   */
  async getUserArticles(
    page = 1,
    perPage = 30
  ): Promise<DevToArticleResponse[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/articles/me?page=${page}&per_page=${perPage}`,
        {
          headers: {
            'api-key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new DevToAPIError(
          `Failed to fetch user articles: ${error.error || response.statusText}`,
          response.status,
          error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof DevToAPIError) throw error;
      throw new DevToAPIError(`Network error: ${error}`);
    }
  }

  /**
   * Unpublish an article (requires admin/moderator role)
   */
  async unpublishArticle(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/articles/${id}/unpublish`, {
        method: 'PUT',
        headers: this.headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new DevToAPIError(
          `Failed to unpublish article: ${error.error || response.statusText}`,
          response.status,
          error
        );
      }
    } catch (error) {
      if (error instanceof DevToAPIError) throw error;
      throw new DevToAPIError(`Network error: ${error}`);
    }
  }

  /**
   * Search for an article by title among user's articles
   */
  async findArticleByTitle(title: string): Promise<DevToArticleResponse | null> {
    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const articles = await this.getUserArticles(page, 100);
        
        const found = articles.find(
          article => article.title.toLowerCase() === title.toLowerCase()
        );
        
        if (found) return found;
        
        hasMore = articles.length === 100;
        page++;
      }

      return null;
    } catch (error) {
      throw new DevToAPIError(`Failed to search articles: ${error}`);
    }
  }
}