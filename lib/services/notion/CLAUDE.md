# Notion API Service Documentation

This directory contains the Notion API integration service for managing and interacting with Notion pages and databases.

## Documentation Files

### 📋 API Reference
- **[authorization.md](./docs/authorization.md)** - Authentication setup and security
- **[blocks.md](./docs/blocks.md)** - Complete guide to Notion blocks
- **[page-content.md](./docs/page-content.md)** - Working with blocks and content
- **[page-parent.md](./docs/page-parent.md)** - Understanding page hierarchy
- **[create-page.md](./docs/create-page.md)** - Creating new pages
- **[update-page.md](./docs/update-page.md)** - Updating page properties
- **[retrieve-page.md](./docs/retrieve-page.md)** - Fetching page data
- **[retrieve-page-property.md](./docs/retrieve-page-property.md)** - Getting property details
- **[search.md](./docs/search.md)** - **NEW: Comprehensive search API documentation**

## Service Architecture

### Core Components

```typescript
// notion-client.ts - Main API client
export class NotionClient {
  constructor(apiKey: string)
  
  // Page operations
  async createPage(data: CreatePageRequest): Promise<Page>
  async getPage(pageId: string): Promise<Page>
  async updatePage(pageId: string, data: UpdatePageRequest): Promise<Page>
  
  // Block operations
  async getBlock(blockId: string): Promise<Block>
  async getBlockChildren(blockId: string): Promise<PaginatedResponse<Block>>
  async getAllBlockChildren(blockId: string): Promise<Block[]>
  async getPageContent(pageId: string): Promise<PaginatedResponse<Block>>
  async getAllPageContent(pageId: string): Promise<Block[]>
  async appendBlocks(pageId: string, blocks: Block[]): Promise<Block[]>
  async updateBlock(blockId: string, data: Partial<Block>): Promise<Block>
  async deleteBlock(blockId: string): Promise<Block>
  
  // Property operations
  async getPageProperty(pageId: string, propertyId: string): Promise<PropertyValue>
  async getAllPropertyData(pageId: string, propertyId: string): Promise<PropertyValue>
  
  // Database operations
  async queryDatabase(databaseId: string, query?: any): Promise<PaginatedResponse<Page>>
  
  // Search operations (Enhanced)
  async search(params: SearchParameters): Promise<SearchResponse>
  async searchPages(query?: string, options?: SearchOptions): Promise<SearchResponse>
  async searchDatabases(query?: string, options?: SearchOptions): Promise<SearchResponse>
  async searchAll(params: SearchParameters): Promise<Array<Page | Database>>
  async getAllSharedPages(options?: SearchOptions): Promise<SearchResponse>
  async getAllSharedDatabases(options?: SearchOptions): Promise<SearchResponse>
  async findPageByTitle(title: string): Promise<Page | null>
  async findDatabaseByTitle(title: string): Promise<Database | null>
}

// notion-types.ts - TypeScript interfaces
export interface Page { ... }
export interface Block { ... }
export interface Database { ... }
export interface PropertyValue { ... }

// notion-helpers.ts - Utility functions
export function createTextBlock(content: string): Block
export function createHeadingBlock(content: string, level: 1 | 2 | 3): Block
export function extractPageTitle(page: Page): string
export function formatRichText(text: string, annotations?: Annotations): RichText[]

// Search helper functions (NEW)
export function filterPages(results: Array<Page | Database>): Page[]
export function filterDatabases(results: Array<Page | Database>): Database[]
export function extractTitle(item: Page | Database): string
export function findByExactTitle(results: Array<Page | Database>, title: string): Page | Database | null
export function findByPartialTitle(results: Array<Page | Database>, query: string): Array<Page | Database>
export function sortByLastEdited(results: Array<Page | Database>, direction?: 'ascending' | 'descending'): Array<Page | Database>
export function sortByCreated(results: Array<Page | Database>, direction?: 'ascending' | 'descending'): Array<Page | Database>
export function groupByParent(results: Array<Page | Database>): Map<string, Array<Page | Database>>
export function filterByDateRange(results: Array<Page | Database>, startDate?: Date, endDate?: Date): Array<Page | Database>
export function isRecentlyModified(item: Page | Database, hoursAgo?: number): boolean
export function summarizeSearchResults(response: SearchResponse): SearchSummary
```

