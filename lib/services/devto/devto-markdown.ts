/**
 * Dev.to Markdown Parser
 * Parses markdown files and extracts front matter for Dev.to articles
 */

import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';

export interface DevToFrontMatter {
  title: string;
  published?: boolean;
  description?: string;
  tags?: string | string[];
  series?: string;
  canonical_url?: string;
  cover_image?: string;
  [key: string]: any;
}

export interface ParsedMarkdown {
  frontMatter: DevToFrontMatter;
  content: string;
  fullContent: string;
}

export class MarkdownParseError extends Error {
  constructor(message: string, public filePath?: string) {
    super(message);
    this.name = 'MarkdownParseError';
  }
}

export class DevToMarkdownParser {
  /**
   * Parse a markdown file and extract front matter and content
   */
  async parseFile(filePath: string): Promise<ParsedMarkdown> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return this.parseContent(fileContent);
    } catch (error) {
      throw new MarkdownParseError(
        `Failed to read file: ${error}`,
        filePath
      );
    }
  }

  /**
   * Parse markdown content string
   */
  parseContent(content: string): ParsedMarkdown {
    try {
      const parsed = matter(content);
      
      // Validate required fields
      if (!parsed.data.title) {
        throw new MarkdownParseError('Missing required field: title');
      }

      // Normalize tags
      if (parsed.data.tags) {
        if (typeof parsed.data.tags === 'string') {
          parsed.data.tags = parsed.data.tags.split(',').map(tag => tag.trim());
        }
      }

      return {
        frontMatter: parsed.data as DevToFrontMatter,
        content: parsed.content,
        fullContent: content,
      };
    } catch (error) {
      if (error instanceof MarkdownParseError) throw error;
      throw new MarkdownParseError(`Failed to parse markdown: ${error}`);
    }
  }

  /**
   * Convert parsed markdown to Dev.to article format
   */
  toDevToArticle(parsed: ParsedMarkdown) {
    const { frontMatter, content } = parsed;

    return {
      title: frontMatter.title,
      body_markdown: content,
      published: frontMatter.published !== false,
      series: frontMatter.series,
      main_image: frontMatter.cover_image,
      canonical_url: frontMatter.canonical_url,
      description: frontMatter.description,
      tags: Array.isArray(frontMatter.tags) ? frontMatter.tags : undefined,
    };
  }

  /**
   * Update front matter in a markdown file
   */
  async updateFrontMatter(
    filePath: string,
    updates: Partial<DevToFrontMatter>
  ): Promise<void> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsed = matter(fileContent);
      
      // Merge updates
      const updatedData = { ...parsed.data, ...updates };
      
      // Recreate the file content
      const newContent = matter.stringify(parsed.content, updatedData);
      
      await fs.writeFile(filePath, newContent, 'utf-8');
    } catch (error) {
      throw new MarkdownParseError(
        `Failed to update front matter: ${error}`,
        filePath
      );
    }
  }

  /**
   * Parse all markdown files in a directory
   */
  async parseDirectory(dirPath: string): Promise<Map<string, ParsedMarkdown>> {
    const results = new Map<string, ParsedMarkdown>();

    try {
      const files = await fs.readdir(dirPath);
      const markdownFiles = files.filter(file => 
        file.endsWith('.md') || file.endsWith('.mdx')
      );

      for (const file of markdownFiles) {
        const filePath = path.join(dirPath, file);
        const parsed = await this.parseFile(filePath);
        results.set(filePath, parsed);
      }

      return results;
    } catch (error) {
      throw new MarkdownParseError(
        `Failed to parse directory: ${error}`,
        dirPath
      );
    }
  }

  /**
   * Validate if a markdown file is ready for Dev.to
   */
  validateForDevTo(parsed: ParsedMarkdown): string[] {
    const errors: string[] = [];
    const { frontMatter, content } = parsed;

    if (!frontMatter.title) {
      errors.push('Missing title in front matter');
    }

    if (frontMatter.title && frontMatter.title.length > 250) {
      errors.push('Title exceeds 250 characters');
    }

    if (frontMatter.tags && Array.isArray(frontMatter.tags)) {
      if (frontMatter.tags.length > 4) {
        errors.push('Maximum 4 tags allowed');
      }
      frontMatter.tags.forEach(tag => {
        if (tag.length > 30) {
          errors.push(`Tag "${tag}" exceeds 30 characters`);
        }
      });
    }

    if (!content || content.trim().length === 0) {
      errors.push('Article content is empty');
    }

    return errors;
  }
}