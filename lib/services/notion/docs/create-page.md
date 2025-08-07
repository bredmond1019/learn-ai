# Create Page Endpoint

## Endpoint Details
- **URL**: `https://api.notion.com/v1/pages`
- **Method**: `POST`
- **Required Headers**:
  ```typescript
  {
    'Authorization': 'Bearer {integration_token}',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  }
  ```

## Required Capabilities
- Integration must have **"Insert content"** capability
- Parent page/database must be shared with integration

## Request Body Structure

### Complete Request Interface
```typescript
interface CreatePageRequest {
  parent: PageParent                    // Required
  properties: Record<string, any>       // Required
  children?: Block[]                    // Optional
  icon?: PageIcon                       // Optional
  cover?: PageCover                     // Optional
}
```

### Parent Object
See [page-parent.md](./page-parent.md) for detailed parent types.

```typescript
type PageParent = 
  | { type: 'database_id', database_id: string }
  | { type: 'page_id', page_id: string }
  | { type: 'workspace', workspace: true }
```

### Properties Object

#### For Page Parents (Simple)
```typescript
{
  title: {
    title: [
      {
        type: 'text',
        text: { content: 'Page Title' }
      }
    ]
  }
}
```

#### For Database Parents (Schema-based)
```typescript
{
  // Must match database schema exactly
  Name: { title: [{ text: { content: 'Item Name' } }] },
  Status: { select: { name: 'In Progress' } },
  Priority: { number: 3 },
  Tags: { multi_select: [{ name: 'urgent' }, { name: 'bug' }] },
  Due: { date: { start: '2024-01-15' } },
  Assignee: { people: [{ id: 'user-uuid' }] }
}
```

### Children Array (Optional)
Initial page content blocks. See [page-content.md](./page-content.md).

```typescript
children: [
  {
    object: 'block',
    type: 'heading_1',
    heading_1: {
      rich_text: [{ text: { content: 'Welcome' } }]
    }
  },
  {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ text: { content: 'First paragraph...' } }]
    }
  }
]
```

### Icon Object (Optional)
```typescript
// Emoji icon
icon: {
  type: 'emoji',
  emoji: '📄'
}

// External image icon
icon: {
  type: 'external',
  external: { url: 'https://example.com/icon.png' }
}
```

### Cover Object (Optional)
```typescript
// External image cover
cover: {
  type: 'external',
  external: { url: 'https://example.com/cover.jpg' }
}
```

## Complete Examples

### Create Simple Page
```typescript
const createSimplePage = async () => {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parent: {
        type: 'page_id',
        page_id: 'parent-page-uuid'
      },
      properties: {
        title: {
          title: [{ text: { content: 'My New Page' } }]
        }
      }
    })
  })
  
  return await response.json()
}
```

### Create Database Item
```typescript
const createDatabaseItem = async () => {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: {
        type: 'database_id',
        database_id: 'database-uuid'
      },
      properties: {
        Name: { 
          title: [{ text: { content: 'New Task' } }] 
        },
        Status: { 
          select: { name: 'To Do' } 
        },
        Priority: { 
          number: 2 
        },
        Due: { 
          date: { 
            start: '2024-01-20',
            end: null 
          } 
        }
      }
    })
  })
  
  return await response.json()
}
```

### Create Rich Page with Content
```typescript
const createRichPage = async () => {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: {
        type: 'page_id',
        page_id: 'parent-uuid'
      },
      properties: {
        title: {
          title: [{ text: { content: 'Project Documentation' } }]
        }
      },
      icon: {
        type: 'emoji',
        emoji: '📚'
      },
      cover: {
        type: 'external',
        external: { 
          url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794'
        }
      },
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{ text: { content: 'Overview' } }]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              { text: { content: 'This document describes the ' } },
              { 
                text: { content: 'project architecture' },
                annotations: { bold: true }
              },
              { text: { content: ' and implementation details.' } }
            ]
          }
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: 'Key Features' } }]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: 'Feature 1' } }]
          }
        }
      ]
    })
  })
  
  return await response.json()
}
```

## Response Format

### Success Response
```typescript
interface PageResponse {
  object: 'page'
  id: string
  created_time: string
  last_edited_time: string
  created_by: { object: 'user', id: string }
  last_edited_by: { object: 'user', id: string }
  cover: PageCover | null
  icon: PageIcon | null
  parent: PageParent
  archived: boolean
  properties: Record<string, any>
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
  "message": "body failed validation: body.properties.title.title should be an array"
}
```

#### 403 Forbidden
```json
{
  "object": "error",
  "status": 403,
  "code": "insufficient_permissions",
  "message": "Integration doesn't have insert content capabilities"
}
```

#### 404 Not Found
```json
{
  "object": "error",
  "status": 404,
  "code": "object_not_found",
  "message": "Could not find parent"
}
```

### Error Handling Example
```typescript
const createPageSafely = async (data: CreatePageRequest) => {
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      
      switch (error.code) {
        case 'insufficient_permissions':
          throw new Error('Integration needs insert content permission')
        case 'object_not_found':
          throw new Error('Parent page/database not found or not shared')
        case 'validation_error':
          throw new Error(`Invalid data: ${error.message}`)
        default:
          throw new Error(error.message)
      }
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to create page:', error)
    throw error
  }
}
```

## Limitations

### Cannot Set
- `rollup` properties
- `created_by`
- `created_time`
- `last_edited_by`
- `last_edited_time`

### Content Limits
- Initial `children` array: 100 blocks max
- Rich text: 2000 characters per array
- Use [Append Block Children](./append-blocks.md) for more content

### Property Constraints
- Page parents: Only `title` property
- Database parents: Must match schema exactly
- Cannot add properties not in database schema

## Best Practices

### 1. Validate Before Creating
```typescript
const validatePageData = (data: CreatePageRequest): string[] => {
  const errors: string[] = []
  
  if (!data.parent) errors.push('Parent is required')
  if (!data.properties) errors.push('Properties are required')
  
  if (data.parent.type === 'page_id' && !data.properties.title) {
    errors.push('Title is required for page parents')
  }
  
  return errors
}
```

### 2. Use Typed Interfaces
```typescript
interface CreateTaskRequest {
  name: string
  status: 'To Do' | 'In Progress' | 'Done'
  priority: number
  dueDate?: string
}

const createTask = async (task: CreateTaskRequest) => {
  return createPage({
    parent: { type: 'database_id', database_id: TASKS_DB_ID },
    properties: {
      Name: { title: [{ text: { content: task.name } }] },
      Status: { select: { name: task.status } },
      Priority: { number: task.priority },
      ...(task.dueDate && {
        Due: { date: { start: task.dueDate } }
      })
    }
  })
}
```

### 3. Handle Large Content
```typescript
const createPageWithLargeContent = async (
  parent: PageParent,
  title: string,
  blocks: Block[]
) => {
  // Create page with first 100 blocks
  const page = await createPage({
    parent,
    properties: { title: { title: [{ text: { content: title } }] } },
    children: blocks.slice(0, 100)
  })
  
  // Append remaining blocks in batches
  for (let i = 100; i < blocks.length; i += 100) {
    await appendBlocks(page.id, blocks.slice(i, i + 100))
    await delay(350) // Respect rate limits
  }
  
  return page
}
```