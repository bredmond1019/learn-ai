/**
 * Notion API TypeScript Type Definitions
 * Based on Notion API version 2022-06-28
 */

// ============================================================================
// Base Types
// ============================================================================

export type NotionColor = 
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'gray_background'
  | 'brown_background'
  | 'orange_background'
  | 'yellow_background'
  | 'green_background'
  | 'blue_background'
  | 'purple_background'
  | 'pink_background'
  | 'red_background'

export interface PartialUser {
  object: 'user'
  id: string
}

export interface User extends PartialUser {
  type?: 'person' | 'bot'
  name?: string
  avatar_url?: string | null
  person?: {
    email?: string
  }
  bot?: {
    owner: {
      type: 'workspace' | 'user'
      workspace?: boolean
      user?: PartialUser
    }
  }
}

// ============================================================================
// Parent Types
// ============================================================================

export interface DatabaseParent {
  type: 'database_id'
  database_id: string
}

export interface PageParent {
  type: 'page_id'
  page_id: string
}

export interface WorkspaceParent {
  type: 'workspace'
  workspace: true
}

export type Parent = DatabaseParent | PageParent | WorkspaceParent

// ============================================================================
// Icon and Cover Types
// ============================================================================

export interface EmojiIcon {
  type: 'emoji'
  emoji: string
}

export interface ExternalIcon {
  type: 'external'
  external: {
    url: string
  }
}

export interface FileIcon {
  type: 'file'
  file: {
    url: string
    expiry_time: string
  }
}

export type PageIcon = EmojiIcon | ExternalIcon | FileIcon

export interface ExternalCover {
  type: 'external'
  external: {
    url: string
  }
}

export interface FileCover {
  type: 'file'
  file: {
    url: string
    expiry_time: string
  }
}

export type PageCover = ExternalCover | FileCover

// ============================================================================
// Rich Text Types
// ============================================================================

export interface TextAnnotations {
  bold?: boolean
  italic?: boolean
  strikethrough?: boolean
  underline?: boolean
  code?: boolean
  color?: NotionColor
}

export interface TextRichText {
  type: 'text'
  text: {
    content: string
    link?: {
      url: string
    } | null
  }
  annotations?: TextAnnotations
  plain_text: string
  href?: string | null
}

export interface MentionRichText {
  type: 'mention'
  mention: {
    type: 'user' | 'page' | 'database' | 'date'
    user?: PartialUser
    page?: { id: string }
    database?: { id: string }
    date?: DatePropertyValue
  }
  annotations?: TextAnnotations
  plain_text: string
  href?: string | null
}

export interface EquationRichText {
  type: 'equation'
  equation: {
    expression: string
  }
  annotations?: TextAnnotations
  plain_text: string
  href?: string | null
}

export type RichText = TextRichText | MentionRichText | EquationRichText

// ============================================================================
// Property Value Types
// ============================================================================

export interface TitlePropertyValue {
  id: string
  type: 'title'
  title: RichText[]
}

export interface RichTextPropertyValue {
  id: string
  type: 'rich_text'
  rich_text: RichText[]
}

export interface NumberPropertyValue {
  id: string
  type: 'number'
  number: number | null
}

export interface SelectPropertyValue {
  id: string
  type: 'select'
  select: {
    id: string
    name: string
    color: NotionColor
  } | null
}

export interface MultiSelectPropertyValue {
  id: string
  type: 'multi_select'
  multi_select: Array<{
    id: string
    name: string
    color: NotionColor
  }>
}

export interface DatePropertyValue {
  id: string
  type: 'date'
  date: {
    start: string
    end?: string | null
    time_zone?: string | null
  } | null
}

export interface CheckboxPropertyValue {
  id: string
  type: 'checkbox'
  checkbox: boolean
}

export interface UrlPropertyValue {
  id: string
  type: 'url'
  url: string | null
}

export interface EmailPropertyValue {
  id: string
  type: 'email'
  email: string | null
}