## Environment Configuration

```bash
# .env.local or .env.development.local
NOTION_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Quick Start Guide

### 1. Basic Setup
```typescript
import { NotionClient } from '@/lib/services/notion/notion-client'

const notion = new NotionClient(process.env.NOTION_KEY!)
```

### 2. Create a Page
```typescript
const page = await notion.createPage({
  parent: { page_id: 'parent-page-id' },
  properties: {
    title: {
      title: [{ text: { content: 'New Page Title' } }]
    }
  },
  children: [
    createHeadingBlock('Welcome', 1),
    createTextBlock('This is the first paragraph.')
  ]
})
```

### 3. Update Page Properties
```typescript
await notion.updatePage(pageId, {
  properties: {
    Status: { select: { name: 'Completed' } },
    Priority: { number: 1 }
  },
  icon: { type: 'emoji', emoji: '✅' }
})
```

### 4. Get Page with Content
```typescript
const page = await notion.getPage(pageId)
const content = await notion.getPageContent(pageId)

console.log('Page:', page.properties.title)
console.log('Blocks:', content.length)
```

## Working with Blocks

### Understanding Block Structure
Blocks are the fundamental content units in Notion. See [blocks.md](./blocks.md) for comprehensive documentation on all block types.

### Creating Rich Content
```typescript
// Create a page with various block types
const page = await notion.createPage({
  parent: { page_id: 'parent-id' },
  properties: {
    title: createTitleProperty('My Rich Content Page')
  },
  children: [
    createHeading('Introduction', 1),
    createParagraph('This page demonstrates various block types.'),
    createDivider(),
    
    createHeading('Code Examples', 2),
    createCodeBlock(`
      function hello() {
        console.log('Hello, Notion!')
      }
    `, 'javascript'),
    
    createCallout('💡 Pro tip: Use callouts for important notes!', 'blue'),
    
    createHeading('Task List', 2),
    createTodo('Complete API integration', false),
    createTodo('Write documentation', true),
    
    createQuote('The best way to predict the future is to invent it.')
  ]
})
```

### Processing Block Content
```typescript
// Extract all text from a page
async function extractPageText(pageId: string): string {
  const blocks = await notion.getAllPageContent(pageId)
  
  return blocks
    .map(block => {
      const type = block.type
      const data = block[type]
      
      if ('rich_text' in data) {
        return data.rich_text.map(rt => rt.plain_text).join('')
      }
      
      return ''
    })
    .filter(text => text)
    .join('\n\n')
}
```

### Updating Blocks
```typescript
// Update a to-do block's checked status
await notion.updateBlock(blockId, {
  type: 'to_do',
  to_do: {
    rich_text: existingRichText,
    checked: true
  }
})

// Update paragraph text
await notion.updateBlock(blockId, {
  type: 'paragraph',
  paragraph: {
    rich_text: createRichText('Updated content')
  }
})
```

## Enhanced Search Functionality

### Basic Search Operations

```typescript
// Search all content
const allResults = await notion.search({ query: "Project" })

// Search pages only
const pages = await notion.searchPages("Design")

// Search databases only
const databases = await notion.searchDatabases("Tasks")

// Search with sorting
const recentPages = await notion.searchPages(undefined, {
  sort: 'descending',
  page_size: 25
})

// Get all pages and databases (no query)
const allShared = await notion.search({})
```

### Advanced Search Features

```typescript
// Find exact title match
const specificPage = await notion.findPageByTitle("Q4 Budget Report")
const specificDb = await notion.findDatabaseByTitle("Project Tasks")

// Get all results (handles pagination automatically)
const allProjectPages = await notion.searchAll({
  query: "Project",
  filter: { value: "page", property: "object" }
})

// Search with complex parameters
const filteredResults = await notion.search({
  query: "Engineering",
  filter: { value: "page", property: "object" },
  sort: { direction: "descending", timestamp: "last_edited_time" },
  page_size: 50
})
```

### Using Search Helpers

```typescript
import {
  filterPages,
  filterDatabases,
  findByPartialTitle,
  sortByLastEdited,
  isRecentlyModified,
  summarizeSearchResults
} from '@/lib/services/notion/notion-helpers'

