import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/projects';
import { getProjectIcon, isRepoPrivate } from '@/lib/icons';
import GitHubButton from '@/components/GitHubButton';
import CollapsibleCodeBlock from '@/components/CollapsibleCodeBlock';
import type { Metadata } from 'next';

// Helper function to generate descriptions for code snippets
function getCodeSnippetDescription(title: string, projectSlug: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    'agentic-flow': {
      'Flutter Cross-Platform Agent Management': 'Implementation of a cross-platform agent management system using Flutter and Riverpod for state management. Shows real-time WebSocket integration and responsive UI patterns.',
      'Rust Workflow Orchestration Service': 'Core workflow engine built in Rust demonstrating event-driven architecture, dependency graph execution, and parallel step processing with retry logic.'
    },
    'rust-workflow-engine': {
      'AI Service Integration Layer': 'Demonstrates how to integrate multiple AI providers (OpenAI, Anthropic, AWS Bedrock) with a unified interface, including streaming responses and token management.',
      'Event-Driven Workflow Architecture': 'Shows the implementation of an event-sourced workflow system with PostgreSQL persistence, real-time updates, and comprehensive error handling.',
      'WebAssembly Plugin System': 'Example of a secure plugin architecture using WebAssembly for extensible content processing with sandboxed execution.'
    },
    'ai-chatbot-rag': {
      'Vector Search Implementation': 'Demonstrates efficient semantic search using embeddings and vector databases for intelligent context retrieval in conversational AI.',
      'LangChain RAG Pipeline': 'Shows how to build a complete retrieval-augmented generation pipeline with document processing, chunking, and context-aware response generation.',
      'Multi-Modal Chat Interface': 'Implementation of a chat interface supporting text, images, and file uploads with real-time streaming responses.'
    },
    'pyagent': {
      'Pure Python Agent Architecture': 'Clean implementation of an AI agent without heavy frameworks, showing tool management, context handling, and execution loops.',
      'Tool Integration Framework': 'Demonstrates how to create a flexible tool system for AI agents with automatic discovery and validation.',
      'Agent Memory Management': 'Shows efficient memory and context management for long-running agent conversations with conversation pruning.'
    },
    'multi-agent-project-manager': {
      'Agent Coordination System': 'Implementation of a multi-agent orchestration system where specialized agents collaborate on complex project management tasks.',
      'Task Distribution Algorithm': 'Shows intelligent task allocation among agents based on capabilities and current workload.',
      'Inter-Agent Communication': 'Demonstrates message passing and state synchronization between multiple autonomous agents.'
    },
    'event-driven-microservices': {
      'Event Bus Implementation': 'Core event bus architecture supporting publish-subscribe patterns with guaranteed delivery and ordering.',
      'Saga Pattern for Distributed Transactions': 'Shows how to implement distributed transactions across microservices using the Saga pattern.',
      'Service Discovery and Load Balancing': 'Demonstrates dynamic service discovery with health checks and intelligent load balancing.'
    },
    'ai-tutor': {
      'Adaptive Learning Algorithm': 'Implementation of personalized learning paths that adapt based on student performance and learning style.',
      'Interactive Code Validation': 'Shows real-time code validation and feedback generation for programming exercises.',
      'Progress Tracking System': 'Demonstrates comprehensive analytics and progress tracking for educational outcomes.'
    },
    'claude-code-sdk-rust': {
      'Rust SDK Architecture': 'Core SDK design showing type-safe API wrappers, automatic retry logic, and ergonomic error handling.',
      'Streaming Response Handler': 'Implementation of efficient streaming for long-form AI responses with backpressure handling.',
      'Request Middleware System': 'Shows how to implement a flexible middleware system for authentication, logging, and rate limiting.'
    },
    'climbr': {
      'Route Optimization Engine': 'Algorithm for suggesting optimal climbing routes based on user skill level and preferences.',
      'Social Feature Implementation': 'Shows real-time social features including live location sharing and group coordination.',
      'Offline Data Sync': 'Demonstrates offline-first architecture with conflict resolution for mobile climbing app.'
    },
    'internal-tools-platform': {
      'Dynamic Form Builder': 'Implementation of a flexible form generation system supporting complex validation and conditional logic.',
      'Workflow Automation Engine': 'Shows how to build visual workflow builders with drag-and-drop interfaces.',
      'Permission System': 'Demonstrates fine-grained access control with role-based and attribute-based permissions.'
    }
  };

  // Return specific description if available, otherwise generate a generic one
  const projectDescriptions = descriptions[projectSlug] || {};
  return projectDescriptions[title] || `Example implementation demonstrating ${title.toLowerCase()}. Click to expand and view the full code with syntax highlighting.`;
}

// Generate static params
export async function generateStaticParams() {
  const locales = ['en', 'pt-BR'];
  const results = [];
  
  for (const locale of locales) {
    const slugs = getAllProjectSlugs(locale);
    for (const slug of slugs) {
      results.push({ locale, slug });
    }
  }
  
  return results;
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const project = await getProjectBySlug(slug, locale);
  
  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project could not be found.'
    };
  }
  
  return {
    title: `${project.title} | AI Engineer Portfolio`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: 'article',
    },
  };
}

export default async function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}) {
  const { slug, locale } = await params;
  const project = await getProjectBySlug(slug, locale);
  
  if (!project) {
    notFound();
  }

  const ProjectIcon = getProjectIcon(project.icon);
  const isPrivate = isRepoPrivate(project);

  return (
    <main className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href={`/${locale}/projetos`}
          className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors mb-6"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar para Projetos
        </Link>
        
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <ProjectIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold flex-1">
            {project.title}
          </h1>
        </div>
        
        <p className="text-xl text-foreground/80 mb-8">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-3 mb-8">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 bg-accent/10 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {project.githubUrl && (
          <GitHubButton githubUrl={project.githubUrl} isPrivate={isPrivate} />
        )}

        <div className="mb-12">
          <h2 className="text-3xl font-semibold mb-6">Overview</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-foreground/80 whitespace-pre-line">
              {project.longDescription.trim()}
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-semibold mb-8">Technical Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {project.techStack.map((category) => (
              <div key={category.category} className="p-6 rounded-lg bg-background-secondary/50 border border-accent/20">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  {category.category}
                </h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-foreground/80">
                      <span className="text-primary">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-semibold mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <p className="text-foreground/80">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Code Snippets Section */}
        {project.codeSnippets && project.codeSnippets.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-8">Code Examples</h2>
            <div className="space-y-4">
              {project.codeSnippets.map((snippet, index) => (
                <CollapsibleCodeBlock
                  key={index}
                  title={snippet.title}
                  description={getCodeSnippetDescription(snippet.title, project.slug)}
                  code={snippet.code}
                  language={snippet.language}
                  defaultOpen={index === 0} // First code block is open by default
                />
              ))}
            </div>
          </div>
        )}

        {/* Challenges Section */}
        {project.challenges && project.challenges.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-8">Technical Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.challenges.map((challenge, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent text-sm">▪</span>
                  </div>
                  <p className="text-foreground/80">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outcomes Section */}
        {project.outcomes && project.outcomes.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-8">Project Outcomes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.outcomes.map((outcome, index) => (
                <div key={index} className="bg-primary/10 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {outcome.value}
                  </div>
                  <div className="text-sm text-foreground/70">
                    {outcome.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}