export interface PhoneNumberPropertyValue {
  id: string
  type: 'phone_number'
  phone_number: string | null
}

export interface PeoplePropertyValue {
  id: string
  type: 'people'
  people: User[]
  has_more?: boolean
}

export interface FilesPropertyValue {
  id: string
  type: 'files'
  files: Array<{
    name: string
    type: 'external' | 'file'
    external?: { url: string }
    file?: { url: string; expiry_time: string }
  }>
}

export interface RelationPropertyValue {
  id: string
  type: 'relation'
  relation: Array<{ id: string }>
  has_more?: boolean
}

export interface RollupPropertyValue {
  id: string
  type: 'rollup'
  rollup: {
    type: 'number' | 'date' | 'array'
    number?: number | null
    date?: DatePropertyValue['date'] | null
    array?: PropertyValue[]
  }
}

export interface FormulaPropertyValue {
  id: string
  type: 'formula'
  formula: {
    type: 'string' | 'number' | 'boolean' | 'date'
    string?: string | null
    number?: number | null
    boolean?: boolean | null
    date?: DatePropertyValue['date'] | null
  }
}

export interface CreatedTimePropertyValue {
  id: string
  type: 'created_time'
  created_time: string
}

export interface CreatedByPropertyValue {
  id: string
  type: 'created_by'
  created_by: User
}

export interface LastEditedTimePropertyValue {
  id: string
  type: 'last_edited_time'
  last_edited_time: string
}

export interface LastEditedByPropertyValue {
  id: string
  type: 'last_edited_by'
  last_edited_by: User
}

export type PropertyValue =
  | TitlePropertyValue
  | RichTextPropertyValue
  | NumberPropertyValue
  | SelectPropertyValue
  | MultiSelectPropertyValue
  | DatePropertyValue
  | CheckboxPropertyValue
  | UrlPropertyValue
  | EmailPropertyValue
  | PhoneNumberPropertyValue
  | PeoplePropertyValue
  | FilesPropertyValue
  | RelationPropertyValue
  | RollupPropertyValue
  | FormulaPropertyValue
  | CreatedTimePropertyValue
  | CreatedByPropertyValue
  | LastEditedTimePropertyValue
  | LastEditedByPropertyValue

// ============================================================================
// Block Types
// ============================================================================

export interface BaseBlock {
  object: 'block'
  id: string
  parent: {
    type: 'page_id' | 'block_id' | 'workspace'
    page_id?: string
    block_id?: string
    workspace?: boolean
  }
  created_time: string
  last_edited_time: string
  created_by: PartialUser
  last_edited_by: PartialUser
  has_children: boolean
  archived: boolean
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  paragraph: {
    rich_text: RichText[]
    color?: NotionColor
  }
}

export interface HeadingOneBlock extends BaseBlock {
  type: 'heading_1'
  heading_1: {
    rich_text: RichText[]
    color?: NotionColor
    is_toggleable?: boolean
  }
}

export interface HeadingTwoBlock extends BaseBlock {
  type: 'heading_2'
  heading_2: {
    rich_text: RichText[]
    color?: NotionColor
    is_toggleable?: boolean
  }
}

export interface HeadingThreeBlock extends BaseBlock {
  type: 'heading_3'
  heading_3: {
    rich_text: RichText[]
    color?: NotionColor
    is_toggleable?: boolean
  }
}

export interface BulletedListItemBlock extends BaseBlock {
  type: 'bulleted_list_item'
  bulleted_list_item: {
    rich_text: RichText[]
    color?: NotionColor
  }
}

export interface NumberedListItemBlock extends BaseBlock {
  type: 'numbered_list_item'
  numbered_list_item: {
    rich_text: RichText[]
    color?: NotionColor
  }
}

export interface ToDoBlock extends BaseBlock {
  type: 'to_do'
  to_do: {
    rich_text: RichText[]
    checked?: boolean
    color?: NotionColor
  }
}

