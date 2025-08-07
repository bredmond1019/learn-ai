# Retrieve Page Endpoint

## Endpoint Details
- **URL**: `https://api.notion.com/v1/pages/{page_id}`
- **Method**: `GET`
- **Required Headers**:
  ```typescript
  {
    'Authorization': 'Bearer {integration_token}',
    'Notion-Version': '2022-06-28'
  }
  ```

## Overview
Retrieves a Page object with its properties and metadata. This endpoint returns page properties but **not** page content (blocks).

## Key Limitations
- Returns maximum 25 references per page property
- Does not return page content/blocks
- For full property data, use [Retrieve Page Property](./retrieve-page-property.md)
- For page content, use Retrieve Block Children endpoint

## Response Format

### Page Object Structure
```typescript
interface PageObject {
  object: 'page'
  id: string
  created_time: string
  last_edited_time: string
  created_by: PartialUser
  last_edited_by: PartialUser
  cover: ExternalFile | null
  icon: Emoji | ExternalFile | null
  parent: DatabaseParent | PageParent | WorkspaceParent
  archived: boolean
  properties: Record<string, PropertyValue>
  url: string
  public_url: string | null
}
```

### Property Values
Properties returned depend on parent type:

#### Database Page Properties
```typescript
{
  properties: {
    Name: {
      id: 'title',
      type: 'title',
      title: [{ type: 'text', text: { content: 'Task Name' } }]
    },
    Status: {
      id: 'select_id',
      type: 'select',
      select: { id: 'status_id', name: 'In Progress', color: 'blue' }
    },
    Priority: {
      id: 'number_id',
      type: 'number',
      number: 3
    },
    Due: {
      id: 'date_id',
      type: 'date',
      date: { start: '2024-01-20', end: null }
    }
  }
}
```

#### Regular Page Properties
```typescript
{
  properties: {
    title: {
      id: 'title',
      type: 'title',
      title: [{ type: 'text', text: { content: 'Page Title' } }]
    }
  }
}
```

## Usage Examples

