# Notion Page Parent Reference

## Overview
Every Notion page must have a parent, which determines where the page lives in the workspace hierarchy and what properties it can have.

## Parent Types

### 1. Database Parent
Pages created as database items.

```typescript
interface DatabaseParent {
  type: 'database_id'
  database_id: string
}
```

**Characteristics:**
- Page inherits database schema
- Must include database properties
- Appears as a row in the database

### 2. Page Parent  
Pages nested under other pages.

```typescript
interface PageParent {
  type: 'page_id'
  page_id: string
}
```

**Characteristics:**
- Only `title` property allowed
- Appears as a subpage
- Inherits permissions from parent page

### 3. Workspace Parent
Top-level pages in the workspace.

```typescript
interface WorkspaceParent {
  type: 'workspace'
  workspace: true
}
```

**Characteristics:**
- Only `title` property allowed
- Appears in workspace root
- Requires broader integration permissions

## Usage Examples

### Creating a Database Item
```typescript
const createDatabaseItem = async () => {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: {
        type: 'database_id',
        database_id: 'e07e9b2e-b97a-4c1e-8493-example'
      },
      properties: {
        // Must match database schema
        Name: { title: [{ text: { content: 'New Task' } }] },
        Status: { select: { name: 'To Do' } },
        Priority: { number: 1 }
      }
    })
  })
}
```

### Creating a Subpage
```typescript
const createSubpage = async () => {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: {
        type: 'page_id',
        page_id: 'a4b7c8d9-example-parent-page-id'
      },
      properties: {
        // Only title is allowed for page parents
        title: {
          title: [{ text: { content: 'Subpage Title' } }]
        }
      }
    })
  })
}
```

### Creating a Workspace Page
```typescript
const createWorkspacePage = async () => {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: {
        type: 'workspace',
        workspace: true
      },
      properties: {
        title: {
          title: [{ text: { content: 'Top Level Page' } }]
        }
      }
    })
  })
}
```

## Parent Constraints

### Database Parents
- **Properties Required**: Must include all required database properties
- **Schema Validation**: Properties must match database schema types
- **Property Limits**: Cannot add properties not in database schema

### Page/Workspace Parents  
- **Limited Properties**: Only `title` property allowed
- **No Custom Properties**: Cannot add additional properties
- **Simple Structure**: Designed for content pages, not structured data

## Type Guards

```typescript
type PageParent = DatabaseParent | PageParent | WorkspaceParent

const isDatabaseParent = (parent: PageParent): parent is DatabaseParent => {
  return parent.type === 'database_id'
}

const isPageParent = (parent: PageParent): parent is PageParent => {
  return parent.type === 'page_id'
}

const isWorkspaceParent = (parent: PageParent): parent is WorkspaceParent => {
  return parent.type === 'workspace'
}
```

## Parent Resolution

### Finding Parent Type
```typescript
const getParentInfo = async (pageId: string) => {
  const response = await fetch(
    `https://api.notion.com/v1/pages/${pageId}`,
    { headers }
  )
  
  const page = await response.json()
  const parent = page.parent
  
  switch (parent.type) {
    case 'database_id':
      return {
        type: 'database',
        id: parent.database_id,
        requiresSchema: true
      }
    case 'page_id':
      return {
        type: 'page',
        id: parent.page_id,
        requiresSchema: false
      }
    case 'workspace':
      return {
        type: 'workspace',
        id: null,
        requiresSchema: false
      }
  }
}
```

## Common Patterns

### Dynamic Parent Selection
```typescript
const createPage = async (config: {
  title: string
  parentType: 'database' | 'page'
  parentId: string
  properties?: Record<string, any>
}) => {
  const parent = config.parentType === 'database'
    ? { type: 'database_id', database_id: config.parentId }
    : { type: 'page_id', page_id: config.parentId }
  
  const properties = config.parentType === 'database'
    ? config.properties // Use provided properties
    : { title: { title: [{ text: { content: config.title } }] } } // Only title
  
  return await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers,
    body: JSON.stringify({ parent, properties })
  })
}
```

### Parent Validation
```typescript
const validateParent = async (parent: PageParent): Promise<boolean> => {
  try {
    switch (parent.type) {
      case 'database_id':
        // Verify database exists and is accessible
        const dbResponse = await fetch(
          `https://api.notion.com/v1/databases/${parent.database_id}`,
          { headers }
        )
        return dbResponse.ok
        
      case 'page_id':
        // Verify page exists and is accessible
        const pageResponse = await fetch(
          `https://api.notion.com/v1/pages/${parent.page_id}`,
          { headers }
        )
        return pageResponse.ok
        
      case 'workspace':
        // Workspace parent always valid if integration has access
        return true
        
      default:
        return false
    }
  } catch {
    return false
  }
}
```

## Error Handling

### Common Parent Errors
```typescript
// Parent not found
{
  "object": "error",
  "status": 404,
  "code": "object_not_found",
  "message": "Could not find parent page/database"
}

// No access to parent
{
  "object": "error",
  "status": 403,
  "code": "restricted_resource",
  "message": "Integration doesn't have access to parent"
}

// Invalid parent type
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "parent.type should be one of database_id, page_id, workspace"
}
```

## Best Practices

1. **Verify Parent Access**: Check parent exists before creating pages
2. **Match Database Schema**: When using database parent, ensure properties match
3. **Handle Parent Types**: Use type guards for parent-specific logic
4. **Error Recovery**: Implement fallback parents for failed creations
5. **Permission Inheritance**: Remember child pages inherit parent permissions