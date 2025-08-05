# Library Documentation Hub

This directory contains the core library code for the portfolio application, organized into logical subdirectories for better maintainability and clarity.

## Directory Structure Overview

### 📡 External Services (`/services`)
Third-party API integrations and external service clients.

See [services/CLAUDE.md](./services/CLAUDE.md) for documentation on:
- **Email Service** - Resend API integration with spam protection
- **Dev.to Publishing** - Article publishing and management  
- **YouTube Services** - Transcript fetching and formatting
- **Translation Service** - AI-powered content translation

### 📄 Content Management (`/content`)
Content processing, validation, and management systems.

See [content/CLAUDE.md](./content/CLAUDE.md) for documentation on:
- **Blog System** - MDX processing and blog post management
- **Learning System** - Module loading and validation
- **Projects System** - Project data management
- **Content Validation** - Cross-content validation utilities

### 🏗️ Core Infrastructure (`/core`)
Essential infrastructure components and utilities.

See [core/CLAUDE.md](./core/CLAUDE.md) for documentation on:
- **Caching System** - LRU cache with namespaces
- **Environment Config** - Type-safe environment management
- **Monitoring & Logging** - Observability and debugging
- **Security** - Rate limiting and protection
- **Navigation** - Route generation utilities

### 💻 Client Utilities (`/client`)
Client-side specific utilities and components.

See [client/CLAUDE.md](./client/CLAUDE.md) for documentation on:
- **Progress Tracking** - Learning progress persistence
- **Icons Library** - SVG icon components
- **Image Optimization** - Client-side image utilities

### 🔧 Other Directories

#### Hooks (`/hooks`)
React hooks for common functionality.
- `useCodePlaygroundOptimization.ts` - Code editor optimization

#### Utils (`/utils`)
General utility functions.
- `date.ts` - Date formatting utilities
- `code-splitting.ts` - Bundle optimization helpers

#### Types (`/types`)
TypeScript type definitions.
- `blog.ts` - Blog-related types

#### Translations (`/translations`)
Internationalization files.
- `en.ts` - English translations
- `pt-BR.ts` - Portuguese translations
- `index.ts` - Translation exports

#### Claude SDK (`/claude-sdk`)
Claude AI integration experiments.
- `playground.ts` - Experimental Claude features

## Architecture Principles

### 1. **Separation of Concerns**
Each subdirectory handles a specific domain, making it easy to find and maintain related code.

### 2. **Documentation First**
Every major directory has its own CLAUDE.md file documenting its contents and usage patterns.

### 3. **Type Safety**
Full TypeScript coverage with strict typing for better developer experience and fewer runtime errors.

### 4. **Performance Optimization**
Built-in caching, lazy loading, and optimization utilities throughout the library.

### 5. **Testing Coverage**
Comprehensive test suites for critical functionality with examples in documentation.

## Quick Reference

### Common Imports

```typescript
// Services
import { sendContactFormEmails } from '@/lib/services/email/email'
import { DevToAPI } from '@/lib/services/devto/devto-api'
import { YouTubeAPIv2 } from '@/lib/services/youtube/youtube-api-v2'
import { translateContent } from '@/lib/services/translation/claude-translator'

// Content
import { getAllPosts } from '@/lib/content/blog/mdx.server'
import { getModule } from '@/lib/content/learning/modules.server'
import { getAllProjects } from '@/lib/content/projects/projects'

// Core
import { blogCache } from '@/lib/core/caching/cache-manager'
import { env, isProduction } from '@/lib/core/environment/env'
import { logger } from '@/lib/core/monitoring/logger'
import { rateLimitMiddleware } from '@/lib/core/security/rate-limit'

// Client
import { useProgress } from '@/lib/client/progress'
import { CheckIcon } from '@/lib/client/icons'
import { getOptimizedImageProps } from '@/lib/client/image-optimization'

// Utils
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils/date'
```

## Getting Started

### For New Features

1. **Identify the category** - Is it a service, content type, core infrastructure, or client utility?
2. **Create in appropriate directory** - Follow the established patterns
3. **Add documentation** - Update the relevant CLAUDE.md file
4. **Include tests** - Add unit tests for new functionality
5. **Export properly** - Ensure clean, typed exports

### For Bug Fixes

1. **Locate the module** - Use the directory structure to find relevant code
2. **Check documentation** - Read the CLAUDE.md file for context
3. **Review tests** - Understand expected behavior
4. **Make minimal changes** - Fix the specific issue
5. **Update tests** - Add tests for the bug scenario

## Best Practices

### 1. **Use Existing Patterns**
Before creating new utilities, check if similar functionality exists.

### 2. **Keep Dependencies Minimal**
Each module should have minimal dependencies on other modules.

### 3. **Document Complex Logic**
Add inline comments for complex algorithms or business logic.

### 4. **Export Types**
Always export TypeScript types alongside implementations.

### 5. **Handle Errors Gracefully**
Use consistent error handling patterns throughout the library.

## Contributing

When adding new functionality:

1. **Follow the directory structure** - Place code in the appropriate subdirectory
2. **Update documentation** - Add to the relevant CLAUDE.md file
3. **Maintain consistency** - Follow existing code patterns and styles
4. **Test thoroughly** - Include unit tests for new code
5. **Consider performance** - Use caching and optimization where appropriate

## Maintenance

### Regular Tasks
- Review and update dependencies
- Check for unused exports
- Update documentation as needed
- Monitor bundle sizes
- Review error logs

### Performance Monitoring
- Cache hit rates
- API response times
- Bundle size analysis
- Memory usage patterns

## Future Considerations

As the library grows, consider:
- Breaking into separate packages
- Implementing a monorepo structure
- Adding more comprehensive testing
- Creating developer tools
- Publishing reusable components