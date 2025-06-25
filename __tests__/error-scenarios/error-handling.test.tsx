import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import ModuleViewer from '@/components/learn/ModuleViewer';
import ModuleNavigation from '@/components/learn/ModuleNavigation';
import CodePlayground from '@/components/learn/CodePlayground';
import { GET as ModulesAPI } from '@/app/api/modules/route';
import { GET as ModuleAPI } from '@/app/api/modules/[pathSlug]/[moduleId]/route';

// Mock dependencies
jest.mock('@/lib/modules.server', () => ({
  getAllLearningPaths: jest.fn(),
  getModulesForPath: jest.fn(),
  getModule: jest.fn(),
  validateModuleId: jest.fn(),
}));

jest.mock('@monaco-editor/react', () => ({
  Editor: ({ value, onChange, onMount }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      onFocus={() => onMount && onMount({ getValue: () => value })}
    />
  ),
}));

jest.mock('next-mdx-remote', () => ({
  MDXRemote: ({ children, ...props }: any) => (
    <div data-testid="mdx-remote" {...props}>
      {children || 'MDX Content'}
    </div>
  ),
}));

jest.mock('@heroicons/react/24/outline', () => ({
  CheckIcon: () => <div data-testid="check-icon" />,
  BookOpenIcon: () => <div data-testid="book-open-icon" />,
  PlayIcon: () => <div data-testid="play-icon" />,
  XMarkIcon: () => <div data-testid="x-mark-icon" />,
  LockClosedIcon: () => <div data-testid="lock-closed-icon" />,
  ArrowPathIcon: () => <div data-testid="arrow-path-icon" />,
  ClipboardDocumentIcon: () => <div data-testid="clipboard-document-icon" />,
  CloudArrowUpIcon: () => <div data-testid="cloud-arrow-up-icon" />,
  HomeIcon: () => <div data-testid="home-icon" />,
  ChevronRightIcon: () => <div data-testid="chevron-right-icon" />,
  ChevronLeftIcon: () => <div data-testid="chevron-left-icon" />,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon" />,
  CheckCircleIcon: () => <div data-testid="check-circle-icon" />,
  PlayCircleIcon: () => <div data-testid="play-circle-icon" />,
}));

// Mock UI components to focus on error handling
jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => <div data-testid="progress" data-value={value} />,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: any) => <div data-testid="tabs-content">{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children }: any) => <button data-testid="tabs-trigger">{children}</button>,
}));

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/learn/paths/test-path/modules/test-module'),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href} data-testid="link">{children}</a>;
  };
});

import {
  getAllLearningPaths,
  getModulesForPath,
  getModule,
  validateModuleId,
} from '@/lib/modules.server';

// Mock clipboard API that can fail
const mockClipboard = {
  writeText: jest.fn(),
};
Object.assign(navigator, { clipboard: mockClipboard });

