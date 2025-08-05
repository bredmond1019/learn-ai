import { notFound } from 'next/navigation';
import Section from '@/components/Section';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Link from 'next/link';
import Button from '@/components/Button';
import { getLearningPathById, getPrerequisitePaths } from '@/lib/content/learning/learn';

interface PathPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PathPageProps) {
  const { slug } = await params;
  const path = getLearningPathById(slug);
  
  if (!path) {
    return {
      title: 'Learning Path Not Found',
    };
  }

  return {
    title: `${path.title} | Learn Agentic AI`,
    description: path.description,
  };
}

export default async function PathPage({ params }: PathPageProps) {
  const { slug } = await params;
  const path = getLearningPathById(slug);

  if (!path) {
    notFound();
  }

  const prerequisites = getPrerequisitePaths(path.id);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-accent/20 text-accent';
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'theory':
        return '📚';
      case 'hands-on':
        return '⚙️';
      case 'project':
        return '🚀';
      default:
        return '📄';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section spacing="lg">
        <Container size="lg">
          <div className="mb-6">
            <Link href="/learn" className="text-primary hover:text-primary-hover transition-colors">
              ← Back to Learn
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(path.level)}`}>
                  {path.level}
                </span>
                <span className="text-sm text-foreground/60">{path.duration}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                {path.title}
              </h1>
              
              <p className="text-xl text-foreground/80 mb-8 leading-relaxed">
                {path.description}
              </p>

              <div className="mb-8">
                <Link href={`/learn/paths/${slug}/modules/${path.modules[0]?.id}`}>
                  <Button size="lg" variant="primary">
                    Start Learning Path
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* What You&apos;ll Learn */}
              <Card>
                <h3 className="text-lg font-semibold mb-3 text-primary">
                  What You&apos;ll Learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {path.topics.map((topic) => (
                    <span 
                      key={topic}
                      className="px-2 py-1 bg-accent/20 rounded text-xs text-foreground/80"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Prerequisites */}
              {prerequisites.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    Prerequisites
                  </h3>
                  <div className="space-y-2">
                    {prerequisites.map((prereq) => (
                      <Link 
                        key={prereq.id}
                        href={`/learn/paths/${prereq.id}`}
                        className="block text-sm text-foreground/80 hover:text-primary transition-colors"
                      >
                        • {prereq.title}
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Learning Outcomes */}
              <Card>
                <h3 className="text-lg font-semibold mb-3 text-primary">
                  Learning Outcomes
                </h3>
                <ul className="space-y-2">
                  {path.outcomes.map((outcome, index) => (
                    <li key={index} className="text-sm text-foreground/80 flex items-start">
                      <span className="text-primary mr-2 mt-1">✓</span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Course Modules */}
      <Section spacing="xl" className="bg-background-secondary/30">
        <Container size="lg">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Course Modules
          </h2>
          
          <div className="space-y-6">
            {path.modules.map((module, index) => (
              <Card key={module.id} variant="interactive">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-lg">{getModuleIcon(module.type)}</span>
                      <span className="text-xs text-foreground/60 capitalize">{module.type}</span>
                      <span className="text-xs text-foreground/60">{module.duration}</span>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 text-primary">
                      {module.title}
                    </h3>
                    
                    <p className="text-foreground/80">
                      {module.description}
                    </p>
                  </div>
                  
                  <Link href={`/learn/paths/${slug}/modules/${module.id}`}>
                    <Button variant="secondary" size="sm" className="ml-4">
                      Start Module
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Get Started */}
      <Section spacing="xl">
        <Container size="md">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-foreground/80 mb-8">
              Join the growing community of engineers mastering agentic AI and MCP servers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/learn/paths/${slug}/modules/${path.modules[0]?.id}`}>
                <Button size="lg" variant="primary">
                  Start {path.title}
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  Get Personal Guidance
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}