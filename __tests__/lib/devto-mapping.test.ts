import { DevToMapping, ArticleMapping, MappingData } from '../../lib/devto-mapping';
import path from 'path';

// Mock fs/promises module
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

// Mock dynamic import of crypto
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mockhash123'),
  })),
}));

// Import after mocking
import fs from 'fs/promises';
import crypto from 'crypto';

describe('DevToMapping', () => {
  let mapping: DevToMapping;
  const mockMappingPath = '/mock/path/.devto-mapping.json';

  beforeEach(() => {
    mapping = new DevToMapping(mockMappingPath);
    jest.clearAllMocks();
    
    // Default mocks
    (fs.readFile as jest.Mock).mockResolvedValue('');
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    
    // Reset crypto mock to default
    const mockCrypto = require('crypto');
    mockCrypto.createHash.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('mockhash123'),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('load', () => {
    it('should load existing mapping file', async () => {
      const mockData: MappingData = {
        version: '1.0.0',
        mappings: [
          {
            filePath: '/test/article1.md',
            articleId: 123,
            title: 'Test Article 1',
            lastSynced: '2024-01-01T00:00:00.000Z',
            checksum: 'hash123',
          },
        ],
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      await mapping.load();

      expect(fs.readFile).toHaveBeenCalledWith(mockMappingPath, 'utf-8');
      expect(mapping.getAllMappings()).toEqual(mockData.mappings);
    });

    it('should use default empty data if file does not exist', async () => {
      const error = new Error('File not found') as any;
      error.code = 'ENOENT';
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await mapping.load();

      expect(mapping.getAllMappings()).toEqual([]);
    });

    it('should throw error for other read errors', async () => {
      const error = new Error('Permission denied');
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await expect(mapping.load()).rejects.toThrow('Failed to load mapping file: Error: Permission denied');
    });
  });

  describe('save', () => {
    it('should save mappings to file', async () => {
      const testMapping: ArticleMapping = {
        filePath: '/test/article.md',
        articleId: 123,
        title: 'Test Article',
        lastSynced: '2024-01-01T00:00:00.000Z',
        checksum: 'hash123',
      };

      await mapping.addMapping(
        testMapping.filePath,
        testMapping.articleId,
        testMapping.title,
        testMapping.checksum
      );

      // Clear the mock to check the save call
      (fs.writeFile as jest.Mock).mockClear();
      await mapping.save();

      expect(fs.writeFile).toHaveBeenCalledWith(
        mockMappingPath,
        expect.stringContaining('"version": "1.0.0"'),
        'utf-8'
      );

      const savedContent = (fs.writeFile as jest.Mock).mock.calls[0][1];
      const savedData = JSON.parse(savedContent);
      expect(savedData.mappings).toHaveLength(1);
      expect(savedData.mappings[0].articleId).toBe(123);
    });

    it('should handle write errors', async () => {
      (fs.writeFile as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(mapping.save()).rejects.toThrow('Failed to save mapping file: Error: Permission denied');
    });
  });

  describe('addMapping', () => {
    it('should add new mapping', async () => {
      const filePath = 'relative/path/article.md';
      const absolutePath = path.resolve(filePath);

      await mapping.addMapping(filePath, 123, 'Test Article', 'hash123');

      const mappings = mapping.getAllMappings();
      expect(mappings).toHaveLength(1);
      expect(mappings[0]).toEqual({
        filePath: absolutePath,
        articleId: 123,
        title: 'Test Article',
        lastSynced: expect.any(String),
        checksum: 'hash123',
      });

      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should update existing mapping', async () => {
      const filePath = 'test/article.md';
      const absolutePath = path.resolve(filePath);

      // Add initial mapping
      await mapping.addMapping(filePath, 123, 'Old Title', 'oldhash');
      
      // Update mapping
      await mapping.addMapping(filePath, 123, 'New Title', 'newhash');

      const mappings = mapping.getAllMappings();
      expect(mappings).toHaveLength(1);
      expect(mappings[0].title).toBe('New Title');
      expect(mappings[0].checksum).toBe('newhash');
    });

    it('should normalize file paths', async () => {
      const filePath1 = './test/article.md';
      const filePath2 = 'test/article.md';

      await mapping.addMapping(filePath1, 123, 'Article 1', 'hash1');
      await mapping.addMapping(filePath2, 456, 'Article 2', 'hash2');

      const mappings = mapping.getAllMappings();
      expect(mappings).toHaveLength(1); // Same file, should update
      expect(mappings[0].articleId).toBe(456);
    });
  });

  describe('getMappingByFile', () => {
    beforeEach(async () => {
      await mapping.addMapping('/test/article1.md', 123, 'Article 1', 'hash1');
      await mapping.addMapping('/test/article2.md', 456, 'Article 2', 'hash2');
    });

    it('should return mapping for existing file', () => {
      const result = mapping.getMappingByFile('/test/article1.md');
      expect(result).not.toBeNull();
      expect(result?.articleId).toBe(123);
    });

    it('should return null for non-existent file', () => {
      const result = mapping.getMappingByFile('/test/nonexistent.md');
      expect(result).toBeNull();
    });

    it('should normalize path before lookup', () => {
      // Use absolute paths that resolve to the same location
      const absolutePath = path.resolve('/test/article1.md');
      const result = mapping.getMappingByFile(absolutePath);
      expect(result).not.toBeNull();
      expect(result?.articleId).toBe(123);
    });
  });

  describe('getMappingByArticleId', () => {
    beforeEach(async () => {
      await mapping.addMapping('/test/article1.md', 123, 'Article 1', 'hash1');
      await mapping.addMapping('/test/article2.md', 456, 'Article 2', 'hash2');
    });

    it('should return mapping for existing article ID', () => {
      const result = mapping.getMappingByArticleId(456);
      expect(result).not.toBeNull();
      expect(result?.filePath).toBe(path.resolve('/test/article2.md'));
    });

    it('should return null for non-existent article ID', () => {
      const result = mapping.getMappingByArticleId(999);
      expect(result).toBeNull();
    });
  });

  describe('removeMapping', () => {
    beforeEach(async () => {
      await mapping.addMapping('/test/article1.md', 123, 'Article 1', 'hash1');
      await mapping.addMapping('/test/article2.md', 456, 'Article 2', 'hash2');
    });

    it('should remove existing mapping', async () => {
      const removed = await mapping.removeMapping('/test/article1.md');
      expect(removed).toBe(true);
      
      const mappings = mapping.getAllMappings();
      expect(mappings).toHaveLength(1);
      expect(mappings[0].articleId).toBe(456);
      
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should return false when removing non-existent mapping', async () => {
      const removed = await mapping.removeMapping('/test/nonexistent.md');
      expect(removed).toBe(false);
      
      const mappings = mapping.getAllMappings();
      expect(mappings).toHaveLength(2);
    });

    it('should normalize path before removal', async () => {
      // Use absolute paths that resolve to the same location
      const absolutePath = path.resolve('/test/article1.md');
      const removed = await mapping.removeMapping(absolutePath);
      expect(removed).toBe(true);
      
      const mappings = mapping.getAllMappings();
      expect(mappings).toHaveLength(1);
    });
  });

  describe('getAllMappings', () => {
    it('should return copy of all mappings', async () => {
      await mapping.addMapping('/test/article1.md', 123, 'Article 1', 'hash1');
      await mapping.addMapping('/test/article2.md', 456, 'Article 2', 'hash2');

      const mappings = mapping.getAllMappings();
      expect(mappings).toHaveLength(2);
      
      // Verify it's a copy of the array, not the objects themselves
      // The implementation returns a shallow copy, which is acceptable
      const originalLength = mappings.length;
      mappings.push({
        filePath: '/test/new.md',
        articleId: 999,
        title: 'New',
        lastSynced: '2024-01-01T00:00:00.000Z'
      });
      
      const mappings2 = mapping.getAllMappings();
      expect(mappings2).toHaveLength(originalLength);
    });

    it('should return empty array when no mappings', () => {
      const mappings = mapping.getAllMappings();
      expect(mappings).toEqual([]);
    });
  });

  describe('clearMappings', () => {
    it('should remove all mappings', async () => {
      await mapping.addMapping('/test/article1.md', 123, 'Article 1', 'hash1');
      await mapping.addMapping('/test/article2.md', 456, 'Article 2', 'hash2');

      await mapping.clearMappings();

      const mappings = mapping.getAllMappings();
      expect(mappings).toEqual([]);
      expect(fs.writeFile).toHaveBeenCalled();
    });
  });

  describe('calculateChecksum', () => {
    it('should calculate MD5 checksum of content', async () => {
      const content = 'Test content for hashing';
      const mockCrypto = require('crypto');
      
      const hash = await DevToMapping.calculateChecksum(content);
      
      expect(mockCrypto.createHash).toHaveBeenCalledWith('md5');
      expect(hash).toBe('mockhash123');
    });
  });

  describe('hasFileChanged', () => {
    beforeEach(async () => {
      await mapping.addMapping('/test/article.md', 123, 'Article', 'oldhash');
    });

    it('should detect changed content', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('New content');
      const mockCrypto = require('crypto');
      mockCrypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('newhash'),
      });

      const changed = await mapping.hasFileChanged('/test/article.md');
      expect(changed).toBe(true);
    });

    it('should detect unchanged content', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue('Same content');
      
      // Set crypto mock to return the same hash as stored
      const mockCrypto = require('crypto');
      mockCrypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('oldhash'),
      });

      const changed = await mapping.hasFileChanged('/test/article.md');
      expect(changed).toBe(false);
    });

    it('should return true for unmapped files', async () => {
      const changed = await mapping.hasFileChanged('/test/unmapped.md');
      expect(changed).toBe(true);
    });

    it('should return true when file has no checksum', async () => {
      await mapping.addMapping('/test/no-checksum.md', 789, 'No Checksum');
      
      const changed = await mapping.hasFileChanged('/test/no-checksum.md');
      expect(changed).toBe(true);
    });

    it('should return true when file read fails', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      const changed = await mapping.hasFileChanged('/test/article.md');
      expect(changed).toBe(true);
    });
  });

  describe('getMappingsNeedingSync', () => {
    beforeEach(async () => {
      await mapping.addMapping('/test/changed.md', 123, 'Changed', 'oldhash');
      await mapping.addMapping('/test/unchanged.md', 456, 'Unchanged', 'samehash');
      await mapping.addMapping('/test/no-checksum.md', 789, 'No Checksum');
    });

    it('should return mappings with changed files', async () => {
      // Use absolute paths that will be stored in mappings
      const changedPath = path.resolve('/test/changed.md');
      const unchangedPath = path.resolve('/test/unchanged.md');
      const noChecksumPath = path.resolve('/test/no-checksum.md');
      
      // Clear existing mappings and add with absolute paths
      await mapping.clearMappings();
      await mapping.addMapping(changedPath, 123, 'Changed', 'oldhash');
      await mapping.addMapping(unchangedPath, 456, 'Unchanged', 'samehash');
      await mapping.addMapping(noChecksumPath, 789, 'No Checksum');
      
      // Set up file read mocks
      (fs.readFile as jest.Mock).mockImplementation((filePath) => {
        if (filePath === changedPath) return Promise.resolve('New content');
        if (filePath === unchangedPath) return Promise.resolve('Same content');
        return Promise.resolve('Any content');
      });
      
      // Set up crypto mocks to return different hashes based on content
      const mockCrypto = require('crypto');
      mockCrypto.createHash.mockImplementation(() => {
        const updateMock = jest.fn();
        return {
          update: updateMock.mockReturnThis(),
          digest: jest.fn().mockImplementation(() => {
            const content = updateMock.mock.calls[0]?.[0];
            if (content === 'New content') return 'newhash';
            if (content === 'Same content') return 'samehash';
            return 'anyhash';
          }),
        };
      });

      const needSync = await mapping.getMappingsNeedingSync();
      
      expect(needSync).toHaveLength(2);
      expect(needSync.map(m => m.articleId)).toContain(123);
      expect(needSync.map(m => m.articleId)).toContain(789);
      expect(needSync.map(m => m.articleId)).not.toContain(456);
    });
  });

  describe('exportToCSV', () => {
    it('should export mappings to CSV format', async () => {
      await mapping.addMapping('/test/article1.md', 123, 'Article 1', 'hash1');
      await mapping.addMapping('/test/article2.md', 456, 'Article "with quotes"', 'hash2');

      const outputPath = '/test/output.csv';
      await mapping.exportToCSV(outputPath);

      expect(fs.writeFile).toHaveBeenCalledWith(
        outputPath,
        expect.stringContaining('File Path,Article ID,Title,Last Synced'),
        'utf-8'
      );

      const csvContent = (fs.writeFile as jest.Mock).mock.calls.find(
        call => call[0] === outputPath
      )[1];

      expect(csvContent).toContain(path.resolve('/test/article1.md'));
      expect(csvContent).toContain('123');
      expect(csvContent).toContain('"Article 1"');
      expect(csvContent).toContain('"Article ""with quotes"""');
    });

    it('should handle empty mappings', async () => {
      const outputPath = '/test/empty.csv';
      await mapping.exportToCSV(outputPath);

      const csvContent = (fs.writeFile as jest.Mock).mock.calls.find(
        call => call[0] === outputPath
      )[1];

      expect(csvContent).toBe('File Path,Article ID,Title,Last Synced');
    });
  });
});