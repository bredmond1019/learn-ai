/**
 * Notion API Service
 * 
 * A comprehensive TypeScript client for the Notion API with full type safety,
 * error handling, rate limiting, and helper utilities.
 */

// Main client
export { NotionClient } from './notion-client'

// Types
export * from './notion-types'

// Errors
export * from './notion-errors'

// Helpers
export {
  // Rich Text
  createText,
  createRichText,
  createFormattedRichText,
  extractPlainText,
  
  // Block Creation
  createParagraph,
  createHeading,
  createBulletedListItem,
  createNumberedListItem,
  createTodo,
  createToggle,
  createCodeBlock,
  createCallout,
  createQuote,
  createDivider,
  createImage,
  createBookmark,
  
  // Property Creation
  createTitleProperty,
  createRichTextProperty,
  createSelectProperty,
  createMultiSelectProperty,
  createDateProperty,
  createCheckboxProperty,
  createNumberProperty,
  createUrlProperty,
  createEmailProperty,
  createPhoneProperty,
  createPeopleProperty,
  createRelationProperty,
  
  // Page Helpers
  getPageTitle,
  getPropertyValue,
  createDatabaseParent,
  createPageParent,
  createWorkspaceParent,
  createEmojiIcon,
  createExternalIcon,
  
  // Validation
  validateBlocks,
  validatePageProperties,
  
  // Markdown Conversion
  markdownToBlocks,
} from './notion-helpers'

// Import for helper function
import { NotionClient } from './notion-client'

// Quick setup helper
export function createNotionClient(apiKey?: string): NotionClient {
  const key = apiKey || process.env.NOTION_KEY || process.env.NOTION_API_KEY
  
  if (!key) {
    throw new Error(
      'Notion API key not found. Please provide it as a parameter or set NOTION_KEY environment variable.'
    )
  }
  
  return new NotionClient(key)
}