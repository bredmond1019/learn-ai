import { notFound } from 'next/navigation';
import Section from '@/components/Section';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Link from 'next/link';
import Button from '@/components/Button';
import { getConceptById, getRelatedConcepts } from '@/lib/content/learning/learn';

interface ConceptPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ConceptPageProps) {
  const { slug } = await params;
  const concept = getConceptById(slug);
  
  if (!concept) {
    return {
      title: 'Concept Not Found',
    };
  }

  return {
    title: `${concept.title} | Learn Agentic AI`,
    description: concept.description,
  };
}

export default async function ConceptPage({ params }: ConceptPageProps) {
  const { slug } = await params;
  const concept = getConceptById(slug);

  if (!concept) {
    notFound();
  }

  const relatedConcepts = getRelatedConcepts(concept.id);

  return (
    <main className="min-h-screen pt-24">
      {/* Hero Section */}
      <Section spacing="lg">
        <Container size="md">
          <div className="mb-6">
            <Link href="/learn" className="text-primary hover:text-primary-hover transition-colors">
              ← Back to Learn
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
              concept.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
              concept.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {concept.difficulty}
            </span>
            <span className="text-sm text-foreground/60 capitalize">
              {concept.category}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            {concept.title}
          </h1>
          
          <p className="text-xl text-foreground/80 leading-relaxed">
            {concept.description}
          </p>
        </Container>
      </Section>

      {/* Content Placeholder */}
      <Section spacing="xl">
        <Container size="md">
          <Card>
            <h2 className="text-2xl font-semibold mb-4 text-primary">
              Content Coming Soon
            </h2>
            <p className="text-foreground/80 mb-6">
              This concept page is under development. The detailed content, examples, 
              and hands-on exercises will be available soon.
            </p>
            <p className="text-foreground/80 mb-6">
              In the meantime, you can explore the learning paths or check out other 
              concepts to start your journey with agentic AI and MCP servers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/learn#learning-paths">
                <Button variant="primary">
                  Explore Learning Paths
                </Button>
              </Link>
              <Link href="/learn#concepts">
                <Button variant="secondary">
                  Browse All Concepts
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </Section>

      {/* Related Concepts */}
      {relatedConcepts.length > 0 && (
        <Section spacing="xl" className="bg-background-secondary/30">
          <Container size="lg">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              Related Concepts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedConcepts.map((relatedConcept) => (
                <Card key={relatedConcept.id} variant="interactive">
                  <h3 className="text-lg font-semibold mb-2 text-primary">
                    {relatedConcept.title}
                  </h3>
                  <p className="text-foreground/80 text-sm mb-4">
                    {relatedConcept.description}
                  </p>
                  <Link href={relatedConcept.learnMore}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </main>
  );
}