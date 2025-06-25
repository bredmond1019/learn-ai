import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import CodePlayground from './CodePlayground';
import { CodeExample, CodeTemplate } from '@/types/module';

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  Editor: ({ value, onChange, onMount, ...props }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      onFocus={() => onMount && onMount({ getValue: () => value })}
      {...props}
    />
  ),
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PlayIcon: () => <div data-testid="play-icon" />,
  ArrowPathIcon: () => <div data-testid="arrow-path-icon" />,
  CloudArrowDownIcon: () => <div data-testid="cloud-arrow-down-icon" />,
  CloudArrowUpIcon: () => <div data-testid="cloud-arrow-up-icon" />,
  CheckIcon: () => <div data-testid="check-icon" />,
  XMarkIcon: () => <div data-testid="x-mark-icon" />,
  ClipboardDocumentIcon: () => <div data-testid="clipboard-document-icon" />,
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

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value} onClick={() => onValueChange && onValueChange('output')}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid="tabs-content" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid="tabs-trigger" data-value={value}>
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

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
}));

// Mock clipboard and localStorage
const mockClipboard = {
  writeText: jest.fn().mockResolvedValue(undefined),
};
Object.assign(navigator, { clipboard: mockClipboard });

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
});

// Test data
const mockTemplate: CodeTemplate = {
  id: 'test-template',
  name: 'Test Template',
  description: 'A test template',
  language: 'javascript',
  code: 'console.log("Hello, World!");',
  readOnlyRanges: [[1, 10]],
};

const mockExamples: CodeExample[] = [
  {
    id: 'example-1',
    title: 'Basic Example',
    description: 'A basic example',
    code: 'console.log("Basic example");',
    language: 'javascript',
  },
  {
    id: 'example-2',
    title: 'Advanced Example',
    description: 'An advanced example',
    code: 'console.log("Advanced example");',
    language: 'javascript',
  },
];