### Basic Page Retrieval
```typescript
const getPage = async (pageId: string) => {
  const response = await fetch(
    `https://api.notion.com/v1/pages/${pageId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_KEY}`,
        'Notion-Version': '2022-06-28'
      }
    }
  )
  
  if (!response.ok) {
    throw new Error(`Failed to retrieve page: ${response.status}`)
  }
  
  return await response.json()
}
```

### Get Page with Error Handling
```typescript
const getPageSafely = async (pageId: string) => {
  try {
    const response = await fetch(
      `https://api.notion.com/v1/pages/${pageId}`,
      { headers }
    )
    
    if (!response.ok) {
      const error = await response.json()
      
      switch (error.code) {
        case 'object_not_found':
          throw new Error('Page not found or not accessible')
        case 'unauthorized':
          throw new Error('Invalid integration token')
        case 'restricted_resource':
          throw new Error('Integration lacks permission to access page')
        default:
          throw new Error(error.message)
      }
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to retrieve page:', error)
    throw error
  }
}
```

### Extract Page Information
```typescript
const getPageInfo = async (pageId: string) => {
  const page = await getPage(pageId)
  
  return {
    id: page.id,
    url: page.url,
    isArchived: page.archived,
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    title: getPageTitle(page),
    parentType: page.parent.type,
    parentId: getParentId(page.parent),
    hasIcon: !!page.icon,
    hasCover: !!page.cover
  }
}

// Helper functions
const getPageTitle = (page: PageObject): string => {
  const titleProp = page.properties.title || page.properties.Name
  if (titleProp?.type === 'title') {
    return titleProp.title
      .map(text => text.plain_text)
      .join('')
  }
  return 'Untitled'
}

const getParentId = (parent: any): string | null => {
  switch (parent.type) {
    case 'database_id':
      return parent.database_id
    case 'page_id':
      return parent.page_id
    case 'workspace':
      return null
    default:
      return null
  }
}
```

## Working with Properties

### Database Page Properties
```typescript
const getDatabasePageData = async (pageId: string) => {
  const page = await getPage(pageId)
  
  // Extract specific property values
  const taskData = {
    name: getPropertyValue(page.properties.Name),
    status: getPropertyValue(page.properties.Status),
    priority: getPropertyValue(page.properties.Priority),
    assignee: getPropertyValue(page.properties.Assignee),
    dueDate: getPropertyValue(page.properties.Due),
    tags: getPropertyValue(page.properties.Tags)
  }
  
  return taskData
}

// Generic property value extractor
const getPropertyValue = (property: any): any => {
  if (!property) return null
  
  switch (property.type) {
    case 'title':
    case 'rich_text':
      return property[property.type]
        .map((text: any) => text.plain_text)
        .join('')
    
    case 'number':
      return property.number
    
    case 'select':
      return property.select?.name
    
    case 'multi_select':
      return property.multi_select.map((item: any) => item.name)
    
    case 'date':
      return property.date?.start
    
    case 'checkbox':
      return property.checkbox
    
    case 'people':
      return property.people.map((person: any) => person.name)
    
    case 'url':
      return property.url
    
    default:
      return null
  }
}
```

### Handle Truncated Properties
```typescript
const getFullPropertyData = async (pageId: string, propertyId: string) => {
  const page = await getPage(pageId)
  const property = page.properties[propertyId]
  
  // Check if property has more than 25 items
  if (property.has_more) {
    console.log('Property has more than 25 items, fetching full data...')
    
    // Use Retrieve Page Property endpoint for full data
    return await getPageProperty(pageId, propertyId)
  }
  
  return property
}
```

## Complete Example with Content

```typescript
const getPageWithContent = async (pageId: string) => {
  // Get page metadata
  const page = await getPage(pageId)
  
  // Get page content blocks
  const blocks = await getPageBlocks(pageId)
  
  return {
    ...page,
    content: blocks
  }
}

const getPageBlocks = async (pageId: string) => {
  let allBlocks = []
  let cursor = undefined
  
  do {
    const response = await fetch(
      `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${
        cursor ? `&start_cursor=${cursor}` : ''
      }`,
      { headers }
    )
    
    const data = await response.json()
    allBlocks = [...allBlocks, ...data.results]
    cursor = data.next_cursor
  } while (cursor)
  
  return allBlocks
}
```

## Common Patterns

### Page Type Detection
```typescript
const getPageType = async (pageId: string) => {
  const page = await getPage(pageId)
  
  if (page.parent.type === 'database_id') {
    return {
      type: 'database_item',
      databaseId: page.parent.database_id,
      propertyCount: Object.keys(page.properties).length
    }
  } else {
    return {
      type: 'regular_page',
      parentType: page.parent.type,
      hasOnlyTitle: Object.keys(page.properties).length === 1
    }
  }
}
```

### Batch Page Retrieval
```typescript
const getPages = async (pageIds: string[]) => {
  const results = await Promise.allSettled(
    pageIds.map(id => getPage(id))
  )
  
  return results.map((result, index) => ({
    pageId: pageIds[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }))
}
```

### Page Cache Implementation
```typescript
class PageCache {
  private cache = new Map<string, { page: PageObject; timestamp: number }>()
  private ttl = 5 * 60 * 1000 // 5 minutes
  
  async get(pageId: string): Promise<PageObject> {
    const cached = this.cache.get(pageId)
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.page
    }
    
    const page = await getPage(pageId)
    this.cache.set(pageId, { page, timestamp: Date.now() })
    
    return page
  }
  
  invalidate(pageId: string) {
    this.cache.delete(pageId)
  }
  
  clear() {
    this.cache.clear()
  }
}
```

## Error Scenarios

### Common Errors
```typescript
// 404 Not Found
{
  "object": "error",
  "status": 404,
  "code": "object_not_found",
  "message": "Could not find page with ID: {page_id}"
}

// 403 Forbidden
{
  "object": "error",
  "status": 403,
  "code": "restricted_resource",
  "message": "Integration doesn't have access to this page"
}

// 400 Bad Request
{
  "object": "error",
  "status": 400,
  "code": "invalid_request",
  "message": "Invalid page ID format"
}
```

## Best Practices

### 1. Check Permissions First
```typescript
const canAccessPage = async (pageId: string): Promise<boolean> => {
  try {
    await getPage(pageId)
    return true
  } catch (error) {
    if (error.message.includes('not found') || 
        error.message.includes('access')) {
      return false
    }
    throw error
  }
}
```

### 2. Handle Archived Pages
```typescript
const getActivePage = async (pageId: string) => {
  const page = await getPage(pageId)
  
  if (page.archived) {
    throw new Error('Page is archived')
  }
  
  return page
}
```

### 3. Efficient Data Fetching
```typescript
const getPageEssentials = async (pageId: string) => {
  const page = await getPage(pageId)
  
  // Only extract what you need
  return {
    id: page.id,
    title: getPageTitle(page),
    lastEdited: page.last_edited_time,
    isDatabase: page.parent.type === 'database_id'
  }
}
```

## Related Endpoints
- [Create Page](./create-page.md) - Create new pages
- [Update Page](./update-page.md) - Modify page properties
- [Retrieve Page Property](./retrieve-page-property.md) - Get full property data
- Retrieve Block Children - Get page content