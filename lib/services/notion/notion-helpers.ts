/**
 * Notion API Helper Functions
 * Utility functions for creating and manipulating Notion blocks and properties
 */

import {
  Block,
  RichText,
  TextRichText,
  TextAnnotations,
  NotionColor,
  CreateBlockData,
  Page,
  Database,
  PropertyValue,
  Parent,
  PageIcon,
  ParagraphBlock,
  HeadingOneBlock,
  HeadingTwoBlock,
  HeadingThreeBlock,
  BulletedListItemBlock,
  NumberedListItemBlock,
  ToDoBlock,
  CodeBlock,
  CalloutBlock,
  QuoteBlock,
  DividerBlock,
  ToggleBlock,
  SearchParameters,
  SearchResponse,
  isPage,
  isDatabase,
} from './notion-types'
import { NotionValidationError, NotionContentLimitError } from './notion-errors'

// ============================================================================
// Rich Text Helpers
// ============================================================================

/**
 * Create a simple text rich text object
 */
export function createText(
  content: string,
  annotations?: Partial<TextAnnotations>,
  link?: string
): TextRichText {
  return {
    type: 'text',
    text: {
      content,
      link: link ? { url: link } : null,
    },
    annotations: annotations || {},
    plain_text: content,
    href: link || null,
  }
}

/**
 * Create rich text array from string with optional formatting
 */
export function createRichText(
  content: string,
  annotations?: Partial<TextAnnotations>
): RichText[] {
  if (content.length > 2000) {
    throw new NotionContentLimitError(
      'Rich text content exceeds 2000 character limit',
      2000,
      content.length
    )
  }

  return [createText(content, annotations)]
}

/**
 * Create formatted rich text with multiple segments
 */
export function createFormattedRichText(
  segments: Array<{
    content: string
    annotations?: Partial<TextAnnotations>
    link?: string
  }>
): RichText[] {
  const totalLength = segments.reduce((sum, seg) => sum + seg.content.length, 0)
  if (totalLength > 2000) {
    throw new NotionContentLimitError(
      'Total rich text content exceeds 2000 character limit',
      2000,
      totalLength
    )
  }

  return segments.map(seg =>
    createText(seg.content, seg.annotations, seg.link)
  )
}

/**
 * Extract plain text from rich text array
 */
export function extractPlainText(richText: RichText[]): string {
  return richText.map(text => text.plain_text).join('')
}

// ============================================================================
// Block Creation Helpers
// ============================================================================

/**
 * Create a paragraph block
 */
export function createParagraph(
  content: string | RichText[],
  color?: NotionColor
): CreateBlockData {
  const richText = typeof content === 'string' ? createRichText(content) : content

  return {
    type: 'paragraph',
    paragraph: {
      rich_text: richText,
      color,
    },
  }
}

/**
 * Create heading blocks
 */
export function createHeading(
  content: string | RichText[],
  level: 1 | 2 | 3,
  options?: {
    color?: NotionColor
    isToggleable?: boolean
  }
): CreateBlockData {
  const richText = typeof content === 'string' ? createRichText(content) : content
  const { color, isToggleable } = options || {}

  const headingContent = {
    rich_text: richText,
    color,
    is_toggleable: isToggleable,
  }

  switch (level) {
    case 1:
      return { type: 'heading_1', heading_1: headingContent }
    case 2:
      return { type: 'heading_2', heading_2: headingContent }
    case 3:
      return { type: 'heading_3', heading_3: headingContent }
  }
}

/**
 * Create a bulleted list item
 */
export function createBulletedListItem(
  content: string | RichText[],
  color?: NotionColor
): CreateBlockData {
  const richText = typeof content === 'string' ? createRichText(content) : content

  return {
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: richText,
      color,
    },
  }
}

/**
 * Create a numbered list item
 */
export function createNumberedListItem(
  content: string | RichText[],
  color?: NotionColor
): CreateBlockData {
  const richText = typeof content === 'string' ? createRichText(content) : content

  return {
    type: 'numbered_list_item',
    numbered_list_item: {
      rich_text: richText,
      color,
    },
  }
}

/**
 * Create a to-do item
 */
export function createTodo(
  content: string | RichText[],
  checked = false,
  color?: NotionColor
): CreateBlockData {
  const richText = typeof content === 'string' ? createRichText(content) : content

  return {
    type: 'to_do',
    to_do: {
      rich_text: richText,
      checked,
      color,
    },
  }
}

/**
 * Create a toggle block
 */
