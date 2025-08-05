/**
 * Integration tests for Dev.to publishing functionality
 * Tests the complete flow of publishing articles to Dev.to
 */

import { DevToAPI } from '../../lib/services/devto/devto-api';
import { DevToMarkdownParser } from '../../lib/services/devto/devto-markdown';
import { DevToMapping } from '../../lib/services/devto/devto-mapping';
import fs from 'fs/promises';
import path from 'path';

// Mock environment
process.env.DEV_TO_API_KEY = 'test-api-key';

// Mock fetch globally
global.fetch = jest.fn();

describe('Dev.to Publishing Integration', () => {
  let api: DevToAPI;
  let parser: DevToMarkdownParser;
  let mapping: DevToMapping;
  
  const testMappingPath = path.join(__dirname, 'test-mapping.json');
  const testArticlePath = path.join(__dirname, '../fixtures/valid-article.md');

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Initialize services
    api = new DevToAPI('test-api-key');
    parser = new DevToMarkdownParser();
    mapping = new DevToMapping(testMappingPath);
    
    // Clean up any existing test files
    try {
      await fs.unlink(testMappingPath);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.unlink(testMappingPath);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  describe('Publishing a new article', () => {
    it('should successfully publish a new article and save mapping', async () => {
      // Mock successful API response
      const mockArticleResponse = {
        id: 12345,
        title: 'Building Production-Ready AI Workflows with Rust',
        url: 'https://dev.to/user/article-12345',
        published: true,
        body_markdown: 'Article content...',
        tag_list: ['rust', 'ai'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticleResponse,
      });

      // Parse the markdown file
      const parsed = await parser.parseFile(testArticlePath);
      
      // Validate the article
      const errors = parser.validateForDevTo(parsed);
      expect(errors).toHaveLength(0);
      
      // Convert to Dev.to format
      const articleData = parser.toDevToArticle(parsed);
      
      // Create the article
      const createdArticle = await api.createArticle(articleData);
      expect(createdArticle.id).toBe(12345);
      
      // Save the mapping
      const fileContent = await fs.readFile(testArticlePath, 'utf-8');
      const checksum = await DevToMapping.calculateChecksum(fileContent);
      
      await mapping.load();
      await mapping.addMapping(
        testArticlePath,
        createdArticle.id,
        createdArticle.title,
        checksum
      );
      
      // Verify the mapping was saved
      const savedMapping = mapping.getMappingByFile(testArticlePath);
      expect(savedMapping).toBeTruthy();
      expect(savedMapping?.articleId).toBe(12345);
      expect(savedMapping?.checksum).toBe(checksum);
    });
  });

  describe('Updating an existing article', () => {
    it('should update an article when content changes', async () => {
      // Set up existing mapping
      await mapping.load();
      await mapping.addMapping(
        testArticlePath,
        12345,
        'Existing Article',
        'old-checksum'
      );

      // Mock successful update response
      const mockUpdateResponse = {
        id: 12345,
        title: 'Building Production-Ready AI Workflows with Rust',
        url: 'https://dev.to/user/article-12345',
        published: true,
        body_markdown: 'Updated content...',
        tag_list: ['rust', 'ai'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdateResponse,
      });

      // Check if file has changed
      const hasChanged = await mapping.hasFileChanged(testArticlePath);
      expect(hasChanged).toBe(true);

      // Parse and update
      const parsed = await parser.parseFile(testArticlePath);
      const articleData = parser.toDevToArticle(parsed);
      
      const updatedArticle = await api.updateArticle(12345, articleData);
      expect(updatedArticle.id).toBe(12345);
      
      // Update mapping with new checksum
      const fileContent = await fs.readFile(testArticlePath, 'utf-8');
      const newChecksum = await DevToMapping.calculateChecksum(fileContent);
      
      await mapping.addMapping(
        testArticlePath,
        updatedArticle.id,
        updatedArticle.title,
        newChecksum
      );
      
      // Verify the mapping was updated
      const updatedMapping = mapping.getMappingByFile(testArticlePath);
      expect(updatedMapping?.checksum).toBe(newChecksum);
    });
  });

  describe('Syncing multiple articles', () => {
    it('should identify articles needing sync', async () => {
      // Set up mappings for multiple articles
      await mapping.load();
      
      // Add mapping for our test article
      await mapping.addMapping(
        testArticlePath,
        12345,
        'Article 1',
        'old-checksum-1'
      );
      
      // Add mapping for a non-existent file
      await mapping.addMapping(
        '/non/existent/file.md',
        12346,
        'Article 2',
        'old-checksum-2'
      );

      // Get articles needing sync
      const needingSync = await mapping.getMappingsNeedingSync();
      
      // Our test article should need sync (checksum mismatch)
      // Non-existent file should need sync (file not found)
      expect(needingSync.length).toBeGreaterThanOrEqual(1);
      
      const testArticleMapping = needingSync.find(
        m => m.filePath === path.resolve(testArticlePath)
      );
      expect(testArticleMapping).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          error: 'Title has already been taken',
        }),
      });

      // Try to create article
      const parsed = await parser.parseFile(testArticlePath);
      const articleData = parser.toDevToArticle(parsed);
      
      await expect(api.createArticle(articleData)).rejects.toThrow(
        'Failed to create article: Title has already been taken'
      );
    });

    it('should handle network errors', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network request failed')
      );

      // Try to create article
      const parsed = await parser.parseFile(testArticlePath);
      const articleData = parser.toDevToArticle(parsed);
      
      await expect(api.createArticle(articleData)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('Validation', () => {
    it('should validate markdown files before publishing', async () => {
      // Test with missing title - should throw during parsing
      const missingTitleContent = `---
description: Missing title
tags: test
---

# Content without title in frontmatter`;

      expect(() => parser.parseContent(missingTitleContent)).toThrow(
        'Missing required field: title'
      );

      // Test with too many tags
      const tooManyTagsContent = `---
title: Test Article
tags: too, many, tags, here, excessive
---

# Content`;

      const parsed = parser.parseContent(tooManyTagsContent);
      const errors = parser.validateForDevTo(parsed);
      
      expect(errors).toContain('Maximum 4 tags allowed');
    });
  });
});