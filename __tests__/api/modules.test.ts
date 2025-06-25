import { NextRequest, NextResponse } from 'next/server';
import { jest } from '@jest/globals';
import { GET as ModulesAPI } from '@/app/api/modules/route';
import { GET as ModuleAPI } from '@/app/api/modules/[pathSlug]/[moduleId]/route';

// Mock the modules.server functions
jest.mock('@/lib/modules.server', () => ({
  getAllLearningPaths: jest.fn(),
  getModulesForPath: jest.fn(),
  getModule: jest.fn(),
  validateModuleId: jest.fn(),
}));

// Mock the MDX parser
jest.mock('@/lib/mdx-parser.server', () => ({
  validateMDXContent: jest.fn(),
}));

import {
  getAllLearningPaths,
  getModulesForPath,
  getModule,
  validateModuleId,
} from '@/lib/modules.server';
import { validateMDXContent } from '@/lib/mdx-parser.server';

// Mock console to suppress error logs in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Test data
const mockModule = {
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
      content: '# Introduction\nTest content',
    },
    {
      id: 'practice',
      title: 'Practice',
      content: '# Practice\nPractice content',
    },
  ],
};

const mockLearningPath = {
  id: 'test-path',
  title: 'Test Learning Path',
  description: 'A test learning path',
  modules: [mockModule],
};

const mockModules = [mockModule];

const mockLearningPaths = [mockLearningPath];

