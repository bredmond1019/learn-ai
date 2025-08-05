# Translation Service Documentation

This service provides AI-powered content translation using Claude API for internationalization support.

## Overview

The translation service offers:
- Automated content translation to Portuguese (pt-BR)
- Content type detection for context-aware translation
- Cultural adaptation and localization
- Batch translation capabilities
- Cost estimation before translation

## Core Components

### `claude-translator.ts`
Main translation service using Anthropic's Claude API.

**Key Features:**
- Multiple content type support
- Context-aware translation
- Cultural adaptation options
- Progress tracking for batch operations
- Cost estimation

**Content Types:**
```typescript
type ContentType = 
  | 'blog-post'         // Blog articles
  | 'project'           // Project descriptions
  | 'ui-text'           // Interface text
  | 'marketing-copy'    // Marketing content
  | 'technical-doc'     // Technical documentation
```

### Translation Options

```typescript
interface TranslationOptions {
  targetLanguage: string    // Default: 'pt-BR'
  contentType: ContentType  // Determines translation style
  preserveCodeBlocks: boolean // Keep code unchanged
  localizeCulture: boolean   // Adapt cultural references
  maintainFormatting: boolean // Preserve MDX/markdown
}
```

## CLI Usage

### Translation Commands

```bash
# Scan for missing translations
npm run translate:scan

# Translate by priority
npm run translate:priority    # Blog + AI fundamentals
npm run translate:blog        # Blog posts only
npm run translate:learning    # Learning modules only
npm run translate:all         # Everything

# Custom translation
npx tsx scripts/translate-content.ts \
  --file path/to/content.md \
  --type blog-post \
  --target pt-BR
```

## Programmatic Usage

### Basic Translation

```typescript
import { translateContent } from '@/lib/services/translation/claude-translator'

const result = await translateContent(
  'English content here...',
  'en',
  'pt-BR',
  {
    contentType: 'blog-post',
    preserveCodeBlocks: true,
    localizeCulture: true
  }
)

if (result.success) {
  console.log(result.translatedContent)
}
```

### Batch Translation

```typescript
import { translateBatch } from '@/lib/services/translation/claude-translator'

const files = [
  { path: 'blog/post1.md', content: '...', type: 'blog-post' },
  { path: 'blog/post2.md', content: '...', type: 'blog-post' }
]

const results = await translateBatch(files, {
  targetLanguage: 'pt-BR',
  onProgress: (current, total) => {
    console.log(`Progress: ${current}/${total}`)
  }
})
```

### Cost Estimation

```typescript
import { estimateCost } from '@/lib/services/translation/claude-translator'

const cost = await estimateCost(contentLength)
console.log(`Estimated cost: $${cost.toFixed(2)}`)
```

## Translation Strategies

### Blog Post Translation
- Preserves technical terminology
- Adapts cultural references
- Maintains markdown formatting
- Keeps code blocks unchanged
- Translates frontmatter metadata

### Technical Documentation
- Preserves technical accuracy
- Maintains code examples
- Translates comments in code
- Keeps API references intact
- Adapts units and formats

### UI Text Translation
- Considers space constraints
- Maintains consistency
- Adapts to local conventions
- Preserves placeholders
- Handles pluralization

### Marketing Copy
- Cultural adaptation focus
- Local market considerations
- Emotional tone preservation
- Call-to-action localization
- Brand voice maintenance

## Content Detection

The service automatically detects content type based on:

1. **File Location**: `/blog/`, `/projects/`, `/learn/`
2. **Frontmatter**: Metadata indicators
3. **Content Analysis**: Technical vs. marketing language
4. **File Extension**: `.md`, `.mdx`, `.json`

## Quality Assurance

### Validation Steps

1. **Pre-Translation**
   - Content type detection
   - Format validation
   - Code block identification

2. **During Translation**
   - Context preservation
   - Technical term consistency
   - Format maintenance

3. **Post-Translation**
   - MDX validation
   - Frontmatter integrity
   - Link preservation

### Common Issues

1. **Code Block Corruption**
   ```typescript
   // Original
   const example = "test"
   
   // Bad translation
   const exemplo = "teste"
   
   // Good (preserved)
   const example = "test"
   ```

2. **Link Translation**
   ```markdown
   // Original
   [Learn more](/en/docs)
   
   // Good
   [Saiba mais](/pt-BR/docs)
   ```

3. **Technical Terms**
   ```
   // Terms to preserve
   - API, REST, GraphQL
   - React, Next.js, TypeScript
   - CI/CD, DevOps
   ```

## Batch Translation Workflow

```typescript
// 1. Scan for untranslated content
const untranslated = await scanForMissingTranslations()

// 2. Estimate costs
const totalCost = await estimateBatchCost(untranslated)

// 3. Confirm and translate
if (confirm(`Translate ${untranslated.length} files? Cost: $${totalCost}`)) {
  const results = await translateBatch(untranslated, {
    onProgress: updateProgressBar,
    onError: logError
  })
}

// 4. Validate results
const valid = await validateTranslations(results)
```

## Environment Configuration

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...  # Claude API key

# Optional
TRANSLATION_MODEL=claude-3-haiku-20240307  # Model selection
TRANSLATION_MAX_BATCH=10                   # Batch size
TRANSLATION_DELAY_MS=1000                  # Rate limiting
```

## Best Practices

1. **Review Translations**: Always review AI translations
2. **Preserve Technical Terms**: Don't translate code or API terms
3. **Test MDX Rendering**: Ensure formatted content renders
4. **Cultural Sensitivity**: Review cultural adaptations
5. **Consistent Terminology**: Maintain glossary of terms

## Cost Management

### Pricing Estimates (Claude 3 Haiku)
- Input: ~$0.25 per million tokens
- Output: ~$1.25 per million tokens
- Average blog post: ~$0.02-0.05

### Optimization Tips
1. Batch similar content types
2. Use caching for repeated phrases
3. Exclude already-translated sections
4. Remove unnecessary metadata

## Testing

```bash
# Test translation quality
npm test -- claude-translator.test.ts

# Validate translations
npm run validate:translations

# Check MDX compatibility
npm run validate:content -- --locale pt-BR
```

## Integration with Content Pipeline

The translation service integrates with:
- Content validation pipeline
- MDX processing system
- File-based CMS structure
- Internationalization routing

Translation workflow ensures:
- Consistent file structure
- Proper locale directories
- Valid MDX output
- Preserved metadata