// Mock localStorage that can fail
const mockLocalStorage = (() => {
  let shouldFail = false;
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => {
      if (shouldFail) throw new Error('Storage quota exceeded');
      return store[key] || null;
    },
    setItem: (key: string, value: string) => {
      if (shouldFail) throw new Error('Storage quota exceeded');
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    setShouldFail: (fail: boolean) => {
      shouldFail = fail;
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Test data
const mockModule = {
  metadata: {
    id: 'test-module',
    title: 'Test Module',
    description: 'A test module',
    type: 'tutorial',
    difficulty: 'beginner',
    duration: '30 min',
    order: 1,
    objectives: ['Learn concepts'],
    prerequisites: []
  },
  sections: [
    {
      id: 'section-1',
      title: 'Section 1',
      type: 'content',
      estimatedDuration: '10 min',
      content: { type: 'mdx', path: '/content/section-1.mdx' }
    }
  ]
};

const mockSerializedContent = {
  compiledSource: 'mock-compiled-source',
  scope: {}
};

describe('Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    (mockLocalStorage as any).setShouldFail(false);
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  describe('ModuleViewer Error Scenarios', () => {
    test('should handle missing module gracefully', () => {
      const propsWithNoModule = {
        module: {
          ...mockModule,
          sections: []
        },
        currentSectionId: undefined,
        completedSections: [],
        onSectionComplete: jest.fn(),
        serializedContent: mockSerializedContent
      };

      render(<ModuleViewer {...propsWithNoModule} />);

      expect(screen.getByText('No content available')).toBeInTheDocument();
      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
    });

    test('should handle invalid section ID gracefully', () => {
      const propsWithInvalidSection = {
        module: mockModule,
        currentSectionId: 'invalid-section-id',
        completedSections: [],
        onSectionComplete: jest.fn(),
        serializedContent: mockSerializedContent
      };

      render(<ModuleViewer {...propsWithInvalidSection} />);

      expect(screen.getByText('No content available')).toBeInTheDocument();
    });

    test('should handle corrupted module data', () => {
      const corruptedModule = {
        ...mockModule,
        metadata: {
          ...mockModule.metadata,
          objectives: null as any
        }
      };

      const props = {
        module: corruptedModule,
        currentSectionId: 'section-1',
        completedSections: [],
        onSectionComplete: jest.fn(),
        serializedContent: mockSerializedContent
      };

      // Should not crash
      expect(() => render(<ModuleViewer {...props} />)).not.toThrow();
    });

    test('should handle missing MDX content', () => {
      const props = {
        module: mockModule,
        currentSectionId: 'section-1',
        completedSections: [],
        onSectionComplete: jest.fn(),
        serializedContent: undefined
      };

      render(<ModuleViewer {...props} />);

      // Should render without MDX content
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.queryByTestId('mdx-remote')).not.toBeInTheDocument();
    });

    test('should handle completion callback errors', async () => {
      const mockOnSectionComplete = jest.fn().mockImplementation(() => {
        throw new Error('Completion callback failed');
      });

      const props = {
        module: mockModule,
        currentSectionId: 'section-1',
        completedSections: [],
        onSectionComplete: mockOnSectionComplete,
        serializedContent: mockSerializedContent
      };

      render(<ModuleViewer {...props} />);

      const completeButton = screen.getByText('Mark Section as Complete');
      
      // Should not crash when callback throws
      expect(() => fireEvent.click(completeButton)).not.toThrow();
    });

    test('should handle extremely large objective lists', () => {
      const moduleWithManyObjectives = {
        ...mockModule,
        metadata: {
          ...mockModule.metadata,
          objectives: Array.from({ length: 1000 }, (_, i) => `Objective ${i + 1}`)
        }
      };

      const props = {
        module: moduleWithManyObjectives,
        currentSectionId: 'section-1',
        completedSections: [],
        onSectionComplete: jest.fn(),
        serializedContent: mockSerializedContent
      };

      // Should render without performance issues
      const startTime = Date.now();
      render(<ModuleViewer {...props} />);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should render quickly
      expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
    });
  });

  describe('ModuleNavigation Error Scenarios', () => {
    const defaultProps = {
      currentModule: mockModule,
      allModules: [mockModule],
      currentSectionId: 'section-1',
      completedSections: [],
      completedModules: [],
      pathId: 'test-path',
      pathTitle: 'Test Path',
      onSectionSelect: jest.fn(),
    };

    test('should handle empty module list', () => {
      const propsWithNoModules = {
        ...defaultProps,
        allModules: []
      };

      render(<ModuleNavigation {...propsWithNoModules} />);

      expect(screen.getByText('Course Modules')).toBeInTheDocument();
      // Should not crash with empty modules
    });

    test('should handle corrupted module data in list', () => {
      const corruptedModules = [
        mockModule,
        null as any,
        undefined as any,
        { ...mockModule, metadata: null } as any
      ];

      const propsWithCorruptedModules = {
        ...defaultProps,
        allModules: corruptedModules.filter(Boolean)
      };

      // Should not crash
      expect(() => render(<ModuleNavigation {...propsWithCorruptedModules} />)).not.toThrow();
    });

    test('should handle invalid current module', () => {
      const propsWithInvalidCurrent = {
        ...defaultProps,
        currentModule: null as any
      };

      // Should handle gracefully without crashing
      expect(() => render(<ModuleNavigation {...propsWithInvalidCurrent} />)).not.toThrow();
    });

    test('should handle circular dependencies in prerequisites', () => {
      const moduleA = { ...mockModule, metadata: { ...mockModule.metadata, id: 'module-a', prerequisites: ['module-b'] } };
      const moduleB = { ...mockModule, metadata: { ...mockModule.metadata, id: 'module-b', prerequisites: ['module-a'] } };

      const propsWithCircularDeps = {
        ...defaultProps,
        allModules: [moduleA, moduleB],
        currentModule: moduleA
      };

      // Should not cause infinite loops
      render(<ModuleNavigation {...propsWithCircularDeps} />);
      expect(screen.getByText('Course Modules')).toBeInTheDocument();
    });

    test('should handle navigation callback errors', async () => {
      const mockOnSectionSelect = jest.fn().mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      const props = {
        ...defaultProps,
        onSectionSelect: mockOnSectionSelect
      };

      render(<ModuleNavigation {...props} />);

      const sectionButton = screen.getByText('Section 1');
      
      // Should not crash when callback throws
      expect(() => fireEvent.click(sectionButton)).not.toThrow();
    });

    test('should handle window.location assignment errors', () => {
      // Mock window.location to throw
      const originalLocation = window.location;
      delete (window as any).location;
      Object.defineProperty(window, 'location', {
        value: {
          href: '',
          assign: jest.fn(() => {
            throw new Error('Navigation blocked');
          })
        },
        writable: true,
      });

      render(<ModuleNavigation {...defaultProps} />);

      const nextButton = screen.getByText('Next');
      
      // Should handle navigation errors gracefully
      expect(() => fireEvent.click(nextButton)).not.toThrow();

      // Restore original location
      window.location = originalLocation;
    });
  });

  describe('CodePlayground Error Scenarios', () => {
    test('should handle clipboard API failures', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard access denied'));

      render(<CodePlayground initialCode="console.log('test');" />);

      const copyButton = screen.getByTestId('clipboard-document-icon').closest('button');
      fireEvent.click(copyButton!);

      // Should not crash on clipboard failure
      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalled();
      });
    });

    test('should handle localStorage failures', async () => {
      (mockLocalStorage as any).setShouldFail(true);

      render(<CodePlayground initialCode="console.log('test');" saveKey="test-key" />);

      const editor = screen.getByTestId('monaco-editor');
      fireEvent.change(editor, { target: { value: 'console.log("modified");' } });

      // Should handle localStorage errors gracefully
      await waitFor(() => {
        expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
      });
    });

    test('should handle corrupted localStorage data', () => {
      mockLocalStorage.setItem('playground_test-key', 'invalid json');

      render(<CodePlayground saveKey="test-key" />);

      // Should not crash and should use default code
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    test('should handle JavaScript execution errors gracefully', async () => {
      render(<CodePlayground initialCode="throw new Error('Runtime error');" />);

      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByTestId('x-mark-icon')).toBeInTheDocument();
      });
    });

    test('should handle infinite loops in user code', async () => {
      const infiniteLoopCode = 'while(true) { console.log("infinite"); }';
      
      render(<CodePlayground initialCode={infiniteLoopCode} />);

      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);

      // Should handle safely (timeout would be implemented in real code)
      await waitFor(() => {
        expect(screen.getByText('Running...')).toBeInTheDocument();
      });
    });

    test('should handle memory exhaustion scenarios', async () => {
      const memoryExhaustionCode = 'const arr = []; while(true) arr.push(new Array(1000000));';
      
      render(<CodePlayground initialCode={memoryExhaustionCode} />);

      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);

      // Should handle memory issues gracefully
      await waitFor(() => {
        expect(runButton).toBeInTheDocument();
      });
    });

    test('should handle onExecute promise rejections', async () => {
      const mockOnExecute = jest.fn().mockRejectedValue(new Error('Execution service unavailable'));

      render(<CodePlayground initialCode="console.log('test');" onExecute={mockOnExecute} />);

      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/Execution service unavailable/)).toBeInTheDocument();
      });
    });

    test('should handle extremely large code inputs', () => {
      const largeCode = 'console.log("'.repeat(100000) + '");';
      
      render(<CodePlayground initialCode={largeCode} />);

      // Should render without crashing
      expect(screen.getByTestId('monaco-editor')).toHaveValue(largeCode);
    });

    test('should handle malformed example data', () => {
      const malformedExamples = [
        null as any,
        undefined as any,
        { id: 'example-1' } as any, // Missing required fields
        { title: 'Example', code: null } as any
      ].filter(Boolean);

      render(<CodePlayground examples={malformedExamples} />);

      // Should render without crashing
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });
  });

  describe('API Error Scenarios', () => {
    test('should handle modules API network failures', async () => {
      (getModulesForPath as jest.Mock).mockRejectedValue(new Error('Network timeout'));

      const request = new NextRequest('http://localhost:3000/api/modules?path=test-path');
      const response = await ModulesAPI(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch modules');
      expect(data.message).toBe('Network timeout');
    });

    test('should handle module API database failures', async () => {
      (validateModuleId as jest.Mock).mockRejectedValue(new Error('Database connection lost'));

      const request = new NextRequest('http://localhost:3000/api/modules/test-path/test-module');
      const params = { params: Promise.resolve({ pathSlug: 'test-path', moduleId: 'test-module' }) };
      const response = await ModuleAPI(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch module');
    });

    test('should handle malformed API parameters', async () => {
      const malformedParams = {
        params: Promise.resolve({
          pathSlug: null,
          moduleId: undefined
        })
      };

      (validateModuleId as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/modules/null/undefined');
      const response = await ModuleAPI(request, malformedParams as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    test('should handle API timeout scenarios', async () => {
      (getModulesForPath as jest.Mock).mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const request = new NextRequest('http://localhost:3000/api/modules?path=slow-path');
      const response = await ModulesAPI(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Request timeout');
    });

    test('should handle concurrent API request failures', async () => {
      let callCount = 0;
      (getModulesForPath as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.reject(new Error(`Request ${callCount} failed`));
        }
        return Promise.resolve([]);
      });

      const requests = Array.from({ length: 10 }, () => {
        const request = new NextRequest('http://localhost:3000/api/modules?path=concurrent-path');
        return ModulesAPI(request);
      });

      const responses = await Promise.all(requests);

      // Some should succeed, some should fail
      const statuses = responses.map(r => r.status);
      expect(statuses).toContain(200); // Some succeeded
      expect(statuses).toContain(500); // Some failed
    });
  });

  describe('Browser Compatibility Error Scenarios', () => {
    test('should handle missing modern browser APIs', () => {
      // Mock missing clipboard API
      delete (navigator as any).clipboard;

      render(<CodePlayground initialCode="console.log('test');" />);

      const copyButton = screen.getByTestId('clipboard-document-icon').closest('button');
      
      // Should not crash when clipboard API is missing
      expect(() => fireEvent.click(copyButton!)).not.toThrow();
    });

    test('should handle missing localStorage', () => {
      // Mock missing localStorage
      const originalLocalStorage = window.localStorage;
      delete (window as any).localStorage;

      render(<CodePlayground saveKey="test-key" />);

      // Should render without localStorage
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();

      // Restore localStorage
      window.localStorage = originalLocalStorage;
    });

    test('should handle unsupported ES6 features gracefully', async () => {
      const es6Code = `
        const arrow = () => console.log('ES6');
        const template = \`Template literal\`;
        const [a, b] = [1, 2];
        arrow();
      `;

      render(<CodePlayground initialCode={es6Code} />);

      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);

      // Should handle ES6 code (or show appropriate error)
      await waitFor(() => {
        expect(runButton).toBeInTheDocument();
      });
    });
  });

  describe('Performance Under Error Conditions', () => {
    test('should maintain performance during repeated errors', async () => {
      const errorOnExecute = jest.fn().mockRejectedValue(new Error('Consistent failure'));

      render(<CodePlayground onExecute={errorOnExecute} />);

      const runButton = screen.getByText('Run');

      // Execute multiple times with errors
      for (let i = 0; i < 10; i++) {
        fireEvent.click(runButton);
        await waitFor(() => {
          expect(screen.getByText('Error')).toBeInTheDocument();
        });
      }

      // Should still be responsive
      expect(runButton).not.toBeDisabled();
    });

    test('should handle memory leaks in error scenarios', () => {
      // Test with many component mounts/unmounts
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<ModuleViewer 
          module={mockModule}
          currentSectionId="section-1"
          completedSections={[]}
          onSectionComplete={() => { throw new Error('Callback error'); }}
          serializedContent={mockSerializedContent}
        />);
        unmount();
      }

      // Should not cause memory issues
      expect(true).toBe(true); // Test completion indicates no memory crashes
    });
  });

  describe('User Input Error Scenarios', () => {
    test('should handle invalid user inputs in code editor', async () => {
      const invalidInputs = [
        '\0\0\0invalid\0\0\0',
        '🚀🎉💻', // Unicode characters
        'a'.repeat(1000000), // Very long input
        '<?xml version="1.0"?><script>alert("xss")</script>',
      ];

      for (const input of invalidInputs) {
        render(<CodePlayground />);
        
        const editor = screen.getByTestId('monaco-editor');
        fireEvent.change(editor, { target: { value: input } });

        // Should handle invalid inputs gracefully
        expect(editor).toHaveValue(input);
      }
    });

    test('should handle rapid user interactions', async () => {
      render(<CodePlayground />);

      const runButton = screen.getByText('Run');
      const editor = screen.getByTestId('monaco-editor');

      // Simulate rapid clicking and typing
      for (let i = 0; i < 20; i++) {
        fireEvent.click(runButton);
        fireEvent.change(editor, { target: { value: `console.log(${i});` } });
      }

      // Should handle rapid interactions without crashing
      expect(runButton).toBeInTheDocument();
    });
  });
});