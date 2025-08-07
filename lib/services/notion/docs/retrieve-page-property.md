# Retrieve Page Property Endpoint

## Endpoint Details
- **URL**: `https://api.notion.com/v1/pages/{page_id}/properties/{property_id}`
- **Method**: `GET`
- **Required Headers**:
  ```typescript
  {
    'Authorization': 'Bearer {integration_token}',
    'Notion-Version': '2022-06-28'
  }
  ```

## When to Use This Endpoint

### Use This Endpoint When:
- Property has more than 25 items (relations, people, etc.)
- You need complete property data with pagination
- Working with rollup properties
- Fetching large text properties

### Use Retrieve Page Instead When:
- You need all page properties at once
- Properties have less than 25 items
- You're checking multiple properties

## Response Types by Property

### Paginated Properties
These properties support pagination when they have many items:

#### Title Property
```typescript
{
  object: 'property_item',
  type: 'title',
  title: {
    type: 'text',
    text: { content: 'Page Title Part 1' },
    plain_text: 'Page Title Part 1'
  },
  next_cursor: 'cursor_abc123',
  has_more: true
}
```

#### Rich Text Property
```typescript
{
  object: 'property_item',
  type: 'rich_text',
  rich_text: [
    {
      type: 'text',
      text: { content: 'Long text content...' },
      plain_text: 'Long text content...'
    }
  ],
  next_cursor: 'cursor_xyz789',
  has_more: true
}
```

#### Relation Property
```typescript
{
  object: 'property_item',
  type: 'relation',
  relation: [
    { id: 'page-id-1' },
    { id: 'page-id-2' },
    // ... up to 25 items
  ],
  next_cursor: 'cursor_rel456',
  has_more: true
}
```

#### People Property
```typescript
{
  object: 'property_item',
  type: 'people',
  people: [
    {
      object: 'user',
      id: 'user-id-1',
      name: 'John Doe',
      avatar_url: 'https://...'
    }
    // ... more users
  ],
  next_cursor: 'cursor_ppl789',
  has_more: true
}
```

### Non-Paginated Properties
These return complete data in a single response:

#### Select/Multi-Select
```typescript
{
  object: 'property_item',
  type: 'select',
  select: {
    id: 'option-id',
    name: 'In Progress',
    color: 'blue'
  }
}
```

#### Number/Checkbox/Date
```typescript
// Number
{
  object: 'property_item',
  type: 'number',
  number: 42
}

// Checkbox
{
  object: 'property_item',
  type: 'checkbox',
  checkbox: true
}

// Date
{
  object: 'property_item',
  type: 'date',
  date: {
    start: '2024-01-15',
    end: '2024-01-20',
    time_zone: null
  }
}
```

## Usage Examples

### Basic Property Retrieval
```typescript
const getPageProperty = async (
  pageId: string,
  propertyId: string
) => {
  const response = await fetch(
    `https://api.notion.com/v1/pages/${pageId}/properties/${propertyId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_KEY}`,
        'Notion-Version': '2022-06-28'
      }
    }
  )
  
  if (!response.ok) {
    throw new Error(`Failed to get property: ${response.status}`)
  }
  
  return await response.json()
}
```

### Get All Paginated Data
```typescript
const getAllPropertyData = async (
  pageId: string,
  propertyId: string
) => {
  let allData = []
  let cursor = undefined
  
  do {
    const url = cursor
      ? `https://api.notion.com/v1/pages/${pageId}/properties/${propertyId}?start_cursor=${cursor}`
      : `https://api.notion.com/v1/pages/${pageId}/properties/${propertyId}`
    
    const response = await fetch(url, { headers })
    const data = await response.json()
    
    // Handle different property types
    if (data.type === 'relation') {
      allData = [...allData, ...data.relation]
    } else if (data.type === 'people') {
      allData = [...allData, ...data.people]
    } else if (data.type === 'rich_text') {
      allData = [...allData, ...data.rich_text]
    } else if (data.type === 'title') {
      allData.push(data.title)
    } else {
      // Non-paginated property
      return data
    }
    
    cursor = data.next_cursor
  } while (cursor)
  
  return {
    type: data.type,
    [data.type]: allData
  }
}
```

### Property Type Handler
```typescript
class PropertyHandler {
  async getCompleteProperty(
    pageId: string,
    propertyId: string,
    propertyType: string
  ) {
    switch (propertyType) {
      case 'title':
        return await this.getTitleProperty(pageId, propertyId)
      case 'relation':
        return await this.getRelationProperty(pageId, propertyId)
      case 'people':
        return await this.getPeopleProperty(pageId, propertyId)
      case 'rich_text':
        return await this.getRichTextProperty(pageId, propertyId)
      default:
        // Non-paginated property
        return await getPageProperty(pageId, propertyId)
    }
  }
  
  private async getTitleProperty(pageId: string, propertyId: string) {
    const data = await getAllPropertyData(pageId, propertyId)
    return data.title
      .map(part => part.plain_text)
      .join('')
  }
  
  private async getRelationProperty(pageId: string, propertyId: string) {
    const data = await getAllPropertyData(pageId, propertyId)
    
    // Optionally fetch related page details
    const relatedPages = await Promise.all(
      data.relation.map(rel => getPage(rel.id))
    )
    
    return relatedPages
  }
  
