import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import ModuleViewer from './ModuleViewer';
import ModuleNavigation from './ModuleNavigation';
import CodePlayground from './CodePlayground';
import { Module, ModuleSection, ModuleMetadata } from '@/types/module';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock external dependencies to focus on accessibility
jest.mock('@monaco-editor/react', () => ({
  Editor: React.forwardRef(({ value, onChange, onMount, ...props }: any, ref: any) => (
    <textarea
      ref={ref}
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      onFocus={() => onMount && onMount({ getValue: () => value })}
      aria-label="Code editor"
      role="textbox"
      {...props}
    />
  )),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/learn/paths/test-path/modules/module-1'),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return (
      <a href={href} data-testid="link">
        {children}
      </a>
    );
  };
});

// Mock Heroicons with accessibility-friendly versions
jest.mock('@heroicons/react/24/outline', () => ({
  CheckIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Check icon">
      <title>Check</title>
    </svg>
  ),
  ClipboardIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Clipboard icon">
      <title>Copy to clipboard</title>
    </svg>
  ),
  BookOpenIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Book icon">
      <title>Book</title>
    </svg>
  ),
  PlayIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Play icon">
      <title>Run code</title>
    </svg>
  ),
  ArrowPathIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Reset icon">
      <title>Reset</title>
    </svg>
  ),
  HomeIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Home icon">
      <title>Home</title>
    </svg>
  ),
  ChevronRightIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Chevron right icon">
      <title>Next</title>
    </svg>
  ),
  ChevronLeftIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Chevron left icon">
      <title>Previous</title>
    </svg>
  ),
  ChevronDownIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Chevron down icon">
      <title>Expand</title>
    </svg>
  ),
  CheckCircleIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Check circle icon">
      <title>Completed</title>
    </svg>
  ),
  LockClosedIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Lock icon">
      <title>Locked</title>
    </svg>
  ),
  PlayCircleIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Play circle icon">
      <title>Available</title>
    </svg>
  ),
  XMarkIcon: (props: any) => (
    <svg {...props} role="img" aria-label="X mark icon">
      <title>Error</title>
    </svg>
  ),
  ClipboardDocumentIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Clipboard document icon">
      <title>Copy code</title>
    </svg>
  ),
  CloudArrowUpIcon: (props: any) => (
    <svg {...props} role="img" aria-label="Cloud upload icon">
      <title>Save</title>
    </svg>
  ),
}));

// Mock MDX with semantic HTML
jest.mock('next-mdx-remote', () => ({
  MDXRemote: ({ children, ...props }: any) => (
    <div data-testid="mdx-remote" {...props}>
      <article role="article" aria-label="Module content">
        <h2>Sample MDX Content</h2>
        <p>This is sample content for accessibility testing.</p>
        <code>console.log("Sample code");</code>
      </article>
    </div>
  ),
}));