describe('API Endpoints Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('/api/modules', () => {
    test('should return all learning paths with modules when no path specified', async () => {
      (getAllLearningPaths as jest.Mock).mockResolvedValue(mockLearningPaths);
      (getModulesForPath as jest.Mock).mockResolvedValue(mockModules);

      const request = new NextRequest('http://localhost:3000/api/modules');
      const response = await ModulesAPI(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: [
          {
            ...mockLearningPath,
            modules: mockModules,
          },
        ],
        count: 1,
      });

      expect(getAllLearningPaths).toHaveBeenCalledTimes(1);
      expect(getModulesForPath).toHaveBeenCalledWith('test-path');
    });

    test('should return modules for specific path when path parameter provided', async () => {
      (getModulesForPath as jest.Mock).mockResolvedValue(mockModules);

      const request = new NextRequest('http://localhost:3000/api/modules?path=test-path');
      const response = await ModulesAPI(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: mockModules,
        count: 1,
      });

      expect(getModulesForPath).toHaveBeenCalledWith('test-path');
      expect(getAllLearningPaths).not.toHaveBeenCalled();
    });

    test('should handle empty results gracefully', async () => {
      (getModulesForPath as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/modules?path=empty-path');
      const response = await ModulesAPI(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: [],
        count: 0,
      });
    });

    test('should handle errors with 500 status', async () => {
      const error = new Error('Database connection failed');
      (getModulesForPath as jest.Mock).mockRejectedValue(error);

      const request = new NextRequest('http://localhost:3000/api/modules?path=error-path');
      const response = await ModulesAPI(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Failed to fetch modules',
        message: 'Database connection failed',
      });

      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching modules:', error);
    });

    test('should handle unknown errors', async () => {
      (getModulesForPath as jest.Mock).mockRejectedValue('Unknown error');

      const request = new NextRequest('http://localhost:3000/api/modules?path=error-path');
      const response = await ModulesAPI(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Failed to fetch modules',
        message: 'Unknown error',
      });
    });

    test('should handle invalid query parameters', async () => {
      (getModulesForPath as jest.Mock).mockResolvedValue([]);

      // Test with special characters in path
      const request = new NextRequest('http://localhost:3000/api/modules?path=test%20path%20with%20spaces');
      const response = await ModulesAPI(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(getModulesForPath).toHaveBeenCalledWith('test path with spaces');
    });

    test('should handle multiple query parameters', async () => {
      (getModulesForPath as jest.Mock).mockResolvedValue(mockModules);

      const request = new NextRequest('http://localhost:3000/api/modules?path=test-path&extra=ignored');
      const response = await ModulesAPI(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockModules);
    });
  });

  describe('/api/modules/[pathSlug]/[moduleId]', () => {
    const createMockParams = (pathSlug: string, moduleId: string) => ({
      params: Promise.resolve({ pathSlug, moduleId }),
    });

    test('should return module with validation when module exists', async () => {
      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(mockModule);
      (validateMDXContent as jest.Mock).mockResolvedValue({
        valid: true,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/modules/test-path/test-module');
      const response = await ModuleAPI(request, createMockParams('test-path', 'test-module'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('test-module');
      expect(data.data.sections).toHaveLength(2);
      expect(data.data.sections[0].contentValid).toBe(true);
      expect(data.data.sections[0].contentError).toBeNull();

      expect(validateModuleId).toHaveBeenCalledWith('test-path', 'test-module');
      expect(getModule).toHaveBeenCalledWith('test-path', 'test-module');
      expect(validateMDXContent).toHaveBeenCalledTimes(2);
    });

    test('should return 404 when module validation fails', async () => {
      (validateModuleId as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/modules/test-path/invalid-module');
      const response = await ModuleAPI(request, createMockParams('test-path', 'invalid-module'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        success: false,
        error: 'Module not found',
        message: 'Module invalid-module not found in path test-path',
      });

      expect(getModule).not.toHaveBeenCalled();
    });

    test('should return 404 when module is null', async () => {
      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/modules/test-path/null-module');
      const response = await ModuleAPI(request, createMockParams('test-path', 'null-module'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        success: false,
        error: 'Module not found',
        message: 'Failed to load module null-module',
      });
    });

    test('should handle MDX validation errors gracefully', async () => {
      const moduleWithBadMDX = {
        ...mockModule,
        sections: [
          {
            id: 'bad-section',
            title: 'Bad Section',
            content: 'invalid mdx content',
          },
        ],
      };

      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(moduleWithBadMDX);
      (validateMDXContent as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Invalid MDX syntax',
      });

      const request = new NextRequest('http://localhost:3000/api/modules/test-path/bad-mdx-module');
      const response = await ModuleAPI(request, createMockParams('test-path', 'bad-mdx-module'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.sections[0].contentValid).toBe(false);
      expect(data.data.sections[0].contentError).toBe('Invalid MDX syntax');
    });

    test('should handle server errors with 500 status', async () => {
      const error = new Error('Server crashed');
      (validateModuleId as jest.Mock).mockRejectedValue(error);

      const request = new NextRequest('http://localhost:3000/api/modules/test-path/error-module');
      const response = await ModuleAPI(request, createMockParams('test-path', 'error-module'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Failed to fetch module',
        message: 'Server crashed',
      });

      expect(mockConsoleError).toHaveBeenCalledWith('Error fetching module:', error);
    });

    test('should handle unknown errors', async () => {
      (validateModuleId as jest.Mock).mockRejectedValue('Unknown error type');

      const request = new NextRequest('http://localhost:3000/api/modules/test-path/unknown-error');
      const response = await ModuleAPI(request, createMockParams('test-path', 'unknown-error'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Unknown error');
    });

    test('should handle special characters in parameters', async () => {
      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(mockModule);
      (validateMDXContent as jest.Mock).mockResolvedValue({
        valid: true,
        error: null,
      });

      const pathSlug = 'test-path-with-dashes';
      const moduleId = 'module_with_underscores';

      const request = new NextRequest(`http://localhost:3000/api/modules/${pathSlug}/${moduleId}`);
      const response = await ModuleAPI(request, createMockParams(pathSlug, moduleId));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(validateModuleId).toHaveBeenCalledWith(pathSlug, moduleId);
      expect(getModule).toHaveBeenCalledWith(pathSlug, moduleId);
    });

    test('should handle empty sections array', async () => {
      const moduleWithoutSections = {
        ...mockModule,
        sections: [],
      };

      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(moduleWithoutSections);

      const request = new NextRequest('http://localhost:3000/api/modules/test-path/empty-module');
      const response = await ModuleAPI(request, createMockParams('test-path', 'empty-module'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.sections).toHaveLength(0);
      expect(validateMDXContent).not.toHaveBeenCalled();
    });

    test('should handle concurrent requests properly', async () => {
      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(mockModule);
      (validateMDXContent as jest.Mock).mockResolvedValue({
        valid: true,
        error: null,
      });

      const requests = Array.from({ length: 5 }, (_, i) => {
        const request = new NextRequest(`http://localhost:3000/api/modules/test-path/module-${i}`);
        return ModuleAPI(request, createMockParams('test-path', `module-${i}`));
      });

      const responses = await Promise.all(requests);

      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(validateModuleId).toHaveBeenCalledTimes(5);
      expect(getModule).toHaveBeenCalledTimes(5);
    });
  });

  describe('API Response Consistency', () => {
    test('should maintain consistent error response format', async () => {
      const testCases = [
        {
          name: 'modules endpoint error',
          endpoint: ModulesAPI,
          request: new NextRequest('http://localhost:3000/api/modules?path=error-path'),
          params: undefined,
          setup: () => (getModulesForPath as jest.Mock).mockRejectedValue(new Error('Test error')),
        },
        {
          name: 'module endpoint error',
          endpoint: ModuleAPI,
          request: new NextRequest('http://localhost:3000/api/modules/test-path/error-module'),
          params: createMockParams('test-path', 'error-module'),
          setup: () => (validateModuleId as jest.Mock).mockRejectedValue(new Error('Test error')),
        },
      ];

      for (const testCase of testCases) {
        testCase.setup();

        const response = testCase.params
          ? await testCase.endpoint(testCase.request, testCase.params)
          : await testCase.endpoint(testCase.request);
        
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toHaveProperty('success', false);
        expect(data).toHaveProperty('error');
        expect(data).toHaveProperty('message');
      }
    });

    test('should maintain consistent success response format', async () => {
      (getModulesForPath as jest.Mock).mockResolvedValue(mockModules);

      const request = new NextRequest('http://localhost:3000/api/modules?path=test-path');
      const response = await ModulesAPI(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('count');
      expect(typeof data.count).toBe('number');
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle large datasets efficiently', async () => {
      const largeModuleArray = Array.from({ length: 100 }, (_, i) => ({
        ...mockModule,
        id: `module-${i}`,
        title: `Module ${i}`,
      }));

      (getModulesForPath as jest.Mock).mockResolvedValue(largeModuleArray);

      const startTime = Date.now();
      const request = new NextRequest('http://localhost:3000/api/modules?path=large-path');
      const response = await ModulesAPI(request);
      const endTime = Date.now();

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.count).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle rapid sequential requests', async () => {
      (validateModuleId as jest.Mock).mockResolvedValue(true);
      (getModule as jest.Mock).mockResolvedValue(mockModule);
      (validateMDXContent as jest.Mock).mockResolvedValue({ valid: true, error: null });

      const requests = Array.from({ length: 20 }, () => {
        const request = new NextRequest('http://localhost:3000/api/modules/test-path/test-module');
        return ModuleAPI(request, createMockParams('test-path', 'test-module'));
      });

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();

      expect(responses).toHaveLength(20);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Security and Validation', () => {
    test('should sanitize path parameters', async () => {
      (validateModuleId as jest.Mock).mockResolvedValue(false);

      const maliciousPath = '../../../etc/passwd';
      const maliciousModule = '<script>alert("xss")</script>';

      const request = new NextRequest(`http://localhost:3000/api/modules/${maliciousPath}/${maliciousModule}`);
      const response = await ModuleAPI(request, createMockParams(maliciousPath, maliciousModule));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(validateModuleId).toHaveBeenCalledWith(maliciousPath, maliciousModule);
      // The API should handle these parameters safely without executing them
    });

    test('should handle very long parameter values', async () => {
      const longPath = 'a'.repeat(1000);
      const longModule = 'b'.repeat(1000);

      (validateModuleId as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest(`http://localhost:3000/api/modules/${longPath}/${longModule}`);
      const response = await ModuleAPI(request, createMockParams(longPath, longModule));

      expect(response.status).toBe(404);
      // Should handle long inputs without crashing
    });

    test('should handle null and undefined parameters gracefully', async () => {
      const testCases = [
        { pathSlug: '', moduleId: 'test-module' },
        { pathSlug: 'test-path', moduleId: '' },
        { pathSlug: '', moduleId: '' },
      ];

      for (const testCase of testCases) {
        (validateModuleId as jest.Mock).mockResolvedValue(false);

        const request = new NextRequest(`http://localhost:3000/api/modules/${testCase.pathSlug}/${testCase.moduleId}`);
        const response = await ModuleAPI(request, createMockParams(testCase.pathSlug, testCase.moduleId));

        expect(response.status).toBe(404);
      }
    });
  });
});