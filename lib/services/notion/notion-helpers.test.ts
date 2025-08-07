/**
 * Tests for Notion Helper Functions
 */

import {
  createText,
  createRichText,
  createFormattedRichText,
  extractPlainText,
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
  createTitleProperty,
  createSelectProperty,
  createMultiSelectProperty,
  createDateProperty,
  createCheckboxProperty,
  createNumberProperty,
  getPageTitle,
  getPropertyValue,
  createDatabaseParent,
  createPageParent,
  createWorkspaceParent,
  createEmojiIcon,
  validateBlocks,
  validatePageProperties,
  markdownToBlocks,
} from './notion-helpers'
import { NotionContentLimitError, NotionValidationError } from './notion-errors'
import { Page, PropertyValue } from './notion-types'

describe('Notion Helpers', () => {
  describe('Rich Text Helpers', () => {
    describe('createText', () => {
      it('should create basic text', () => {
        const text = createText('Hello World')
        expect(text).toEqual({
          type: 'text',
          text: { content: 'Hello World', link: null },
          annotations: {},
          plain_text: 'Hello World',
          href: null,
        })
      })

      it('should create text with annotations', () => {
        const text = createText('Bold Text', { bold: true, italic: true })
        expect(text.annotations).toEqual({ bold: true, italic: true })
      })

      it('should create text with link', () => {
        const text = createText('Click here', {}, 'https://example.com')
        expect(text.text.link).toEqual({ url: 'https://example.com' })
        expect(text.href).toBe('https://example.com')
      })
    })

    describe('createRichText', () => {
      it('should create rich text array', () => {
        const richText = createRichText('Hello')
        expect(richText).toHaveLength(1)
        expect(richText[0].plain_text).toBe('Hello')
      })

      it('should throw error for content exceeding 2000 chars', () => {
        const longText = 'a'.repeat(2001)
        expect(() => createRichText(longText)).toThrow(NotionContentLimitError)
      })
    })

    describe('createFormattedRichText', () => {
      it('should create multiple formatted segments', () => {
        const segments = [
          { content: 'Hello ', annotations: { bold: true } },
          { content: 'World', annotations: { italic: true }, link: 'https://example.com' },
        ]
        const richText = createFormattedRichText(segments)
        
        expect(richText).toHaveLength(2)
        expect(richText[0].annotations).toEqual({ bold: true })
        expect(richText[1].annotations).toEqual({ italic: true })
        expect(richText[1].href).toBe('https://example.com')
      })

      it('should throw error if total content exceeds 2000 chars', () => {
        const segments = [
          { content: 'a'.repeat(1000) },
          { content: 'b'.repeat(1001) },
        ]
        expect(() => createFormattedRichText(segments)).toThrow(NotionContentLimitError)
      })
    })

    describe('extractPlainText', () => {
      it('should extract plain text from rich text array', () => {
        const richText = [
          createText('Hello '),
          createText('World'),
        ]
        expect(extractPlainText(richText)).toBe('Hello World')
      })
    })
  })

  describe('Block Creation Helpers', () => {
    describe('createParagraph', () => {
      it('should create paragraph from string', () => {
        const block = createParagraph('Test paragraph')
        expect(block.type).toBe('paragraph')
        expect(block.paragraph?.rich_text[0].plain_text).toBe('Test paragraph')
      })

      it('should create paragraph with color', () => {
        const block = createParagraph('Colored text', 'blue')
        expect(block.paragraph?.color).toBe('blue')
      })
    })

    describe('createHeading', () => {
      it('should create heading 1', () => {
        const block = createHeading('Title', 1)
        expect(block.type).toBe('heading_1')
      })

      it('should create heading 2 with toggle', () => {
        const block = createHeading('Subtitle', 2, { isToggleable: true })
        expect(block.type).toBe('heading_2')
        expect(block.heading_2?.is_toggleable).toBe(true)
      })

      it('should create heading 3 with color', () => {
        const block = createHeading('Section', 3, { color: 'red' })
        expect(block.type).toBe('heading_3')
        expect(block.heading_3?.color).toBe('red')
      })
    })

    describe('createBulletedListItem', () => {
      it('should create bulleted list item', () => {
        const block = createBulletedListItem('Item 1')
        expect(block.type).toBe('bulleted_list_item')
        expect(block.bulleted_list_item?.rich_text[0].plain_text).toBe('Item 1')
      })
    })

    describe('createTodo', () => {
      it('should create unchecked todo', () => {
        const block = createTodo('Task 1')
        expect(block.type).toBe('to_do')
        expect(block.to_do?.checked).toBe(false)
      })

      it('should create checked todo', () => {
        const block = createTodo('Completed task', true)
        expect(block.to_do?.checked).toBe(true)
      })
    })

    describe('createCodeBlock', () => {
      it('should create code block with language', () => {
        const block = createCodeBlock('console.log("Hello")', 'javascript')
        expect(block.type).toBe('code')
        expect(block.code?.language).toBe('javascript')
      })

      it('should create code block with caption', () => {
        const block = createCodeBlock('print("Hello")', 'python', 'Example code')
        expect(block.code?.caption).toBeDefined()
        expect(block.code?.caption?.[0].plain_text).toBe('Example code')
      })
    })

    describe('createCallout', () => {
      it('should create callout with default emoji', () => {
        const block = createCallout('Important note')
        expect(block.type).toBe('callout')
        expect(block.callout?.icon?.emoji).toBe('💡')
        expect(block.callout?.color).toBe('gray_background')
      })

      it('should create callout with custom emoji and color', () => {
        const block = createCallout('Warning', { emoji: '⚠️', color: 'red_background' })
        expect(block.callout?.icon?.emoji).toBe('⚠️')
        expect(block.callout?.color).toBe('red_background')
      })
    })
  })

  describe('Property Helpers', () => {
    describe('createTitleProperty', () => {
      it('should create title property', () => {
        const prop = createTitleProperty('Page Title')
        expect(prop.title[0].plain_text).toBe('Page Title')
      })
    })

    describe('createSelectProperty', () => {
      it('should create select property', () => {
        const prop = createSelectProperty('In Progress')
        expect(prop.select.name).toBe('In Progress')
      })
    })

    describe('createMultiSelectProperty', () => {
      it('should create multi-select property', () => {
        const prop = createMultiSelectProperty(['tag1', 'tag2'])
        expect(prop.multi_select).toHaveLength(2)
        expect(prop.multi_select[0].name).toBe('tag1')
      })
    })

    describe('createDateProperty', () => {
      it('should create date property with string', () => {
        const prop = createDateProperty('2024-01-01')
        expect(prop.date.start).toBe('2024-01-01')
        expect(prop.date.end).toBeNull()
      })

      it('should create date property with Date object', () => {
        const date = new Date('2024-01-01')
        const prop = createDateProperty(date)
        expect(prop.date.start).toBe(date.toISOString())
      })

      it('should create date range', () => {
        const prop = createDateProperty('2024-01-01', '2024-01-31')
        expect(prop.date.end).toBe('2024-01-31')
      })
    })
  })

  describe('Page Helpers', () => {
    describe('getPageTitle', () => {
      it('should extract title from title property', () => {
        const page = {
          properties: {
            title: {
              type: 'title',
              title: [createText('My Page')],
            },
          },
        } as any

        expect(getPageTitle(page)).toBe('My Page')
      })

      it('should try common property names', () => {
        const page = {
          properties: {
            Name: {
              type: 'title',
              title: [createText('Named Page')],
            },
          },
        } as any

        expect(getPageTitle(page)).toBe('Named Page')
      })

      it('should return Untitled for pages without title', () => {
        const page = {
          properties: {},
        } as any

        expect(getPageTitle(page)).toBe('Untitled')
      })
    })

    describe('getPropertyValue', () => {
      it('should extract title value', () => {
        const prop: PropertyValue = {
          id: 'title',
          type: 'title',
          title: [createText('Title Text')],
        }
        expect(getPropertyValue(prop)).toBe('Title Text')
      })

      it('should extract number value', () => {
        const prop: PropertyValue = {
          id: 'num',
          type: 'number',
          number: 42,
        }
        expect(getPropertyValue(prop)).toBe(42)
      })

      it('should extract select value', () => {
        const prop: PropertyValue = {
          id: 'sel',
          type: 'select',
          select: { id: '123', name: 'Option A', color: 'blue' },
        }
        expect(getPropertyValue(prop)).toBe('Option A')
      })

      it('should extract multi-select values', () => {
        const prop: PropertyValue = {
          id: 'multi',
          type: 'multi_select',
          multi_select: [
            { id: '1', name: 'Tag1', color: 'red' },
            { id: '2', name: 'Tag2', color: 'blue' },
          ],
        }
        expect(getPropertyValue(prop)).toEqual(['Tag1', 'Tag2'])
      })
    })
  })

  describe('Parent Helpers', () => {
    it('should create database parent', () => {
      const parent = createDatabaseParent('db-123')
      expect(parent.type).toBe('database_id')
      expect(parent.database_id).toBe('db-123')
    })

    it('should create page parent', () => {
      const parent = createPageParent('page-123')
      expect(parent.type).toBe('page_id')
      expect(parent.page_id).toBe('page-123')
    })

    it('should create workspace parent', () => {
      const parent = createWorkspaceParent()
      expect(parent.type).toBe('workspace')
      expect(parent.workspace).toBe(true)
    })
  })

  describe('Validation Helpers', () => {
    describe('validateBlocks', () => {
      it('should pass for valid blocks', () => {
        const blocks = [
          createParagraph('Test'),
          createHeading('Title', 1),
        ]
        expect(() => validateBlocks(blocks)).not.toThrow()
      })

      it('should throw for too many blocks', () => {
        const blocks = new Array(1001).fill(createParagraph('Test'))
        expect(() => validateBlocks(blocks)).toThrow(NotionContentLimitError)
      })

      it('should throw for blocks without type', () => {
        const blocks = [{ invalid: true } as any]
        expect(() => validateBlocks(blocks)).toThrow(NotionValidationError)
      })
    })

    describe('validatePageProperties', () => {
      it('should allow any properties for database parent', () => {
        const props = {
          Name: { title: [] },
          Status: { select: { name: 'Todo' } },
          Priority: { number: 1 },
        }
        expect(() => validatePageProperties(props, 'database_id')).not.toThrow()
      })

      it('should only allow title for page parent', () => {
        const props = {
          title: { title: [] },
        }
        expect(() => validatePageProperties(props, 'page_id')).not.toThrow()
      })

      it('should throw for non-title properties on page parent', () => {
        const props = {
          title: { title: [] },
          Status: { select: { name: 'Todo' } },
        }
        expect(() => validatePageProperties(props, 'page_id')).toThrow(NotionValidationError)
      })
    })
  })

  describe('Markdown Conversion', () => {
    describe('markdownToBlocks', () => {
      it('should convert headings', () => {
        const markdown = '# Heading 1\n## Heading 2\n### Heading 3'
        const blocks = markdownToBlocks(markdown)
        
        expect(blocks).toHaveLength(3)
        expect(blocks[0].type).toBe('heading_1')
        expect(blocks[1].type).toBe('heading_2')
        expect(blocks[2].type).toBe('heading_3')
      })

      it('should convert lists', () => {
        const markdown = '- Item 1\n- Item 2\n1. Numbered 1\n2. Numbered 2'
        const blocks = markdownToBlocks(markdown)
        
        expect(blocks[0].type).toBe('bulleted_list_item')
        expect(blocks[2].type).toBe('numbered_list_item')
      })

      it('should convert code blocks', () => {
        const markdown = '```javascript\nconsole.log("Hello")\n```'
        const blocks = markdownToBlocks(markdown)
        
        expect(blocks[0].type).toBe('code')
        expect(blocks[0].code?.language).toBe('javascript')
      })

      it('should convert quotes', () => {
        const markdown = '> This is a quote'
        const blocks = markdownToBlocks(markdown)
        
        expect(blocks[0].type).toBe('quote')
      })

      it('should convert dividers', () => {
        const markdown = 'Text\n---\nMore text'
        const blocks = markdownToBlocks(markdown)
        
        expect(blocks[1].type).toBe('divider')
      })

      it('should handle unclosed code blocks', () => {
        const markdown = '```python\nprint("Hello")'
        const blocks = markdownToBlocks(markdown)
        
        expect(blocks[0].type).toBe('code')
        expect(blocks[0].code?.rich_text[0].plain_text).toBe('print("Hello")')
      })
    })
  })
})