export interface ToggleBlock extends BaseBlock {
  type: 'toggle'
  toggle: {
    rich_text: RichText[]
    color?: NotionColor
  }
}

export interface CodeBlock extends BaseBlock {
  type: 'code'
  code: {
    rich_text: RichText[]
    language: string
    caption?: RichText[]
  }
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout'
  callout: {
    rich_text: RichText[]
    icon?: PageIcon
    color?: NotionColor
  }
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote'
  quote: {
    rich_text: RichText[]
    color?: NotionColor
  }
}

export interface DividerBlock extends BaseBlock {
  type: 'divider'
  divider: Record<string, never>
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  image: {
    type: 'external' | 'file'
    external?: { url: string }
    file?: { url: string; expiry_time: string }
    caption?: RichText[]
  }
}

export interface VideoBlock extends BaseBlock {
  type: 'video'
  video: {
    type: 'external' | 'file'
    external?: { url: string }
    file?: { url: string; expiry_time: string }
    caption?: RichText[]
  }
}

export interface FileBlock extends BaseBlock {
  type: 'file'
  file: {
    type: 'external' | 'file'
    external?: { url: string }
    file?: { url: string; expiry_time: string }
    caption?: RichText[]
  }
}

export interface BookmarkBlock extends BaseBlock {
  type: 'bookmark'
  bookmark: {
    url: string
    caption?: RichText[]
  }
}

export interface EquationBlock extends BaseBlock {
  type: 'equation'
  equation: {
    expression: string
  }
}

export type Block =
  | ParagraphBlock
  | HeadingOneBlock
  | HeadingTwoBlock
  | HeadingThreeBlock
  | BulletedListItemBlock
  | NumberedListItemBlock
  | ToDoBlock
  | ToggleBlock
  | CodeBlock
  | CalloutBlock
  | QuoteBlock
  | DividerBlock
  | ImageBlock
  | VideoBlock
  | FileBlock
  | BookmarkBlock
  | EquationBlock

// ============================================================================
// Page Types
// ============================================================================

export interface Page {
  object: 'page'
  id: string
  created_time: string
  last_edited_time: string
  created_by: PartialUser
  last_edited_by: PartialUser
  cover: PageCover | null
  icon: PageIcon | null
  parent: Parent
  archived: boolean
  properties: Record<string, PropertyValue>
  url: string
  public_url?: string | null
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreatePageRequest {
  parent: Parent
  properties: Record<string, any>
  children?: Omit<Block, keyof BaseBlock>[]
  icon?: PageIcon | null
  cover?: PageCover | null
}

export interface UpdatePageRequest {
  properties?: Record<string, any>
  icon?: PageIcon | null
  cover?: PageCover | null
  archived?: boolean
}

export interface AppendBlockChildrenRequest {
  children: Omit<Block, keyof BaseBlock>[]
  after?: string
}

// ============================================================================
// Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  object: 'list'
  results: T[]
  next_cursor: string | null
  has_more: boolean
}

export interface PropertyItemResponse {
  object: 'property_item'
  type: PropertyValue['type']
  id?: string
  next_cursor?: string | null
  has_more?: boolean
  [key: string]: any
}

export interface ErrorResponse {
  object: 'error'
  status: number
  code: string
  message: string
}

// ============================================================================
// Database Types
// ============================================================================