export function createToggle(
  content: string | RichText[],
  color?: NotionColor
): CreateBlockData {
  const richText = typeof content === 'string' ? createRichText(content) : content

  return {
    type: 'toggle',
    toggle: {
      rich_text: richText,
      color,
    },
  }
}

/**
 * Create a code block
 */
export function createCodeBlock(
  code: string,
  language = 'plain text',
  caption?: string
): CreateBlockData {
  return {
    type: 'code',
    code: {
      rich_text: createRichText(code),
      language,
      caption: caption ? createRichText(caption) : undefined,
    },
  }
}

/**
 * Create a callout block
 */
export function createCallout(
  content: string | RichText[],
  options?: {
    emoji?: string
    color?: NotionColor
  }
): CreateBlockData {
  const richText = typeof content === 'string' ? createRichText(content) : content
  const { emoji = '💡', color = 'gray_background' } = options || {}

  return {
    type: 'callout',
    callout: {
      rich_text: richText,
      icon: { type: 'emoji', emoji },
      color,
    },
  }
}

/**
 * Create a quote block
 */
export function createQuote(
  content: string | RichText[],
  color?: NotionColor
): CreateBlockData {
  const richText = typeof content === 'string' ? createRichText(content) : content

  return {
    type: 'quote',
    quote: {
      rich_text: richText,
      color,
    },
  }
}

/**
 * Create a divider block
 */
export function createDivider(): CreateBlockData {
  return {
    type: 'divider',
    divider: {},
  }
}

/**
 * Create an image block
 */
export function createImage(
  url: string,
  caption?: string
): CreateBlockData {
  return {
    type: 'image',
    image: {
      type: 'external',
      external: { url },
      caption: caption ? createRichText(caption) : undefined,
    },
  }
}

/**
 * Create a bookmark block
 */
export function createBookmark(
  url: string,
  caption?: string
): CreateBlockData {
  return {
    type: 'bookmark',
    bookmark: {
      url,
      caption: caption ? createRichText(caption) : undefined,
    },
  }
}

// ============================================================================
// Page Property Helpers
// ============================================================================

/**
 * Create title property value
 */
export function createTitleProperty(title: string) {
  return {
    title: createRichText(title),
  }
}

/**
 * Create rich text property value
 */
export function createRichTextProperty(text: string) {
  return {
    rich_text: createRichText(text),
  }
}

/**
 * Create select property value
 */
export function createSelectProperty(name: string) {
  return {
    select: { name },
  }
}

/**
 * Create multi-select property value
 */
export function createMultiSelectProperty(names: string[]) {
  return {
    multi_select: names.map(name => ({ name })),
  }
}

/**
 * Create date property value
 */
export function createDateProperty(
  start: string | Date,
  end?: string | Date,
  timeZone?: string
) {
  const startStr = start instanceof Date ? start.toISOString() : start
  const endStr = end instanceof Date ? end.toISOString() : end

  return {
    date: {
      start: startStr,
      end: endStr || null,
      time_zone: timeZone || null,
    },
  }
}

/**
 * Create checkbox property value
 */
export function createCheckboxProperty(checked: boolean) {
  return {
    checkbox: checked,
  }
}

/**
 * Create number property value
 */
export function createNumberProperty(value: number) {
  return {
    number: value,
  }
}

/**
 * Create URL property value
 */
export function createUrlProperty(url: string) {
  return {
    url,
  }
}

/**
 * Create email property value
 */
export function createEmailProperty(email: string) {
  return {
    email,
  }
}

/**
 * Create phone property value
 */
export function createPhoneProperty(phone: string) {
  return {
    phone_number: phone,
  }
}

/**
 * Create people property value
 */
export function createPeopleProperty(userIds: string[]) {
  return {
    people: userIds.map(id => ({ id })),
  }
}

/**
 * Create relation property value
 */
export function createRelationProperty(pageIds: string[]) {
  return {
    relation: pageIds.map(id => ({ id })),
  }
}

// ============================================================================
// Page Helpers
// ============================================================================

/**
 * Extract page title from properties
 */
export function getPageTitle(page: Page): string {
  // Look for common title property names
  const titleProps = ['title', 'Title', 'Name', 'name']
  
  for (const prop of titleProps) {
    const property = page.properties[prop]
    if (property && property.type === 'title' && property.title.length > 0) {
      return extractPlainText(property.title)
    }
  }

  // Fallback: look for any title property
  for (const [_, property] of Object.entries(page.properties)) {
    if (property.type === 'title' && property.title.length > 0) {
      return extractPlainText(property.title)
    }
  }

  return 'Untitled'
}