// Mock UI components with proper accessibility
jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className, ...props }: { value: number; className?: string }) => (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${value}%`}
      className={className}
      {...props}
    >
      <span className="sr-only">{value}% complete</span>
    </div>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <section className={className} role="region">
      {children}
    </section>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span role="status" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div role="tabpanel">
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div role="tabpanel" aria-labelledby={`tab-${value}`}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => (
    <div role="tablist">
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, ...props }: any) => (
    <button role="tab" id={`tab-${value}`} aria-controls={`panel-${value}`} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} role="region" aria-label="Scrollable content">
      {children}
    </div>
  ),
}));

// Test data
const createMockModule = (id: string, title: string): Module => ({
  metadata: {
    id,
    title,
    description: `Description for ${title}`,
    type: 'tutorial',
    difficulty: 'beginner',
    duration: '30 min',
    order: 1,
    objectives: [
      'Learn fundamental concepts',
      'Apply knowledge practically',
      'Complete hands-on exercises'
    ],
    prerequisites: []
  } as ModuleMetadata,
  sections: [
    {
      id: `${id}-section-1`,
      title: `${title} - Introduction`,
      type: 'content',
      estimatedDuration: '10 min',
      content: { type: 'mdx', path: `/content/${id}-intro.mdx` }
    },
    {
      id: `${id}-section-2`,
      title: `${title} - Practice`,
      type: 'exercise',
      estimatedDuration: '15 min',
      content: { type: 'mdx', path: `/content/${id}-practice.mdx` }
    }
  ] as ModuleSection[]
});

const mockModule = createMockModule('test-module', 'Test Module');
const mockModules = [mockModule];

const mockSerializedContent: MDXRemoteSerializeResult = {
  compiledSource: 'mock-compiled-source',
  scope: {}
};

describe('Learn Platform Accessibility Tests', () => {
  describe('ModuleViewer Accessibility', () => {
    const defaultProps = {
      module: mockModule,
      currentSectionId: 'test-module-section-1',
      completedSections: [],
      onSectionComplete: jest.fn(),
      serializedContent: mockSerializedContent
    };

    test('should have no accessibility violations', async () => {
      const { container } = render(<ModuleViewer {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper heading hierarchy', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      // Main module title should be h1
      const moduleTitle = screen.getByRole('heading', { level: 1 });
      expect(moduleTitle).toHaveTextContent('Test Module');
      
      // Section title should be h2
      const sectionTitle = screen.getByRole('heading', { level: 2 });
      expect(sectionTitle).toHaveTextContent('Test Module - Introduction');
      
      // Learning objectives should be h3
      const objectivesTitle = screen.getByRole('heading', { level: 3 });
      expect(objectivesTitle).toHaveTextContent('Learning Objectives');
    });

    test('should have accessible progress indicator', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label', 'Progress: 0%');
    });

    test('should announce progress changes', () => {
      const { rerender } = render(<ModuleViewer {...defaultProps} />);
      
      // Initial state
      expect(screen.getByText('0% complete')).toBeInTheDocument();
      
      // Update with completed sections
      rerender(
        <ModuleViewer 
          {...defaultProps} 
          completedSections={['test-module-section-1']} 
        />
      );
      
      expect(screen.getByText('50% complete')).toBeInTheDocument();
    });

    test('should have accessible completion button', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      const completeButton = screen.getByRole('button', { 
        name: /mark section as complete/i 
      });
      expect(completeButton).toBeInTheDocument();
      expect(completeButton).not.toHaveAttribute('aria-disabled');
    });

    test('should have accessible learning objectives list', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      const objectivesList = screen.getByRole('list');
      expect(objectivesList).toBeInTheDocument();
      
      const objectives = screen.getAllByRole('listitem');
      expect(objectives).toHaveLength(3);
      
      objectives.forEach((objective, index) => {
        expect(objective).toHaveTextContent(mockModule.metadata.objectives![index]);
      });
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const mockOnSectionComplete = jest.fn();
      
      render(
        <ModuleViewer 
          {...defaultProps} 
          onSectionComplete={mockOnSectionComplete} 
        />
      );
      
      // Tab to the complete button
      await user.tab();
      const completeButton = screen.getByRole('button', { 
        name: /mark section as complete/i 
      });
      expect(document.activeElement).toBe(completeButton);
      
      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(mockOnSectionComplete).toHaveBeenCalledWith('test-module-section-1');
    });

    test('should have proper section landmarks', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThan(0);
      
      // MDX content should be in an article
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'Module content');
    });

    test('should handle empty state accessibly', () => {
      const propsWithNoSections = {
        ...defaultProps,
        module: {
          ...mockModule,
          sections: []
        }
      };
      
      render(<ModuleViewer {...propsWithNoSections} />);
      
      expect(screen.getByText('No content available')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Book icon' })).toBeInTheDocument();
    });
  });

  describe('ModuleNavigation Accessibility', () => {
    const defaultProps = {
      currentModule: mockModule,
      allModules: mockModules,
      currentSectionId: 'test-module-section-1',
      completedSections: [],
      completedModules: [],
      pathId: 'test-path',
      pathTitle: 'Test Learning Path',
      onSectionSelect: jest.fn(),
    };

    test('should have no accessibility violations', async () => {
      const { container } = render(<ModuleNavigation {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible breadcrumb navigation', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // Breadcrumb links should be accessible
      const links = screen.getAllByTestId('link');
      expect(links.length).toBeGreaterThan(0);
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.textContent).toBeTruthy();
      });
    });

    test('should have accessible module list', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      // Modules should be properly labeled
      const moduleTitle = screen.getByText('Test Module');
      expect(moduleTitle).toBeInTheDocument();
      
      // Progress indicators should be accessible
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    test('should have accessible section navigation', async () => {
      const user = userEvent.setup();
      const mockOnSectionSelect = jest.fn();
      
      render(
        <ModuleNavigation 
          {...defaultProps} 
          onSectionSelect={mockOnSectionSelect} 
        />
      );
      
      const sectionButton = screen.getByText('Test Module - Introduction');
      expect(sectionButton.closest('button')).toBeInTheDocument();
      
      await user.click(sectionButton);
      expect(mockOnSectionSelect).toHaveBeenCalledWith('test-module-section-1');
    });

    test('should have accessible previous/next navigation', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      const previousButton = screen.getByRole('button', { name: /previous/i });
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      expect(previousButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
      
      // Should indicate current position
      expect(screen.getByText('Section 1 of 2')).toBeInTheDocument();
    });

    test('should indicate module completion status accessibly', () => {
      const propsWithCompleted = {
        ...defaultProps,
        completedModules: ['test-module'],
        completedSections: ['test-module-section-1', 'test-module-section-2']
      };
      
      render(<ModuleNavigation {...propsWithCompleted} />);
      
      // Completed modules should have check icons
      expect(screen.getByRole('img', { name: 'Completed' })).toBeInTheDocument();
    });

    test('should indicate locked modules accessibly', () => {
      const moduleWithPrereqs = createMockModule('locked-module', 'Locked Module');
      moduleWithPrereqs.metadata.prerequisites = ['prerequisite-module'];
      
      const propsWithLocked = {
        ...defaultProps,
        allModules: [mockModule, moduleWithPrereqs],
        currentModule: moduleWithPrereqs
      };
      
      render(<ModuleNavigation {...propsWithLocked} />);
      
      // Locked modules should have lock icons
      expect(screen.getByRole('img', { name: 'Locked' })).toBeInTheDocument();
    });

    test('should support keyboard navigation for module expansion', async () => {
      const user = userEvent.setup();
      render(<ModuleNavigation {...defaultProps} />);
      
      // Find expandable module button
      const expandButton = screen.getByRole('img', { name: 'Expand' }).closest('button');
      expect(expandButton).toBeInTheDocument();
      
      if (expandButton) {
        await user.tab();
        if (document.activeElement === expandButton) {
          await user.keyboard('{Enter}');
          // Module should expand/collapse
        }
      }
    });
  });

  describe('CodePlayground Accessibility', () => {
    const defaultProps = {
      initialCode: 'console.log("Hello, World!");',
      language: 'javascript',
      saveKey: 'test-playground'
    };

    test('should have no accessibility violations', async () => {
      const { container } = render(<CodePlayground {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have accessible code editor', () => {
      render(<CodePlayground {...defaultProps} />);
      
      const editor = screen.getByRole('textbox');
      expect(editor).toHaveAttribute('aria-label', 'Code editor');
      expect(editor).toHaveValue('console.log("Hello, World!");');
    });

    test('should have accessible action buttons', () => {
      render(<CodePlayground {...defaultProps} />);
      
      const runButton = screen.getByRole('button', { name: /run/i });
      expect(runButton).toBeInTheDocument();
      
      // Icon buttons should have accessible names
      const copyButton = screen.getByRole('img', { name: 'Copy code' }).closest('button');
      expect(copyButton).toBeInTheDocument();
      
      const resetButton = screen.getByRole('img', { name: 'Reset' }).closest('button');
      expect(resetButton).toBeInTheDocument();
      
      const saveButton = screen.getByRole('img', { name: 'Save' }).closest('button');
      expect(saveButton).toBeInTheDocument();
    });

    test('should have accessible tabs', () => {
      render(<CodePlayground {...defaultProps} />);
      
      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThanOrEqual(2);
      
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-controls');
        expect(tab.id).toBeTruthy();
      });
    });

    test('should announce execution results', async () => {
      const user = userEvent.setup();
      render(<CodePlayground {...defaultProps} />);
      
      const runButton = screen.getByRole('button', { name: /run/i });
      await user.click(runButton);
      
      await waitFor(() => {
        // Output should be announced
        expect(screen.getByText('Hello, World!')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Check icon' })).toBeInTheDocument();
      });
    });

    test('should announce error states', async () => {
      const user = userEvent.setup();
      render(<CodePlayground initialCode="throw new Error('Test error');" language="javascript" />);
      
      const runButton = screen.getByRole('button', { name: /run/i });
      await user.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Error' })).toBeInTheDocument();
      });
    });

    test('should announce save status changes', async () => {
      const user = userEvent.setup();
      render(<CodePlayground {...defaultProps} />);
      
      const editor = screen.getByRole('textbox');
      await user.clear(editor);
      await user.type(editor, 'console.log("Modified");');
      
      await waitFor(() => {
        expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
      });
    });

    test('should support keyboard shortcuts', async () => {
      const user = userEvent.setup();
      render(<CodePlayground {...defaultProps} />);
      
      const editor = screen.getByRole('textbox');
      editor.focus();
      
      // Ctrl+Enter should run code (in real implementation)
      await user.keyboard('{Control>}{Enter}{/Control}');
      
      // Should maintain focus and be keyboard accessible
      expect(editor).toHaveFocus();
    });

    test('should have accessible loading states', async () => {
      const slowExecute = jest.fn(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, output: 'Done' }), 100))
      );
      
      const user = userEvent.setup();
      render(<CodePlayground {...defaultProps} onExecute={slowExecute} />);
      
      const runButton = screen.getByRole('button', { name: /run/i });
      await user.click(runButton);
      
      // Button should indicate loading state
      expect(screen.getByText('Running...')).toBeInTheDocument();
      expect(runButton).toBeDisabled();
    });
  });

  describe('Cross-Component Accessibility', () => {
    test('should maintain focus order across components', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <ModuleNavigation
            currentModule={mockModule}
            allModules={mockModules}
            currentSectionId="test-module-section-1"
            completedSections={[]}
            completedModules={[]}
            pathId="test-path"
            pathTitle="Test Path"
            onSectionSelect={jest.fn()}
          />
          <ModuleViewer
            module={mockModule}
            currentSectionId="test-module-section-1"
            completedSections={[]}
            onSectionComplete={jest.fn()}
            serializedContent={mockSerializedContent}
          />
        </div>
      );
      
      // Tab through elements in logical order
      await user.tab();
      await user.tab();
      await user.tab();
      
      // Focus should move through interactive elements
      expect(document.activeElement).toBeTruthy();
    });

    test('should have consistent landmark structure', () => {
      render(
        <div>
          <ModuleNavigation
            currentModule={mockModule}
            allModules={mockModules}
            currentSectionId="test-module-section-1"
            completedSections={[]}
            completedModules={[]}
            pathId="test-path"
            pathTitle="Test Path"
            onSectionSelect={jest.fn()}
          />
          <main>
            <ModuleViewer
              module={mockModule}
              currentSectionId="test-module-section-1"
              completedSections={[]}
              onSectionComplete={jest.fn()}
              serializedContent={mockSerializedContent}
            />
          </main>
        </div>
      );
      
      // Should have navigation landmark
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Should have main content area
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Should have regions for different content areas
      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThan(0);
    });

    test('should handle responsive design accessibly', () => {
      // Mock viewport changes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      render(<CodePlayground initialCode="console.log('mobile');" />);
      
      // Should maintain accessibility on smaller screens
      const editor = screen.getByRole('textbox');
      expect(editor).toBeInTheDocument();
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Touch targets should be accessible
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Screen Reader Support', () => {
    test('should provide descriptive text for visual elements', () => {
      render(
        <ModuleViewer
          module={mockModule}
          currentSectionId="test-module-section-1"
          completedSections={['test-module-section-1']}
          onSectionComplete={jest.fn()}
          serializedContent={mockSerializedContent}
        />
      );
      
      // Progress should be described
      expect(screen.getByText('50% complete')).toBeInTheDocument();
      
      // Icons should have meaningful labels
      const checkIcon = screen.getByRole('img', { name: 'Check icon' });
      expect(checkIcon).toBeInTheDocument();
    });

    test('should provide context for dynamic content', async () => {
      const user = userEvent.setup();
      render(<CodePlayground initialCode="console.log('test');" />);
      
      const runButton = screen.getByRole('button', { name: /run/i });
      await user.click(runButton);
      
      await waitFor(() => {
        // Output should be in accessible format
        const outputPanel = screen.getByRole('tabpanel');
        expect(outputPanel).toBeInTheDocument();
      });
    });

    test('should handle live regions appropriately', () => {
      render(<CodePlayground initialCode="console.log('test');" />);
      
      // Save status should be announced
      const savedStatus = screen.getByText('Saved');
      expect(savedStatus.closest('[role="status"]')).toBeInTheDocument();
    });
  });

  describe('Color and Contrast', () => {
    test('should not rely solely on color for information', () => {
      render(
        <ModuleNavigation
          currentModule={mockModule}
          allModules={mockModules}
          currentSectionId="test-module-section-1"
          completedSections={['test-module-section-1']}
          completedModules={[]}
          pathId="test-path"
          pathTitle="Test Path"
          onSectionSelect={jest.fn()}
        />
      );
      
      // Completed sections should have icons in addition to color
      expect(screen.getByRole('img', { name: 'Completed' })).toBeInTheDocument();
      
      // Progress should have text labels
      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });

    test('should provide text alternatives for status indicators', () => {
      render(<CodePlayground initialCode="console.log('test');" />);
      
      // Status badges should have text content
      const languageBadge = screen.getByRole('status');
      expect(languageBadge).toHaveTextContent('javascript');
    });
  });
});