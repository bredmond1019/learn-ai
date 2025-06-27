import { render, screen } from '@testing-library/react';
import { ModuleRenderer } from './ModuleRenderer';
import { Module } from '@/types/module';

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>;
  };
});

// Mock remark-gfm
jest.mock('remark-gfm', () => () => {});

// Mock CodeBlock component
jest.mock('@/components/ui/code-block', () => ({
  CodeBlock: ({ code, language }: { code: string; language: string }) => (
    <pre data-language={language}>{code}</pre>
  )
}));

// Mock dynamic import for Diagram component
jest.mock('next/dynamic', () => () => {
  const MockedDiagram = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mermaid-diagram" className="mermaid">{children}</div>
  );
  return MockedDiagram;
});

describe('ModuleRenderer', () => {
  const mockModule: Module = {
    metadata: {
      id: 'test-module',
      title: 'Test Module',
      description: 'Test module description',
      order: 1,
      estimatedTime: 10,
      objectives: ['Objective 1', 'Objective 2'],
      prerequisites: [],
      tags: ['test'],
      difficulty: 'beginner'
    },
    sections: [
      {
        id: 'section-1',
        title: 'Introduction',
        content: {
          type: 'mdx',
          source: '# Introduction\n\nThis is the introduction section with **bold** text.'
        }
      },
      {
        id: 'section-2',
        title: 'Code Example',
        content: {
          type: 'mdx',
          source: 'Here is a code block:\n\n```python\nprint("Hello, World!")\n```'
        }
      }
    ]
  };

  it('should render MDX content correctly', () => {
    render(<ModuleRenderer module={mockModule} locale="en" />);
    
    // Check if sections are rendered
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Code Example')).toBeInTheDocument();
    
    // Check if markdown content is processed
    const markdownContents = screen.getAllByTestId('markdown-content');
    expect(markdownContents).toHaveLength(2);
    expect(markdownContents[0]).toHaveTextContent('This is the introduction section with **bold** text.');
  });

  it('should handle Quiz components', () => {
    const moduleWithQuiz: Module = {
      ...mockModule,
      sections: [
        {
          id: 'quiz-section',
          title: 'Quiz Time',
          content: {
            type: 'mdx',
            source: `Let's test your knowledge:

<Quiz questions={[
  {
    id: "q1",
    question: "What is React?",
    options: ["A library", "A framework", "A language", "A database"],
    correctAnswer: 0,
    explanation: "React is a JavaScript library for building user interfaces."
  }
]} />`
          }
        }
      ]
    };

    render(<ModuleRenderer module={moduleWithQuiz} locale="en" />);
    
    // Check if quiz is rendered
    expect(screen.getByText('1. What is React?')).toBeInTheDocument();
    expect(screen.getByText('A library')).toBeInTheDocument();
    expect(screen.getByText('A framework')).toBeInTheDocument();
    expect(screen.getByText('Show Answer')).toBeInTheDocument();
  });

  it('should handle CodeExample components', () => {
    const moduleWithCodeExample: Module = {
      ...mockModule,
      sections: [
        {
          id: 'code-section',
          title: 'Code Examples',
          content: {
            type: 'mdx',
            source: `Here's an example:

<CodeExample 
  title="Python Hello World" 
  language="python"
  fileName="hello.py"
  code={\`def greet(name):
    return f"Hello, {name}!"
    
print(greet("World"))\`} 
/>`
          }
        }
      ]
    };

    render(<ModuleRenderer module={moduleWithCodeExample} locale="en" />);
    
    // Check if code example is rendered
    expect(screen.getByText(/def greet/)).toBeInTheDocument();
    expect(screen.getByText(/return f"Hello,/)).toBeInTheDocument();
    expect(screen.getByText(/print\(greet\("World"\)\)/)).toBeInTheDocument();
  });

  it.skip('should handle Diagram components with Mermaid', () => {
    const moduleWithDiagram: Module = {
      ...mockModule,
      sections: [
        {
          id: 'diagram-section',
          title: 'Architecture Diagram',
          content: {
            type: 'mdx',
            source: `Here's the architecture:

<Diagram>
graph TD
    A[Client] --> B[API Gateway]
    B --> C[Service 1]
    B --> D[Service 2]
</Diagram>`
          }
        }
      ]
    };

    render(<ModuleRenderer module={moduleWithDiagram} locale="en" />);
    
    // Check if diagram is rendered
    const diagram = screen.getByTestId('mermaid-diagram');
    expect(diagram).toBeInTheDocument();
    expect(diagram).toHaveClass('mermaid');
  });

  it('should handle Callout components', () => {
    const moduleWithCallout: Module = {
      ...mockModule,
      sections: [
        {
          id: 'callout-section',
          title: 'Important Notes',
          content: {
            type: 'mdx',
            source: `Pay attention:

<Callout type="warning">
This is a warning message that you should read carefully.
</Callout>

<Callout type="info">
This is an informational note.
</Callout>`
          }
        }
      ]
    };

    render(<ModuleRenderer module={moduleWithCallout} locale="en" />);
    
    // Check if callouts are rendered
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('This is a warning message that you should read carefully.')).toBeInTheDocument();
    expect(screen.getByText('💡')).toBeInTheDocument();
    expect(screen.getByText('This is an informational note.')).toBeInTheDocument();
  });

  it('should preserve Python code examples functionality', () => {
    const moduleWithPythonCode: Module = {
      ...mockModule,
      sections: [
        {
          id: 'python-section',
          title: 'Python Programming',
          content: {
            type: 'mdx',
            source: `Let's write some Python:

\`\`\`python
# This is a Python example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test the function
for i in range(10):
    print(f"fibonacci({i}) = {fibonacci(i)}")
\`\`\`

This demonstrates recursion in Python.`
          }
        }
      ]
    };

    render(<ModuleRenderer module={moduleWithPythonCode} locale="en" />);
    
    // Check if Python code is rendered
    const codeContent = screen.getByText(/def fibonacci/);
    expect(codeContent).toBeInTheDocument();
    // Since we're mocking react-markdown, we just check the content is there
    expect(screen.getByText(/fibonacci\(n-1\)/)).toBeInTheDocument();
    expect(screen.getByText(/This demonstrates recursion in Python/)).toBeInTheDocument();
  });
});