// Get search results
const searchResponse = await notion.search({ query: "Product" })

// Filter and process results
const pages = filterPages(searchResponse.results)
const databases = filterDatabases(searchResponse.results)

// Find partial matches
const designDocs = findByPartialTitle(searchResponse.results, "design")

// Sort by last edited
const recentFirst = sortByLastEdited(searchResponse.results)

// Check for recent modifications
const recentlyUpdated = searchResponse.results.filter(item => 
  isRecentlyModified(item, 24) // Last 24 hours
)

// Get summary information
const summary = summarizeSearchResults(searchResponse)
console.log(`Found ${summary.pages} pages and ${summary.databases} databases`)
```

### Practical Search Examples

```typescript
// Find all pages modified today
async function getTodaysPages() {
  const response = await notion.searchPages(undefined, {
    sort: 'descending'
  })
  
  return response.results.filter(page => 
    isRecentlyModified(page, 24)
  )
}

// Search and group by parent
async function getContentStructure() {
  const allContent = await notion.searchAll({})
  const grouped = groupByParent(allContent)
  
  for (const [parent, items] of grouped) {
    console.log(`${parent}: ${items.length} items`)
  }
  
  return grouped
}

// Find pages in date range
async function getQuarterlyReports(quarter: number, year: number) {
  const startDate = new Date(year, (quarter - 1) * 3, 1)
  const endDate = new Date(year, quarter * 3, 0)
  
  const allPages = await notion.searchAll({
    query: "Report",
    filter: { value: "page", property: "object" }
  })
  
  return filterByDateRange(allPages, startDate, endDate)
}
```

## Common Use Cases

### Blog Post Management
```typescript
// Create blog post in Notion
async function createBlogPost(title: string, content: string, tags: string[]) {
  return await notion.createPage({
    parent: { database_id: BLOG_DATABASE_ID },
    properties: {
      Title: { title: [{ text: { content: title } }] },
      Tags: { multi_select: tags.map(tag => ({ name: tag })) },
      Status: { select: { name: 'Draft' } },
      'Published Date': { date: { start: new Date().toISOString() } }
    },
    children: parseMarkdownToBlocks(content)
  })
}
```

### Task Management
```typescript
// Sync tasks with Notion database
async function syncTask(task: Task) {
  if (task.notionId) {
    // Update existing
    return await notion.updatePage(task.notionId, {
      properties: {
        Name: { title: [{ text: { content: task.name } }] },
        Status: { select: { name: task.status } },
        Due: { date: { start: task.dueDate } }
      }
    })
  } else {
    // Create new
    return await notion.createPage({
      parent: { database_id: TASKS_DATABASE_ID },
      properties: {
        Name: { title: [{ text: { content: task.name } }] },
        Status: { select: { name: task.status } },
        Due: { date: { start: task.dueDate } }
      }
    })
  }
}
```

### Content Migration
```typescript
// Import MDX blog posts to Notion
async function importMDXToNotion(mdxContent: string, metadata: BlogMetadata) {
  const blocks = await convertMDXToNotionBlocks(mdxContent)
  
  return await notion.createPage({
    parent: { database_id: BLOG_DATABASE_ID },
    properties: {
      Title: { title: [{ text: { content: metadata.title } }] },
      Excerpt: { rich_text: [{ text: { content: metadata.excerpt } }] },
      Author: { rich_text: [{ text: { content: metadata.author } }] },
      Tags: { multi_select: metadata.tags.map(tag => ({ name: tag })) }
    },
    icon: { type: 'emoji', emoji: '📝' },
    children: blocks
  })
}
```

## Error Handling

### Rate Limiting
```typescript
class NotionRateLimiter {
  private requestQueue: Array<() => Promise<any>> = []
  private processing = false
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      
      this.processQueue()
    })
  }
  
  private async processQueue() {
    if (this.processing) return
    this.processing = true
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!
      await request()
      await new Promise(resolve => setTimeout(resolve, 350)) // ~3 req/sec
    }
    
    this.processing = false
  }
}
```

### Error Recovery
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      const delay = Math.pow(2, i) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retries exceeded')
}
```

## Testing Strategy

