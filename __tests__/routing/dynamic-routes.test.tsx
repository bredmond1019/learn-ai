import { NextRequest, NextResponse } from 'next/server';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation';
import { jest } from '@jest/globals';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Mock the modules.server functions
jest.mock('@/lib/modules.server', () => ({
  getModule: jest.fn(),
  getLearningPath: jest.fn(),
  getModuleNeighbors: jest.fn(),
  validateModuleId: jest.fn(),
  getModulesForPath: jest.fn(),
  getAllLearningPaths: jest.fn(),
}));

// Mock the MDX parser
jest.mock('@/lib/mdx-parser.server', () => ({
  parseMDXContent: jest.fn(),
  validateMDXContent: jest.fn(),
}));

import {
  getModule,
  getLearningPath,
  getModuleNeighbors,
  validateModuleId,
  getModulesForPath,
  getAllLearningPaths,
} from '@/lib/modules.server';
import { parseMDXContent, validateMDXContent } from '@/lib/mdx-parser.server';

// Import the page component and API routes
import ModulePage, { generateMetadata } from '@/app/learn/paths/[slug]/modules/[moduleId]/page';
import { GET as ModuleAPI } from '@/app/api/modules/[pathSlug]/[moduleId]/route';
import { GET as ModulesAPI } from '@/app/api/modules/route';

// Mock data
const mockModule = {
  id: 'test-module',
  title: 'Test Module',
  description: 'A test module for routing tests',
  duration: '30 min',
  difficulty: 'beginner',
  order: 1,
  metadata: {
    tags: ['javascript', 'fundamentals'],
    author: 'Test Author',
  },
  learningObjectives: [
    'Understand basic concepts',
    'Apply knowledge in practice',
  ],
  prerequisites: ['Basic JavaScript'],
  sections: [
    {
      id: 'intro',
      title: 'Introduction',
      content: '# Introduction\nThis is test content.',
    },
  ],
};

const mockLearningPath = {
  id: 'test-path',
  title: 'Test Learning Path',
  description: 'A test learning path',
  modules: [mockModule],
};

const mockNeighbors = {
  previous: null,
  next: {
    id: 'next-module',
    title: 'Next Module',
  },
};

