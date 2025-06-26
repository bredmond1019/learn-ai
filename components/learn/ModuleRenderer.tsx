'use client';

import { Module } from '@/types/module';
import { CodeBlock } from '@/components/ui/code-block';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { useMemo } from 'react';

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

const Callout = ({ type, children }: { type: 'info' | 'warning' | 'success' | 'error'; children: React.ReactNode }) => {
  const typeStyles = {
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    warning: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
    error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
  };

  const iconStyles = {
    info: '💡',
    warning: '⚠️',
    success: '✅',
    error: '❌'
  };

  return (
    <div className={`border-l-4 p-4 my-4 rounded-r-lg ${typeStyles[type]}`}>
      <div className="flex items-start">
        <span className="mr-2 text-lg">{iconStyles[type]}</span>
        <div className="text-gray-700 dark:text-gray-300">{children}</div>
      </div>
    </div>
  );
};

interface ModuleRendererProps {
  module: Module;
  locale: string;
}

export function ModuleRenderer({ module, locale }: ModuleRendererProps) {
  const parseAndRenderContent = (content: string) => {
    if (!content) return null;
    
    // Remove h2 headers since we display section titles from JSON
    let processedContent = content.replace(/^## [^\n]*\{#[^}]+\}$/gm, '');
    
    // Debug: Check if h2 headers were removed
    if (content !== processedContent) {
      console.log('Removed h2 headers from content');
    }
    
    // Process Quiz components
    processedContent = processedContent.replace(
      /<Quiz\s+questions=\{(\[[\s\S]*?\])\}\s*\/>/g,
      (match, questionsStr) => {
        try {
          const questions = eval(`(${questionsStr})`);
          return `<!-- QUIZ_PLACEHOLDER:${JSON.stringify(questions)} -->`;
        } catch (e) {
          console.error('Error parsing Quiz:', e);
          return '<!-- QUIZ_ERROR -->';
        }
      }
    );
    
    // Process Callout components
    processedContent = processedContent.replace(
      /<Callout\s+type="([^"]+)"\s*>([\s\S]*?)<\/Callout>/g,
      (match, type, calloutContent) => {
        return `<!-- CALLOUT_PLACEHOLDER:${type}:${calloutContent.trim()} -->`;
      }
    );
    
    // Process CodeExample components - handle the complete component including multiline code
    let codeExampleIndex = 0;
    while (true) {
      const codeExampleStart = processedContent.indexOf('<CodeExample', codeExampleIndex);
      if (codeExampleStart === -1) break;
      
      // Find the end of the component />
      const codeExampleEnd = processedContent.indexOf('/>', codeExampleStart);
      if (codeExampleEnd === -1) break;
      
      const fullComponent = processedContent.substring(codeExampleStart, codeExampleEnd + 2);
      
      try {
        const props: any = {};
        
        // Extract title
        const titleMatch = fullComponent.match(/title="([^"]*?)"/);
        if (titleMatch) props.title = titleMatch[1];
        
        // Extract language
        const languageMatch = fullComponent.match(/language="([^"]*?)"/);
        if (languageMatch) props.language = languageMatch[1];
        
        // Extract fileName
        const fileNameMatch = fullComponent.match(/fileName="([^"]*?)"/);
        if (fileNameMatch) props.fileName = fileNameMatch[1];
        
        // Extract code - find code={` and matching `}
        const codeStartPattern = 'code={`';
        const codeStartIdx = fullComponent.indexOf(codeStartPattern);
        if (codeStartIdx !== -1) {
          const codeContentStart = codeStartIdx + codeStartPattern.length;
          // Find the closing `}
          const codeEndPattern = '`}';
          const codeEndIdx = fullComponent.indexOf(codeEndPattern, codeContentStart);
          if (codeEndIdx !== -1) {
            props.code = fullComponent.substring(codeContentStart, codeEndIdx);
          }
        }
        
        // Extract highlightLines
        const highlightLinesMatch = fullComponent.match(/highlightLines=\{(\[[^\}]*?\])\}/);
        if (highlightLinesMatch) {
          try {
            props.highlightLines = eval(highlightLinesMatch[1]);
          } catch (e) {
            console.warn('Error parsing highlightLines:', e);
          }
        }
        
        const placeholder = `<!-- CODEEXAMPLE_PLACEHOLDER:${JSON.stringify(props)} -->`;
        processedContent = processedContent.substring(0, codeExampleStart) + 
                          placeholder + 
                          processedContent.substring(codeExampleEnd + 2);
        
        // Update index for next search
        codeExampleIndex = codeExampleStart + placeholder.length;
      } catch (e) {
        console.error('Error parsing CodeExample:', e);
        const errorPlaceholder = '<!-- CODEEXAMPLE_ERROR -->';
        processedContent = processedContent.substring(0, codeExampleStart) + 
                          errorPlaceholder + 
                          processedContent.substring(codeExampleEnd + 2);
        codeExampleIndex = codeExampleStart + errorPlaceholder.length;
      }
    }
    
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
          { type: 'QUIZ_ERROR', start: processedContent.indexOf('<!-- QUIZ_ERROR -->', currentIndex) },
          { type: 'CODEEXAMPLE_ERROR', start: processedContent.indexOf('<!-- CODEEXAMPLE_ERROR -->', currentIndex) }
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
          const match = fullPlaceholder.match(/<!-- CALLOUT_PLACEHOLDER:([^:]+):(.*?) -->/);
          if (match) {
            const [, type, calloutContent] = match;
            parts.push(
              <Callout key={partKey++} type={type as any}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{calloutContent}</ReactMarkdown>
              </Callout>
            );
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
        } else if (nextPlaceholder.type === 'QUIZ_ERROR') {
          parts.push(<p key={partKey++} className="mb-4 text-red-600">Error parsing quiz component</p>);
        } else if (nextPlaceholder.type === 'CODEEXAMPLE_ERROR') {
          parts.push(<p key={partKey++} className="mb-4 text-red-600">Error parsing code example component</p>);
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