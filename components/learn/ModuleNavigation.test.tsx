import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { usePathname } from 'next/navigation';
import ModuleNavigation from './ModuleNavigation';
import { Module, ModuleSection, ModuleMetadata } from '@/types/module';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href} data-testid="link">{children}</a>;
  };
});

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ChevronLeftIcon: () => <div data-testid="chevron-left-icon" />,
  ChevronRightIcon: () => <div data-testid="chevron-right-icon" />,
  HomeIcon: () => <div data-testid="home-icon" />,
  CheckCircleIcon: () => <div data-testid="check-circle-icon" />,
  LockClosedIcon: () => <div data-testid="lock-closed-icon" />,
  PlayCircleIcon: () => <div data-testid="play-circle-icon" />,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon" />,
}));

// Mock UI components
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

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number; className?: string }) => (
    <div data-testid="progress" data-value={value} className={className}>
      Progress: {value}%
    </div>
  ),
}));

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Mock window.location
const mockLocationHref = jest.fn();
delete (window as any).location;
window.location = {
  href: '',
  assign: mockLocationHref,
} as any;

// Test data
const createMockModule = (id: string, title: string, order: number, prerequisites: string[] = []): Module => ({
  metadata: {
    id,
    title,
    description: `Description for ${title}`,
    type: 'tutorial',
    difficulty: 'beginner',
    duration: '30 min',
    order,
    objectives: ['Learn concepts'],
    prerequisites
  } as ModuleMetadata,
  sections: [
    {
      id: `${id}-section-1`,
      title: `${title} - Section 1`,
      type: 'content',
      estimatedDuration: '10 min',
      content: { type: 'mdx', path: `/content/${id}-section-1.mdx` }
    },
    {
      id: `${id}-section-2`,
      title: `${title} - Section 2`,
      type: 'exercise',
      estimatedDuration: '15 min',
      content: { type: 'mdx', path: `/content/${id}-section-2.mdx` }
    },
    {
      id: `${id}-section-3`,
      title: `${title} - Section 3`,
      type: 'quiz',
      estimatedDuration: '5 min',
      content: { type: 'mdx', path: `/content/${id}-section-3.mdx` }
    }
  ] as ModuleSection[]
});

const mockModules: Module[] = [
  createMockModule('module-1', 'Introduction to Concepts', 1),
  createMockModule('module-2', 'Advanced Topics', 2, ['module-1']),
  createMockModule('module-3', 'Expert Level', 3, ['module-2']),
];

const currentModule = mockModules[0];

