/**
 * Tests for Notion Search API functionality
 */

import { NotionClient } from './notion-client'
import {
  extractTitle,
  filterPages,
  filterDatabases,
  findByExactTitle,
  findByPartialTitle,
  sortByLastEdited,
  sortByCreated,
  groupByParent,
  filterByDateRange,
  isRecentlyModified,
  summarizeSearchResults,
  createRecentSearchParams,
} from './notion-helpers'
import { Page, Database, SearchResponse } from './notion-types'

// Mock fetch
global.fetch = jest.fn()

describe('NotionClient Search Methods', () => {
  let client: NotionClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    client = new NotionClient('test-api-key')
  })

  const mockPage: Page = {
    object: 'page',
    id: 'page-123',
    created_time: '2024-01-01T00:00:00.000Z',
    last_edited_time: '2024-01-15T10:00:00.000Z',
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
        title: [{ 
          type: 'text', 
          text: { content: 'Test Page' }, 
          plain_text: 'Test Page',
          annotations: {}
        }],
      },
    },
    url: 'https://notion.so/page-123',
  }

  const mockDatabase: Database = {
    object: 'database',
    id: 'db-456',
    created_time: '2024-01-01T00:00:00.000Z',
    last_edited_time: '2024-01-20T15:00:00.000Z',
    created_by: { object: 'user', id: 'user-123' },
    last_edited_by: { object: 'user', id: 'user-123' },
    title: [{ 
      type: 'text', 
      text: { content: 'Test Database' }, 
      plain_text: 'Test Database',
      annotations: {}
    }],
    description: [],
    icon: null,
    cover: null,
    properties: {},
    parent: { type: 'workspace', workspace: true },
    url: 'https://notion.so/db-456',
    archived: false,
    is_inline: false,
  }

  const mockSearchResponse: SearchResponse = {
    object: 'list',
    results: [mockPage, mockDatabase],
    next_cursor: null,
    has_more: false,
    type: 'page_or_database',
    page_or_database: {},
  }

  describe('search', () => {
    it('should search with no parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse,
        headers: new Headers(),
      } as Response)

      const result = await client.search()

      expect(result).toEqual(mockSearchResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.notion.com/v1/search',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({}),
        })
      )
    })

    it('should search with query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse,
        headers: new Headers(),
      } as Response)

      const result = await client.search({ query: 'Test' })

      expect(result).toEqual(mockSearchResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.notion.com/v1/search',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ query: 'Test' }),
        })
      )
    })

    it('should search with filter and sort', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockSearchResponse, results: [mockPage] }),
        headers: new Headers(),
      } as Response)

      const result = await client.search({
        query: 'Project',
        filter: { value: 'page', property: 'object' },
        sort: { direction: 'descending', timestamp: 'last_edited_time' },
        page_size: 50,
      })

      expect(result.results).toHaveLength(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.notion.com/v1/search',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            query: 'Project',
            filter: { value: 'page', property: 'object' },
            sort: { direction: 'descending', timestamp: 'last_edited_time' },
            page_size: 50,
          }),
        })
      )
    })
  })

  describe('searchPages', () => {
    it('should search for pages only', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockSearchResponse, results: [mockPage] }),
        headers: new Headers(),
      } as Response)

      const result = await client.searchPages('Test')

      expect(result.results).toHaveLength(1)
      expect(result.results[0].object).toBe('page')
    })

    it('should search pages with sort', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockSearchResponse, results: [mockPage] }),
        headers: new Headers(),
      } as Response)

      await client.searchPages('Test', { sort: 'descending' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.notion.com/v1/search',
        expect.objectContaining({
          body: expect.stringContaining('"sort":{"direction":"descending","timestamp":"last_edited_time"}'),
        })
      )
    })
  })

  describe('searchDatabases', () => {
    it('should search for databases only', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockSearchResponse, results: [mockDatabase] }),
        headers: new Headers(),
      } as Response)

      const result = await client.searchDatabases('Test')

      expect(result.results).toHaveLength(1)
      expect(result.results[0].object).toBe('database')
    })
  })

  describe('searchAll', () => {
    it('should handle pagination automatically', async () => {
      const firstResponse: SearchResponse = {
        ...mockSearchResponse,
        next_cursor: 'cursor-123',
        has_more: true,
      }

      const secondResponse: SearchResponse = {
        ...mockSearchResponse,
        results: [mockPage],
        next_cursor: null,
        has_more: false,
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => firstResponse,
          headers: new Headers(),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => secondResponse,
          headers: new Headers(),
        } as Response)

      const results = await client.searchAll({ query: 'Test' })

      expect(results).toHaveLength(3) // 2 from first + 1 from second
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('findPageByTitle', () => {
    it('should find page with exact title match', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse,
        headers: new Headers(),
      } as Response)

      const result = await client.findPageByTitle('Test Page')

      expect(result).toEqual(mockPage)
    })

    it('should return null if no exact match found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse,
        headers: new Headers(),
      } as Response)

      const result = await client.findPageByTitle('Non-existent Page')

      expect(result).toBeNull()
    })
  })

  describe('findDatabaseByTitle', () => {
    it('should find database with exact title match', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse,
        headers: new Headers(),
      } as Response)

      const result = await client.findDatabaseByTitle('Test Database')

      expect(result).toEqual(mockDatabase)
    })
  })
})

