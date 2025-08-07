# Working with Notion Page Content

## Core Concepts

### Block Architecture
- **Pages** are containers made up of **blocks**
- **Blocks** are the atomic units of content (paragraphs, headings, lists, etc.)
- Blocks can have **child blocks** creating nested structures
- Each block has a unique ID and type

### Block Structure
```typescript
interface Block {
  object: 'block'
  id: string
  parent: { type: 'page_id' | 'block_id', [key: string]: string }
  type: BlockType
  created_time: string
  last_edited_time: string
  created_by: { object: 'user', id: string }
  last_edited_by: { object: 'user', id: string }
  has_children: boolean
  archived: boolean
  [type: string]: BlockTypeObject // Type-specific content
}
```

## Supported Block Types

### Text Blocks
- `paragraph`
- `heading_1`, `heading_2`, `heading_3`
- `bulleted_list_item`
- `numbered_list_item`
- `to_do`
- `toggle`
- `quote`
- `callout`
- `code`

### Media Blocks
- `image`
- `video`
- `file`
- `pdf`
- `bookmark`
- `embed`

### Layout Blocks
- `divider`
- `table_of_contents`
- `column_list` & `column`
- `synced_block`

### Database Blocks
- `child_page`
- `child_database`
- `table`

## Reading Page Content

### Retrieve Block Children
```typescript
const getPageContent = async (pageId: string) => {
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

### Handling Nested Blocks
```typescript
const getBlocksRecursively = async (blockId: string): Promise<Block[]> => {
  const blocks = await getPageContent(blockId)
  
  for (const block of blocks) {
    if (block.has_children && block.type !== 'child_page') {
      block.children = await getBlocksRecursively(block.id)
    }
  }
  
  return blocks
}
```

## Creating Page Content

### With Initial Content
```typescript
const createPageWithContent = async () => {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: { page_id: parentPageId },
      properties: {
        title: {
          title: [{ text: { content: 'New Page' } }]
        }
      },
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
            rich_text: [{ text: { content: 'This is the first paragraph.' } }]
          }
        }
      ]
    })
  })
}
```

## Appending Content

### Basic Append
```typescript
const appendContent = async (pageId: string, blocks: Block[]) => {
  const response = await fetch(
    `https://api.notion.com/v1/blocks/${pageId}/children`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ children: blocks })
    }
  )
}
```

### Insert After Specific Block
```typescript
const insertAfterBlock = async (
  pageId: string, 
  afterBlockId: string, 
  newBlocks: Block[]
) => {
  const response = await fetch(
    `https://api.notion.com/v1/blocks/${pageId}/children`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ 
        children: newBlocks,
        after: afterBlockId
      })
    }
  )
}
```

## Rich Text Formatting

### Rich Text Object Structure
```typescript
interface RichText {
  type: 'text' | 'mention' | 'equation'
  text?: {
    content: string
    link?: { url: string }
  }
  annotations?: {
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    code?: boolean
    color?: Color
  }
  plain_text: string
  href?: string
}
```

### Creating Formatted Text
```typescript
const formattedParagraph = {
  object: 'block',
  type: 'paragraph',
  paragraph: {
    rich_text: [
      {
        type: 'text',
        text: { content: 'This is ' }
      },
      {
        type: 'text',
        text: { content: 'bold' },
        annotations: { bold: true }
      },
      {
        type: 'text',
        text: { content: ' and this is ' }
      },
      {
        type: 'text',
        text: { 
          content: 'a link',
          link: { url: 'https://example.com' }
        },
        annotations: { underline: true }
      }
    ]
  }
}
```

## Content Limitations

### Size Limits
- **Request size**: 1000 blocks per request
- **Rich text**: 2000 characters per rich text array
- **Block children**: No explicit limit, but paginated at 100

### Block Type Limitations
Not all Notion blocks are supported via API:
- ❌ Breadcrumb
- ❌ Button
- ❌ Table of contents (read-only)
- ❌ Link preview (auto-converts to bookmark)
- ❌ Mention of page/date (in certain contexts)

## Best Practices

### 1. Efficient Content Structure
```typescript
// Good: Use properties for structured data
const page = {
  properties: {
    Status: { select: { name: 'In Progress' } },
    Priority: { number: 1 },
    Tags: { multi_select: [{ name: 'Important' }] }
  },
  children: [
    // Use content for narrative text
  ]
}
```

### 2. Batch Operations
```typescript
// Append multiple blocks in one request
const blocks = [
  createHeading('Section 1'),
  createParagraph('Content...'),
  createHeading('Section 2'),
  createParagraph('More content...')
]
await appendContent(pageId, blocks)
```

### 3. Error Handling
```typescript
const safeAppendContent = async (pageId: string, blocks: Block[]) => {
  try {
    return await appendContent(pageId, blocks)
  } catch (error) {
    if (error.code === 'object_not_found') {
      console.error('Page not found or not accessible')
    } else if (error.code === 'rate_limited') {
      // Implement retry logic
    }
    throw error
  }
}
```

### 4. Content Validation
```typescript
const validateBlock = (block: any): boolean => {
  // Check required fields
  if (!block.object || !block.type) return false
  
  // Validate type-specific content
  if (block.type === 'paragraph' && !block.paragraph?.rich_text) {
    return false
  }
  
  return true
}
```

## Common Patterns

### Page Templates
```typescript
const createProjectPage = async (title: string, description: string) => {
  return await createPage({
    parent: { database_id: projectsDatabaseId },
    properties: {
      Name: { title: [{ text: { content: title } }] },
      Status: { select: { name: 'Not Started' } }
    },
    children: [
      createHeading('Overview', 1),
      createParagraph(description),
      createHeading('Tasks', 2),
      createTodo('Define requirements', false),
      createTodo('Create design', false),
      createTodo('Implement solution', false)
    ]
  })
}
```

### Content Migration
```typescript
const migrateMarkdownToNotion = async (markdown: string, pageId: string) => {
  const blocks = parseMarkdownToBlocks(markdown)
  
  // Split into chunks of 100 blocks
  for (let i = 0; i < blocks.length; i += 100) {
    const chunk = blocks.slice(i, i + 100)
    await appendContent(pageId, chunk)
    
    // Respect rate limits
    await new Promise(resolve => setTimeout(resolve, 350))
  }
}
```