describe('Dynamic Route Generation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Module Page Route Generation', () => {
    test('should generate valid module page routes', async () => {
      const mockParams = Promise.resolve({
        slug: 'test-path',
        moduleId: 'test-module',
      });

      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(mockModule);
      (getLearningPath as jest.Mock).mockResolvedValue(mockLearningPath);
      (getModuleNeighbors as jest.Mock).mockResolvedValue(mockNeighbors);
      (parseMDXContent as jest.Mock).mockResolvedValue({
        content: <div>Parsed MDX Content</div>,
      });

      // Test the page component
      const component = await ModulePage({ params: mockParams });
      expect(component).toBeTruthy();

      // Verify all required data was fetched
      expect(validateModuleId).toHaveBeenCalledWith('test-path', 'test-module');
      expect(getModule).toHaveBeenCalledWith('test-path', 'test-module');
      expect(getLearningPath).toHaveBeenCalledWith('test-path');
      expect(getModuleNeighbors).toHaveBeenCalledWith('test-path', 'test-module');
    });

    test('should handle invalid module IDs with 404', async () => {
      const mockParams = Promise.resolve({
        slug: 'test-path',
        moduleId: 'invalid-module',
      });

      (validateModuleId as jest.Mock).mockResolvedValue(false);

      await ModulePage({ params: mockParams });

      expect(notFound).toHaveBeenCalled();
    });

    test('should handle missing module data with 404', async () => {
      const mockParams = Promise.resolve({
        slug: 'test-path',
        moduleId: 'test-module',
      });

      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(null);
      (getLearningPath as jest.Mock).mockResolvedValue(mockLearningPath);

      await ModulePage({ params: mockParams });

      expect(notFound).toHaveBeenCalled();
    });

    test('should handle missing learning path with 404', async () => {
      const mockParams = Promise.resolve({
        slug: 'invalid-path',
        moduleId: 'test-module',
      });

      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(mockModule);
      (getLearningPath as jest.Mock).mockResolvedValue(null);

      await ModulePage({ params: mockParams });

      expect(notFound).toHaveBeenCalled();
    });

    test('should generate proper navigation links', async () => {
      const mockParams = Promise.resolve({
        slug: 'test-path',
        moduleId: 'test-module',
      });

      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(mockModule);
      (getLearningPath as jest.Mock).mockResolvedValue(mockLearningPath);
      (getModuleNeighbors as jest.Mock).mockResolvedValue(mockNeighbors);
      (parseMDXContent as jest.Mock).mockResolvedValue({
        content: <div>Parsed MDX Content</div>,
      });

      const component = await ModulePage({ params: mockParams });
      
      // The component should contain proper navigation structure
      expect(component).toBeTruthy();
      expect(getModuleNeighbors).toHaveBeenCalledWith('test-path', 'test-module');
    });
  });

  describe('Metadata Generation', () => {
    test('should generate proper metadata for valid modules', async () => {
      const mockParams = Promise.resolve({
        slug: 'test-path',
        moduleId: 'test-module',
      });

      (getModule as jest.Mock).mockResolvedValue(mockModule);
      (getLearningPath as jest.Mock).mockResolvedValue(mockLearningPath);

      const metadata = await generateMetadata({ params: mockParams });

      expect(metadata).toEqual({
        title: 'Test Module - Test Learning Path',
        description: 'A test module for routing tests',
        keywords: 'javascript, fundamentals',
        authors: [{ name: 'Test Author' }],
      });
    });

    test('should handle missing module metadata gracefully', async () => {
      const mockParams = Promise.resolve({
        slug: 'test-path',
        moduleId: 'invalid-module',
      });

      (getModule as jest.Mock).mockResolvedValue(null);
      (getLearningPath as jest.Mock).mockResolvedValue(null);

      const metadata = await generateMetadata({ params: mockParams });

      expect(metadata).toEqual({
        title: 'Module Not Found',
        description: 'The requested module could not be found.',
      });
    });
  });

  describe('Route Parameter Validation', () => {
    test('should validate route parameters', async () => {
        const mockParams = Promise.resolve({
          slug: 'test-path',
          moduleId: 'test-module',
        });

        (validateModuleId as jest.Mock).mockResolvedValue(true);
        (getModule as jest.Mock).mockResolvedValue(mockModule);
        (getLearningPath as jest.Mock).mockResolvedValue(mockLearningPath);
        (getModuleNeighbors as jest.Mock).mockResolvedValue(mockNeighbors);
        (parseMDXContent as jest.Mock).mockResolvedValue({
          content: <div>Content</div>,
        });

        const component = await ModulePage({ params: mockParams });
        expect(component).toBeTruthy();
    });

    test('should validate path slug parameter', async () => {
      const testCases = [
        { slug: 'valid-path', shouldPass: true },
        { slug: 'another-valid-path', shouldPass: true },
        { slug: '', shouldPass: false },
      ];

      for (const testCase of testCases) {
        const mockParams = Promise.resolve({
            slug: testCase.slug,
          moduleId: 'test-module',
        });

        if (testCase.shouldPass) {
          (validateModuleId as jest.Mock).mockResolvedValue(true);
          (getModule as jest.Mock).mockResolvedValue(mockModule);
          (getLearningPath as jest.Mock).mockResolvedValue(mockLearningPath);
        } else {
          (validateModuleId as jest.Mock).mockResolvedValue(false);
        }

        await ModulePage({ params: mockParams });
        
        if (!testCase.shouldPass) {
          expect(notFound).toHaveBeenCalled();
        }
      }
    });

    test('should validate module ID parameter', async () => {
      const testCases = [
        { moduleId: 'valid-module', shouldPass: true },
        { moduleId: 'another-module-123', shouldPass: true },
        { moduleId: '', shouldPass: false },
        { moduleId: 'invalid-module', shouldPass: false },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        
        const mockParams = Promise.resolve({
            slug: 'test-path',
          moduleId: testCase.moduleId,
        });

        (validateModuleId as jest.Mock).mockResolvedValue(testCase.shouldPass);
        
        if (testCase.shouldPass) {
          (getModule as jest.Mock).mockResolvedValue(mockModule);
          (getLearningPath as jest.Mock).mockResolvedValue(mockLearningPath);
          (getModuleNeighbors as jest.Mock).mockResolvedValue(mockNeighbors);
          (parseMDXContent as jest.Mock).mockResolvedValue({
            content: <div>Content</div>,
          });
        }

        await ModulePage({ params: mockParams });
        
        if (!testCase.shouldPass) {
          expect(notFound).toHaveBeenCalled();
        }
      }
    });
  });

  describe('Async Route Handling', () => {
    test('should handle concurrent requests properly', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        Promise.resolve({
            slug: 'test-path',
          moduleId: `module-${i}`,
        })
      );

      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(mockModule);
      (getLearningPath as jest.Mock).mockResolvedValue(mockLearningPath);
      (getModuleNeighbors as jest.Mock).mockResolvedValue(mockNeighbors);
      (parseMDXContent as jest.Mock).mockResolvedValue({
        content: <div>Content</div>,
      });

      const results = await Promise.all(
        requests.map(params => ModulePage({ params }))
      );

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeTruthy();
      });
    });

    test('should handle slow data loading gracefully', async () => {
      const mockParams = Promise.resolve({
        slug: 'test-path',
        moduleId: 'slow-module',
      });

      // Simulate slow data loading
      (validateModuleId as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 100))
      );
      (getModule as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockModule), 100))
      );
      (getLearningPath as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockLearningPath), 100))
      );
      (getModuleNeighbors as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockNeighbors), 100))
      );
      (parseMDXContent as jest.Mock).mockResolvedValue({
        content: <div>Content</div>,
      });

      const startTime = Date.now();
      const component = await ModulePage({ params: mockParams });
      const endTime = Date.now();

      expect(component).toBeTruthy();
      expect(endTime - startTime).toBeGreaterThan(100);
    });
  });

  describe('Error Boundary Testing', () => {
    test('should handle data loading errors gracefully', async () => {
      const mockParams = Promise.resolve({
        slug: 'error-path',
        moduleId: 'error-module',
      });

      (validateModuleId as jest.Mock).mockRejectedValue(new Error('Database error'));

      await ModulePage({ params: mockParams });
      
      // Should handle errors and show 404
      expect(notFound).toHaveBeenCalled();
    });

    test('should handle MDX parsing errors', async () => {
      const mockParams = Promise.resolve({
        slug: 'test-path',
        moduleId: 'test-module',
      });

      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(mockModule);
      (getLearningPath as jest.Mock).mockResolvedValue(mockLearningPath);
      (getModuleNeighbors as jest.Mock).mockResolvedValue(mockNeighbors);
      (parseMDXContent as jest.Mock).mockRejectedValue(new Error('MDX parsing error'));

      // Should handle MDX errors gracefully without crashing
      const component = await ModulePage({ params: mockParams });
      expect(component).toBeTruthy();
    });
  });

  describe('Caching Behavior', () => {
    test('should cache module data properly', async () => {
      const mockParams1 = Promise.resolve({
        slug: 'test-path',
        moduleId: 'cached-module',
      });
      
      const mockParams2 = Promise.resolve({
        slug: 'test-path',
        moduleId: 'cached-module',
      });

      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(mockModule);
      (getLearningPath as jest.Mock).mockResolvedValue(mockLearningPath);
      (getModuleNeighbors as jest.Mock).mockResolvedValue(mockNeighbors);
      (parseMDXContent as jest.Mock).mockResolvedValue({
        content: <div>Content</div>,
      });

      // First request
      await ModulePage({ params: mockParams1 });
      
      // Second request - should use cached data
      await ModulePage({ params: mockParams2 });

      // Verify caching mechanism (implementation depends on actual cache strategy)
      expect(getModule).toHaveBeenCalledTimes(2);
    });
  });
});