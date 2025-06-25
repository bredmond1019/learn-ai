import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import ModuleViewer from './ModuleViewer';
import { Module, ModuleSection, ModuleMetadata } from '@/types/module';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

// Mock external dependencies
jest.mock('@heroicons/react/24/outline', () => ({
  CheckIcon: () => <div data-testid="check-icon" />,
  ClipboardIcon: () => <div data-testid="clipboard-icon" />,
  BookOpenIcon: () => <div data-testid="book-open-icon" />,
}));

jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children, ...props }: any) => (
    <pre data-testid="syntax-highlighter" {...props}>
      {children}
    </pre>
  ),
}));

jest.mock('react-syntax-highlighter/dist/cjs/styles/prism', () => ({
  oneDark: {},
}));

jest.mock('next-mdx-remote', () => ({
  MDXRemote: ({ children, ...props }: any) => (
    <div data-testid="mdx-remote" {...props}>
      {children || 'MDX Content'}
    </div>
  ),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock UI components
jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number; className?: string }) => (
    <div data-testid="progress" data-value={value} className={className}>
      Progress: {value}%
    </div>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

// Test data
const mockModule: Module = {
  metadata: {
    id: 'test-module',
    title: 'Test Module',
    description: 'A test module for learning',
    type: 'tutorial',
    difficulty: 'beginner',
    duration: '30 min',
    order: 1,
    objectives: [
      'Understand basic concepts',
      'Apply learned skills',
      'Complete practical exercises'
    ],
    prerequisites: []
  } as ModuleMetadata,
  sections: [
    {
      id: 'section-1',
      title: 'Introduction',
      type: 'content',
      estimatedDuration: '10 min',
      content: {
        type: 'mdx',
        path: '/content/section-1.mdx'
      }
    },
    {
      id: 'section-2',
      title: 'Practice',
      type: 'exercise',
      estimatedDuration: '15 min',
      content: {
        type: 'mdx',
        path: '/content/section-2.mdx'
      }
    },
    {
      id: 'section-3',
      title: 'Assessment',
      type: 'quiz',
      estimatedDuration: '5 min',
      content: {
        type: 'mdx',
        path: '/content/section-3.mdx'
      }
    }
  ] as ModuleSection[]
};

const mockSerializedContent: MDXRemoteSerializeResult = {
  compiledSource: 'mock-compiled-source',
  scope: {}
};

describe('ModuleViewer Component', () => {
  const defaultProps = {
    module: mockModule,
    currentSectionId: 'section-1',
    completedSections: [],
    onSectionComplete: jest.fn(),
    serializedContent: mockSerializedContent
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders module title and description', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      expect(screen.getByText('Test Module')).toBeInTheDocument();
      expect(screen.getByText('A test module for learning')).toBeInTheDocument();
    });

    test('renders module metadata badges', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      const badges = screen.getAllByTestId('badge');
      expect(badges).toHaveLength(2);
      expect(screen.getByText('tutorial')).toBeInTheDocument();
      expect(screen.getByText('beginner')).toBeInTheDocument();
    });

    test('renders progress indicator', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      expect(screen.getByTestId('progress')).toBeInTheDocument();
      expect(screen.getByText('Progress: 0 of 3 sections')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    test('renders time estimate', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      expect(screen.getByText('Estimated time: 10 min')).toBeInTheDocument();
    });

    test('renders current section title', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      expect(screen.getByText('Introduction')).toBeInTheDocument();
    });

    test('renders learning objectives', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      expect(screen.getByText('Learning Objectives')).toBeInTheDocument();
      expect(screen.getByText('Understand basic concepts')).toBeInTheDocument();
      expect(screen.getByText('Apply learned skills')).toBeInTheDocument();
      expect(screen.getByText('Complete practical exercises')).toBeInTheDocument();
    });

    test('renders MDX content when available', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      expect(screen.getByTestId('mdx-remote')).toBeInTheDocument();
    });

    test('renders section type badge for non-content sections', () => {
      const propsWithExercise = {
        ...defaultProps,
        currentSectionId: 'section-2'
      };
      
      render(<ModuleViewer {...propsWithExercise} />);
      
      expect(screen.getByText('exercise')).toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    test('calculates progress correctly with completed sections', () => {
      const propsWithProgress = {
        ...defaultProps,
        completedSections: ['section-1', 'section-2']
      };
      
      render(<ModuleViewer {...propsWithProgress} />);
      
      expect(screen.getByText('Progress: 2 of 3 sections')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();
      expect(screen.getByTestId('progress')).toHaveAttribute('data-value', '67');
    });

    test('shows 100% progress when all sections completed', () => {
      const propsWithFullProgress = {
        ...defaultProps,
        completedSections: ['section-1', 'section-2', 'section-3']
      };
      
      render(<ModuleViewer {...propsWithFullProgress} />);
      
      expect(screen.getByText('Progress: 3 of 3 sections')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByTestId('progress')).toHaveAttribute('data-value', '100');
    });
  });

  describe('Section Navigation', () => {
    test('displays first section by default when no currentSectionId provided', () => {
      const propsWithoutCurrentSection = {
        ...defaultProps,
        currentSectionId: undefined
      };
      
      render(<ModuleViewer {...propsWithoutCurrentSection} />);
      
      expect(screen.getByText('Introduction')).toBeInTheDocument();
    });

    test('displays correct section based on currentSectionId', () => {
      const propsWithDifferentSection = {
        ...defaultProps,
        currentSectionId: 'section-3'
      };
      
      render(<ModuleViewer {...propsWithDifferentSection} />);
      
      expect(screen.getByText('Assessment')).toBeInTheDocument();
      expect(screen.getByText('quiz')).toBeInTheDocument();
    });
  });

  describe('Section Completion', () => {
    test('shows completion button for uncompleted section', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      expect(screen.getByText('Mark Section as Complete')).toBeInTheDocument();
    });

    test('hides completion button for completed section', () => {
      const propsWithCompletedSection = {
        ...defaultProps,
        completedSections: ['section-1']
      };
      
      render(<ModuleViewer {...propsWithCompletedSection} />);
      
      expect(screen.queryByText('Mark Section as Complete')).not.toBeInTheDocument();
    });

    test('calls onSectionComplete when completion button clicked', async () => {
      const mockOnSectionComplete = jest.fn();
      const propsWithHandler = {
        ...defaultProps,
        onSectionComplete: mockOnSectionComplete
      };
      
      render(<ModuleViewer {...propsWithHandler} />);
      
      const completeButton = screen.getByText('Mark Section as Complete');
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockOnSectionComplete).toHaveBeenCalledWith('section-1');
      });
    });
  });

  describe('Error States', () => {
    test('shows no content message when no active section', () => {
      const propsWithNoSections = {
        ...defaultProps,
        module: {
          ...mockModule,
          sections: []
        }
      };
      
      render(<ModuleViewer {...propsWithNoSections} />);
      
      expect(screen.getByTestId('book-open-icon')).toBeInTheDocument();
      expect(screen.getByText('No content available')).toBeInTheDocument();
    });

    test('handles invalid currentSectionId gracefully', () => {
      const propsWithInvalidSection = {
        ...defaultProps,
        currentSectionId: 'invalid-section'
      };
      
      render(<ModuleViewer {...propsWithInvalidSection} />);
      
      expect(screen.getByText('No content available')).toBeInTheDocument();
    });
  });

  describe('Code Block Functionality', () => {
    test('renders code blocks with syntax highlighting', () => {
      // Test would require more complex setup with actual MDX content
      // This is a placeholder for code block testing
      render(<ModuleViewer {...defaultProps} />);
      
      // This test would verify that code blocks are rendered correctly
      // when MDX content contains code snippets
      expect(screen.getByTestId('mdx-remote')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      // Check for proper heading hierarchy
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Test Module');
      
      const sectionHeading = screen.getByRole('heading', { level: 2 });
      expect(sectionHeading).toHaveTextContent('Introduction');
      
      const objectivesHeading = screen.getByRole('heading', { level: 3 });
      expect(objectivesHeading).toHaveTextContent('Learning Objectives');
    });

    test('completion button is accessible', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      const completeButton = screen.getByRole('button', { name: /mark section as complete/i });
      expect(completeButton).toBeInTheDocument();
      expect(completeButton).not.toHaveAttribute('aria-disabled');
    });

    test('progress indicator has appropriate labels', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      expect(screen.getByText('Progress: 0 of 3 sections')).toBeInTheDocument();
      expect(screen.getByTestId('progress')).toBeInTheDocument();
    });

    test('learning objectives list is properly structured', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      const objectivesList = screen.getByRole('list');
      expect(objectivesList).toBeInTheDocument();
      
      const objectives = screen.getAllByRole('listitem');
      expect(objectives).toHaveLength(3);
    });
  });

  describe('Responsive Design', () => {
    test('applies responsive classes', () => {
      render(<ModuleViewer {...defaultProps} />);
      
      const completeButton = screen.getByText('Mark Section as Complete');
      expect(completeButton).toHaveClass('w-full', 'sm:w-auto');
    });
  });

  describe('Dynamic Content Updates', () => {
    test('updates content when currentSectionId changes', () => {
      const { rerender } = render(<ModuleViewer {...defaultProps} />);
      
      expect(screen.getByText('Introduction')).toBeInTheDocument();
      
      rerender(<ModuleViewer {...defaultProps} currentSectionId="section-2" />);
      
      expect(screen.getByText('Practice')).toBeInTheDocument();
      expect(screen.getByText('exercise')).toBeInTheDocument();
    });

    test('updates progress when completedSections changes', () => {
      const { rerender } = render(<ModuleViewer {...defaultProps} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      
      rerender(<ModuleViewer {...defaultProps} completedSections={['section-1']} />);
      
      expect(screen.getByText('33%')).toBeInTheDocument();
    });
  });
});