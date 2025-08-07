# Notion Search API Reference

## Overview

The Search API allows you to search for pages and databases across your Notion workspace that have been shared with your integration. It provides a powerful way to find content by title and filter results by object type.

## Endpoint

```
POST https://api.notion.com/v1/search
```

## Request Parameters

### Query Parameter

The `query` parameter searches for pages and databases with titles containing the specified text.

```typescript
{
  "query": "Project Alpha"  // Optional: searches titles
}
```

**Note**: If `query` is omitted, the API returns all pages and databases shared with the integration.

### Filter Parameter

The `filter` parameter restricts results to specific object types.

```typescript
{
  "filter": {
    "value": "page" | "database",
    "property": "object"
  }
}
```

#### Filter Examples

**Pages only:**
```json
{
  "filter": {
    "value": "page",
    "property": "object"
  }
}
```

**Databases only:**
```json
{
  "filter": {
    "value": "database",
    "property": "object"
  }
}
```

### Sort Parameter

Sort results by last edited time.

```typescript
{
  "sort": {
    "direction": "ascending" | "descending",
    "timestamp": "last_edited_time"
  }
}
```

### Pagination Parameters

Handle large result sets with pagination.

```typescript
{
  "start_cursor": "cursor_string",  // From previous response's next_cursor
  "page_size": 100  // Max 100, default 100
}
```

## Complete Request Example

```typescript
{
  "query": "Engineering",
  "filter": {
    "value": "page",
    "property": "object"
  },
  "sort": {
    "direction": "descending",
    "timestamp": "last_edited_time"
  },
  "start_cursor": "7c6b1c95-de50-45ca-94e6-af1acdba3b88",
  "page_size": 50
}
```

## Response Format

### Successful Response

```typescript
{
  "object": "list",
  "results": [
    {
      "object": "page" | "database",
      "id": "page_or_database_id",
      "created_time": "2024-01-15T12:00:00.000Z",
      "last_edited_time": "2024-01-20T15:30:00.000Z",
      "created_by": {
        "object": "user",
        "id": "user_id"
      },
      "last_edited_by": {
        "object": "user",
        "id": "user_id"
      },
      "parent": {
        "type": "page_id" | "database_id" | "workspace",
        "page_id": "parent_id"  // or database_id
      },
      "properties": {
        // Page/Database properties
      },
      "url": "https://www.notion.so/page_id"
    }
    // ... more results
  ],
  "next_cursor": "next_page_cursor" | null,
  "has_more": boolean,
  "type": "page_or_database",
  "page_or_database": {}  // Deprecated field
}
```

## TypeScript Interface

```typescript
interface SearchParameters {
  query?: string
  filter?: {
    value: 'page' | 'database'
    property: 'object'
  }
  sort?: {
    direction: 'ascending' | 'descending'
    timestamp: 'last_edited_time'
  }
  start_cursor?: string
  page_size?: number
}

interface SearchResponse<T = Page | Database> {
  object: 'list'
  results: T[]
  next_cursor: string | null
  has_more: boolean
  type: 'page_or_database'
  page_or_database: {}  // Deprecated
}
```

## Usage Examples

### Basic Search

Search for all pages containing "Product":

```typescript
const results = await notion.search({
  query: "Product"
})
```

### Search Pages Only

Find all pages with "Design" in the title:

```typescript
const pages = await notion.search({
  query: "Design",
  filter: {
    value: "page",
    property: "object"
  }
})
```

### Search Databases

Find all databases containing "Tasks":

```typescript
const databases = await notion.search({
  query: "Tasks",
  filter: {
    value: "database",
    property: "object"
  }
})
```

### Get All Shared Content

Retrieve all pages and databases (no query):

```typescript
const allContent = await notion.search({})
```

### Sorted Search with Pagination

Get recently edited pages:

```typescript
const recentPages = await notion.search({
  filter: {
    value: "page",
    property: "object"
  },
  sort: {
    direction: "descending",
    timestamp: "last_edited_time"
  },
  page_size: 25
})
```

### Handle Pagination

Retrieve all results across multiple pages:

```typescript
async function searchAll(query: string): Promise<Array<Page | Database>> {
  const allResults = []
  let cursor = undefined
  
  do {
    const response = await notion.search({
      query,
      start_cursor: cursor,
      page_size: 100
    })
    
    allResults.push(...response.results)
    cursor = response.next_cursor
  } while (cursor)
  
  return allResults
}
```

## Important Limitations

1. **Shared Content Only**: Search only returns pages and databases that have been explicitly shared with your integration
2. **Title Search**: The query parameter only searches within page/database titles, not content
3. **No Full-Text Search**: Does not search within page content or block text
4. **Linked Databases**: Excludes duplicated linked databases from results
5. **Integration Capabilities**: Results respect the integration's permissions and capabilities

## Performance Considerations

### Rate Limiting
- Subject to standard Notion API rate limits (~3 requests per second)
- Implement client-side rate limiting for bulk searches

### Optimization Tips
1. Use filters to reduce result set size
2. Implement caching for frequently searched terms
3. Use pagination with reasonable page_size (25-50 for UI, 100 for batch)
4. Consider database queries for searching within specific databases

## Error Handling

### Common Error Codes

- `401 unauthorized`: Invalid API key or insufficient permissions
- `429 rate_limited`: Too many requests, check Retry-After header
- `400 invalid_request`: Malformed request parameters
- `503 service_unavailable`: Notion API temporarily unavailable

### Error Response Format

```json
{
  "object": "error",
  "status": 400,
  "code": "invalid_request",
  "message": "Invalid filter property"
}
```

## Best Practices

1. **Use Specific Filters**: Always use filters when you know the object type
2. **Implement Caching**: Cache search results for common queries
3. **Handle Empty Results**: Check for empty results array
4. **Respect Rate Limits**: Implement exponential backoff for retries
5. **Optimize Queries**: Use more specific search terms to reduce result sets

## Alternative Approaches

### When to Use Database Query Instead

Use the database query endpoint when:
- Searching within a specific database
- Need to filter by properties other than title
- Require complex filtering conditions
- Want to sort by database properties

```typescript
// Better for database-specific searches
const results = await notion.databases.query({
  database_id: "database_id",
  filter: {
    property: "Name",
    title: {
      contains: "Project"
    }
  }
})
```

## Integration with NotionClient

The search functionality integrates seamlessly with our NotionClient:

```typescript
// Simple search
const results = await client.search({ query: "Budget" })

// Advanced search with all options
const pages = await client.searchPages("Project", {
  sort: "descending",
  page_size: 50
})

// Search all databases
const databases = await client.searchDatabases()
```