/**
 * Get property value as plain value
 */
export function getPropertyValue(property: PropertyValue): any {
  switch (property.type) {
    case 'title':
      return extractPlainText(property.title)
    case 'rich_text':
      return extractPlainText(property.rich_text)
    case 'number':
      return property.number
    case 'select':
      return property.select?.name || null
    case 'multi_select':
      return property.multi_select.map(item => item.name)
    case 'date':
      return property.date?.start || null
    case 'checkbox':
      return property.checkbox
    case 'url':
      return property.url
    case 'email':
      return property.email
    case 'phone_number':
      return property.phone_number
    case 'people':
      return property.people
    case 'relation':
      return property.relation
    case 'created_time':
      return property.created_time
    case 'last_edited_time':
      return property.last_edited_time
    default:
      return null
  }
}

/**
 * Create parent object helpers
 */
export function createDatabaseParent(databaseId: string): Parent {
  return {
    type: 'database_id',
    database_id: databaseId,
  }
}

export function createPageParent(pageId: string): Parent {
  return {
    type: 'page_id',
    page_id: pageId,
  }
}

export function createWorkspaceParent(): Parent {
  return {
    type: 'workspace',
    workspace: true,
  }
}

/**
 * Create icon helpers
 */
export function createEmojiIcon(emoji: string): PageIcon {
  return {
    type: 'emoji',
    emoji,
  }
}

export function createExternalIcon(url: string): PageIcon {
  return {
    type: 'external',
    external: { url },
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate block array doesn't exceed limits
 */
export function validateBlocks(blocks: CreateBlockData[]): void {
  if (blocks.length > 1000) {
    throw new NotionContentLimitError(
      'Cannot create more than 1000 blocks at once',
      1000,
      blocks.length
    )
  }

  // Validate each block
  blocks.forEach((block, index) => {
    if (!block.type) {
      throw new NotionValidationError(
        `Block at index ${index} is missing required 'type' field`,
        'type'
      )
    }
  })
}

/**
 * Validate page properties
 */
export function validatePageProperties(
  properties: Record<string, any>,
  parentType: Parent['type']
): void {
  if (parentType !== 'database_id') {
    // For non-database parents, only title is allowed
    const allowedProps = ['title', 'Title']
    const hasDisallowedProps = Object.keys(properties).some(
      key => !allowedProps.includes(key)
    )

    if (hasDisallowedProps) {
      throw new NotionValidationError(
        'Only title property is allowed for page parents',
        'properties'
      )
    }
  }
}

// ============================================================================
// Markdown Conversion Helpers
// ============================================================================

/**
 * Convert markdown to Notion blocks (basic implementation)
 */
export function markdownToBlocks(markdown: string): CreateBlockData[] {
  const blocks: CreateBlockData[] = []
  const lines = markdown.split('\n')
  let inCodeBlock = false
  let codeContent: string[] = []
  let codeLanguage = 'plain text'

  for (const line of lines) {
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push(createCodeBlock(codeContent.join('\n'), codeLanguage))
        codeContent = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
        codeLanguage = line.slice(3) || 'plain text'
      }
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push(createHeading(line.slice(2), 1))
    } else if (line.startsWith('## ')) {
      blocks.push(createHeading(line.slice(3), 2))
    } else if (line.startsWith('### ')) {
      blocks.push(createHeading(line.slice(4), 3))
    }
    // Lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push(createBulletedListItem(line.slice(2)))
    } else if (/^\d+\.\s/.test(line)) {
      blocks.push(createNumberedListItem(line.replace(/^\d+\.\s/, '')))
    }
    // Quote
    else if (line.startsWith('> ')) {
      blocks.push(createQuote(line.slice(2)))
    }
    // Divider
    else if (line === '---' || line === '***') {
      blocks.push(createDivider())
    }
    // Paragraph
    else if (line.trim()) {
      blocks.push(createParagraph(line))
    }
  }

  // Handle unclosed code block
  if (inCodeBlock && codeContent.length > 0) {
    blocks.push(createCodeBlock(codeContent.join('\n'), codeLanguage))
  }

  return blocks
}

// ============================================================================
// Search Helpers
// ============================================================================

/**
 * Filter search results to only pages
 */
export function filterPages(results: Array<Page | Database>): Page[] {
  return results.filter(isPage) as Page[]
}

