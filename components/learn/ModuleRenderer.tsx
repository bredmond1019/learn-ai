'use client';

import { Module } from '@/types/module';
import { CodeBlock } from '@/components/ui/code-block';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ModuleRendererProps {
  module: Module;
  locale: string;
}

export function ModuleRenderer({ module, locale }: ModuleRendererProps) {
  const renderMDXContent = (content: string) => {
    // Extract frontmatter if present
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    let processedContent = content.replace(frontmatterRegex, '');
    
    // Remove import statements
    const importRegex = /^import\s+.*$/gm;
    processedContent = processedContent.replace(importRegex, '');
    
    // Remove anchor tags from headers
    processedContent = processedContent.replace(/\s*\{#[^}]+\}/g, '');
    
    // Handle custom components that might not render
    processedContent = processedContent
      .replace(/<CodeExample[^>]*>[\s\S]*?<\/CodeExample>/g, (match) => {
        // Extract props from CodeExample
        const titleMatch = match.match(/title=["']([^"']+)["']/);
        const languageMatch = match.match(/language=["']([^"']+)["']/);
        
        // Extract code from the code prop - handle template literals
        const codeMatch = match.match(/code=\{`([\s\S]*?)`\}/);
        
        const title = titleMatch ? titleMatch[1] : '';
        const code = codeMatch ? codeMatch[1] : '';
        const language = languageMatch ? languageMatch[1] : 'typescript';
        
        return `### ${title}\n\n\`\`\`${language}\n${code}\n\`\`\``;
      })
      .replace(/<Callout[^>]*>([\s\S]*?)<\/Callout>/g, (match, content) => {
        const typeMatch = match.match(/type=["']([^"']+)["']/);
        const type = typeMatch ? typeMatch[1] : 'info';
        return `> **${type.toUpperCase()}**: ${content.trim()}`;
      })
      .replace(/<Diagram[^>]*\/>/g, '*[Diagram]*')
      .replace(/<Exercise[^>]*\/>/g, '*[Exercise]*');
    
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mb-3 mt-6 text-gray-900 dark:text-gray-100">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mb-2 mt-4 text-gray-900 dark:text-gray-100">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mb-2 mt-3 text-gray-900 dark:text-gray-100">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc pl-6 space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal pl-6 space-y-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 dark:text-gray-300">{children}</li>
          ),
          code: ({ className, children, ...props }: any) => {
            const inline = !!(props.inline);
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'typescript';
            
            if (!inline && typeof children === 'string') {
              return (
                <div className="mb-4">
                  <CodeBlock
                    code={children}
                    language={language}
                    showLineNumbers={true}
                  />
                </div>
              );
            }
            
            return (
              <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-gray-700 dark:text-gray-300">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    );
  };

  const renderQuizSection = (section: any) => {
    const quiz = section.content;
    return (
      <>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {quiz.title}
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          {quiz.description}
        </p>
        <div className="space-y-6">
          {quiz.questions.map((question: any, qIndex: number) => (
            <div key={question.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
                {qIndex + 1}. {question.question}
              </p>
              {question.type === 'multiple-choice' && (
                <ul className="space-y-2">
                  {question.options.map((option: any) => (
                    <li key={option.id} className="flex items-start">
                      <span className="mr-2 font-mono text-sm">{option.id})</span>
                      <span className="text-gray-700 dark:text-gray-300">{option.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {question.type === 'true-false' && (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  True or False question
                </p>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderCodeExamples = (codeExamples: any[]) => {
    if (!codeExamples || codeExamples.length === 0) return null;
    
    return (
      <div className="space-y-4 mt-6">
        {codeExamples.map((example) => (
          <div key={example.id}>
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {example.title}
            </h4>
            {example.description && (
              <p className="mb-2 text-gray-700 dark:text-gray-300">{example.description}</p>
            )}
            <CodeBlock
              code={example.code}
              language={example.language || 'typescript'}
              showLineNumbers={true}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {module.sections.map((section, index) => (
        <div key={section.id || index} className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
          {section.type === 'quiz' && section.content?.type === 'quiz' ? (
            renderQuizSection(section)
          ) : section.content?.type === 'mdx' && section.content.source ? (
            <>
              {renderMDXContent(section.content.source)}
              {section.content.codeExamples && renderCodeExamples(section.content.codeExamples)}
            </>
          ) : (
            <>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {section.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Module content not available.
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}