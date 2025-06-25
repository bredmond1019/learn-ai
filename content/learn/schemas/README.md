# Learning Module Schema Documentation

This document describes the standardized metadata schema for AI Engineering learning modules, based on the MCP (Model Context Protocol) format structure.

## Overview

The schema provides a consistent structure for all learning modules while maintaining compatibility with existing TypeScript interfaces in `types/module.ts`. It incorporates the best aspects of both the MCP format (structured metadata object) and the direct format (flat structure) used across different modules.

## Schema Structure

### Core Components

1. **Metadata Object**: Contains all module identification, categorization, and administrative information
2. **Sections Array**: Ordered content sections with flexible content types
3. **Resources Array**: External references and learning materials
4. **Exercises Array**: Standalone practice exercises
5. **Assessment Criteria**: Completion and scoring requirements

## Metadata Object

The metadata object follows the MCP format structure and contains all core module information:

```json
{
  "metadata": {
    "id": "introduction-to-mcp",
    "pathId": "mcp-fundamentals",
    "title": "What is MCP?",
    "description": "Understanding the Model Context Protocol and its role in modern AI systems",
    "duration": "30 minutes",
    "type": "theory",
    "difficulty": "beginner",
    "order": 1,
    "prerequisites": [],
    "objectives": [
      "Understand what MCP is and why it exists",
      "Learn the core concepts and terminology"
    ],
    "tags": ["mcp", "introduction", "concepts"],
    "version": "1.0.0",
    "lastUpdated": "2024-01-15",
    "author": "Brandon Redmond",
    "estimatedCompletionTime": 30
  }
}
```

### Key Fields

- **id**: Unique kebab-case identifier
- **pathId**: Learning path this module belongs to
- **title**: Human-readable module title
- **description**: Detailed description (max 500 chars)
- **duration**: Human-readable time estimate
- **type**: Content type (theory, concept, practice, project, assessment)
- **difficulty**: beginner | intermediate | advanced
- **order**: Position within learning path (1-based)
- **objectives**: Array of learning objectives
- **estimatedCompletionTime**: Time in minutes (for progress tracking)

## Sections Structure

Sections provide flexible content organization with three main types:

### 1. Content Sections

Standard sections with MDX content and code examples:

```json
{
  "id": "core-concepts",
  "title": "Core Concepts",
  "type": "content",
  "order": 2,
  "estimatedDuration": "10 minutes",
  "content": {
    "type": "mdx",
    "source": "01-introduction-to-mcp.mdx#core-concepts",
    "codeExamples": [
      {
        "id": "mcp-server-structure",
        "title": "Basic MCP Server Structure",
        "description": "A minimal MCP server implementation",
        "language": "typescript",
        "code": "import { Server } from '@modelcontextprotocol/sdk/server/index.js';",
        "highlightLines": [1, 2],
        "runnable": false
      }
    ]
  }
}
```

### 2. Quiz Sections

Integrated quiz sections with multiple question types:

```json
{
  "id": "knowledge-check",
  "title": "Knowledge Check",
  "type": "quiz",
  "order": 4,
  "content": {
    "type": "quiz",
    "title": "Test Your Understanding",
    "questions": [
      {
        "id": "q1",
        "type": "multiple-choice",
        "question": "What does MCP stand for?",
        "points": 1,
        "options": [
          {
            "id": "a",
            "text": "Model Context Protocol",
            "explanation": "Correct! MCP stands for Model Context Protocol."
          }
        ],
        "correctAnswers": ["a"],
        "randomizeOptions": true
      }
    ],
    "passingScore": 70,
    "allowRetries": true
  }
}
```

### 3. Exercise Sections

Embedded exercises with validation:

```json
{
  "id": "practice-exercise",
  "title": "Build Your First MCP Server",
  "type": "exercise",
  "order": 5,
  "content": {
    "type": "exercise",
    "title": "MCP Server Implementation",
    "exerciseType": "coding",
    "difficulty": "medium",
    "instructions": [
      "Create a new MCP server project",
      "Implement basic resource endpoints"
    ],
    "startingCode": "// Your code here",
    "hints": ["Remember to import the MCP SDK"],
    "validation": [
      {
        "type": "contains",
        "value": "import { Server }",
        "message": "Make sure to import the Server class"
      }
    ]
  }
}
```

## Resources and External Materials

Resources provide additional learning materials:

```json
{
  "resources": [
    {
      "id": "mcp-spec",
      "title": "MCP Specification",
      "type": "reference",
      "url": "https://spec.modelcontextprotocol.io",
      "description": "The official MCP specification document",
      "required": false
    },
    {
      "id": "mcp-tutorial",
      "title": "Getting Started with MCP",
      "type": "tutorial",
      "url": "https://tutorial.modelcontextprotocol.io",
      "description": "Step-by-step tutorial for MCP development",
      "required": true
    }
  ]
}
```

## Assessment Criteria

Define completion requirements and scoring:

```json
{
  "assessmentCriteria": {
    "minimumScore": 70,
    "requiredSections": ["introduction", "core-concepts", "architecture"],
    "timeTracking": true,
    "completionCertificate": false
  }
}
```

## Question Types

The schema supports multiple quiz question formats:

### Multiple Choice
```json
{
  "type": "multiple-choice",
  "question": "Which are core MCP components?",
  "options": [...],
  "correctAnswers": ["a", "b", "c"]
}
```

### True/False
```json
{
  "type": "true-false",
  "question": "MCP servers can only provide read-only resources.",
  "correctAnswer": false
}
```

### Code Output
```json
{
  "type": "code-output",
  "question": "What does this code output?",
  "correctAnswer": "Hello, World!"
}
```

### Fill in the Blank
```json
{
  "type": "fill-in-blank",
  "question": "MCP stands for _____ Context Protocol",
  "correctAnswer": "Model"
}
```

## Migration Benefits

This standardized schema addresses the inconsistencies identified in the audit:

1. **Unified Structure**: All modules follow the same JSON structure
2. **Flexible Content**: Supports various content types within sections
3. **Rich Metadata**: Comprehensive module information in structured format
4. **TypeScript Compatibility**: Fully compatible with existing interfaces
5. **Extensibility**: Easy to add new fields and content types
6. **Validation**: JSON Schema enables automatic validation

## Usage Guidelines

### Creating New Modules

1. Use the schema as your template
2. Validate against the JSON Schema
3. Ensure all required fields are present
4. Follow naming conventions (kebab-case for IDs)
5. Include meaningful learning objectives
6. Provide estimated durations for sections

### Converting Existing Modules

1. Map existing fields to new schema structure
2. Move metadata to the `metadata` object
3. Convert quiz objects to quiz sections
4. Ensure section content follows new format
5. Validate the converted module

### Content Guidelines

- **Duration Format**: Use "X minutes" or "X hours" format
- **ID Format**: Use kebab-case for all IDs
- **Order**: Use 1-based ordering for sections and modules
- **Tags**: Use lowercase, hyphenated tags
- **Objectives**: Write clear, measurable learning objectives
- **Code Examples**: Provide meaningful titles and descriptions

## Example Complete Module

```json
{
  "metadata": {
    "id": "example-module",
    "pathId": "example-path",
    "title": "Example Learning Module",
    "description": "A complete example of the standardized module format",
    "duration": "45 minutes",
    "type": "concept",
    "difficulty": "intermediate",
    "order": 1,
    "prerequisites": ["basic-programming"],
    "objectives": [
      "Understand the example concepts",
      "Apply the learned principles"
    ],
    "tags": ["example", "tutorial"],
    "version": "1.0.0",
    "lastUpdated": "2025-06-20",
    "author": "AI Engineering Team",
    "estimatedCompletionTime": 45
  },
  "sections": [
    {
      "id": "introduction",
      "title": "Introduction",
      "type": "content",
      "order": 1,
      "estimatedDuration": "15 minutes",
      "content": {
        "type": "mdx",
        "source": "example-module.mdx#introduction",
        "codeExamples": []
      }
    },
    {
      "id": "quiz",
      "title": "Knowledge Check",
      "type": "quiz",
      "order": 2,
      "estimatedDuration": "10 minutes",
      "content": {
        "type": "quiz",
        "title": "Test Your Knowledge",
        "questions": [...],
        "passingScore": 70
      }
    }
  ],
  "resources": [...],
  "assessmentCriteria": {
    "minimumScore": 70,
    "requiredSections": ["introduction"],
    "timeTracking": true,
    "completionCertificate": false
  }
}
```

This schema provides a robust foundation for consistent, maintainable learning content while preserving all existing functionality and enabling future enhancements.