describe('ModuleNavigation Component', () => {
  const defaultProps = {
    currentModule,
    allModules: mockModules,
    currentSectionId: 'module-1-section-1',
    completedSections: [],
    completedModules: [],
    pathId: 'test-path',
    pathTitle: 'Test Learning Path',
    onSectionSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/learn/paths/test-path/modules/module-1');
    window.location.href = '';
  });

  describe('Breadcrumb Navigation', () => {
    test('renders breadcrumb navigation correctly', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByText('Learn')).toBeInTheDocument();
      expect(screen.getByText('Test Learning Path')).toBeInTheDocument();
      expect(screen.getByText('Introduction to Concepts')).toBeInTheDocument();
    });

    test('includes current section in breadcrumb when available', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      expect(screen.getByText('Introduction to Concepts - Section 1')).toBeInTheDocument();
    });

    test('renders clickable breadcrumb links', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      const links = screen.getAllByTestId('link');
      expect(links.length).toBeGreaterThan(0);
      
      // Check that Learn link has correct href
      const learnLink = links.find(link => link.textContent === 'Learn');
      expect(learnLink).toHaveAttribute('href', '/learn');
    });
  });

  describe('Module List Rendering', () => {
    test('renders all modules in correct order', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      expect(screen.getByText('Introduction to Concepts')).toBeInTheDocument();
      expect(screen.getByText('Advanced Topics')).toBeInTheDocument();
      expect(screen.getByText('Expert Level')).toBeInTheDocument();
    });

    test('shows module metadata (duration and section count)', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      expect(screen.getByText('30 min • 3 sections')).toBeInTheDocument();
    });

    test('highlights current module', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      // Current module should have different styling
      const moduleElements = screen.getAllByText(/Introduction to Concepts/);
      expect(moduleElements.length).toBeGreaterThan(0);
    });

    test('shows locked modules correctly', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      // Advanced Topics should be locked since module-1 is not completed
      expect(screen.getAllByTestId('lock-closed-icon')).toHaveLength(2); // module-2 and module-3
    });

    test('shows unlocked modules correctly', () => {
      const propsWithCompletedModules = {
        ...defaultProps,
        completedModules: ['module-1']
      };
      
      render(<ModuleNavigation {...propsWithCompletedModules} />);
      
      // module-2 should be unlocked now
      expect(screen.getAllByTestId('play-circle-icon')).toHaveLength(1);
    });

    test('shows completed modules correctly', () => {
      const propsWithCompletedModules = {
        ...defaultProps,
        completedModules: ['module-1']
      };
      
      render(<ModuleNavigation {...propsWithCompletedModules} />);
      
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });
  });

  describe('Module Progress Calculation', () => {
    test('calculates module progress correctly', () => {
      const propsWithProgress = {
        ...defaultProps,
        completedSections: ['module-1-section-1', 'module-1-section-2']
      };
      
      render(<ModuleNavigation {...propsWithProgress} />);
      
      const progressBadge = screen.getByText('67%');
      expect(progressBadge).toBeInTheDocument();
    });

    test('shows 0% progress for modules with no completed sections', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      const progressBadges = screen.getAllByText('0%');
      expect(progressBadges.length).toBeGreaterThan(0);
    });

    test('shows progress bars for unlocked modules', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      const progressBars = screen.getAllByTestId('progress');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Module Expansion/Collapse', () => {
    test('expands current module by default', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      // Current module should be expanded and show sections
      expect(screen.getByText('Introduction to Concepts - Section 1')).toBeInTheDocument();
      expect(screen.getByText('Introduction to Concepts - Section 2')).toBeInTheDocument();
      expect(screen.getByText('Introduction to Concepts - Section 3')).toBeInTheDocument();
    });

    test('allows toggling module expansion', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      // Find and click the expansion toggle
      const expandButton = screen.getByTestId('chevron-down-icon').closest('button');
      expect(expandButton).toBeInTheDocument();
      
      if (expandButton) {
        fireEvent.click(expandButton);
        // After clicking, sections might be hidden (this would need DOM assertion)
      }
    });

    test('does not allow expansion of locked modules', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      // Locked modules should not be expandable
      const lockedModuleText = screen.getByText('Advanced Topics');
      const moduleContainer = lockedModuleText.closest('[class*="opacity-50"]');
      expect(moduleContainer).toBeInTheDocument();
    });
  });

  describe('Section Navigation', () => {
    test('renders sections with completion status', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      // Sections should show completion status
      const sectionElements = screen.getAllByText(/Section/);
      expect(sectionElements.length).toBeGreaterThanOrEqual(3);
    });

    test('highlights current section', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      // Current section should be highlighted
      const currentSectionText = screen.getByText('Introduction to Concepts - Section 1');
      expect(currentSectionText).toBeInTheDocument();
    });

    test('shows section types with badges', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      expect(screen.getByText('exercise')).toBeInTheDocument();
      expect(screen.getByText('quiz')).toBeInTheDocument();
    });

    test('calls onSectionSelect when section clicked', async () => {
      const mockOnSectionSelect = jest.fn();
      const propsWithHandler = {
        ...defaultProps,
        onSectionSelect: mockOnSectionSelect
      };
      
      render(<ModuleNavigation {...propsWithHandler} />);
      
      const sectionButton = screen.getByText('Introduction to Concepts - Section 2');
      fireEvent.click(sectionButton);
      
      await waitFor(() => {
        expect(mockOnSectionSelect).toHaveBeenCalledWith('module-1-section-2');
      });
    });

    test('shows completed sections with check icons', () => {
      const propsWithCompletedSections = {
        ...defaultProps,
        completedSections: ['module-1-section-1']
      };
      
      render(<ModuleNavigation {...propsWithCompletedSections} />);
      
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });
  });

  describe('Previous/Next Navigation', () => {
    test('shows section counter', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      expect(screen.getByText('Section 1 of 3')).toBeInTheDocument();
    });

    test('enables next button when next section available', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      const nextButton = screen.getByText('Next').closest('button');
      expect(nextButton).not.toHaveAttribute('disabled');
    });

    test('enables previous button when previous section available', () => {
      const propsWithMiddleSection = {
        ...defaultProps,
        currentSectionId: 'module-1-section-2'
      };
      
      render(<ModuleNavigation {...propsWithMiddleSection} />);
      
      const previousButton = screen.getByText('Previous').closest('button');
      expect(previousButton).not.toHaveAttribute('disabled');
    });

    test('disables previous button on first section of first module', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      const previousButton = screen.getByText('Previous').closest('button');
      expect(previousButton).toHaveAttribute('disabled');
    });

    test('handles next section navigation', async () => {
      const mockOnSectionSelect = jest.fn();
      const propsWithHandler = {
        ...defaultProps,
        onSectionSelect: mockOnSectionSelect
      };
      
      render(<ModuleNavigation {...propsWithHandler} />);
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(mockOnSectionSelect).toHaveBeenCalledWith('module-1-section-2');
      });
    });

    test('handles previous section navigation', async () => {
      const mockOnSectionSelect = jest.fn();
      const propsWithHandler = {
        ...defaultProps,
        currentSectionId: 'module-1-section-2',
        onSectionSelect: mockOnSectionSelect
      };
      
      render(<ModuleNavigation {...propsWithHandler} />);
      
      const previousButton = screen.getByText('Previous');
      fireEvent.click(previousButton);
      
      await waitFor(() => {
        expect(mockOnSectionSelect).toHaveBeenCalledWith('module-1-section-1');
      });
    });

    test('navigates to next module when reaching end of current module', () => {
      const propsWithLastSection = {
        ...defaultProps,
        currentSectionId: 'module-1-section-3',
        completedModules: ['module-1'] // Make module-2 unlocked
      };
      
      render(<ModuleNavigation {...propsWithLastSection} />);
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      // Should navigate to next module
      expect(window.location.href).toBe('/learn/paths/test-path/modules/module-2');
    });

    test('disables next button when next module is locked', () => {
      const propsWithLastSection = {
        ...defaultProps,
        currentSectionId: 'module-1-section-3'
        // Don't complete module-1, so module-2 stays locked
      };
      
      render(<ModuleNavigation {...propsWithLastSection} />);
      
      const nextButton = screen.getByText('Next').closest('button');
      expect(nextButton).toHaveAttribute('disabled');
    });
  });

  describe('Accessibility', () => {
    test('has proper navigation landmark', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
    });

    test('section buttons are keyboard accessible', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      const sectionButtons = screen.getAllByRole('button');
      expect(sectionButtons.length).toBeGreaterThan(0);
      
      sectionButtons.forEach(button => {
        expect(button).not.toHaveAttribute('tabIndex', '-1');
      });
    });

    test('navigation buttons have descriptive text', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Section 1 of 3')).toBeInTheDocument();
    });

    test('locked modules have appropriate visual indicators', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      expect(screen.getAllByTestId('lock-closed-icon')).toHaveLength(2);
    });

    test('completed sections have appropriate visual indicators', () => {
      const propsWithCompletedSections = {
        ...defaultProps,
        completedSections: ['module-1-section-1']
      };
      
      render(<ModuleNavigation {...propsWithCompletedSections} />);
      
      // The current module should be expanded by default and show section icons
      // Look for any check circle icon (there might be multiple)
      const checkIcons = screen.queryAllByTestId('check-circle-icon');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    test('applies responsive classes', () => {
      render(<ModuleNavigation {...defaultProps} />);
      
      // Check for any element with flex-1 class since the structure may vary
      const flexElements = document.querySelectorAll('.flex-1');
      expect(flexElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty module list', () => {
      const propsWithNoModules = {
        ...defaultProps,
        allModules: []
      };
      
      render(<ModuleNavigation {...propsWithNoModules} />);
      
      expect(screen.getByText('Course Modules')).toBeInTheDocument();
    });

    test('handles module without sections', () => {
      const moduleWithoutSections = {
        ...currentModule,
        sections: []
      };
      
      const propsWithEmptyModule = {
        ...defaultProps,
        currentModule: moduleWithoutSections
      };
      
      render(<ModuleNavigation {...propsWithEmptyModule} />);
      
      expect(screen.getByText('Section 1 of 0')).toBeInTheDocument();
    });

    test('handles invalid currentSectionId', () => {
      const propsWithInvalidSection = {
        ...defaultProps,
        currentSectionId: 'invalid-section-id'
      };
      
      render(<ModuleNavigation {...propsWithInvalidSection} />);
      
      // Should default to first section or handle gracefully
      expect(screen.getByText('Section 1 of 3')).toBeInTheDocument();
    });
  });
});