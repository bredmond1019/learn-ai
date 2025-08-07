# Update Page Endpoint

## Endpoint Details
- **URL**: `https://api.notion.com/v1/pages/{page_id}`
- **Method**: `PATCH`
- **Required Headers**:
  ```typescript
  {
    'Authorization': 'Bearer {integration_token}',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  }
  ```

## Required Capabilities
- Integration must have **"Update content"** capability
- Page must be shared with integration

## What Can Be Updated

### 1. Page Properties
- ✅ Database properties (for database pages)
- ❌ Cannot update rollup properties
- ❌ Cannot update formula properties
- ❌ Cannot update computed properties

### 2. Page Metadata
- ✅ Icon (emoji or external image)
- ✅ Cover image
- ✅ Archived status

### 3. What Cannot Be Changed
- ❌ Page parent
- ❌ Page content (use append blocks endpoint)
- ❌ Created/edited timestamps
- ❌ Created/edited by users

## Request Body Structure

### Interface
```typescript
interface UpdatePageRequest {
  properties?: Record<string, any>    // Update properties
  icon?: PageIcon | null             // Update or remove icon
  cover?: PageCover | null           // Update or remove cover
  archived?: boolean                 // Archive/unarchive page
}
```

### Update Properties Example
```typescript
{
  properties: {
    // For database pages - must match schema
    Status: { select: { name: 'Completed' } },
    Priority: { number: 1 },
    Tags: { multi_select: [{ name: 'done' }, { name: 'reviewed' }] },
    
    // For regular pages - only title
    title: {
      title: [{ text: { content: 'Updated Title' } }]
    }
  }
}
```

### Update Icon
```typescript
// Set emoji icon
{
  icon: {
    type: 'emoji',
    emoji: '✅'
  }
}

// Set external icon
{
  icon: {
    type: 'external',
    external: { url: 'https://example.com/icon.png' }
  }
}

// Remove icon
{
  icon: null
}
```

### Update Cover
```typescript
// Set cover image
{
  cover: {
    type: 'external',
    external: { url: 'https://example.com/cover.jpg' }
  }
}

// Remove cover
{
  cover: null
}
```

### Archive/Unarchive
```typescript
// Archive page
{
  archived: true
}

// Restore page
{
  archived: false
}
```

## Complete Examples

