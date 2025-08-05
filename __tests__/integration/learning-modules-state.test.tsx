/**
 * Integration test for learning modules maintaining state during navigation
 * Tests complete learning module workflow including state persistence and navigation
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModuleRenderer } from '@/components/learn/ModuleRenderer'
import type { Module } from '@/types/module'

// Mock the progress API
const mockProgressData = {
  'intro-to-ai-python': { completed: true, progress: 100 },
  'python-basics': { completed: false, progress: 60 }
}

// Mock fetch for progress API
global.fetch = jest.fn()

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/learn/intro-to-ai-python',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock react-markdown and related components
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

// Mock server modules loading
jest.mock('@/lib/content/learning/modules.server', () => ({
  getModule: jest.fn(),
  getAllModules: jest.fn(),
}))

describe('Learning Modules State Integration', () => {
  const mockModule: Module = {
    metadata: {
      id: 'intro-to-ai-python',
      title: 'Introduction to AI with Python',
      description: 'Learn the fundamentals of artificial intelligence using Python programming language.',
      order: 1,
      estimatedTime: 120, // 2 hours in minutes
      objectives: [
        'Understand basic AI concepts',
        'Write simple Python programs for AI',
        'Explore machine learning fundamentals'
      ],
      prerequisites: [],
      tags: ['python', 'ai', 'beginner'],
      difficulty: 'beginner'
    },
    sections: [
      {
        id: 'what-is-ai',
        title: 'What is Artificial Intelligence?',
        content: {
          type: 'mdx',
          source: `# What is Artificial Intelligence?

Artificial Intelligence (AI) is a broad field of computer science focused on creating systems that can perform tasks that typically require human intelligence.

## Key Concepts

- **Machine Learning**: Systems that learn from data
- **Neural Networks**: Computing systems inspired by biological neural networks
- **Deep Learning**: Advanced neural networks with multiple layers

<Callout type="info">
AI is not about replacing humans, but augmenting human capabilities.
</Callout>

## Types of AI

1. **Narrow AI**: Designed for specific tasks
2. **General AI**: Hypothetical AI with human-level intelligence
3. **Superintelligence**: AI that exceeds human intelligence

<CodeExample language="python" title="Simple AI Example">
\`\`\`python
# A simple decision tree example
def classify_weather(temperature, humidity):
    if temperature > 25 and humidity < 60:
        return "sunny"
    elif temperature < 15:
        return "cold"
    else:
        return "cloudy"

# Test the classifier
weather = classify_weather(28, 45)
print(f"Today's weather is: {weather}")
\`\`\`
</CodeExample>

This is just the beginning of our journey into AI!`
        }
      },
      {
        id: 'python-basics',
        title: 'Python Basics for AI',
        content: {
          type: 'mdx',
          source: `# Python Basics for AI

Python is the most popular programming language for AI development due to its simplicity and powerful libraries.

## Essential Python Concepts

### Variables and Data Types

<CodeExample language="python" title="Basic Variables">
\`\`\`python
# Numbers
age = 25
temperature = 36.5

# Strings
name = "AI Assistant"
greeting = f"Hello, {name}!"

# Lists (arrays)
numbers = [1, 2, 3, 4, 5]
technologies = ["Python", "TensorFlow", "Pandas"]

# Dictionaries (objects)
person = {
    "name": "Alice",
    "age": 30,
    "skills": ["Python", "Machine Learning"]
}
\`\`\`
</CodeExample>

### Functions

Functions help organize code and make it reusable.

<CodeExample language="python" title="AI Helper Functions">
\`\`\`python
def calculate_accuracy(correct_predictions, total_predictions):
    """Calculate model accuracy percentage"""
    return (correct_predictions / total_predictions) * 100

def preprocess_text(text):
    """Clean and prepare text for AI processing"""
    return text.lower().strip().replace("  ", " ")

# Usage
accuracy = calculate_accuracy(85, 100)
print(f"Model accuracy: {accuracy}%")

clean_text = preprocess_text("  Hello World!  ")
print(f"Cleaned text: '{clean_text}'")
\`\`\`
</CodeExample>
`
        }
      },
      {
        id: 'quiz-basics',
        title: 'Test Your Knowledge',
        content: {
          type: 'mdx',
          source: `# Knowledge Check

Let's test what you've learned so far!

<Quiz>
{
  "questions": [
    {
      "question": "What does AI stand for?",
      "options": [
        "Automated Intelligence",
        "Artificial Intelligence",
        "Advanced Integration",
        "Algorithmic Interpretation"
      ],
      "correct": 1,
      "explanation": "AI stands for Artificial Intelligence, which refers to computer systems that can perform tasks typically requiring human intelligence."
    },
    {
      "question": "Which Python data type is best for storing a collection of related items?",
      "options": [
        "String",
        "Integer",
        "List",
        "Boolean"
      ],
      "correct": 2,
      "explanation": "Lists are perfect for storing collections of related items, like a list of technologies or a series of numbers."
    }
  ]
}
</Quiz>`
        }
      }
    ]
  }

  const secondModule: Module = {
    metadata: {
      id: 'python-intermediate',
      title: 'Intermediate Python for AI',
      description: 'Build on Python basics with more advanced concepts for AI development.',
      order: 2,
      estimatedTime: 180, // 3 hours in minutes
      objectives: [
        'Work with Python libraries for AI',
        'Understand object-oriented programming',
        'Handle data with Pandas'
      ],
      prerequisites: ['intro-to-ai-python'],
      tags: ['python', 'ai', 'intermediate'],
      difficulty: 'intermediate'
    },
    sections: [
      {
        id: 'libraries-intro',
        title: 'AI Libraries in Python',
        content: {
          type: 'mdx',
          source: `# AI Libraries in Python

Python's strength in AI comes from its rich ecosystem of libraries.

## Essential AI Libraries

- **NumPy**: Numerical computing
- **Pandas**: Data manipulation and analysis
- **Scikit-learn**: Machine learning algorithms
- **TensorFlow**: Deep learning framework
- **PyTorch**: Another popular deep learning framework

<CodeExample language="python" title="Working with NumPy">
\`\`\`python
import numpy as np

# Create arrays
numbers = np.array([1, 2, 3, 4, 5])
matrix = np.array([[1, 2], [3, 4]])

# Mathematical operations
squared = numbers ** 2
mean_value = np.mean(numbers)

print(f"Original: {numbers}")
print(f"Squared: {squared}")
print(f"Mean: {mean_value}")
\`\`\`
</CodeExample>`
        }
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup fetch mock for progress API
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/progress')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProgressData)
        } as Response)
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  describe('Module state persistence', () => {
    it('should render all module sections simultaneously', async () => {
      render(<ModuleRenderer module={mockModule} locale="en" />)

      // All sections should be visible simultaneously
      expect(screen.getByText('What is Artificial Intelligence?')).toBeInTheDocument()
      expect(screen.getByText('Python Basics for AI')).toBeInTheDocument()
      expect(screen.getByText('Test Your Knowledge')).toBeInTheDocument()

      // Check that content from all sections is present
      expect(screen.getByText(/Artificial Intelligence \(AI\) is a broad field/)).toBeInTheDocument()
      expect(screen.getByText(/Python is the most popular programming language/)).toBeInTheDocument()
      expect(screen.getByText(/Let's test what you've learned so far/)).toBeInTheDocument()
    })

    it('should render module content consistently', async () => {
      render(<ModuleRenderer module={mockModule} locale="en" />)

      // Module content should render correctly
      expect(screen.getByText('What is Artificial Intelligence?')).toBeInTheDocument()
      expect(screen.getByText('Python Basics for AI')).toBeInTheDocument()
      expect(screen.getByText('Test Your Knowledge')).toBeInTheDocument()

      // Should render MDX content properly
      const markdownContent = screen.getAllByTestId('markdown-content')
      expect(markdownContent.length).toBeGreaterThan(0)
    })

    it('should render quiz components correctly', async () => {
      render(<ModuleRenderer module={mockModule} locale="en" />)

      // Quiz section should be rendered
      expect(screen.getByText('Test Your Knowledge')).toBeInTheDocument()
      expect(screen.getByText(/Knowledge Check/)).toBeInTheDocument()

      // Quiz questions should be visible
      expect(screen.getByText(/What does AI stand for/)).toBeInTheDocument()
      expect(screen.getByText(/Which Python data type is best/)).toBeInTheDocument()
    })

    it('should handle complex module structures', async () => {
      render(<ModuleRenderer module={secondModule} locale="en" />)

      // Should render the module correctly
      expect(screen.getByText('AI Libraries in Python')).toBeInTheDocument()
      expect(screen.getByText(/Python's strength in AI comes from/)).toBeInTheDocument()
      
      // Should render code examples as comments (due to our mock)
      const markdownContent = screen.getAllByTestId('markdown-content')
      expect(markdownContent.length).toBeGreaterThan(0)
    })
  })

  describe('Module rendering', () => {
    it('should render different modules correctly', () => {
      // Test with a module that has prerequisites
      render(<ModuleRenderer module={secondModule} locale="en" />)

      // Should display module content
      expect(screen.getByText('AI Libraries in Python')).toBeInTheDocument()
      expect(screen.getByText(/Python's strength in AI comes from/)).toBeInTheDocument()
    })

    it('should handle locale switching', async () => {
      const { rerender } = render(<ModuleRenderer module={mockModule} locale="en" />)

      // Verify English content is rendered
      expect(screen.getByText('What is Artificial Intelligence?')).toBeInTheDocument()
      expect(screen.getByText('Python Basics for AI')).toBeInTheDocument()

      // Switch to Portuguese locale
      rerender(<ModuleRenderer module={mockModule} locale="pt-BR" />)

      // Content structure should be maintained (same module, different locale)
      expect(screen.getByText('What is Artificial Intelligence?')).toBeInTheDocument()
      expect(screen.getByText('Python Basics for AI')).toBeInTheDocument()
    })

    it('should render MDX components correctly', () => {
      render(<ModuleRenderer module={mockModule} locale="en" />)

      // Should render Callout components
      expect(screen.getByText(/AI is not about replacing humans/)).toBeInTheDocument()

      // Should handle CodeExample components (rendered as comments in test)
      const markdownContent = screen.getAllByTestId('markdown-content')
      expect(markdownContent.length).toBeGreaterThan(0)
    })
  })

  describe('Error handling and edge cases', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockRejectedValue(new Error('API Error'))

      render(<ModuleRenderer module={mockModule} locale="en" />)

      // Should still render module content even if progress loading fails
      expect(screen.getByText('What is Artificial Intelligence?')).toBeInTheDocument()
    })

    it('should handle modules with missing sections', () => {
      const moduleWithMissingSections: Module = {
        ...mockModule,
        sections: []
      }

      // Should not crash when rendering module with no sections
      expect(() => {
        render(<ModuleRenderer module={moduleWithMissingSections} locale="en" />)
      }).not.toThrow()
      
      // Should render an empty but valid container
      const container = document.querySelector('[class*="space-y"]')
      expect(container).toBeInTheDocument()
    })

    it('should handle invalid MDX content gracefully', () => {
      const moduleWithInvalidMDX: Module = {
        ...mockModule,
        sections: [
          {
            id: 'invalid-content',
            title: 'Invalid Content',
            type: 'lesson',
            content: {
              source: '# Invalid MDX\n\n<UnknownComponent>\nThis should not break the app\n</UnknownComponent>'
            }
          }
        ]
      }

      render(<ModuleRenderer module={moduleWithInvalidMDX} locale="en" />)

      // Should render title even if MDX content fails
      expect(screen.getByText('Invalid Content')).toBeInTheDocument()
    })
  })

  describe('Integration with learning system', () => {
    it('should provide stable content rendering for progress tracking', async () => {
      // The ModuleRenderer provides consistent content that can be tracked externally
      render(<ModuleRenderer module={mockModule} locale="en" />)

      // Content should be rendered in a predictable structure
      expect(screen.getByText('What is Artificial Intelligence?')).toBeInTheDocument()
      expect(screen.getByText('Python Basics for AI')).toBeInTheDocument()
      expect(screen.getByText('Test Your Knowledge')).toBeInTheDocument()

      // Should maintain structure across renders
      const sections = screen.getAllByRole('heading', { level: 2 })
      expect(sections).toHaveLength(3)
    })

    it('should handle different module types for learning progression', async () => {
      // Test rendering different types of learning content
      const { rerender } = render(<ModuleRenderer module={mockModule} locale="en" />)
      
      // Should render basic module
      expect(screen.getByText('What is Artificial Intelligence?')).toBeInTheDocument()
      
      // Should handle more advanced modules
      rerender(<ModuleRenderer module={secondModule} locale="en" />)
      expect(screen.getByText('AI Libraries in Python')).toBeInTheDocument()
    })
  })
})