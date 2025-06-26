import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import {
  getModule,
  getModulesForPath,
  getLearningPath,
  getAllLearningPaths,
  validateModuleId,
  getModuleNeighbors,
} from '@/lib/modules.server';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  readdir: jest.fn(),
  access: jest.fn(),
}));
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock process.cwd
const mockCwd = jest.fn();
Object.defineProperty(process, 'cwd', {
  value: mockCwd,
});

// Mock console to suppress error logs in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Test data
const mockModuleData = {
  id: 'test-module',
  title: 'Test Module',
  description: 'A test module',
  duration: '30 min',
  difficulty: 'beginner',
  order: 1,
  sections: [
    {
      id: 'intro',
      title: 'Introduction',
      content: '',
    },
    {
      id: 'practice',
      title: 'Practice',
      content: '',
    },
  ],
};

const mockLearningPathData = {
  id: 'test-path',
  title: 'Test Learning Path',
  description: 'A test learning path',
  modules: [],
};

const mockMDXContent = `# Introduction

This is a test MDX content for the introduction section.

## Key Concepts

- Concept 1
- Concept 2
- Concept 3

\`\`\`javascript
console.log("Hello, World!");
\`\`\`
`;

describe('Data Fetching Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCwd.mockReturnValue('/test/app');
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('getModule', () => {
    test('should successfully load a module with MDX content', async () => {
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(mockModuleData)) // Module JSON
        .mockResolvedValueOnce(mockMDXContent) // Section 1 MDX
        .mockResolvedValueOnce(mockMDXContent); // Section 2 MDX

      const result = await getModule('test-path', 'test-module');

      expect(result).toEqual({
        ...mockModuleData,
        sections: [
          {
            ...mockModuleData.sections[0],
            content: mockMDXContent,
          },
          {
            ...mockModuleData.sections[1],
            content: mockMDXContent,
          },
        ],
      });

      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join('/test/app', 'content', 'learn', 'paths', 'test-path', 'modules', 'test-module.json'),
        'utf-8'
      );
    });

    test('should handle missing module file', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await getModule('nonexistent-path', 'nonexistent-module');

      expect(result).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to load module nonexistent-module from path nonexistent-path:',
        expect.any(Error)
      );
    });

    test('should handle invalid JSON in module file', async () => {
      mockFs.readFile.mockResolvedValueOnce('invalid json');

      const result = await getModule('test-path', 'invalid-module');

      expect(result).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to load module invalid-module from path test-path:',
        expect.any(Error)
      );
    });

    test('should handle missing MDX files gracefully', async () => {
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(mockModuleData)) // Module JSON
        .mockRejectedValueOnce(new Error('MDX file not found')) // Section 1 MDX
        .mockResolvedValueOnce(mockMDXContent); // Section 2 MDX

      const result = await getModule('test-path', 'test-module');

      expect(result).toEqual({
        ...mockModuleData,
        sections: [
          {
            ...mockModuleData.sections[0],
            content: '', // Empty content for missing MDX
          },
          {
            ...mockModuleData.sections[1],
            content: mockMDXContent,
          },
        ],
      });

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to load MDX content for section intro:',
        expect.any(Error)
      );
    });

    test('should cache module results', async () => {
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(mockModuleData))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent);

      // First call
      const result1 = await getModule('test-path', 'test-module');
      
      // Second call - should use cache
      const result2 = await getModule('test-path', 'test-module');

      expect(result1).toEqual(result2);
      // File system should only be accessed once due to caching
      expect(mockFs.readFile).toHaveBeenCalledTimes(3); // 1 JSON + 2 MDX files
    });
  });

  describe('getModulesForPath', () => {
    test('should load all modules for a learning path', async () => {
      const mockFiles = ['module-1.json', 'module-2.json', 'section-1.mdx', 'section-2.mdx'];
      
      mockFs.readdir.mockResolvedValue(mockFiles as any);
      
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify({ ...mockModuleData, id: 'module-1', order: 1 }))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(JSON.stringify({ ...mockModuleData, id: 'module-2', order: 2 }))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent);

      const result = await getModulesForPath('test-path');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('module-1');
      expect(result[1].id).toBe('module-2');
      expect(result[0].order).toBe(1);
      expect(result[1].order).toBe(2);
    });

    test('should filter out non-JSON files and section files', async () => {
      const mockFiles = [
        'module-1.json',
        'module-1-intro.json', // Should be filtered out
        'module-1-intro.mdx',  // Should be filtered out
        'readme.txt',          // Should be filtered out
        'module-2.json',
      ];
      
      mockFs.readdir.mockResolvedValue(mockFiles as any);
      
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify({ ...mockModuleData, id: 'module-1', order: 1 }))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(JSON.stringify({ ...mockModuleData, id: 'module-2', order: 2 }))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent);

      const result = await getModulesForPath('test-path');

      expect(result).toHaveLength(2);
      expect(mockFs.readFile).toHaveBeenCalledTimes(6); // 2 modules × (1 JSON + 2 MDX)
    });

    test('should sort modules by order', async () => {
      const mockFiles = ['module-b.json', 'module-a.json', 'module-c.json'];
      
      mockFs.readdir.mockResolvedValue(mockFiles as any);
      
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify({ ...mockModuleData, id: 'module-b', order: 3 }))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(JSON.stringify({ ...mockModuleData, id: 'module-a', order: 1 }))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(JSON.stringify({ ...mockModuleData, id: 'module-c', order: 2 }))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent);

      const result = await getModulesForPath('test-path');

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('module-a');
      expect(result[1].id).toBe('module-c');
      expect(result[2].id).toBe('module-b');
    });

    test('should handle directory read errors', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Directory not found'));

      const result = await getModulesForPath('nonexistent-path');

      expect(result).toEqual([]);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to load modules for path nonexistent-path:',
        expect.any(Error)
      );
    });

    test('should filter out null modules from failed loads', async () => {
      const mockFiles = ['valid-module.json', 'invalid-module.json'];
      
      mockFs.readdir.mockResolvedValue(mockFiles as any);
      
      // First module loads successfully
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify({ ...mockModuleData, id: 'valid-module', order: 1 }))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent)
        // Second module fails to load
        .mockRejectedValueOnce(new Error('Invalid JSON'));

      const result = await getModulesForPath('test-path');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('valid-module');
    });
  });

  describe('getLearningPath', () => {
    test('should successfully load learning path metadata', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockLearningPathData));

      const result = await getLearningPath('test-path');

      expect(result).toEqual(mockLearningPathData);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join('/test/app', 'content', 'learn', 'paths', 'test-path', 'metadata.json'),
        'utf-8'
      );
    });

    test('should handle missing metadata file', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await getLearningPath('nonexistent-path');

      expect(result).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to load learning path nonexistent-path:',
        expect.any(Error)
      );
    });

    test('should handle invalid JSON in metadata file', async () => {
      mockFs.readFile.mockResolvedValue('invalid json');

      const result = await getLearningPath('test-path');

      expect(result).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to load learning path test-path:',
        expect.any(Error)
      );
    });
  });

  describe('getAllLearningPaths', () => {
    test('should load all learning paths from directories', async () => {
      const mockDirs = ['path-1', 'path-2', 'file.txt'];
      
      mockFs.readdir.mockResolvedValue(mockDirs as any);
      
      // Mock stat calls
      mockFs.stat
        .mockResolvedValueOnce({ isDirectory: () => true } as any) // path-1
        .mockResolvedValueOnce({ isDirectory: () => true } as any) // path-2
        .mockResolvedValueOnce({ isDirectory: () => false } as any); // file.txt
      
      // Mock metadata reads
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify({ ...mockLearningPathData, id: 'path-1' }))
        .mockResolvedValueOnce(JSON.stringify({ ...mockLearningPathData, id: 'path-2' }));

      const result = await getAllLearningPaths();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('path-1');
      expect(result[1].id).toBe('path-2');
    });

    test('should filter out files and handle errors', async () => {
      const mockDirs = ['valid-path', 'invalid-path'];
      
      mockFs.readdir.mockResolvedValue(mockDirs as any);
      
      mockFs.stat
        .mockResolvedValueOnce({ isDirectory: () => true } as any)
        .mockResolvedValueOnce({ isDirectory: () => true } as any);
      
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify({ ...mockLearningPathData, id: 'valid-path' }))
        .mockRejectedValueOnce(new Error('Metadata not found'));

      const result = await getAllLearningPaths();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('valid-path');
    });

    test('should handle directory read errors', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Cannot read directory'));

      const result = await getAllLearningPaths();

      expect(result).toEqual([]);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to load learning paths:',
        expect.any(Error)
      );
    });
  });

  describe('validateModuleId', () => {
    test('should return true for valid module IDs', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockModuleData));

      const result = await validateModuleId('test-path', 'test-module');

      expect(result).toBe(true);
    });

    test('should return false for invalid module IDs', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await validateModuleId('test-path', 'invalid-module');

      expect(result).toBe(false);
    });

    test('should return false for modules that return null', async () => {
      mockFs.readFile.mockResolvedValue('invalid json');

      const result = await validateModuleId('test-path', 'invalid-module');

      expect(result).toBe(false);
    });
  });

  describe('getModuleNeighbors', () => {
    test('should return correct neighbors for middle module', async () => {
      const modules = [
        { ...mockModuleData, id: 'module-1', order: 1 },
        { ...mockModuleData, id: 'module-2', order: 2 },
        { ...mockModuleData, id: 'module-3', order: 3 },
      ];

      const mockFiles = ['module-1.json', 'module-2.json', 'module-3.json'];
      
      mockFs.readdir.mockResolvedValue(mockFiles as any);
      
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(modules[0]))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(JSON.stringify(modules[1]))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(JSON.stringify(modules[2]))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent);

      const result = await getModuleNeighbors('test-path', 'module-2');

      expect(result.previous).toEqual(modules[0]);
      expect(result.next).toEqual(modules[2]);
    });

    test('should return null previous for first module', async () => {
      const modules = [
        { ...mockModuleData, id: 'module-1', order: 1 },
        { ...mockModuleData, id: 'module-2', order: 2 },
      ];

      const mockFiles = ['module-1.json', 'module-2.json'];
      
      mockFs.readdir.mockResolvedValue(mockFiles as any);
      
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(modules[0]))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(JSON.stringify(modules[1]))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent);

      const result = await getModuleNeighbors('test-path', 'module-1');

      expect(result.previous).toBeNull();
      expect(result.next).toEqual(modules[1]);
    });

    test('should return null next for last module', async () => {
      const modules = [
        { ...mockModuleData, id: 'module-1', order: 1 },
        { ...mockModuleData, id: 'module-2', order: 2 },
      ];

      const mockFiles = ['module-1.json', 'module-2.json'];
      
      mockFs.readdir.mockResolvedValue(mockFiles as any);
      
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(modules[0]))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(JSON.stringify(modules[1]))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent);

      const result = await getModuleNeighbors('test-path', 'module-2');

      expect(result.previous).toEqual(modules[0]);
      expect(result.next).toBeNull();
    });

    test('should return null for both when module not found', async () => {
      const modules = [
        { ...mockModuleData, id: 'module-1', order: 1 },
        { ...mockModuleData, id: 'module-2', order: 2 },
      ];

      const mockFiles = ['module-1.json', 'module-2.json'];
      
      mockFs.readdir.mockResolvedValue(mockFiles as any);
      
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(modules[0]))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(JSON.stringify(modules[1]))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent);

      const result = await getModuleNeighbors('test-path', 'nonexistent-module');

      expect(result.previous).toBeNull();
      expect(result.next).toBeNull();
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large numbers of modules efficiently', async () => {
      const moduleCount = 100;
      const mockFiles = Array.from({ length: moduleCount }, (_, i) => `module-${i}.json`);
      
      mockFs.readdir.mockResolvedValue(mockFiles as any);
      
      // Mock file reads for all modules
      for (let i = 0; i < moduleCount; i++) {
        mockFs.readFile
          .mockResolvedValueOnce(JSON.stringify({ ...mockModuleData, id: `module-${i}`, order: i }))
          .mockResolvedValueOnce(mockMDXContent)
          .mockResolvedValueOnce(mockMDXContent);
      }

      const startTime = Date.now();
      const result = await getModulesForPath('large-path');
      const endTime = Date.now();

      expect(result).toHaveLength(moduleCount);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle concurrent access properly', async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockModuleData));

      const promises = Array.from({ length: 10 }, () => 
        getModule('test-path', 'concurrent-module')
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toEqual(expect.objectContaining({
          id: 'test-module',
          title: 'Test Module',
        }));
      });
    });

    test('should handle empty directories gracefully', async () => {
      mockFs.readdir.mockResolvedValue([] as any);

      const result = await getModulesForPath('empty-path');

      expect(result).toEqual([]);
    });

    test('should handle mixed content types in directory', async () => {
      const mockFiles = [
        'module-1.json',
        '.DS_Store',
        'module-2.json',
        'thumbs.db',
        'module-1-intro.mdx',
        'README.md',
      ];
      
      mockFs.readdir.mockResolvedValue(mockFiles as any);
      
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify({ ...mockModuleData, id: 'module-1', order: 1 }))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(JSON.stringify({ ...mockModuleData, id: 'module-2', order: 2 }))
        .mockResolvedValueOnce(mockMDXContent)
        .mockResolvedValueOnce(mockMDXContent);

      const result = await getModulesForPath('mixed-path');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('module-1');
      expect(result[1].id).toBe('module-2');
    });
  });
});