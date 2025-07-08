'use client';

import { Module } from '@/types/module';
import { CodeBlock } from '@/components/ui/code-block';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { useMemo, useEffect } from 'react';

// Declare mermaid global
declare global {
  interface Window {
    mermaid: any;
  }
}

// Import mermaid for client-side rendering
let mermaidAPI: any = null;
if (typeof window !== 'undefined') {
  import('mermaid').then((m) => {
    mermaidAPI = m.default;
    mermaidAPI.initialize({ 
      startOnLoad: false,
      theme: 'default',
      themeVariables: {
        darkMode: document.documentElement.classList.contains('dark')
      }
    });
  });
}

// Import components that are used in MDX content
const Quiz = ({ questions }: { questions: any[] }) => {
  return (
    <div className="space-y-6">
      {questions.map((question: any, qIndex: number) => (
        <div key={question.id || qIndex} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            {qIndex + 1}. {question.question}
          </p>
          {question.options && (
            <ul className="space-y-2">
              {question.options.map((option: any, oIndex: number) => (
                <li key={oIndex} className="flex items-start">
                  <span className="mr-2 font-mono text-sm">{String.fromCharCode(65 + oIndex)})</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {typeof option === 'string' ? option : option.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {question.correctAnswer !== undefined && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Show Answer
              </summary>
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Correct Answer: {String.fromCharCode(65 + question.correctAnswer)}
                </p>
                {question.explanation && (
                  <p className="text-sm mt-1 text-blue-800 dark:text-blue-200">
                    {question.explanation}
                  </p>
                )}
              </div>
            </details>
          )}
        </div>
      ))}
    </div>
  );
};

const Callout = ({ type, title, children }: { type: string; title?: string; children: React.ReactNode }) => {
  const typeStyles: Record<string, string> = {
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    history: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20',
    tip: 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20',
    insight: 'border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/20'
  };

  const iconStyles: Record<string, string> = {
    info: '💡',
    warning: '⚠️',
    success: '✅',
    error: '❌',
    history: '📚',
    tip: '💡',
    insight: '🔍'
  };

  return (
    <div className={`border-l-4 p-4 my-4 rounded-r-lg ${typeStyles[type] || typeStyles.info}`}>
      <div className="flex items-start">
        <span className="mr-2 text-lg">{iconStyles[type] || iconStyles.info}</span>
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h4>
          )}
          <div className="text-gray-700 dark:text-gray-300">{children}</div>
        </div>
      </div>
    </div>
  );
};

interface ModuleRendererProps {
  module: Module;
  locale: string;
}

export function ModuleRenderer({ module, locale }: ModuleRendererProps) {
  // Initialize mermaid diagrams after render
  useEffect(() => {
    const renderMermaidDiagrams = async () => {
      if (typeof window !== 'undefined' && (window.mermaid || mermaidAPI)) {
        const mermaid = window.mermaid || mermaidAPI;
        
        // Find all mermaid elements that haven't been processed
        const mermaidElements = document.querySelectorAll('.mermaid:not([data-processed="true"])');
        
        for (const element of Array.from(mermaidElements)) {
          try {
            const graphDefinition = element.textContent || '';
            const graphId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
            
            // Render the diagram
            const { svg } = await mermaid.render(graphId, graphDefinition);
            
            // Replace the element content with the rendered SVG
            element.innerHTML = svg;
            element.setAttribute('data-processed', 'true');
          } catch (error) {
            console.error('Failed to render mermaid diagram:', error);
            element.innerHTML = '<p class="text-red-600">Failed to render diagram</p>';
          }
        }
      }
    };
    
    // Delay to ensure DOM is ready
    setTimeout(renderMermaidDiagrams, 100);
  }, [module]); // Re-run when module changes
  const parseAndRenderContent = (content: string) => {
    if (!content) return null;
    
    // Remove h2 headers since we display section titles from JSON
    // First, identify if there's an h3 immediately after h2 (with optional blank lines)
    let processedContent = content;
    
    // Replace h2 followed by h3 pattern
    processedContent = processedContent.replace(
      /^## [^\n]*\n+### [^\n]*/gm,
      ''
    );
    
    // Then remove any remaining h2 headers (like Knowledge Check)
    processedContent = processedContent.replace(/^## [^\n]*$/gm, '');
    
    // Process Quiz components with nested Question components
    processedContent = processedContent.replace(
      /<Quiz>([\s\S]*?)<\/Quiz>/g,
      (match, quizContent) => {
        try {
          // Extract Question components from within Quiz
          const questions = [];
          const questionRegex = /<Question\s+([\s\S]*?)\/>/g;
          let questionMatch;
          
          while ((questionMatch = questionRegex.exec(quizContent)) !== null) {
            const questionProps = questionMatch[1];
            const question: any = {};
            
            // Extract question text
            const questionTextMatch = questionProps.match(/question="([^"]*?)"/);
            if (questionTextMatch) question.question = questionTextMatch[1];
            
            // Extract options array - handle multiline
            const optionsMatch = questionProps.match(/options=\{(\[[\s\S]*?\])\}/);
            if (optionsMatch) {
              try {
                question.options = eval(optionsMatch[1]);
              } catch (e) {
                console.error('Error parsing options:', e);
                question.options = [];
              }
            }
            
            // Extract correct answer
            const correctMatch = questionProps.match(/correct=\{(\d+)\}/);
            if (correctMatch) {
              question.correctAnswer = parseInt(correctMatch[1]);
            }
            
            // Extract explanation
            const explanationMatch = questionProps.match(/explanation="([^"]*?)"/);
            if (explanationMatch) question.explanation = explanationMatch[1];
            
            questions.push(question);
          }
          
          return `<!-- QUIZ_PLACEHOLDER:${JSON.stringify(questions)} -->`;
        } catch (e) {
          console.error('Error parsing Quiz:', e);
          return '<!-- QUIZ_ERROR -->';
        }
      }
    );
    
    // Process Callout components (with optional title attribute)
    processedContent = processedContent.replace(
      /<Callout\s+type="([^"]+)"(?:\s+title="([^"]+)")?\s*>([\s\S]*?)<\/Callout>/g,
      (match, type, title, calloutContent) => {
        const data: { type: string; content: string; title?: string } = { 
          type, 
          content: calloutContent.trim() 
        };
        if (title) data.title = title;
        return `<!-- CALLOUT_PLACEHOLDER:${JSON.stringify(data)} -->`;
      }
    );
    
    // Process CodeBlock components
    processedContent = processedContent.replace(
      /<CodeBlock\s+([^>]+)>([\s\S]*?)<\/CodeBlock>/g,
      (match, attributes, codeContent) => {
        // Parse attributes
        const languageMatch = attributes.match(/language="([^"]+)"/);
        const filenameMatch = attributes.match(/filename="([^"]+)"/);
        const highlightMatch = attributes.match(/highlight="([^"]+)"/);
        
        const language = languageMatch ? languageMatch[1] : 'text';
        const filename = filenameMatch ? filenameMatch[1] : null;
        const highlight = highlightMatch ? highlightMatch[1] : null;
        
        // Convert to markdown code block format
        let header = '';
        if (filename) {
          header += `# ${filename}\n`;
        }
        if (highlight) {
          header += `# Highlight lines: ${highlight}\n`;
        }
        
        return `\`\`\`${language}\n${header}${codeContent.trim()}\n\`\`\``;
      }
    );
    
    // Process CodeExample components - handle format with children content
    processedContent = processedContent.replace(
      /<CodeExample\s+language="([^"]+)"(?:\s+title="([^"]+)")?\s*>([\s\S]*?)<\/CodeExample>/g,
      (match, language, title, code) => {
        const props: any = { language, code: code.trim() };
        if (title) props.title = title;
        return `<!-- CODEEXAMPLE_PLACEHOLDER:${JSON.stringify(props)} -->`;
      }
    );
    
    // Process Diagram components with mermaid content
    processedContent = processedContent.replace(
      /<Diagram>([\s\S]*?)<\/Diagram>/g,
      (match, diagramContent) => {
        // Extract mermaid code block content
        const mermaidMatch = diagramContent.match(/```mermaid\s*([\s\S]*?)```/);
        if (mermaidMatch) {
          // Use base64 encoding to avoid JSON escaping issues
          const mermaidCode = mermaidMatch[1].trim();
          // Client-side only - we're in a browser context
          const base64Code = btoa(unescape(encodeURIComponent(mermaidCode)));
          return `<!-- DIAGRAM_PLACEHOLDER:${base64Code} -->`;
        }
        return '<!-- DIAGRAM_ERROR -->';
      }
    );
    
    // Process content by finding and replacing placeholders
    const renderParts = () => {
      const parts: React.ReactNode[] = [];
      let currentIndex = 0;
      let partKey = 0;
      
      while (currentIndex < processedContent.length) {
        // Find the next placeholder
        const placeholderMatches = [
          { type: 'QUIZ_PLACEHOLDER', start: processedContent.indexOf('<!-- QUIZ_PLACEHOLDER:', currentIndex) },
          { type: 'CALLOUT_PLACEHOLDER', start: processedContent.indexOf('<!-- CALLOUT_PLACEHOLDER:', currentIndex) },
          { type: 'CODEEXAMPLE_PLACEHOLDER', start: processedContent.indexOf('<!-- CODEEXAMPLE_PLACEHOLDER:', currentIndex) },
          { type: 'DIAGRAM_PLACEHOLDER', start: processedContent.indexOf('<!-- DIAGRAM_PLACEHOLDER:', currentIndex) },
          { type: 'QUIZ_ERROR', start: processedContent.indexOf('<!-- QUIZ_ERROR -->', currentIndex) },
          { type: 'CODEEXAMPLE_ERROR', start: processedContent.indexOf('<!-- CODEEXAMPLE_ERROR -->', currentIndex) },
          { type: 'DIAGRAM_ERROR', start: processedContent.indexOf('<!-- DIAGRAM_ERROR -->', currentIndex) }
        ].filter(match => match.start !== -1).sort((a, b) => a.start - b.start);
        
        if (placeholderMatches.length === 0) {
          // No more placeholders, add remaining content
          const remainingContent = processedContent.substring(currentIndex);
          if (remainingContent.trim()) {
            parts.push(
              <ReactMarkdown
                key={partKey++}
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
                  ol: ({ children, start }) => (
                    <ol className="mb-4 list-decimal pl-6 space-y-2" start={start}>
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700 dark:text-gray-300">{children}</li>
                  ),
                  pre: ({ children, ...props }: any) => {
                    // Handle code blocks - pre wraps code elements
                    const codeElement = children?.props;
                    if (codeElement && codeElement.className) {
                      const match = /language-(\w+)/.exec(codeElement.className || '');
                      const language = match ? match[1] : 'typescript';
                      const codeContent = codeElement.children;
                      
                      if (typeof codeContent === 'string') {
                        // Special handling for mermaid
                        if (language === 'mermaid') {
                          return (
                            <div className="mb-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                              <pre className="mermaid">
                                {codeContent}
                              </pre>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="mb-4">
                            <CodeBlock
                              code={codeContent}
                              language={language}
                              showLineNumbers={true}
                            />
                          </div>
                        );
                      }
                    }
                    // Fallback for pre without code
                    return <pre className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">{children}</pre>;
                  },
                  code: ({ className, children, ...props }: any) => {
                    // Only handle inline code here
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
                  details: ({ children }) => (
                    <details className="my-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      {children}
                    </details>
                  ),
                  summary: ({ children }) => (
                    <summary className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100 hover:text-primary">
                      {children}
                    </summary>
                  ),
                }}
              >
                {remainingContent}
              </ReactMarkdown>
            );
          }
          break;
        }
        
        const nextPlaceholder = placeholderMatches[0];
        
        // Add content before the placeholder
        if (nextPlaceholder.start > currentIndex) {
          const beforeContent = processedContent.substring(currentIndex, nextPlaceholder.start);
          if (beforeContent.trim()) {
            parts.push(
              <ReactMarkdown
                key={partKey++}
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
                  ol: ({ children, start }) => (
                    <ol className="mb-4 list-decimal pl-6 space-y-2" start={start}>
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700 dark:text-gray-300">{children}</li>
                  ),
                  pre: ({ children, ...props }: any) => {
                    // Handle code blocks - pre wraps code elements
                    const codeElement = children?.props;
                    if (codeElement && codeElement.className) {
                      const match = /language-(\w+)/.exec(codeElement.className || '');
                      const language = match ? match[1] : 'typescript';
                      const codeContent = codeElement.children;
                      
                      if (typeof codeContent === 'string') {
                        // Special handling for mermaid
                        if (language === 'mermaid') {
                          return (
                            <div className="mb-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                              <pre className="mermaid">
                                {codeContent}
                              </pre>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="mb-4">
                            <CodeBlock
                              code={codeContent}
                              language={language}
                              showLineNumbers={true}
                            />
                          </div>
                        );
                      }
                    }
                    // Fallback for pre without code
                    return <pre className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">{children}</pre>;
                  },
                  code: ({ className, children, ...props }: any) => {
                    // Only handle inline code here
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
                  details: ({ children }) => (
                    <details className="my-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      {children}
                    </details>
                  ),
                  summary: ({ children }) => (
                    <summary className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100 hover:text-primary">
                      {children}
                    </summary>
                  ),
                }}
              >
                {beforeContent}
              </ReactMarkdown>
            );
          }
        }
        
        // Find the end of this placeholder
        const placeholderEndIndex = processedContent.indexOf(' -->', nextPlaceholder.start);
        if (placeholderEndIndex === -1) {
          console.error('Malformed placeholder found');
          break;
        }
        
        const fullPlaceholder = processedContent.substring(nextPlaceholder.start, placeholderEndIndex + 4);
        
        // Process the placeholder based on its type
        if (nextPlaceholder.type === 'QUIZ_PLACEHOLDER') {
          const questionsJson = fullPlaceholder.match(/<!-- QUIZ_PLACEHOLDER:(.*?) -->/)?.[1];
          if (questionsJson) {
            try {
              const questions = JSON.parse(questionsJson);
              parts.push(<Quiz key={partKey++} questions={questions} />);
            } catch (e) {
              parts.push(<p key={partKey++} className="mb-4 text-red-600">Error rendering quiz</p>);
            }
          }
        } else if (nextPlaceholder.type === 'CALLOUT_PLACEHOLDER') {
          const jsonMatch = fullPlaceholder.match(/<!-- CALLOUT_PLACEHOLDER:(.*?) -->/);
          if (jsonMatch) {
            try {
              const data = JSON.parse(jsonMatch[1]);
              parts.push(
                <Callout key={partKey++} type={data.type} title={data.title}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
                </Callout>
              );
            } catch (e) {
              parts.push(<p key={partKey++} className="mb-4 text-red-600">Error rendering callout</p>);
            }
          }
        } else if (nextPlaceholder.type === 'CODEEXAMPLE_PLACEHOLDER') {
          const propsMatch = fullPlaceholder.match(/<!-- CODEEXAMPLE_PLACEHOLDER:([\s\S]*?) -->/);
          if (propsMatch) {
            try {
              const props = JSON.parse(propsMatch[1]);
              parts.push(
                <div key={partKey++} className="my-4">
                  <CodeBlock
                    code={props.code || ''}
                    language={props.language || 'text'}
                    showLineNumbers={true}
                    title={props.title}
                  />
                </div>
              );
            } catch (e) {
              parts.push(<p key={partKey++} className="mb-4 text-red-600">Error rendering code example</p>);
            }
          }
        } else if (nextPlaceholder.type === 'DIAGRAM_PLACEHOLDER') {
          const diagramMatch = fullPlaceholder.match(/<!-- DIAGRAM_PLACEHOLDER:(.*?) -->/);
          if (diagramMatch) {
            try {
              // Decode from base64
              const base64Code = diagramMatch[1];
              const decodedCode = decodeURIComponent(escape(atob(base64Code)));
              
              parts.push(
                <div key={partKey++} className="my-6">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                    <pre className="mermaid">
                      {decodedCode}
                    </pre>
                  </div>
                </div>
              );
            } catch (e) {
              console.error('Error parsing diagram:', e);
              parts.push(<p key={partKey++} className="mb-4 text-red-600">Error rendering diagram</p>);
            }
          }
        } else if (nextPlaceholder.type === 'QUIZ_ERROR') {
          parts.push(<p key={partKey++} className="mb-4 text-red-600">Error parsing quiz component</p>);
        } else if (nextPlaceholder.type === 'CODEEXAMPLE_ERROR') {
          parts.push(<p key={partKey++} className="mb-4 text-red-600">Error parsing code example component</p>);
        } else if (nextPlaceholder.type === 'DIAGRAM_ERROR') {
          parts.push(<p key={partKey++} className="mb-4 text-red-600">Error parsing diagram component</p>);
        }
        
        currentIndex = placeholderEndIndex + 4;
      }
      
      return parts;
    };
    
    return (
      <div>
        {renderParts().map((part, index) => (
          <React.Fragment key={index}>{part}</React.Fragment>
        ))}
      </div>
    );
  };

  const renderQuizSection = (section: any) => {
    const quiz = section.content;
    
    // Handle Quiz components in MDX content
    if (quiz.type === 'mdx' && quiz.source) {
      // Extract Quiz component from MDX
      const quizMatch = quiz.source.match(/<Quiz[\s\S]*?questions=\{(\[[\s\S]*?\])\}[\s\S]*?\/>/);
      if (quizMatch) {
        try {
          const questions = eval(quizMatch[1]);
          return renderQuizQuestions({ questions });
        } catch (error) {
          console.error('Error parsing Quiz component:', error);
        }
      }
    }
    
    // Fallback to regular quiz rendering
    return (
      <>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {quiz.title || 'Knowledge Check'}
        </h2>
        {quiz.description && (
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            {quiz.description}
          </p>
        )}
        {quiz.questions && renderQuizQuestions(quiz)}
      </>
    );
  };

  const renderQuizQuestions = (quiz: { questions: any[] }) => {
    return (
      <div className="space-y-6">
        {quiz.questions.map((question: any, qIndex: number) => (
          <div key={question.id || qIndex} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
              {qIndex + 1}. {question.question}
            </p>
            {(question.type === 'multiple-choice' || question.options) && (
              <ul className="space-y-2">
                {question.options.map((option: any, oIndex: number) => (
                  <li key={option.id || oIndex} className="flex items-start">
                    <span className="mr-2 font-mono text-sm">{String.fromCharCode(65 + oIndex)})</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {typeof option === 'string' ? option : option.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {question.type === 'true-false' && (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                True or False question
              </p>
            )}
            {question.correctAnswer !== undefined && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Show Answer
                </summary>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Correct Answer: {String.fromCharCode(65 + question.correctAnswer)}
                  </p>
                  {question.explanation && (
                    <p className="text-sm mt-1 text-blue-800 dark:text-blue-200">
                      {question.explanation}
                    </p>
                  )}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
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
          ) : section.type === 'quiz' && section.content?.type === 'mdx' && section.content.source ? (
            <>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {section.title}
              </h2>
              {parseAndRenderContent(section.content.source)}
            </>
          ) : section.content?.type === 'mdx' && section.content.source ? (
            <>
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {section.title}
              </h2>
              {parseAndRenderContent(section.content.source)}
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