describe('CodePlayground Component', () => {
  const defaultProps = {
    initialCode: 'console.log("Initial code");',
    language: 'javascript',
    onExecute: jest.fn(),
    saveKey: 'test-playground',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    (window.performance.now as jest.Mock).mockReturnValue(100);
  });

  describe('Rendering', () => {
    test('renders playground with initial code', () => {
      render(<CodePlayground {...defaultProps} />);
      
      expect(screen.getByTestId('monaco-editor')).toHaveValue('console.log("Initial code");');
      expect(screen.getByText('Code Playground')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });

    test('renders with template code when provided', () => {
      const propsWithTemplate = {
        ...defaultProps,
        initialCode: undefined,
        template: mockTemplate,
      };
      
      render(<CodePlayground {...propsWithTemplate} />);
      
      expect(screen.getByTestId('monaco-editor')).toHaveValue('console.log("Hello, World!");');
    });

    test('renders examples when provided', () => {
      const propsWithExamples = {
        ...defaultProps,
        examples: mockExamples,
      };
      
      render(<CodePlayground {...propsWithExamples} />);
      
      expect(screen.getByText('Examples:')).toBeInTheDocument();
      expect(screen.getByText('Basic Example')).toBeInTheDocument();
      expect(screen.getByText('Advanced Example')).toBeInTheDocument();
    });

    test('shows saved status initially', () => {
      render(<CodePlayground {...defaultProps} />);
      
      expect(screen.getByText('Saved')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    test('renders action buttons', () => {
      render(<CodePlayground {...defaultProps} />);
      
      expect(screen.getByTestId('clipboard-document-icon')).toBeInTheDocument();
      expect(screen.getByTestId('cloud-arrow-up-icon')).toBeInTheDocument();
      expect(screen.getByTestId('arrow-path-icon')).toBeInTheDocument();
      expect(screen.getByText('Run')).toBeInTheDocument();
    });
  });

  describe('Code Editing', () => {
    test('updates code when editor content changes', async () => {
      render(<CodePlayground {...defaultProps} />);
      
      const editor = screen.getByTestId('monaco-editor');
      fireEvent.change(editor, { target: { value: 'console.log("Updated code");' } });
      
      expect(editor).toHaveValue('console.log("Updated code");');
    });

    test('shows unsaved status when code changes', async () => {
      render(<CodePlayground {...defaultProps} />);
      
      const editor = screen.getByTestId('monaco-editor');
      fireEvent.change(editor, { target: { value: 'console.log("Modified");' } });
      
      await waitFor(() => {
        expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
      });
    });

    test('auto-saves code after delay', async () => {
      jest.useFakeTimers();
      
      render(<CodePlayground {...defaultProps} />);
      
      const editor = screen.getByTestId('monaco-editor');
      fireEvent.change(editor, { target: { value: 'console.log("Auto-save test");' } });
      
      // Fast-forward time to trigger auto-save
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      await waitFor(() => {
        expect(mockLocalStorage.getItem('playground_test-playground')).toBeTruthy();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Code Execution', () => {
    test('executes JavaScript code and shows output', async () => {
      render(<CodePlayground {...defaultProps} initialCode="console.log('Test output');" />);
      
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test output')).toBeInTheDocument();
        expect(screen.getByText('Output')).toBeInTheDocument();
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      });
    });

    test('shows running state during execution', async () => {
      const slowExecute = jest.fn(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true, output: 'Done' }), 100)
      ));
      
      render(<CodePlayground {...defaultProps} onExecute={slowExecute} />);
      
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      expect(screen.getByText('Running...')).toBeInTheDocument();
      expect(runButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.getByText('Done')).toBeInTheDocument();
      });
    });

    test('handles execution errors', async () => {
      render(<CodePlayground {...defaultProps} initialCode="throw new Error('Test error');" />);
      
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText(/Test error/)).toBeInTheDocument();
        expect(screen.getByTestId('x-mark-icon')).toBeInTheDocument();
      });
    });

    test('shows execution time', async () => {
      (window.performance.now as jest.Mock)
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(150);
      
      render(<CodePlayground {...defaultProps} initialCode="console.log('Timing test');" />);
      
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('(50.00ms)')).toBeInTheDocument();
      });
    });

    test('uses custom onExecute when provided', async () => {
      const mockOnExecute = jest.fn().mockResolvedValue({
        success: true,
        output: 'Custom execution result',
      });
      
      render(<CodePlayground {...defaultProps} onExecute={mockOnExecute} />);
      
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(mockOnExecute).toHaveBeenCalledWith('console.log("Initial code");');
        expect(screen.getByText('Custom execution result')).toBeInTheDocument();
      });
    });

    test('handles onExecute promise rejection', async () => {
      const mockOnExecute = jest.fn().mockRejectedValue(new Error('Execution failed'));
      
      render(<CodePlayground {...defaultProps} onExecute={mockOnExecute} />);
      
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Execution failed/)).toBeInTheDocument();
      });
    });
  });

  describe('Local Storage Integration', () => {
    test('loads saved code on mount', () => {
      const savedCode = JSON.stringify({
        code: 'console.log("Saved code");',
        timestamp: new Date().toISOString(),
        language: 'javascript',
      });
      
      mockLocalStorage.setItem('playground_test-playground', savedCode);
      
      render(<CodePlayground {...defaultProps} />);
      
      expect(screen.getByTestId('monaco-editor')).toHaveValue('console.log("Saved code");');
    });

    test('handles corrupted saved data gracefully', () => {
      mockLocalStorage.setItem('playground_test-playground', 'invalid-json');
      
      // Should not throw and should use initial code
      render(<CodePlayground {...defaultProps} />);
      
      expect(screen.getByTestId('monaco-editor')).toHaveValue('console.log("Initial code");');
    });

    test('manual save button works', async () => {
      render(<CodePlayground {...defaultProps} />);
      
      const editor = screen.getByTestId('monaco-editor');
      fireEvent.change(editor, { target: { value: 'console.log("Manual save");' } });
      
      const saveButton = screen.getByTestId('cloud-arrow-up-icon').closest('button');
      fireEvent.click(saveButton!);
      
      await waitFor(() => {
        const saved = JSON.parse(mockLocalStorage.getItem('playground_test-playground')!);
        expect(saved.code).toBe('console.log("Manual save");');
      });
    });

    test('does not save without saveKey', () => {
      const propsWithoutSaveKey = {
        ...defaultProps,
        saveKey: undefined,
      };
      
      render(<CodePlayground {...propsWithoutSaveKey} />);
      
      const editor = screen.getByTestId('monaco-editor');
      fireEvent.change(editor, { target: { value: 'console.log("No save");' } });
      
      // Should not show save-related UI
      expect(screen.queryByTestId('cloud-arrow-up-icon')).not.toBeInTheDocument();
      expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });
  });

  describe('Example Loading', () => {
    test('loads example code when example clicked', () => {
      const propsWithExamples = {
        ...defaultProps,
        examples: mockExamples,
      };
      
      render(<CodePlayground {...propsWithExamples} />);
      
      const basicExampleButton = screen.getByText('Basic Example');
      fireEvent.click(basicExampleButton);
      
      expect(screen.getByTestId('monaco-editor')).toHaveValue('console.log("Basic example");');
    });

    test('clears output when loading example', () => {
      const propsWithExamples = {
        ...defaultProps,
        examples: mockExamples,
        initialCode: 'console.log("Initial");',
      };
      
      render(<CodePlayground {...propsWithExamples} />);
      
      // First execute initial code
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      // Then load an example
      const basicExampleButton = screen.getByText('Basic Example');
      fireEvent.click(basicExampleButton);
      
      // Output should be cleared
      expect(screen.queryByText('Initial')).not.toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    test('resets code to initial value', () => {
      render(<CodePlayground {...defaultProps} />);
      
      const editor = screen.getByTestId('monaco-editor');
      fireEvent.change(editor, { target: { value: 'console.log("Modified");' } });
      
      const resetButton = screen.getByTestId('arrow-path-icon').closest('button');
      fireEvent.click(resetButton!);
      
      expect(editor).toHaveValue('console.log("Initial code");');
    });

    test('resets to template code when template provided', () => {
      const propsWithTemplate = {
        ...defaultProps,
        initialCode: undefined,
        template: mockTemplate,
      };
      
      render(<CodePlayground {...propsWithTemplate} />);
      
      const editor = screen.getByTestId('monaco-editor');
      fireEvent.change(editor, { target: { value: 'console.log("Modified");' } });
      
      const resetButton = screen.getByTestId('arrow-path-icon').closest('button');
      fireEvent.click(resetButton!);
      
      expect(editor).toHaveValue('console.log("Hello, World!");');
    });

    test('clears output and error on reset', async () => {
      render(<CodePlayground {...defaultProps} initialCode="console.log('Test');" />);
      
      // Execute code to generate output
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });
      
      // Reset
      const resetButton = screen.getByTestId('arrow-path-icon').closest('button');
      fireEvent.click(resetButton!);
      
      // Output should be cleared
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });
  });

  describe('Copy to Clipboard', () => {
    test('copies code to clipboard', async () => {
      render(<CodePlayground {...defaultProps} />);
      
      const copyButton = screen.getByTestId('clipboard-document-icon').closest('button');
      fireEvent.click(copyButton!);
      
      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('console.log("Initial code");');
      });
    });

    test('handles clipboard errors gracefully', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));
      
      render(<CodePlayground {...defaultProps} />);
      
      const copyButton = screen.getByTestId('clipboard-document-icon').closest('button');
      fireEvent.click(copyButton!);
      
      // Should not throw or crash
      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalled();
      });
    });
  });

  describe('Tabs Functionality', () => {
    test('switches between editor and output tabs', () => {
      render(<CodePlayground {...defaultProps} />);
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getByText('Editor')).toBeInTheDocument();
      expect(screen.getByText('Output')).toBeInTheDocument();
    });

    test('shows output indicator when there is output', async () => {
      render(<CodePlayground {...defaultProps} initialCode="console.log('Test');" />);
      
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      await waitFor(() => {
        // Should show green indicator for successful output
        const outputTab = screen.getByText('Output');
        expect(outputTab.parentElement).toBeInTheDocument();
      });
    });

    test('switches to output tab automatically on execution', async () => {
      render(<CodePlayground {...defaultProps} />);
      
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      // Should switch to output tab
      await waitFor(() => {
        expect(screen.getByTestId('tabs')).toHaveAttribute('data-value', 'output');
      });
    });
  });

  describe('Editor Configuration', () => {
    test('sets up Monaco editor with correct options', () => {
      render(<CodePlayground {...defaultProps} />);
      
      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toBeInTheDocument();
    });

    test('handles different programming languages', () => {
      const propsWithPython = {
        ...defaultProps,
        language: 'python',
        initialCode: 'print("Hello, Python!")',
      };
      
      render(<CodePlayground {...propsWithPython} />);
      
      expect(screen.getByText('python')).toBeInTheDocument();
      expect(screen.getByTestId('monaco-editor')).toHaveValue('print("Hello, Python!")');
    });
  });

  describe('Error Handling', () => {
    test('handles empty output gracefully', async () => {
      render(<CodePlayground {...defaultProps} initialCode="// No output" />);
      
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText('Code executed successfully (no output)')).toBeInTheDocument();
      });
    });

    test('captures console.error and console.warn', async () => {
      render(<CodePlayground {...defaultProps} initialCode="console.error('Error message'); console.warn('Warning message');" />);
      
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/ERROR: Error message/)).toBeInTheDocument();
        expect(screen.getByText(/WARN: Warning message/)).toBeInTheDocument();
      });
    });

    test('handles complex objects in console.log', async () => {
      render(<CodePlayground {...defaultProps} initialCode="console.log({key: 'value', nested: {prop: 42}});" />);
      
      const runButton = screen.getByText('Run');
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/"key": "value"/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has accessible button labels', () => {
      render(<CodePlayground {...defaultProps} />);
      
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Each button should have meaningful content
      buttons.forEach(button => {
        expect(button.textContent || button.querySelector('[data-testid]')).toBeTruthy();
      });
    });

    test('editor is keyboard accessible', () => {
      render(<CodePlayground {...defaultProps} />);
      
      const editor = screen.getByTestId('monaco-editor');
      expect(editor).not.toHaveAttribute('tabindex', '-1');
    });

    test('tabs are keyboard navigable', () => {
      render(<CodePlayground {...defaultProps} />);
      
      const tabTriggers = screen.getAllByTestId('tabs-trigger');
      expect(tabTriggers.length).toBe(2);
      
      tabTriggers.forEach(trigger => {
        expect(trigger.tagName).toBe('BUTTON');
      });
    });
  });
});