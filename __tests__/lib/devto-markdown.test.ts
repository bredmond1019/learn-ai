import { DevToMarkdownParser, MarkdownParseError } from '../../lib/devto-markdown';
import * as fs from 'fs/promises';

// Mock fs/promises module
jest.mock('fs/promises');

describe('DevToMarkdownParser', () => {
  const parser = new DevToMarkdownParser();
  const mockedFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseFile', () => {
    it('should parse valid markdown file with front matter', async () => {
      const validContent = `---
title: "Building AI Agents with TypeScript: A Practical Guide"
description: "Learn how to build production-ready AI agents using TypeScript, LangChain, and modern web technologies"
tags: ["typescript", "ai", "langchain", "agents"]
published: true
canonical_url: "https://brandonjredmond.com/blog/ai-agents-typescript"
cover_image: "https://brandonjredmond.com/images/ai-agents-cover.jpg"
---

# Building AI Agents with TypeScript: A Practical Guide

Content here...`;

      mockedFs.readFile.mockResolvedValue(validContent);

      const result = await parser.parseFile('valid-article.md');

      expect(result).toEqual({
        frontMatter: {
          title: 'Building AI Agents with TypeScript: A Practical Guide',
          description: 'Learn how to build production-ready AI agents using TypeScript, LangChain, and modern web technologies',
          tags: ['typescript', 'ai', 'langchain', 'agents'],
          published: true,
          canonical_url: 'https://brandonjredmond.com/blog/ai-agents-typescript',
          cover_image: 'https://brandonjredmond.com/images/ai-agents-cover.jpg',
        },
        content: '\n# Building AI Agents with TypeScript: A Practical Guide\n\nContent here...',
        fullContent: validContent,
      });
    });

    it('should handle markdown without front matter', async () => {
      const contentWithoutFrontMatter = `# Just a Regular Markdown File

This file has no front matter.`;

      mockedFs.readFile.mockResolvedValue(contentWithoutFrontMatter);

      await expect(parser.parseFile('no-frontmatter.md')).rejects.toThrow(
        MarkdownParseError
      );
    });

    it('should throw error for non-existent file', async () => {
      mockedFs.readFile.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      await expect(parser.parseFile('non-existent.md')).rejects.toThrow(
        MarkdownParseError
      );
    });

    it('should handle empty front matter', async () => {
      const emptyFrontMatter = `---
title: "Required Title"
---

# Article with minimal front matter`;

      mockedFs.readFile.mockResolvedValue(emptyFrontMatter);

      const result = await parser.parseFile('empty-frontmatter.md');

      expect(result).toEqual({
        frontMatter: {
          title: 'Required Title',
        },
        content: '\n# Article with minimal front matter',
        fullContent: emptyFrontMatter,
      });
    });

    it('should preserve code blocks in content', async () => {
      const contentWithCode = `---
title: "Code Example"
---

Here's some code:

\`\`\`typescript
function hello() {
  return 'world';
}
\`\`\`

More content...`;

      mockedFs.readFile.mockResolvedValue(contentWithCode);

      const result = await parser.parseFile('code-example.md');

      expect(result.content).toContain('```typescript');
      expect(result.content).toContain("function hello()");
    });
  });

  describe('parseContent', () => {
    it('should parse content string with front matter', () => {
      const content = `---
title: "Test Article"
tags: "javascript, react"
---

# Content`;

      const result = parser.parseContent(content);

      expect(result.frontMatter.title).toBe('Test Article');
      expect(result.frontMatter.tags).toEqual(['javascript', 'react']);
      expect(result.content).toBe('\n# Content');
    });

    it('should throw error for missing title', () => {
      const content = `---
description: "No title here"
---

# Content`;

      expect(() => parser.parseContent(content)).toThrow(MarkdownParseError);
      expect(() => parser.parseContent(content)).toThrow('Missing required field: title');
    });

    it('should normalize string tags to array', () => {
      const content = `---
title: "Test"
tags: "tag1, tag2, tag3"
---

Content`;

      const result = parser.parseContent(content);

      expect(result.frontMatter.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });

  describe('validateForDevTo', () => {
    it('should validate complete article data', () => {
      const validData = {
        frontMatter: {
          title: 'Test Article',
          description: 'A test article',
          tags: ['test', 'validation'],
          published: true,
        },
        content: '# Test Article\n\nContent',
        fullContent: '---\ntitle: Test Article\n---\n# Test Article\n\nContent',
      };

      const errors = parser.validateForDevTo(validData);
      expect(errors).toEqual([]);
    });

    it('should return error for missing title', () => {
      const dataWithoutTitle = {
        frontMatter: {},
        content: '# Content without title in data',
        fullContent: '# Content without title in data',
      };

      const errors = parser.validateForDevTo(dataWithoutTitle);
      expect(errors).toContain('Missing title in front matter');
    });

    it('should return error for title exceeding 250 characters', () => {
      const longTitle = 'A'.repeat(251);
      const dataWithLongTitle = {
        frontMatter: {
          title: longTitle,
        },
        content: '# Content',
        fullContent: `---\ntitle: ${longTitle}\n---\n# Content`,
      };

      const errors = parser.validateForDevTo(dataWithLongTitle);
      expect(errors).toContain('Title exceeds 250 characters');
    });

    it('should return error for empty content', () => {
      const dataWithoutContent = {
        frontMatter: {
          title: 'Title without content',
          tags: ['test'],
        },
        content: '',
        fullContent: '---\ntitle: Title without content\n---\n',
      };

      const errors = parser.validateForDevTo(dataWithoutContent);
      expect(errors).toContain('Article content is empty');
    });

    it('should return error for too many tags', () => {
      const dataWithTooManyTags = {
        frontMatter: {
          title: 'Test',
          tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
        },
        content: 'Content',
        fullContent: '---\ntitle: Test\n---\nContent',
      };

      const errors = parser.validateForDevTo(dataWithTooManyTags);
      expect(errors).toContain('Maximum 4 tags allowed');
    });

    it('should validate tag length', () => {
      const dataWithLongTag = {
        frontMatter: {
          title: 'Test',
          tags: ['valid-tag', 'this-tag-is-way-too-long-and-exceeds-thirty-characters'],
        },
        content: 'Content',
        fullContent: '---\ntitle: Test\n---\nContent',
      };

      const errors = parser.validateForDevTo(dataWithLongTag);
      expect(errors.some(error => error.includes('exceeds 30 characters'))).toBe(true);
    });

    it('should return multiple errors', () => {
      const invalidData = {
        frontMatter: {
          tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'],
        },
        content: '   ',
        fullContent: '---\n---\n   ',
      };

      const errors = parser.validateForDevTo(invalidData);
      expect(errors).toContain('Missing title in front matter');
      expect(errors).toContain('Article content is empty');
      expect(errors).toContain('Maximum 4 tags allowed');
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('toDevToArticle', () => {
    it('should transform parsed data to Dev.to format', () => {
      const parsedData = {
        frontMatter: {
          title: 'Test Article',
          description: 'Test description',
          tags: ['javascript', 'tutorial'],
          published: false,
          series: 'My Series',
          canonical_url: 'https://example.com/test',
          cover_image: 'https://example.com/cover.jpg',
        },
        content: '# Test Article\n\nContent here',
        fullContent: '---\ntitle: Test Article\n---\n# Test Article\n\nContent here',
      };

      const result = parser.toDevToArticle(parsedData);

      expect(result).toEqual({
        title: 'Test Article',
        body_markdown: '# Test Article\n\nContent here',
        description: 'Test description',
        tags: ['javascript', 'tutorial'],
        published: false,
        series: 'My Series',
        canonical_url: 'https://example.com/test',
        main_image: 'https://example.com/cover.jpg',
      });
    });

    it('should handle missing optional fields', () => {
      const minimalData = {
        frontMatter: {
          title: 'Minimal Article',
        },
        content: 'Just content',
        fullContent: '---\ntitle: Minimal Article\n---\nJust content',
      };

      const result = parser.toDevToArticle(minimalData);

      expect(result).toEqual({
        title: 'Minimal Article',
        body_markdown: 'Just content',
        published: true, // defaults to true when not specified as false
        series: undefined,
        main_image: undefined,
        canonical_url: undefined,
        description: undefined,
        tags: undefined,
      });
    });

    it('should handle published defaulting', () => {
      const dataWithoutPublished = {
        frontMatter: {
          title: 'Article',
        },
        content: 'Content',
        fullContent: '---\ntitle: Article\n---\nContent',
      };

      const result = parser.toDevToArticle(dataWithoutPublished);
      expect(result.published).toBe(true);

      const dataWithPublishedFalse = {
        frontMatter: {
          title: 'Article',
          published: false,
        },
        content: 'Content',
        fullContent: '---\ntitle: Article\npublished: false\n---\nContent',
      };

      const result2 = parser.toDevToArticle(dataWithPublishedFalse);
      expect(result2.published).toBe(false);
    });

    it('should handle cover_image alias', () => {
      const dataWithCoverImage = {
        frontMatter: {
          title: 'Article',
          cover_image: 'https://example.com/image.jpg',
        },
        content: 'Content',
        fullContent: '---\ntitle: Article\n---\nContent',
      };

      const result = parser.toDevToArticle(dataWithCoverImage);

      expect(result.main_image).toBe('https://example.com/image.jpg');
    });

    it('should handle non-array tags gracefully', () => {
      const dataWithStringTags = {
        frontMatter: {
          title: 'Article',
          tags: 'not-an-array' as any,
        },
        content: 'Content',
        fullContent: '---\ntitle: Article\n---\nContent',
      };

      const result = parser.toDevToArticle(dataWithStringTags);

      expect(result.tags).toBeUndefined();
    });
  });

  describe('integration tests', () => {
    it('should parse and transform a complete article', async () => {
      const articleContent = `---
title: "Complete Article Example"
description: "A comprehensive test article"
tags: ["TypeScript", "Testing", "Dev.to"]
published: true
series: "Testing Series"
canonical_url: "https://myblog.com/complete-article"
---

# Complete Article Example

This is a complete article with all the features.

## Code Examples

\`\`\`typescript
interface Article {
  title: string;
  content: string;
}
\`\`\`

## Lists

- Item 1
- Item 2
- Item 3

### Conclusion

That's all folks!`;

      mockedFs.readFile.mockResolvedValue(articleContent);

      const parsed = await parser.parseFile('complete.md');
      const transformed = parser.toDevToArticle(parsed);
      const errors = parser.validateForDevTo(parsed);

      expect(errors).toEqual([]);
      expect(transformed.title).toBe('Complete Article Example');
      expect(transformed.tags).toEqual(['TypeScript', 'Testing', 'Dev.to']);
      expect(transformed.published).toBe(true);
      expect(transformed.series).toBe('Testing Series');
      expect(transformed.body_markdown).toContain('```typescript');
    });

    it('should handle parsing errors gracefully', async () => {
      const invalidYaml = `---
title: "Test
tags: [unclosed
---

Content`;

      mockedFs.readFile.mockResolvedValue(invalidYaml);

      await expect(parser.parseFile('invalid.md')).rejects.toThrow(MarkdownParseError);
    });
  });

  describe('updateFrontMatter', () => {
    it('should update front matter in a file', async () => {
      const originalContent = `---
title: "Original Title"
tags: ["tag1", "tag2"]
published: false
---

# Article Content

This is the article content.`;

      mockedFs.readFile.mockResolvedValue(originalContent);
      mockedFs.writeFile.mockResolvedValue(undefined);

      await parser.updateFrontMatter('test.md', {
        title: 'Updated Title',
        published: true,
        description: 'New description',
      });

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        'test.md',
        expect.stringContaining('title: Updated Title'),
        'utf-8'
      );
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        'test.md',
        expect.stringContaining('published: true'),
        'utf-8'
      );
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        'test.md',
        expect.stringContaining('description: New description'),
        'utf-8'
      );
    });

    it('should handle errors when updating front matter', async () => {
      mockedFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(
        parser.updateFrontMatter('nonexistent.md', { title: 'New Title' })
      ).rejects.toThrow(MarkdownParseError);
    });
  });

  describe('parseDirectory', () => {
    it('should parse all markdown files in a directory', async () => {
      mockedFs.readdir.mockResolvedValue(['file1.md', 'file2.mdx', 'file3.txt', 'file4.md'] as any);

      const file1Content = `---
title: "File 1"
---

Content 1`;

      const file2Content = `---
title: "File 2"
---

Content 2`;

      const file4Content = `---
title: "File 4"
---

Content 4`;

      mockedFs.readFile
        .mockResolvedValueOnce(file1Content)
        .mockResolvedValueOnce(file2Content)
        .mockResolvedValueOnce(file4Content);

      const result = await parser.parseDirectory('/test/dir');

      expect(mockedFs.readdir).toHaveBeenCalledWith('/test/dir');
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);
      expect(result.has('/test/dir/file1.md')).toBe(true);
      expect(result.has('/test/dir/file2.mdx')).toBe(true);
      expect(result.has('/test/dir/file4.md')).toBe(true);
      expect(result.has('/test/dir/file3.txt')).toBe(false);

      const file1 = result.get('/test/dir/file1.md');
      expect(file1?.frontMatter.title).toBe('File 1');
    });

    it('should handle errors when parsing directory', async () => {
      mockedFs.readdir.mockRejectedValue(new Error('Directory not found'));

      await expect(parser.parseDirectory('/nonexistent')).rejects.toThrow(MarkdownParseError);
    });
  });
});