/**
 * Filter search results to only databases
 */
export function filterDatabases(results: Array<Page | Database>): Database[] {
  return results.filter(isDatabase) as Database[]
}

/**
 * Extract title from a page or database
 */
export function extractTitle(item: Page | Database): string {
  if (isDatabase(item)) {
    return item.title.map(t => t.plain_text).join('')
  }
  
  // For pages, find the title property
  for (const [key, value] of Object.entries(item.properties)) {
    if (value.type === 'title' && 'title' in value) {
      return value.title.map((t: any) => t.plain_text).join('')
    }
  }
  
  return ''
}

/**
 * Search for exact title match in results
 */
export function findByExactTitle(
  results: Array<Page | Database>,
  title: string
): Page | Database | null {
  return results.find(item => extractTitle(item) === title) || null
}

/**
 * Search for partial title match in results (case-insensitive)
 */
export function findByPartialTitle(
  results: Array<Page | Database>,
  query: string
): Array<Page | Database> {
  const lowerQuery = query.toLowerCase()
  return results.filter(item => 
    extractTitle(item).toLowerCase().includes(lowerQuery)
  )
}

/**
 * Sort search results by last edited time
 */
export function sortByLastEdited(
  results: Array<Page | Database>,
  direction: 'ascending' | 'descending' = 'descending'
): Array<Page | Database> {
  return [...results].sort((a, b) => {
    const aTime = new Date(a.last_edited_time).getTime()
    const bTime = new Date(b.last_edited_time).getTime()
    return direction === 'ascending' ? aTime - bTime : bTime - aTime
  })
}

/**
 * Sort search results by created time
 */
export function sortByCreated(
  results: Array<Page | Database>,
  direction: 'ascending' | 'descending' = 'descending'
): Array<Page | Database> {
  return [...results].sort((a, b) => {
    const aTime = new Date(a.created_time).getTime()
    const bTime = new Date(b.created_time).getTime()
    return direction === 'ascending' ? aTime - bTime : bTime - aTime
  })
}

/**
 * Group search results by parent
 */
export function groupByParent(
  results: Array<Page | Database>
): Map<string, Array<Page | Database>> {
  const grouped = new Map<string, Array<Page | Database>>()
  
  for (const item of results) {
    let parentKey: string
    
    switch (item.parent.type) {
      case 'page_id':
        parentKey = `page:${item.parent.page_id}`
        break
      case 'database_id':
        parentKey = `database:${item.parent.database_id}`
        break
      case 'workspace':
        parentKey = 'workspace'
        break
      default:
        parentKey = 'unknown'
    }
    
    if (!grouped.has(parentKey)) {
      grouped.set(parentKey, [])
    }
    grouped.get(parentKey)!.push(item)
  }
  
  return grouped
}

/**
 * Get search results created within a date range
 */
export function filterByDateRange(
  results: Array<Page | Database>,
  startDate?: Date,
  endDate?: Date
): Array<Page | Database> {
  return results.filter(item => {
    const createdTime = new Date(item.created_time).getTime()
    
    if (startDate && createdTime < startDate.getTime()) {
      return false
    }
    
    if (endDate && createdTime > endDate.getTime()) {
      return false
    }
    
    return true
  })
}

/**
 * Create search parameters for finding recent items
 */
export function createRecentSearchParams(
  hoursAgo: number = 24,
  filter?: 'page' | 'database'
): SearchParameters {
  const params: SearchParameters = {
    sort: {
      direction: 'descending',
      timestamp: 'last_edited_time'
    },
    page_size: 100
  }
  
  if (filter) {
    params.filter = {
      value: filter,
      property: 'object'
    }
  }
  
  return params
}

/**
 * Check if a page or database has been recently modified
 */
export function isRecentlyModified(
  item: Page | Database,
  hoursAgo: number = 24
): boolean {
  const threshold = Date.now() - (hoursAgo * 60 * 60 * 1000)
  const lastEdited = new Date(item.last_edited_time).getTime()
  return lastEdited > threshold
}

/**
 * Extract summary information from search results
 */
export function summarizeSearchResults(response: SearchResponse): {
  total: number
  pages: number
  databases: number
  hasMore: boolean
  titles: string[]
} {
  const pages = filterPages(response.results)
  const databases = filterDatabases(response.results)
  
  return {
    total: response.results.length,
    pages: pages.length,
    databases: databases.length,
    hasMore: response.has_more,
    titles: response.results.map(extractTitle)
  }
}