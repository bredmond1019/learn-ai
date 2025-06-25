import { notFound } from 'next/navigation';
import Link from 'next/link';
import Section from '@/components/Section';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { getLearningPathById } from '@/lib/learn';

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PreviewPageProps) {
  const { slug } = await params;
  const path = getLearningPathById(slug);
  
  if (!path) {
    return {
      title: 'Preview Not Found',
    };
  }

  return {
    title: `Preview: ${path.title} | Learn Agentic AI`,
    description: `Preview the content for ${path.title} learning path`,
  };
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;
  const path = getLearningPathById(slug);

  if (!path) {
    notFound();
  }

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Section spacing="lg" className="bg-background-secondary/30">
        <Container size="lg">
          <div className="mb-6">
            <Link href="/learn" className="text-primary hover:text-primary-hover transition-colors">
              ← Back to Learn
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(path.level)}`}>
              {path.level}
            </span>
            <span className="text-sm text-foreground/60">{path.duration}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Preview: {path.title}
          </h1>
          
          <p className="text-xl text-foreground/80 mb-8 leading-relaxed max-w-3xl">
            {path.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/learn/paths/${slug}/modules/${path.modules[0]?.id}`}>
              <Button size="lg" variant="primary">
                Start Learning Path
              </Button>
            </Link>
            <Link href={`/learn/paths/${slug}`}>
              <Button size="lg" variant="secondary">
                View Full Details
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Learning Outcomes */}
      <Section spacing="xl">
        <Container size="lg">
          <h2 className="text-2xl font-semibold mb-8">What You&apos;ll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {path.outcomes.map((outcome, index) => (
              <div key={index} className="flex items-start">
                <svg className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-foreground/80">{outcome}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Module Preview */}
      <Section spacing="xl" className="bg-background-secondary/30">
        <Container size="lg">
          <h2 className="text-2xl font-semibold mb-8">Course Modules</h2>
          <div className="space-y-4">
            {path.modules.map((module, index) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">{getModuleIcon(module.type)}</span>
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        Module {index + 1}: {module.title}
                      </h3>
                      <span className="text-sm text-foreground/60">
                        {module.duration}
                      </span>
                    </div>
                    
                    <p className="text-foreground/70 mb-3">
                      {module.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-primary">
                        {module.type === 'theory' && 'Conceptual Learning'}
                        {module.type === 'hands-on' && 'Practical Exercise'}
                        {module.type === 'project' && 'Project Work'}
                      </span>
                      <span className="text-foreground/50">•</span>
                      <span className="text-foreground/60">
                        {module.content}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Link
                      href={`/learn/paths/${slug}/modules/${module.id}`}
                      className="text-primary hover:text-primary-hover transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section spacing="xl">
        <Container size="md">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-foreground/80 mb-8">
              Join this learning path and master {path.title.toLowerCase()} with hands-on projects and real-world examples.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/learn/paths/${slug}/modules/${path.modules[0]?.id}`}>
                <Button size="lg" variant="primary">
                  Start Module 1 Now
                </Button>
              </Link>
              <Link href="/learn">
                <Button size="lg" variant="secondary">
                  Explore Other Paths
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}