### Update Database Item
```typescript
const updateTask = async (pageId: string) => {
  const response = await fetch(
    `https://api.notion.com/v1/pages/${pageId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          Status: { select: { name: 'Done' } },
          Completed: { checkbox: true },
          CompletedDate: { date: { start: new Date().toISOString() } }
        },
        icon: {
          type: 'emoji',
          emoji: '✅'
        }
      })
    }
  )
  
  return await response.json()
}
```

### Update Multiple Properties
```typescript
const updateProjectStatus = async (
  pageId: string,
  updates: {
    status: string
    progress: number
    lastUpdated: string
    tags: string[]
  }
) => {
  const response = await fetch(
    `https://api.notion.com/v1/pages/${pageId}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        properties: {
          Status: { select: { name: updates.status } },
          Progress: { number: updates.progress },
          'Last Updated': { date: { start: updates.lastUpdated } },
          Tags: { 
            multi_select: updates.tags.map(tag => ({ name: tag }))
          }
        }
      })
    }
  )
  
  return await response.json()
}
```

### Archive Pages in Bulk
```typescript
const archivePages = async (pageIds: string[]) => {
  const results = await Promise.all(
    pageIds.map(async (pageId) => {
      try {
        const response = await fetch(
          `https://api.notion.com/v1/pages/${pageId}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ archived: true })
          }
        )
        return { pageId, success: response.ok }
      } catch (error) {
        return { pageId, success: false, error }
      }
    })
  )
  
  return results
}
```

## Response Format
Returns the updated page object with all properties:

```typescript
interface PageResponse {
  object: 'page'
  id: string
  created_time: string
  last_edited_time: string    // Updated timestamp
  created_by: { object: 'user', id: string }
  last_edited_by: { object: 'user', id: string }
  cover: PageCover | null
  icon: PageIcon | null
  parent: PageParent
  archived: boolean
  properties: Record<string, any>  // Updated properties
  url: string
  public_url: string | null
}
```

## Error Handling

### Common Errors

#### 400 Bad Request
```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "body.properties.Status.select.name is not a valid select option"
}
```

#### 403 Forbidden
```json
{
  "object": "error",
  "status": 403,
  "code": "insufficient_permissions",
  "message": "Integration doesn't have update content capabilities"
}
```

#### 404 Not Found
```json
{
  "object": "error",
  "status": 404,
  "code": "object_not_found",
  "message": "Could not find page with ID: {page_id}"
}
```

### Safe Update Function
```typescript
const updatePageSafely = async (
  pageId: string,
  updates: UpdatePageRequest
) => {
  try {
    const response = await fetch(
      `https://api.notion.com/v1/pages/${pageId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      
      switch (error.code) {
        case 'insufficient_permissions':
          throw new Error('No update permission for this page')
        case 'object_not_found':
          throw new Error('Page not found or not accessible')
        case 'validation_error':
          throw new Error(`Invalid update: ${error.message}`)
        case 'conflict_error':
          throw new Error('Page was modified by another user')
        default:
          throw new Error(error.message)
      }
    }
    
    return await response.json()
  } catch (error) {
    console.error('Update failed:', error)
    throw error
  }
}
```

## Common Patterns

### Conditional Updates
```typescript
const updateIfNeeded = async (
  pageId: string,
  currentStatus: string,
  newStatus: string
) => {
  if (currentStatus === newStatus) {
    console.log('No update needed')
    return null
  }
  
  return await updatePageSafely(pageId, {
    properties: {
      Status: { select: { name: newStatus } },
      'Last Modified': { date: { start: new Date().toISOString() } }
    }
  })
}
```

### Batch Property Updates
```typescript
interface PropertyUpdate {
  [key: string]: any
}

const batchUpdateProperties = async (
  pageId: string,
  updates: PropertyUpdate[]
) => {
  const properties = updates.reduce((acc, update) => ({
    ...acc,
    ...update
  }), {})
  
  return await updatePageSafely(pageId, { properties })
}
```

### Update with Validation
```typescript
const updateTaskStatus = async (
  pageId: string,
  newStatus: 'To Do' | 'In Progress' | 'Done'
) => {
  const validStatuses = ['To Do', 'In Progress', 'Done']
  
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`)
  }
  
  const updates: UpdatePageRequest = {
    properties: {
      Status: { select: { name: newStatus } }
    }
  }
  
  // Add completion data for Done status
  if (newStatus === 'Done') {
    updates.properties.Completed = { checkbox: true }
    updates.properties.CompletedDate = { 
      date: { start: new Date().toISOString() }
    }
    updates.icon = { type: 'emoji', emoji: '✅' }
  }
  
  return await updatePageSafely(pageId, updates)
}
```

## Best Practices

### 1. Validate Before Updating
```typescript
const validateDatabaseUpdate = async (
  databaseId: string,
  properties: Record<string, any>
) => {
  // Fetch database schema
  const database = await fetchDatabase(databaseId)
  const schema = database.properties
  
  // Validate each property
  for (const [key, value] of Object.entries(properties)) {
    if (!schema[key]) {
      throw new Error(`Property ${key} not in database schema`)
    }
    // Additional type validation...
  }
}
```

### 2. Handle Concurrent Updates
```typescript
const updateWithRetry = async (
  pageId: string,
  updates: UpdatePageRequest,
  maxRetries = 3
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await updatePageSafely(pageId, updates)
    } catch (error) {
      if (error.message.includes('conflict') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }
      throw error
    }
  }
}
```

### 3. Atomic Updates
```typescript
const atomicStatusTransition = async (
  pageId: string,
  fromStatus: string,
  toStatus: string
) => {
  // Get current page state
  const page = await fetchPage(pageId)
  const currentStatus = page.properties.Status?.select?.name
  
  // Verify current state
  if (currentStatus !== fromStatus) {
    throw new Error(
      `Cannot transition from ${currentStatus} to ${toStatus}`
    )
  }
  
  // Perform update
  return await updatePageSafely(pageId, {
    properties: {
      Status: { select: { name: toStatus } },
      'Previous Status': { select: { name: fromStatus } },
      'Transitioned At': { date: { start: new Date().toISOString() } }
    }
  })
}
```

## Limitations & Workarounds

### Cannot Change Parent
If you need to "move" a page:
1. Create a new page with desired parent
2. Copy all properties and content
3. Archive or delete original page

### Cannot Update Content
To modify page content:
1. Use [Append Block Children](./append-blocks.md) to add content
2. Use Update Block endpoint to modify existing blocks
3. Use Delete Block endpoint to remove blocks

### Read-Only Properties
These properties cannot be updated:
- Rollup
- Formula  
- Created time/by
- Last edited time/by
- Unique ID