describe('Search Helper Functions', () => {
  const mockPage: Page = {
    object: 'page',
    id: 'page-123',
    created_time: '2024-01-01T00:00:00.000Z',
    last_edited_time: '2024-01-15T10:00:00.000Z',
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
        title: [{ 
          type: 'text', 
          text: { content: 'Test Page' }, 
          plain_text: 'Test Page',
          annotations: {}
        }],
      },
    },
    url: 'https://notion.so/page-123',
  }

  const mockDatabase: Database = {
    object: 'database',
    id: 'db-456',
    created_time: '2024-01-05T00:00:00.000Z',
    last_edited_time: '2024-01-20T15:00:00.000Z',
    created_by: { object: 'user', id: 'user-123' },
    last_edited_by: { object: 'user', id: 'user-123' },
    title: [{ 
      type: 'text', 
      text: { content: 'Test Database' }, 
      plain_text: 'Test Database',
      annotations: {}
    }],
    description: [],
    icon: null,
    cover: null,
    properties: {},
    parent: { type: 'workspace', workspace: true },
    url: 'https://notion.so/db-456',
    archived: false,
    is_inline: false,
  }

  const results = [mockPage, mockDatabase]

  describe('filterPages', () => {
    it('should filter to only pages', () => {
      const pages = filterPages(results)
      expect(pages).toHaveLength(1)
      expect(pages[0]).toEqual(mockPage)
    })
  })

  describe('filterDatabases', () => {
    it('should filter to only databases', () => {
      const databases = filterDatabases(results)
      expect(databases).toHaveLength(1)
      expect(databases[0]).toEqual(mockDatabase)
    })
  })

  describe('extractTitle', () => {
    it('should extract title from page', () => {
      expect(extractTitle(mockPage)).toBe('Test Page')
    })

    it('should extract title from database', () => {
      expect(extractTitle(mockDatabase)).toBe('Test Database')
    })
  })

  describe('findByExactTitle', () => {
    it('should find item with exact title', () => {
      const result = findByExactTitle(results, 'Test Page')
      expect(result).toEqual(mockPage)
    })

    it('should return null if no match', () => {
      const result = findByExactTitle(results, 'Non-existent')
      expect(result).toBeNull()
    })
  })

  describe('findByPartialTitle', () => {
    it('should find items with partial title match', () => {
      const matches = findByPartialTitle(results, 'Test')
      expect(matches).toHaveLength(2)
    })

    it('should be case-insensitive', () => {
      const matches = findByPartialTitle(results, 'test')
      expect(matches).toHaveLength(2)
    })
  })

  describe('sortByLastEdited', () => {
    it('should sort by last edited time descending', () => {
      const sorted = sortByLastEdited(results)
      expect(sorted[0]).toEqual(mockDatabase) // More recently edited
      expect(sorted[1]).toEqual(mockPage)
    })

    it('should sort ascending when specified', () => {
      const sorted = sortByLastEdited(results, 'ascending')
      expect(sorted[0]).toEqual(mockPage)
      expect(sorted[1]).toEqual(mockDatabase)
    })
  })

  describe('sortByCreated', () => {
    it('should sort by created time', () => {
      const sorted = sortByCreated(results, 'ascending')
      expect(sorted[0]).toEqual(mockPage) // Created earlier
      expect(sorted[1]).toEqual(mockDatabase)
    })
  })

  describe('groupByParent', () => {
    it('should group items by parent', () => {
      const grouped = groupByParent(results)
      expect(grouped.size).toBe(2)
      expect(grouped.has('page:parent-123')).toBe(true)
      expect(grouped.has('workspace')).toBe(true)
    })
  })

  describe('filterByDateRange', () => {
    it('should filter by date range', () => {
      const startDate = new Date('2024-01-02')
      const endDate = new Date('2024-01-10')
      const filtered = filterByDateRange(results, startDate, endDate)
      expect(filtered).toHaveLength(1)
      expect(filtered[0]).toEqual(mockDatabase)
    })
  })

  describe('isRecentlyModified', () => {
    it('should check if recently modified', () => {
      const recentPage = { ...mockPage, last_edited_time: new Date().toISOString() }
      expect(isRecentlyModified(recentPage, 1)).toBe(true)
      expect(isRecentlyModified(mockPage, 1)).toBe(false)
    })
  })

  describe('summarizeSearchResults', () => {
    it('should summarize search results', () => {
      const response: SearchResponse = {
        object: 'list',
        results,
        next_cursor: 'cursor-123',
        has_more: true,
        type: 'page_or_database',
        page_or_database: {},
      }

      const summary = summarizeSearchResults(response)

      expect(summary).toEqual({
        total: 2,
        pages: 1,
        databases: 1,
        hasMore: true,
        titles: ['Test Page', 'Test Database'],
      })
    })
  })

  describe('createRecentSearchParams', () => {
    it('should create search params for recent items', () => {
      const params = createRecentSearchParams(48, 'page')
      
      expect(params).toEqual({
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
        page_size: 100,
        filter: {
          value: 'page',
          property: 'object',
        },
      })
    })
  })
})