  private async getPeopleProperty(pageId: string, propertyId: string) {
    const data = await getAllPropertyData(pageId, propertyId)
    return data.people.map(person => ({
      id: person.id,
      name: person.name,
      email: person.person?.email || null
    }))
  }
  
  private async getRichTextProperty(pageId: string, propertyId: string) {
    const data = await getAllPropertyData(pageId, propertyId)
    return data.rich_text
      .map(text => text.plain_text)
      .join('')
  }
}
```

## Working with Rollup Properties

```typescript
const getRollupProperty = async (
  pageId: string,
  propertyId: string
) => {
  const property = await getPageProperty(pageId, propertyId)
  
  if (property.type !== 'rollup') {
    throw new Error('Not a rollup property')
  }
  
  switch (property.rollup.type) {
    case 'number':
      return property.rollup.number
    
    case 'date':
      return property.rollup.date
    
    case 'array':
      // May need pagination for large arrays
      if (property.has_more) {
        return await getAllPropertyData(pageId, propertyId)
      }
      return property.rollup.array
    
    default:
      return property.rollup
  }
}
```

## Error Handling

### Common Errors
```typescript
// 404 Not Found
{
  "object": "error",
  "status": 404,
  "code": "object_not_found",
  "message": "Could not find property"
}

// 400 Bad Request
{
  "object": "error",
  "status": 400,
  "code": "invalid_request",
  "message": "Invalid property ID"
}
```

### Safe Property Retrieval
```typescript
const getPropertySafely = async (
  pageId: string,
  propertyId: string
) => {
  try {
    return await getPageProperty(pageId, propertyId)
  } catch (error) {
    if (error.message.includes('404')) {
      console.error('Property not found')
      return null
    }
    throw error
  }
}
```

## Complete Examples

### Get All Relations with Details
```typescript
const getRelatedPagesWithDetails = async (
  pageId: string,
  propertyId: string
) => {
  // Get all relation IDs
  const relationData = await getAllPropertyData(pageId, propertyId)
  
  if (relationData.type !== 'relation') {
    throw new Error('Not a relation property')
  }
  
  // Fetch details for each related page
  const relatedPages = await Promise.all(
    relationData.relation.map(async (rel) => {
      try {
        const page = await getPage(rel.id)
        return {
          id: rel.id,
          title: getPageTitle(page),
          url: page.url,
          properties: page.properties
        }
      } catch (error) {
        return {
          id: rel.id,
          error: 'Failed to fetch page details'
        }
      }
    })
  )
  
  return relatedPages.filter(page => !page.error)
}
```

### Property Data Aggregator
```typescript
const aggregatePropertyData = async (
  pageId: string,
  properties: { name: string; id: string; type: string }[]
) => {
  const results = {}
  
  for (const prop of properties) {
    try {
      if (['title', 'relation', 'people', 'rich_text'].includes(prop.type)) {
        // Potentially paginated property
        results[prop.name] = await getAllPropertyData(pageId, prop.id)
      } else {
        // Simple property
        results[prop.name] = await getPageProperty(pageId, prop.id)
      }
    } catch (error) {
      console.error(`Failed to get ${prop.name}:`, error)
      results[prop.name] = null
    }
  }
  
  return results
}
```

## Best Practices

### 1. Check Property Type First
```typescript
const getPropertyValue = async (
  page: PageObject,
  propertyName: string
) => {
  const property = page.properties[propertyName]
  
  if (!property) {
    throw new Error(`Property ${propertyName} not found`)
  }
  
  // Check if pagination needed
  if (property.has_more) {
    return await getAllPropertyData(page.id, property.id)
  }
  
  // Return simple value
  return property[property.type]
}
```

### 2. Cache Property Data
```typescript
class PropertyCache {
  private cache = new Map<string, any>()
  
  getCacheKey(pageId: string, propertyId: string) {
    return `${pageId}:${propertyId}`
  }
  
  async get(pageId: string, propertyId: string) {
    const key = this.getCacheKey(pageId, propertyId)
    
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }
    
    const data = await getAllPropertyData(pageId, propertyId)
    this.cache.set(key, data)
    
    return data
  }
  
  invalidate(pageId: string, propertyId?: string) {
    if (propertyId) {
      this.cache.delete(this.getCacheKey(pageId, propertyId))
    } else {
      // Invalidate all properties for page
      for (const key of this.cache.keys()) {
        if (key.startsWith(pageId)) {
          this.cache.delete(key)
        }
      }
    }
  }
}
```

### 3. Batch Property Fetching
```typescript
const batchGetProperties = async (
  pageId: string,
  propertyIds: string[]
) => {
  const results = await Promise.allSettled(
    propertyIds.map(id => getPageProperty(pageId, id))
  )
  
  return results.reduce((acc, result, index) => {
    if (result.status === 'fulfilled') {
      acc[propertyIds[index]] = result.value
    } else {
      acc[propertyIds[index]] = { error: result.reason }
    }
    return acc
  }, {})
}
```

## Performance Tips

1. **Minimize API Calls**: Get all properties from Retrieve Page first, only use this endpoint for paginated data
2. **Parallel Fetching**: Fetch multiple properties concurrently when possible
3. **Implement Caching**: Cache property data to avoid repeated API calls
4. **Handle Rate Limits**: Implement retry logic with exponential backoff