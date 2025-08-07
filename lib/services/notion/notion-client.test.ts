/**
 * Tests for Notion API Client
 */

import { NotionClient } from './notion-client'
import {
  NotionAPIError,
  NotionAuthError,
  NotionRateLimitError,
  NotionValidationError,
} from './notion-errors'
import { Page, Block, CreatePageRequest } from './notion-types'

// Mock fetch
global.fetch = jest.fn()

describe('NotionClient', () => {
  let client: NotionClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    client = new NotionClient('test-api-key')
  })

  describe('constructor', () => {
    it('should initialize with string config', () => {
      const client = new NotionClient('test-key')
      expect(client).toBeDefined()
    })

    it('should initialize with object config', () => {
      const client = new NotionClient({
        apiKey: 'test-key',
        apiVersion: '2022-06-28',
        timeout: 5000,
      })
      expect(client).toBeDefined()
    })
  })

  describe('createPage', () => {
    const mockPage: Page = {
      object: 'page',
      id: 'page-123',
      created_time: '2024-01-01T00:00:00.000Z',
      last_edited_time: '2024-01-01T00:00:00.000Z',
      created_by: { object: 'user', id: 'user-123' },
      last_edited_by: { object: 'user', id: 'user-123' },
      cover: null,
      icon: null,
      parent: { type: 'page_id', page_id: 'parent-123' },
      archived: false,
      properties: {
        title: {
          id: 'title',
          type: 'title',
          title: [{ type: 'text', text: { content: 'Test Page' }, plain_text: 'Test Page', annotations: {} }],
        },
      },
      url: 'https://notion.so/page-123',
    }

    it('should create a page successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPage,
        headers: new Headers(),
      } as Response)

      const request: CreatePageRequest = {
        parent: { type: 'page_id', page_id: 'parent-123' },
        properties: {
          title: {
            title: [{ type: 'text', text: { content: 'Test Page' } }],
          },
        },
      }

      const result = await client.createPage(request)

      expect(result).toEqual(mockPage)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.notion.com/v1/pages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Notion-Version': '2022-06-28',
          }),
          body: JSON.stringify(request),
        })
      )
    })

    it('should handle 401 auth error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          object: 'error',
          status: 401,
          code: 'unauthorized',
          message: 'Invalid API key',
        }),
        headers: new Headers(),
      } as Response)

      await expect(
        client.createPage({
          parent: { type: 'page_id', page_id: 'parent-123' },
          properties: {},
        })
      ).rejects.toThrow(NotionAuthError)
    })

    it('should handle 429 rate limit error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          object: 'error',
          status: 429,
          code: 'rate_limited',
          message: 'Rate limited',
        }),
        headers: new Headers({ 'retry-after': '5' }),
      } as Response)

      await expect(
        client.createPage({
          parent: { type: 'page_id', page_id: 'parent-123' },
          properties: {},
        })
      ).rejects.toThrow(NotionRateLimitError)
    })
  })

  describe('getPage', () => {
    const mockPage: Page = {
      object: 'page',
      id: 'page-123',
      created_time: '2024-01-01T00:00:00.000Z',
      last_edited_time: '2024-01-01T00:00:00.000Z',
      created_by: { object: 'user', id: 'user-123' },
      last_edited_by: { object: 'user', id: 'user-123' },
      cover: null,
      icon: null,
      parent: { type: 'page_id', page_id: 'parent-123' },
      archived: false,
      properties: {},
      url: 'https://notion.so/page-123',
    }

    it('should retrieve a page successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPage,
        headers: new Headers(),
      } as Response)

      const result = await client.getPage('page-123')

      expect(result).toEqual(mockPage)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.notion.com/v1/pages/page-123',
        expect.objectContaining({
          method: 'GET',
        })
      )
    })

    it('should handle 404 not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          object: 'error',
          status: 404,
          code: 'object_not_found',
          message: 'Page not found',
        }),
        headers: new Headers(),
      } as Response)

      await expect(client.getPage('page-123')).rejects.toThrow(NotionAPIError)
    })
  })

  describe('updatePage', () => {
    it('should update page properties', async () => {
      const mockUpdatedPage: Page = {
        object: 'page',
        id: 'page-123',
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-02T00:00:00.000Z',
        created_by: { object: 'user', id: 'user-123' },
        last_edited_by: { object: 'user', id: 'user-123' },
        cover: null,
        icon: { type: 'emoji', emoji: '✅' },
        parent: { type: 'page_id', page_id: 'parent-123' },
        archived: false,
        properties: {},
        url: 'https://notion.so/page-123',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedPage,
        headers: new Headers(),
      } as Response)

      const result = await client.updatePage('page-123', {
        icon: { type: 'emoji', emoji: '✅' },
      })

      expect(result).toEqual(mockUpdatedPage)
    })
  })

  describe('archivePage', () => {
    it('should archive a page', async () => {
      const mockArchivedPage: Page = {
        object: 'page',
        id: 'page-123',
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-02T00:00:00.000Z',
        created_by: { object: 'user', id: 'user-123' },
        last_edited_by: { object: 'user', id: 'user-123' },
        cover: null,
        icon: null,
        parent: { type: 'page_id', page_id: 'parent-123' },
        archived: true,
        properties: {},
        url: 'https://notion.so/page-123',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockArchivedPage,
        headers: new Headers(),
      } as Response)

      const result = await client.archivePage('page-123')

      expect(result.archived).toBe(true)
    })
  })

  describe('getPageContent', () => {
    const mockBlocks: Block[] = [
      {
        object: 'block',
        id: 'block-1',
        parent: { type: 'page_id', page_id: 'page-123' },
        type: 'paragraph',
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-01T00:00:00.000Z',
        created_by: { object: 'user', id: 'user-123' },
        last_edited_by: { object: 'user', id: 'user-123' },
        has_children: false,
        archived: false,
        paragraph: {
          rich_text: [{ type: 'text', text: { content: 'Test' }, plain_text: 'Test', annotations: {} }],
        },
      } as any,
    ]

    it('should get page content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          object: 'list',
          results: mockBlocks,
          next_cursor: null,
          has_more: false,
        }),
        headers: new Headers(),
      } as Response)

      const result = await client.getPageContent('page-123')

      expect(result.results).toEqual(mockBlocks)
      expect(result.has_more).toBe(false)
    })

    it('should handle pagination', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            object: 'list',
            results: [mockBlocks[0]],
            next_cursor: 'cursor-123',
            has_more: true,
          }),
          headers: new Headers(),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            object: 'list',
            results: [mockBlocks[0]],
            next_cursor: null,
            has_more: false,
          }),
          headers: new Headers(),
        } as Response)

      const allBlocks = await client.getAllPageContent('page-123')

      expect(allBlocks).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('error handling', () => {
    it('should retry on 500 errors', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'page-123' }),
          headers: new Headers(),
        } as Response)

      // This should succeed after retry
      const result = await client.getPage('page-123')
      expect(result.id).toBe('page-123')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle timeout', async () => {
      // Create a client with very short timeout
      const timeoutClient = new NotionClient({
        apiKey: 'test-key',
        timeout: 1, // 1ms timeout
      })

      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({} as Response), 1000)
          })
      )

      await expect(timeoutClient.getPage('page-123')).rejects.toThrow(
        NotionAPIError
      )
    })
  })

  describe('testConnection', () => {
    it('should return true for valid connection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          object: 'list',
          results: [],
          next_cursor: null,
          has_more: false,
        }),
        headers: new Headers(),
      } as Response)

      const result = await client.testConnection()
      expect(result).toBe(true)
    })

    it('should return false for auth error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          object: 'error',
          status: 401,
          code: 'unauthorized',
          message: 'Invalid API key',
        }),
        headers: new Headers(),
      } as Response)

      const result = await client.testConnection()
      expect(result).toBe(false)
    })
  })
})