### Unit Tests
```typescript
// Mock Notion API responses
jest.mock('@/lib/services/notion/notion-client')

test('creates page with content', async () => {
  const mockPage = { id: 'page-123', properties: {...} }
  NotionClient.prototype.createPage.mockResolvedValue(mockPage)
  
  const result = await createBlogPost('Test', 'Content', ['tag1'])
  expect(result.id).toBe('page-123')
})
```

### Integration Tests
```typescript
// Test with real Notion API (test workspace)
test.skip('integration: creates real page', async () => {
  const notion = new NotionClient(process.env.NOTION_TEST_KEY!)
  const page = await notion.createPage({...})
  
  expect(page.id).toBeDefined()
  
  // Cleanup
  await notion.archivePage(page.id)
})
```

## Security Best Practices

1. **API Key Storage**: Never commit API keys, use environment variables
2. **Permission Scoping**: Only request necessary permissions
3. **Input Validation**: Validate all data before sending to Notion
4. **Error Messages**: Don't expose internal IDs in error messages
5. **Rate Limiting**: Implement client-side rate limiting

## Performance Optimization

### Caching Strategy
```typescript
import { blogCache } from '@/lib/core/caching/cache-manager'

async function getCachedNotionPage(pageId: string) {
  const cacheKey = `notion:page:${pageId}`
  
  // Check cache
  const cached = await blogCache.get(cacheKey)
  if (cached) return cached
  
  // Fetch from Notion
  const page = await notion.getPage(pageId)
  
  // Cache for 5 minutes
  await blogCache.set(cacheKey, page, 5 * 60 * 1000)
  
  return page
}
```

### Batch Operations
```typescript
async function batchUpdatePages(updates: Array<{id: string, data: any}>) {
  // Process in chunks to respect rate limits
  const chunks = chunk(updates, 3)
  
  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(({ id, data }) => notion.updatePage(id, data))
    )
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}
```

## Future Enhancements

### Planned Features
1. **Database Operations**: Query and filter database pages
2. **Block Operations**: Update and delete individual blocks
3. **Search API**: Search across workspace content
4. **Webhooks**: Listen for Notion changes
5. **Sync Engine**: Two-way sync with local content

### Integration Ideas
- Sync blog posts between MDX files and Notion
- Manage learning modules in Notion databases
- Track project tasks and progress
- Content calendar management
- Knowledge base synchronization

## Learn Agentic AI Hub

### Overview
The Learn Agentic AI hub is a comprehensive Notion-based learning resource that organizes blog posts, video summaries, and technical guides into structured learning tracks. See [notion-hub-structure.md](./notion-hub-structure.md) for the complete architecture documentation.

### Hub Structure
```
Learn Agentic AI (Root Page - ID: 24647f4e622b80bba146e4b181ed10ff)
├── 📚 Content Library (All content browsable)
├── 🎯 Learning Tracks (4 structured paths)
├── 🛠️ Technical Guides (Implementation focused)
└── 🚀 Quick Start (Getting started resources)
```

### Content Organization
- **37 Blog Posts**: Organized by learning track and difficulty
- **11 Video Summaries**: YouTube content with full transcripts
- **4 Learning Tracks**: Claude Code, Reliable Agents, Fundamentals, Production
- **Technical Guides**: MCP series and implementation guides

### API Functions for Hub Management
```typescript
// notion-hub-api.ts
export async function createContentPage(content: ContentData, parentId: string)
export async function createTrackPage(track: TrackData)
export async function updateHubNavigation(hubId: string)
export async function linkRelatedContent(videoId: string, blogId: string)
export async function addNewContent(content: NewContent)
```

### Maintenance Scripts
- `scripts/create-notion-hub-v2.ts` - Main hub creation/update script
- `scripts/notion-content-mapper.ts` - Content relationship management
- `scripts/video-blog-mapping.ts` - Video to blog post mappings

## Resources

- [Official Notion API Docs](https://developers.notion.com)
- [API Reference](https://developers.notion.com/reference)
- [Notion SDK for JavaScript](https://github.com/makenotion/notion-sdk-js)
- [Community Examples](https://github.com/makenotion/notion-sdk-js/tree/main/examples)
- [Learn Agentic AI Hub Documentation](./notion-hub-structure.md)