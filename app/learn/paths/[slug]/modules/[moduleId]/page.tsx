import { notFound } from 'next/navigation';
import Link from 'next/link';
import { allModuleContent as moduleContent } from '@/components/learn/ModuleContent';
import { getLearningPathById } from '@/lib/learn';
import { CodeBlock } from '@/components/ui/code-block';

interface PageProps {
  params: Promise<{
    slug: string;
    moduleId: string;
  }>;
}

export default async function ModulePage({ params }: PageProps) {
  const { slug, moduleId } = await params;
  
  const content = moduleContent[moduleId as keyof typeof moduleContent];
  const learningPath = getLearningPathById(slug);
  
  if (!content || !learningPath) {
    notFound();
  }
  
  // Find current module index and calculate prev/next
  const currentModuleIndex = learningPath.modules.findIndex(m => m.id === moduleId);
  const previousModule = currentModuleIndex > 0 ? learningPath.modules[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < learningPath.modules.length - 1 ? learningPath.modules[currentModuleIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center space-x-2 text-sm">
            <Link
              href="/learn"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Learn
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href={`/learn/paths/${slug}`}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Learning Path
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-gray-100">{content.title}</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {content.title}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {content.description}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {content.sections.map((section, index) => (
            <div key={index} className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {section.title}
              </h2>
              
              {section.content && (
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  {section.content}
                </p>
              )}
              
              {section.list && (
                <ul className="mb-4 list-disc pl-6 space-y-2">
                  {section.list.map((item, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              
              {section.code && (
                <div className="mb-4">
                  <CodeBlock
                    code={section.code}
                    language={section.language || 'typescript'}
                    showLineNumbers={true}
                  />
                </div>
              )}
              
              {section.subsections && (
                <div className="space-y-4 mt-4">
                  {section.subsections.map((subsection, i) => (
                    <div key={i} className="ml-4">
                      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {subsection.title}
                      </h3>
                      {subsection.content && (
                        <p className="mb-2 text-gray-700 dark:text-gray-300">
                          {subsection.content}
                        </p>
                      )}
                      {subsection.list && (
                        <ul className="list-disc pl-6 space-y-1">
                          {subsection.list.map((item, j) => (
                            <li key={j} className="text-gray-700 dark:text-gray-300">
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      {subsection.code && (
                        <div className="mb-4">
                          <CodeBlock
                            code={subsection.code}
                            language={subsection.language || 'typescript'}
                            showLineNumbers={true}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Navigation */}
        <nav className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/learn/paths/${slug}`}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Back to {learningPath.title}
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            {previousModule ? (
              <Link
                href={`/learn/paths/${slug}/modules/${previousModule.id}`}
                className="flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Module
              </Link>
            ) : (
              <div></div>
            )}
            
            {nextModule ? (
              <Link
                href={`/learn/paths/${slug}/modules/${nextModule.id}`}
                className="flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-primary-hover"
              >
                Next Module
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <Link
                href={`/learn/paths/${slug}`}
                className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete Path
              </Link>
            )}
          </div>
        </nav>
      </main>
    </div>
  );
}