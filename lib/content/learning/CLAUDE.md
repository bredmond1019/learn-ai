# Learning System Documentation

This directory manages the learning management system (LMS) functionality, including module loading, validation, and content processing.

## Core Components

### `modules.server.ts`
Server-side module loading and processing.

**Key Functions:**
- `getModule()` - Load single module with content
- `getModulesForPath()` - Get all modules in a learning path
- `getAllLearningPaths()` - List available paths
- `validateModuleId()` - Validate module existence

**Caching Strategy:**
- React cache() for request-level caching
- LRU cache for application-level caching
- Automatic cache invalidation

### `module-validation.ts`
Comprehensive module validation system.

**Validation Features:**
- JSON schema validation
- Content completeness checks
- Section reference validation
- Prerequisite verification
- File existence checks

**Validation Levels:**
- **Errors**: Must fix (missing required fields)
- **Warnings**: Should fix (best practices)
- **Info**: Suggestions (optimizations)

### `learn.ts`
Learning path utilities and type definitions.

**Key Exports:**
- Learning path interfaces
- Module type definitions
- Progress tracking types
- Utility functions

## Module Architecture

### File Structure
```
content/learn/paths/
├── ai-engineering-fundamentals/
│   ├── metadata.json              # Path metadata
│   └── modules/
│       ├── 00-introduction.json   # Module metadata
│       ├── 00-introduction.mdx    # Module content
│       ├── 01-basics.json
│       └── 01-basics.mdx
└── [locale]/                      # Localized content
    └── ai-engineering-fundamentals/
        └── modules/
            └── 00-introduction.mdx
```

### Module Metadata (JSON)
```json
{
  "id": "intro-to-vectors",
  "title": "Introduction to Vectors",
  "description": "Learn vector basics",
  "type": "concept",
  "difficulty": "beginner",
  "estimatedTime": 15,
  "learningObjectives": [
    "Understand vectors",
    "Apply vector math"
  ],
  "prerequisites": [],
  "tags": ["vectors", "math"],
  "sections": [
    {
      "id": "theory",
      "title": "Vector Theory",
      "type": "content",
      "content": {
        "source": "mdx",
        "file": "00-introduction.mdx#theory"
      }
    }
  ]
}
```

### Module Types
- **concept**: Theoretical understanding
- **theory**: In-depth explanations
- **project**: Hands-on building
- **practice**: Exercises and problems

### Section Types
- **content**: MDX content sections
- **quiz**: Interactive assessments
- **exercise**: Coding challenges

## MDX Content Structure

### Section Markers
```mdx
<!-- SECTION: theory -->
# Vector Theory

Content for this section...

<!-- SECTION: implementation -->
# Implementation

Code examples here...
```

### Custom Components
```mdx
<Quiz id="vectors-quiz">
  <Question>What is a vector?</Question>
  <Options>
    <Option correct>A quantity with magnitude and direction</Option>
    <Option>A scalar value</Option>
  </Options>
</Quiz>

<CodeExample title="Vector Addition" language="python">
  def add_vectors(v1, v2):
      return [v1[i] + v2[i] for i in range(len(v1))]
</CodeExample>

<Callout type="important">
  Vectors must have the same dimensions to add.
</Callout>

<Diagram>
  ```mermaid
  graph LR
    A[Vector] --> B[Magnitude]
    A --> C[Direction]
  ```
</Diagram>
```

## Validation System

### Schema Validation
```typescript
// Module must match schema
const result = ModuleValidator.validateModule(moduleData)
if (!result.isValid) {
  console.error(result.errors)
}
```

### Content Validation
```typescript
// Check all referenced sections exist
const sections = ModuleValidator.validateSections(
  module,
  mdxContent
)
```

### Best Practices Validation
- Module titles < 60 characters
- Descriptions 50-160 characters
- Learning objectives 3-5 items
- Estimated time in 5-minute increments
- Code blocks < 30 lines

## Progress Integration

### Progress Tracking Interface
```typescript
interface ModuleProgress {
  moduleId: string
  completed: boolean
  completedSections: string[]
  timeSpent: number
  lastAccessed: string
  quizScores: Record<string, number>
}
```

### Progress Hooks
```typescript
// Client-side progress tracking
const { 
  progress, 
  markSectionComplete,
  updateQuizScore 
} = useModuleProgress(moduleId)
```

## Localization Support

### Fallback Mechanism
1. Check locale-specific content
2. Fall back to English version
3. Use inline translations for UI

### Content Structure
```
modules/
├── 00-intro.json      # Metadata (not localized)
├── 00-intro.mdx       # English content
└── pt-BR/
    └── 00-intro.mdx   # Portuguese content
```

## Performance Optimizations

### Lazy Loading
```typescript
// Load module content on demand
const content = await loadModuleContent(moduleId, sectionId)

// Lazy load heavy components
const Quiz = dynamic(() => import('./Quiz'))
```

### Caching Layers
1. **React Cache**: Request-level deduplication
2. **LRU Cache**: Application-level caching
3. **CDN Cache**: Static content caching

### Optimized Queries
```typescript
// Load only metadata for listings
const modules = await getModuleMetadata(pathId)

// Load full content when needed
const module = await getModule(pathId, moduleId)
```

## Error Handling

### Common Issues

1. **Missing MDX File**
   ```
   Error: Module content file not found
   Solution: Ensure .mdx file exists with matching name
   ```

2. **Invalid Section Reference**
   ```
   Error: Section 'theory' not found in MDX
   Solution: Add <!-- SECTION: theory --> marker
   ```

3. **Schema Validation Failure**
   ```
   Error: Missing required field 'learningObjectives'
   Solution: Add array of learning objectives
   ```

## Testing Modules

### Validation Commands
```bash
# Validate all modules
npm run validate:content

# Test specific module
npx tsx scripts/validate-module.ts path-id/module-id

# Check learning path
npx tsx scripts/validate-learning-path.ts path-id
```

### Test Coverage
- Module schema compliance
- Section existence
- Content rendering
- Quiz functionality
- Progress tracking

## Best Practices

### Content Guidelines
1. **30-Line Rule**: Break code into digestible chunks
2. **Progressive Disclosure**: Simple → Complex
3. **Interactive Elements**: Quizzes every 2-3 sections
4. **Clear Objectives**: Specific, measurable goals
5. **Time Estimates**: Realistic and tested

### Module Design
1. **Single Concept**: One main idea per module
2. **Prerequisite Chain**: Clear learning path
3. **Mixed Content**: Theory + Practice
4. **Self-Contained**: Minimal external dependencies
5. **Accessible**: Multiple learning styles

### Performance Tips
1. Keep modules under 10 sections
2. Optimize images and diagrams
3. Use code highlighting efficiently
4. Implement proper loading states
5. Cache expensive computations