export interface Database {
  object: 'database'
  id: string
  created_time: string
  last_edited_time: string
  created_by: PartialUser
  last_edited_by: PartialUser
  title: RichText[]
  description: RichText[]
  icon: PageIcon | null
  cover: PageCover | null
  properties: Record<string, any> // Database schema properties
  parent: Parent
  url: string
  archived: boolean
  is_inline: boolean
  public_url?: string | null
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchParameters {
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

export interface SearchResponse {
  object: 'list'
  results: Array<Page | Database>
  next_cursor: string | null
  has_more: boolean
  type: 'page_or_database'
  page_or_database: {} // Deprecated field
}

// ============================================================================
// API Configuration
// ============================================================================

export interface NotionAPIConfig {
  apiKey: string
  apiVersion?: string
  baseUrl?: string
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
}

// ============================================================================
// Utility Types
// ============================================================================

export type BlockType = Block['type']

export type PropertyType = PropertyValue['type']

export type PartialBlock = Omit<Block, keyof BaseBlock>

// CreateBlockData represents the data needed to create a block
// It's essentially a Block without the BaseBlock properties (id, created_time, etc.)
export type CreateBlockData = 
  | { type: 'paragraph'; paragraph: { rich_text: RichText[]; color?: NotionColor } }
  | { type: 'heading_1'; heading_1: { rich_text: RichText[]; color?: NotionColor; is_toggleable?: boolean } }
  | { type: 'heading_2'; heading_2: { rich_text: RichText[]; color?: NotionColor; is_toggleable?: boolean } }
  | { type: 'heading_3'; heading_3: { rich_text: RichText[]; color?: NotionColor; is_toggleable?: boolean } }
  | { type: 'bulleted_list_item'; bulleted_list_item: { rich_text: RichText[]; color?: NotionColor } }
  | { type: 'numbered_list_item'; numbered_list_item: { rich_text: RichText[]; color?: NotionColor } }
  | { type: 'to_do'; to_do: { rich_text: RichText[]; checked: boolean; color?: NotionColor } }
  | { type: 'toggle'; toggle: { rich_text: RichText[]; color?: NotionColor } }
  | { type: 'code'; code: { rich_text: RichText[]; language: string; caption?: RichText[] } }
  | { type: 'callout'; callout: { rich_text: RichText[]; icon: PageIcon; color?: NotionColor } }
  | { type: 'quote'; quote: { rich_text: RichText[]; color?: NotionColor } }
  | { type: 'divider'; divider: Record<string, never> }
  | { type: 'image'; image: { type: 'external' | 'file'; external?: { url: string }; file?: { url: string; expiry_time: string }; caption?: RichText[] } }
  | { type: 'video'; video: { type: 'external' | 'file'; external?: { url: string }; file?: { url: string; expiry_time: string }; caption?: RichText[] } }
  | { type: 'file'; file: { type: 'external' | 'file'; external?: { url: string }; file?: { url: string; expiry_time: string }; caption?: RichText[] } }
  | { type: 'bookmark'; bookmark: { url: string; caption?: RichText[] } }
  | { type: 'equation'; equation: { expression: string } }

export type PropertyValueMap = {
  title: TitlePropertyValue
  rich_text: RichTextPropertyValue
  number: NumberPropertyValue
  select: SelectPropertyValue
  multi_select: MultiSelectPropertyValue
  date: DatePropertyValue
  checkbox: CheckboxPropertyValue
  url: UrlPropertyValue
  email: EmailPropertyValue
  phone_number: PhoneNumberPropertyValue
  people: PeoplePropertyValue
  files: FilesPropertyValue
  relation: RelationPropertyValue
  rollup: RollupPropertyValue
  formula: FormulaPropertyValue
  created_time: CreatedTimePropertyValue
  created_by: CreatedByPropertyValue
  last_edited_time: LastEditedTimePropertyValue
  last_edited_by: LastEditedByPropertyValue
}

// Type guards
export function isDatabaseParent(parent: Parent): parent is DatabaseParent {
  return parent.type === 'database_id'
}

export function isPageParent(parent: Parent): parent is PageParent {
  return parent.type === 'page_id'
}

export function isWorkspaceParent(parent: Parent): parent is WorkspaceParent {
  return parent.type === 'workspace'
}

export function isTextRichText(richText: RichText): richText is TextRichText {
  return richText.type === 'text'
}

export function isPaginatedProperty(value: PropertyValue): value is PropertyValue & { has_more: boolean } {
  return 'has_more' in value
}

export function isDatabase(object: Page | Database): object is Database {
  return object.object === 'database'
}

export function isPage(object: Page | Database): object is Page {
  return object.object === 'page'
}