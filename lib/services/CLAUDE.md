# External Services Documentation

This directory contains integrations with external APIs and third-party services.

## Service Categories

### 📧 Email Service (`/email`)
See [email/CLAUDE.md](./email/CLAUDE.md) for email service documentation including:
- Resend API integration
- Contact form handling
- Spam protection mechanisms
- Rate limiting implementation

### 📝 Dev.to Publishing (`/devto`)
See [devto/CLAUDE.md](./devto/CLAUDE.md) for Dev.to API documentation including:
- Article publishing pipeline
- Markdown processing
- Article mapping and tracking
- Series management

### 🎥 YouTube Services (`/youtube`)
See [youtube/CLAUDE.md](./youtube/CLAUDE.md) for YouTube transcript services including:
- Transcript fetching with youtubei.js
- Multiple export formats
- Video metadata extraction
- Storage and search capabilities

### 🌐 Translation Service (`/translation`)
See [translation/CLAUDE.md](./translation/CLAUDE.md) for AI translation documentation including:
- Claude API integration
- Content type detection
- Cultural adaptation
- Batch translation workflows

### 📄 Notion Service (`/notion`)
See [notion/CLAUDE.md](./notion/CLAUDE.md) for Notion API documentation including:
- Full TypeScript client implementation
- Page and block operations
- Property management
- Error handling and rate limiting
- Helper utilities for content creation

## Common Patterns

All services in this directory follow these patterns:

1. **Error Handling**: Comprehensive error classes and retry logic
2. **Rate Limiting**: Built-in rate limit management where applicable
3. **Type Safety**: Full TypeScript typing for all APIs
4. **Testing**: Unit tests included for critical functionality
5. **Configuration**: Environment variable based configuration

## Integration Guidelines

When adding new external services:

1. Create a dedicated subdirectory
2. Include a CLAUDE.md file documenting the service
3. Implement proper error handling and rate limiting
4. Add comprehensive TypeScript types
5. Include unit tests
6. Document all environment variables needed