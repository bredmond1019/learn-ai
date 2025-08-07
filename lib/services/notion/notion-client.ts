/**
 * Notion API Client
 * Provides a typed interface for interacting with the Notion API
 */

import {
  Page,
  Block,
  Database,
  Parent,
  CreatePageRequest,
  UpdatePageRequest,
  AppendBlockChildrenRequest,
  PaginatedResponse,
  PropertyItemResponse,
  ErrorResponse,
  NotionAPIConfig,
  PropertyValue,
  SearchParameters,
  SearchResponse,
} from './notion-types'
import { NotionAPIError, NotionRateLimitError, NotionAuthError } from './notion-errors'

export class NotionClient {
  private readonly apiKey: string
  private readonly apiVersion: string
  private readonly baseUrl: string
  private readonly timeout: number
  private readonly retryAttempts: number
  private readonly retryDelay: number
  private readonly headers: Record<string, string>
  
  // Rate limiting
  private requestQueue: Array<() => Promise<any>> = []
  private isProcessingQueue = false
  private lastRequestTime = 0
  private readonly minRequestInterval = 350 // ~3 requests per second

  constructor(config: NotionAPIConfig | string) {
    if (typeof config === 'string') {
      this.apiKey = config
      this.apiVersion = '2022-06-28'
      this.baseUrl = 'https://api.notion.com/v1'
      this.timeout = 30000
      this.retryAttempts = 3
      this.retryDelay = 1000
    } else {
      this.apiKey = config.apiKey
      this.apiVersion = config.apiVersion || '2022-06-28'
      this.baseUrl = config.baseUrl || 'https://api.notion.com/v1'
      this.timeout = config.timeout || 30000
      this.retryAttempts = config.retryAttempts || 3
      this.retryDelay = config.retryDelay || 1000
    }

    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Notion-Version': this.apiVersion,
      'Content-Type': 'application/json',
    }
  }

  // ============================================================================
  // Page Operations
  // ============================================================================

  /**
   * Create a new page
   */
  async createPage(data: CreatePageRequest): Promise<Page> {
    return this.request<Page>('POST', '/pages', data)
  }

  /**
   * Retrieve a page by ID
   */
  async getPage(pageId: string): Promise<Page> {
    return this.request<Page>('GET', `/pages/${pageId}`)
  }

  /**
   * Update page properties
   */
  async updatePage(pageId: string, data: UpdatePageRequest): Promise<Page> {
    return this.request<Page>('PATCH', `/pages/${pageId}`, data)
  }

  /**
   * Archive or unarchive a page
   */
  async archivePage(pageId: string, archived = true): Promise<Page> {
    return this.updatePage(pageId, { archived })
  }

  // ============================================================================
  // Block Operations
  // ============================================================================

  /**
   * Get page content (blocks)
   */
  async getPageContent(
    pageId: string,
    cursor?: string
  ): Promise<PaginatedResponse<Block>> {
    const params = new URLSearchParams()
    if (cursor) params.append('start_cursor', cursor)
    params.append('page_size', '100')
    
    return this.request<PaginatedResponse<Block>>(
      'GET',
      `/blocks/${pageId}/children?${params}`
    )
  }

  /**
   * Get all blocks from a page (handles pagination automatically)
   */
  async getAllPageContent(pageId: string): Promise<Block[]> {
    const blocks: Block[] = []
    let cursor: string | undefined

    do {
      const response = await this.getPageContent(pageId, cursor)
      blocks.push(...response.results)
      cursor = response.next_cursor || undefined
    } while (cursor)

    return blocks
  }

  /**
   * Append blocks to a page or block
   */
  async appendBlocks(
    pageId: string,
    data: AppendBlockChildrenRequest
  ): Promise<PaginatedResponse<Block>> {
    return this.request<PaginatedResponse<Block>>(
      'PATCH',
      `/blocks/${pageId}/children`,
      data
    )
  }

  /**
   * Get a single block
   */
  async getBlock(blockId: string): Promise<Block> {
    return this.request<Block>('GET', `/blocks/${blockId}`)
  }

  /**
   * Update a block
   */
  async updateBlock(
    blockId: string,
    data: Partial<Block>
  ): Promise<Block> {
    return this.request<Block>('PATCH', `/blocks/${blockId}`, data)
  }

  /**
   * Delete a block
   */
  async deleteBlock(blockId: string): Promise<Block> {
    return this.request<Block>('DELETE', `/blocks/${blockId}`)
  }

  /**
   * Get block children (with pagination)
   */
  async getBlockChildren(
    blockId: string,
    cursor?: string,
    pageSize = 100
  ): Promise<PaginatedResponse<Block>> {
    const params = new URLSearchParams()
    if (cursor) params.append('start_cursor', cursor)
    params.append('page_size', pageSize.toString())
    
    return this.request<PaginatedResponse<Block>>(
      'GET',
      `/blocks/${blockId}/children?${params}`
    )
  }

  /**
   * Get all children of a block (handles pagination)
   */
  async getAllBlockChildren(blockId: string): Promise<Block[]> {
    const blocks: Block[] = []
    let cursor: string | undefined

    do {
      const response = await this.getBlockChildren(blockId, cursor)
      blocks.push(...response.results)
      cursor = response.next_cursor || undefined
    } while (cursor)

    return blocks
  }

  // ============================================================================
  // Property Operations
  // ============================================================================

  /**
   * Retrieve a page property
   */
  async getPageProperty(
    pageId: string,
    propertyId: string,
    cursor?: string
  ): Promise<PropertyItemResponse> {
    const params = new URLSearchParams()
    if (cursor) params.append('start_cursor', cursor)
    
    const url = `/pages/${pageId}/properties/${propertyId}${
      cursor ? `?${params}` : ''
    }`
    
    return this.request<PropertyItemResponse>('GET', url)
  }

  /**
   * Get all data for a paginated property
   */
  async getAllPropertyData(
    pageId: string,
    propertyId: string
  ): Promise<PropertyValue> {
    let allData: any[] = []
    let cursor: string | undefined
    let propertyType: string | undefined
    let propertyId_: string | undefined

    do {
      const response = await this.getPageProperty(pageId, propertyId, cursor)
      
      if (!propertyType) {
        propertyType = response.type
        propertyId_ = response.id
      }

      // Handle different property types
      switch (propertyType) {
        case 'relation':
          allData = [...allData, ...(response.relation || [])]
          break
        case 'people':
          allData = [...allData, ...(response.people || [])]
          break
        case 'rich_text':
          allData = [...allData, ...(response.rich_text || [])]
          break
        case 'title':
          allData = [...allData, ...(response.title || [])]
          break
        default:
          // Non-paginated property - cast to PropertyValue
          return response as unknown as PropertyValue
      }

      cursor = response.next_cursor || undefined
    } while (cursor)

    // Construct the property value object
    const result: any = {
      type: propertyType,
      id: propertyId_,
      [propertyType]: allData,
    }

    return result as PropertyValue
  }

  // ============================================================================
  // Database Operations (Basic - can be extended)
  // ============================================================================

  /**
   * Query a database
   */
  async queryDatabase(
    databaseId: string,
    query: any = {}
  ): Promise<PaginatedResponse<Page>> {
    return this.request<PaginatedResponse<Page>>(
      'POST',
      `/databases/${databaseId}/query`,
      query
    )
  }

  // ============================================================================
  // Search Operations
  // ============================================================================

  /**
   * Search for pages and databases with full parameter support
   * 
   * @param params - Search parameters
   * @returns Paginated search results containing pages and/or databases
   * 
   * @example
   * // Search for all content with "Project" in title
   * const results = await client.search({ query: "Project" })
   * 
   * // Search only pages, sorted by last edited
   * const pages = await client.search({
   *   query: "Design",
   *   filter: { value: "page", property: "object" },
   *   sort: { direction: "descending", timestamp: "last_edited_time" }
   * })
   */
  async search(params: SearchParameters = {}): Promise<SearchResponse> {
    return this.request<SearchResponse>('POST', '/search', params)
  }

  /**
   * Search for pages only
   * 
   * @param query - Optional search query for titles
   * @param options - Additional search options
   * @returns Pages matching the search criteria
   */
  async searchPages(
    query?: string,
    options: {
      sort?: 'ascending' | 'descending'
      start_cursor?: string
      page_size?: number
    } = {}
  ): Promise<SearchResponse> {
    const params: SearchParameters = {
      query,
      filter: {
        value: 'page',
        property: 'object'
      },
      ...options
    }

    if (options.sort) {
      params.sort = {
        direction: options.sort,
        timestamp: 'last_edited_time'
      }
    }

    return this.search(params)
  }

  /**
   * Search for databases only
   * 
   * @param query - Optional search query for titles
   * @param options - Additional search options
   * @returns Databases matching the search criteria
   */
  async searchDatabases(
    query?: string,
    options: {
      sort?: 'ascending' | 'descending'
      start_cursor?: string
      page_size?: number
    } = {}
  ): Promise<SearchResponse> {
    const params: SearchParameters = {
      query,
      filter: {
        value: 'database',
        property: 'object'
      },
      ...options
    }

    if (options.sort) {
      params.sort = {
        direction: options.sort,
        timestamp: 'last_edited_time'
      }
    }

    return this.search(params)
  }

  /**
   * Search and retrieve all results (handles pagination automatically)
   * 
   * @param params - Search parameters
   * @returns All pages and databases matching the search
   * 
   * @example
   * // Get all pages with "Budget" in title
   * const allBudgetPages = await client.searchAll({
   *   query: "Budget",
   *   filter: { value: "page", property: "object" }
   * })
   */
  async searchAll(params: SearchParameters = {}): Promise<Array<Page | Database>> {
    const results: Array<Page | Database> = []
    let cursor: string | undefined = params.start_cursor

    do {
      const response = await this.search({
        ...params,
        start_cursor: cursor,
        page_size: params.page_size || 100
      })

      results.push(...response.results)
      cursor = response.next_cursor || undefined
    } while (cursor)

    return results
  }

  /**
   * Get all shared pages (no query filter)
   * 
   * @param options - Pagination and sort options
   * @returns All pages shared with the integration
   */
  async getAllSharedPages(options: {
    sort?: 'ascending' | 'descending'
    page_size?: number
  } = {}): Promise<SearchResponse> {
    return this.searchPages(undefined, options)
  }

  /**
   * Get all shared databases (no query filter)
   * 
   * @param options - Pagination and sort options
   * @returns All databases shared with the integration
   */
  async getAllSharedDatabases(options: {
    sort?: 'ascending' | 'descending'
    page_size?: number
  } = {}): Promise<SearchResponse> {
    return this.searchDatabases(undefined, options)
  }

  /**
   * Find a page by title (exact match)
   * 
   * @param title - The exact title to search for
   * @returns The first page with matching title, or null if not found
   */
  async findPageByTitle(title: string): Promise<Page | null> {
    const response = await this.searchPages(title)
    
    // Filter for exact title match
    const exactMatch = response.results.find(result => {
      if (result.object !== 'page') return false
      const page = result as Page
      const pageTitle = this.extractTitle(page)
      return pageTitle === title
    })

    return exactMatch as Page || null
  }

  /**
   * Find a database by title (exact match)
   * 
   * @param title - The exact title to search for
   * @returns The first database with matching title, or null if not found
   */
  async findDatabaseByTitle(title: string): Promise<Database | null> {
    const response = await this.searchDatabases(title)
    
    // Filter for exact title match
    const exactMatch = response.results.find(result => {
      if (result.object !== 'database') return false
      const db = result as Database
      const dbTitle = db.title.map(t => t.plain_text).join('')
      return dbTitle === title
    })

    return exactMatch as Database || null
  }

  /**
   * Extract title from a page
   * @private
   */
  private extractTitle(page: Page): string {
    // Try to find a title property
    for (const [key, value] of Object.entries(page.properties)) {
      if (value.type === 'title' && 'title' in value) {
        return value.title.map((t: any) => t.plain_text).join('')
      }
    }
    return ''
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Make an API request with rate limiting and retry logic
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    data?: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await this.executeRequest<T>(method, path, data)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.processQueue()
    })
  }

  /**
   * Process the request queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return
    this.isProcessingQueue = true

    while (this.requestQueue.length > 0) {
      const timeSinceLastRequest = Date.now() - this.lastRequestTime
      const waitTime = Math.max(0, this.minRequestInterval - timeSinceLastRequest)
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }

      const request = this.requestQueue.shift()
      if (request) {
        this.lastRequestTime = Date.now()
        await request()
      }
    }

    this.isProcessingQueue = false
  }

  /**
   * Execute a single request with retry logic
   */
  private async executeRequest<T>(
    method: string,
    path: string,
    data?: any,
    attempt = 1
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check for rate limiting
      const retryAfter = response.headers.get('retry-after')
      if (response.status === 429 && retryAfter) {
        const waitTime = parseInt(retryAfter) * 1000
        throw new NotionRateLimitError(
          `Rate limited. Retry after ${retryAfter} seconds`,
          waitTime
        )
      }

      // Handle successful responses
      if (response.ok) {
        return await response.json()
      }

      // Handle error responses
      const errorData = await response.json() as ErrorResponse
      
      switch (response.status) {
        case 401:
          throw new NotionAuthError(errorData.message)
        case 403:
          throw new NotionAPIError(
            errorData.message,
            response.status,
            errorData.code
          )
        case 404:
          throw new NotionAPIError(
            errorData.message || 'Resource not found',
            404,
            'object_not_found'
          )
        default:
          throw new NotionAPIError(
            errorData.message,
            response.status,
            errorData.code
          )
      }
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle network errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NotionAPIError('Request timeout', 0, 'timeout')
      }

      // Retry logic for rate limits and network errors
      if (
        attempt < this.retryAttempts &&
        (error instanceof NotionRateLimitError ||
          (error instanceof NotionAPIError && error.status >= 500))
      ) {
        const delay = error instanceof NotionRateLimitError
          ? error.retryAfter
          : this.retryDelay * Math.pow(2, attempt - 1)

        await new Promise(resolve => setTimeout(resolve, delay))
        return this.executeRequest<T>(method, path, data, attempt + 1)
      }

      throw error
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.search({ page_size: 1 })
      return true
    } catch (error) {
      if (error instanceof NotionAuthError) {
        return false
      }
      throw error
    }
  }

  /**
   * Get rate limit information from last response
   */
  getRateLimitInfo(): {
    requestsRemaining?: number
    resetTime?: Date
  } {
    // This would need to be implemented with response header tracking
    // For now, return empty object
    return {}
  }
}