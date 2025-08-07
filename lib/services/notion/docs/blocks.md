# Notion Blocks API Reference

## Overview

Blocks are the fundamental units of content in Notion. Everything you see in a Notion page — from text to images to tables — is represented as a block object. The Notion API allows you to read, create, update, and delete blocks programmatically.

## Block Object Structure

### Common Block Properties

Every block object contains these common fields:

```typescript
{
  "object": "block",
  "id": "block_id",
  "parent": {
    "type": "page_id" | "database_id" | "block_id",
    "page_id": "parent_page_id" // or database_id/block_id
  },
  "created_time": "2023-12-13T00:00:00.000Z",
  "last_edited_time": "2023-12-13T00:00:00.000Z",
  "created_by": { "object": "user", "id": "user_id" },
  "last_edited_by": { "object": "user", "id": "user_id" },
  "has_children": false,
  "archived": false,
  "type": "paragraph", // Block type
  "paragraph": { // Type-specific properties
    // ...
  }
}
```

## Supported Block Types

### Text Blocks

#### Paragraph
```typescript
{
  "type": "paragraph",
  "paragraph": {
    "rich_text": RichText[],
    "color": Color
  }
}
```

#### Headings
```typescript
// heading_1, heading_2, heading_3
{
  "type": "heading_1",
  "heading_1": {
    "rich_text": RichText[],
    "color": Color,
    "is_toggleable": boolean
  }
}
```

#### Lists
```typescript
// bulleted_list_item
{
  "type": "bulleted_list_item",
  "bulleted_list_item": {
    "rich_text": RichText[],
    "color": Color
  }
}

// numbered_list_item
{
  "type": "numbered_list_item",
  "numbered_list_item": {
    "rich_text": RichText[],
    "color": Color
  }
}
```

#### To-do
```typescript
{
  "type": "to_do",
  "to_do": {
    "rich_text": RichText[],
    "checked": boolean,
    "color": Color
  }
}
```

#### Toggle
```typescript
{
  "type": "toggle",
  "toggle": {
    "rich_text": RichText[],
    "color": Color
  }
}
```

#### Quote
```typescript
{
  "type": "quote",
  "quote": {
    "rich_text": RichText[],
    "color": Color
  }
}
```

#### Callout
```typescript
{
  "type": "callout",
  "callout": {
    "rich_text": RichText[],
    "icon": {
      "type": "emoji",
      "emoji": "💡"
    },
    "color": Color
  }
}
```

### Code and Specialized Blocks

#### Code
```typescript
{
  "type": "code",
  "code": {
    "rich_text": RichText[],
    "caption": RichText[],
    "language": CodeLanguage
  }
}
```

#### Equation
```typescript
{
  "type": "equation",
  "equation": {
    "expression": string // LaTeX string
  }
}
```

### Structural Blocks

#### Divider
```typescript
{
  "type": "divider",
  "divider": {} // Empty object
}
```

#### Column List and Column
```typescript
// Column list contains columns
{
  "type": "column_list",
  "column_list": {}
}

// Individual column
{
  "type": "column",
  "column": {}
}
```

#### Table
```typescript
{
  "type": "table",
  "table": {
    "table_width": number,
    "has_column_header": boolean,
    "has_row_header": boolean
  }
}
```

#### Table Row
```typescript
{
  "type": "table_row",
  "table_row": {
    "cells": RichText[][]
  }
}
```

### Media Blocks

#### Image
```typescript
{
  "type": "image",
  "image": {
    "type": "external" | "file",
    "external": {
      "url": string
    },
    "caption": RichText[]
  }
}
```

#### Video
```typescript
{
  "type": "video",
  "video": {
    "type": "external" | "file",
    "external": {
      "url": string
    },
    "caption": RichText[]
  }
}
```

#### File
```typescript
{
  "type": "file",
  "file": {
    "type": "external" | "file",
    "external": {
      "url": string
    },
    "caption": RichText[]
  }
}
```

#### PDF
```typescript
{
  "type": "pdf",
  "pdf": {
    "type": "external" | "file",
    "external": {
      "url": string
    },
    "caption": RichText[]
  }
}
```

### Other Blocks

#### Bookmark
```typescript
{
  "type": "bookmark",
  "bookmark": {
    "url": string,
    "caption": RichText[]
  }
}
```

#### Embed
```typescript
{
  "type": "embed",
  "embed": {
    "url": string
  }
}
```

#### Child Page
```typescript
{
  "type": "child_page",
  "child_page": {
    "title": string
  }
}
```

#### Child Database
```typescript
{
  "type": "child_database",
  "child_database": {
    "title": string
  }
}
```

## Rich Text Format

Rich text is used in many block types and follows this structure:

```typescript
interface RichText {
  type: "text" | "mention" | "equation";
  text?: {
    content: string;
    link?: {
      url: string;
    };
  };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: Color;
  };
  plain_text: string;
  href?: string;
}
```

## Colors

Supported colors for text and backgrounds:

- `default`
- `gray`
- `brown`
- `orange`
- `yellow`
- `green`
- `blue`
- `purple`
- `pink`
- `red`
- `gray_background`
- `brown_background`
- `orange_background`
- `yellow_background`
- `green_background`
- `blue_background`
- `purple_background`
- `pink_background`
- `red_background`

## Code Languages

Supported programming languages for code blocks:

```
abap, arduino, bash, basic, c, clojure, coffeescript, c++, c#, css,
dart, diff, docker, elixir, elm, erlang, flow, fortran, f#, gherkin,
glsl, go, graphql, groovy, haskell, html, java, javascript, json,
julia, kotlin, latex, less, lisp, livescript, lua, makefile, markdown,
markup, matlab, mermaid, nix, objective-c, ocaml, pascal, perl, php,
plain text, powershell, prolog, protobuf, python, r, reason, ruby,
rust, sass, scala, scheme, scss, shell, sql, swift, typescript,
vb.net, verilog, vhdl, visual basic, webassembly, xml, yaml
```

## Block Operations

### Retrieve a Block
```
GET https://api.notion.com/v1/blocks/{block_id}
```

### Retrieve Block Children
```
GET https://api.notion.com/v1/blocks/{block_id}/children?page_size=100
```

Returns paginated results of child blocks.

### Append Block Children
```
PATCH https://api.notion.com/v1/blocks/{block_id}/children
```

Body:
```json
{
  "children": [
    {
      "type": "paragraph",
      "paragraph": {
        "rich_text": [{ "type": "text", "text": { "content": "New paragraph" } }]
      }
    }
  ]
}
```

### Update a Block
```
PATCH https://api.notion.com/v1/blocks/{block_id}
```

Note: Not all block types support updates. Generally, you can update:
- Rich text content
- Checked status for to-do blocks
- Some other type-specific properties

### Delete a Block
```
DELETE https://api.notion.com/v1/blocks/{block_id}
```

Sets the block's `archived` property to `true`.

## Important Limitations

### Unsupported Block Types
The following Notion block types are not supported via the API:
- AI block
- Breadcrumb
- Button
- Link preview
- Mention (inline only)
- Table of contents
- Template (deprecated)
- Synced block (original)

### Other Limitations
1. **Maximum children per request**: 100 blocks
2. **Nested blocks**: Some block types cannot have children
3. **Table limitations**: Cannot update table structure after creation
4. **File uploads**: Direct file upload not supported; use external URLs
5. **Block moving**: Cannot move blocks between parents via API

## Best Practices

### Creating Blocks
1. **Batch operations**: Create multiple blocks in a single request when possible
2. **Use children parameter**: When creating pages, include initial blocks as children
3. **Validate rich text**: Ensure rich text arrays are properly formatted

### Working with Children
1. **Check has_children**: Before fetching children, verify the block supports them
2. **Handle pagination**: Use cursor-based pagination for large sets of children
3. **Recursive fetching**: Implement recursive logic for deeply nested structures

### Performance Considerations
1. **Minimize API calls**: Fetch all needed blocks in fewer requests
2. **Cache block data**: Store frequently accessed blocks locally
3. **Rate limiting**: Respect Notion's rate limits (3 requests/second)

## Common Patterns

### Converting Markdown to Blocks
```typescript
function markdownToBlocks(markdown: string): Block[] {
  const blocks: Block[] = []
  const lines = markdown.split('\n')
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      blocks.push(createHeading1(line.slice(2)))
    } else if (line.startsWith('## ')) {
      blocks.push(createHeading2(line.slice(3)))
    } else if (line.startsWith('- ')) {
      blocks.push(createBulletedListItem(line.slice(2)))
    } else if (line.trim()) {
      blocks.push(createParagraph(line))
    }
  }
  
  return blocks
}
```

### Extracting Text from Blocks
```typescript
function extractTextFromBlock(block: Block): string {
  const type = block.type
  const data = block[type]
  
  if ('rich_text' in data) {
    return data.rich_text.map(rt => rt.plain_text).join('')
  }
  
  return ''
}
```

### Creating Rich Content
```typescript
function createRichParagraph(content: string, options?: {
  bold?: boolean
  color?: Color
}): Block {
  return {
    type: 'paragraph',
    paragraph: {
      rich_text: [{
        type: 'text',
        text: { content },
        annotations: {
          bold: options?.bold || false,
          color: options?.color || 'default'
        }
      }],
      color: 'default'
    }
  }
}
```