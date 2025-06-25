'use client';

import React, { useState, useEffect } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { CodeBlock } from '@/components/ui/code-block';
import { CheckIcon, ClipboardIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { Module, Section } from '@/types/module';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

interface ModuleViewerProps {
  module: Module;
  currentSectionId?: string;
  onSectionComplete?: (sectionId: string) => void;
  completedSections?: string[];
  serializedContent?: MDXRemoteSerializeResult;
}

interface CodeComponentProps {
  children: string;
  className?: string;
  [key: string]: any;
}

const CodeComponent: React.FC<CodeComponentProps> = ({ children, className, ...props }) => {
  const language = className?.replace(/^language-/, '') || 'javascript';

  return (
    <ComponentErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Code block rendering error:', error);
      }}
    >
      <div className="my-6">
        <CodeBlock
          code={children}
          language={language}
          showLineNumbers={true}
          {...props}
        />
      </div>
    </ComponentErrorBoundary>
  );
};

const ModuleViewer: React.FC<ModuleViewerProps> = ({
  module,
  currentSectionId,
  onSectionComplete,
  completedSections = [],
  serializedContent
}) => {
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Find the active section
    const section = currentSectionId 
      ? module.sections.find(s => s.id === currentSectionId)
      : module.sections[0];
    
    setActiveSection(section || null);

    // Calculate progress
    const completedCount = completedSections.length;
    const totalSections = module.sections.length;
    const progressPercentage = totalSections > 0 
      ? Math.round((completedCount / totalSections) * 100)
      : 0;
    setProgress(progressPercentage);
  }, [currentSectionId, module.sections, completedSections]);

  const mdxComponents = {
    pre: ({ children }: any) => children,
    code: CodeComponent,
    h1: (props: any) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
    h2: (props: any) => <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />,
    h3: (props: any) => <h3 className="text-xl font-medium mt-4 mb-2" {...props} />,
    p: (props: any) => <p className="mb-4 leading-relaxed" {...props} />,
    ul: (props: any) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
    ol: (props: any) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
    li: (props: any) => <li className="ml-4" {...props} />,
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-4 italic" {...props} />
    ),
    a: (props: any) => (
      <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
    ),
    table: (props: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
      </div>
    ),
    th: (props: any) => (
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props} />
    ),
    td: (props: any) => (
      <td className="px-6 py-4 whitespace-nowrap text-sm" {...props} />
    ),
  };

  const handleSectionComplete = () => {
    if (activeSection && onSectionComplete) {
      onSectionComplete(activeSection.id);
    }
  };

  const getTimeEstimate = () => {
    const currentTime = activeSection?.estimatedDuration || module.metadata.duration;
    return currentTime;
  };

  if (!activeSection) {
    return (
      <Card className="p-8 text-center">
        <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">No content available</p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Module Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{module.metadata.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{module.metadata.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{module.metadata.type}</Badge>
            <Badge variant="outline">{module.metadata.difficulty}</Badge>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Progress: {completedSections.length} of {module.sections.length} sections</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Time Estimate */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Estimated time: {getTimeEstimate()}</span>
        </div>
      </div>

      {/* Section Content */}
      <Card className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">{activeSection.title}</h2>
          {activeSection.type !== 'content' && (
            <Badge variant="secondary" className="mb-4">
              {activeSection.type}
            </Badge>
          )}
        </div>

        {/* MDX Content Rendering */}
        {activeSection.type === 'content' && activeSection.content.type === 'mdx' && serializedContent && (
          <ComponentErrorBoundary 
            onError={(error, errorInfo) => {
              console.error('MDX rendering error:', error);
              console.error('Error info:', errorInfo);
            }}
          >
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <MDXRemote {...serializedContent} components={mdxComponents} />
            </div>
          </ComponentErrorBoundary>
        )}

        {/* Section Complete Button */}
        {!completedSections.includes(activeSection.id) && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={handleSectionComplete}
              className="w-full sm:w-auto"
            >
              Mark Section as Complete
            </Button>
          </div>
        )}
      </Card>

      {/* Learning Objectives */}
      {module.metadata.objectives && module.metadata.objectives.length > 0 && (
        <Card className="mt-6 p-6">
          <h3 className="text-lg font-semibold mb-4">Learning Objectives</h3>
          <ul className="space-y-2">
            {module.metadata.objectives.map((objective, index) => (
              <li key={index} className="flex items-start">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{objective}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default ModuleViewer;