import Section from '@/components/Section';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Button from '@/components/Button';
import LearnCardServer from '@/components/LearnCardServer';
import ConceptCard from '@/components/ConceptCard';
import Link from 'next/link';
import { learningPaths, concepts } from '@/lib/content/learning/learn';

export const metadata = {
  title: 'Learn Agentic AI & MCP Servers',
  description: 'Master the fundamentals of agentic AI systems and MCP servers with Brandon\'s teaching-focused approach to complex AI concepts.',
};


const teachingPhilosophy = {
  title: "Teaching Philosophy: From Complex to Clear",
  points: [
    "Start with the 'why' - understand the problem before diving into solutions",
    "Break complex systems into manageable, logical components",
    "Learn by building - every concept is paired with hands-on implementation",
    "Connect new concepts to existing knowledge you already have",
    "Practice makes permanent - repetition builds understanding"
  ]
};

export default async function LearnPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section spacing="xl">
        <Container size="lg">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Learn <span className="text-primary">Agentic AI</span> & 
              <br />
              <span className="text-primary">MCP Servers</span>
            </h1>
            <p className="text-xl text-foreground/80 mb-8 leading-relaxed">
              Master the fundamentals of intelligent AI systems with a teacher who understands 
              how to make complex concepts click. From MCP server architecture to agentic workflows, 
              learn by building real systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#learning-paths">
                <Button size="lg" variant="primary">
                  Start Learning
                </Button>
              </Link>
              <Link href="#concepts">
                <Button size="lg" variant="secondary">
                  Explore Concepts
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">10+</p>
              <p className="text-sm text-foreground/60">MCP Servers Built</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">100+</p>
              <p className="text-sm text-foreground/60">Students Taught</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">5+</p>
              <p className="text-sm text-foreground/60">Years Teaching</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Teaching Philosophy */}
      <Section spacing="xl" className="bg-background-secondary/30">
        <Container size="md">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">
              {teachingPhilosophy.title}
            </h2>
            <p className="text-lg text-foreground/80">
              My approach to teaching complex AI concepts, refined through years in the classroom 
              and now applied to cutting-edge technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachingPhilosophy.points.map((point, index) => (
              <Card key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">{index + 1}</span>
                </div>
                <p className="text-foreground/80">{point}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Learning Paths */}
      <Section spacing="xl" id="learning-paths">
        <Container size="lg">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">
              Learning Paths
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Structured learning journeys that take you from beginner to expert. 
              Each path is designed with clear progression and hands-on projects.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {learningPaths['en'].map((path) => (
              <LearnCardServer key={path.id} path={path} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Key Concepts */}
      <Section spacing="xl" id="concepts" className="bg-background-secondary/30">
        <Container size="lg">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">
              Key Concepts
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Essential concepts explained clearly. Each topic breaks down complex ideas 
              into understandable components with real-world examples.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {concepts['en'].slice(0, 6).map((concept) => (
              <ConceptCard key={concept.id} concept={concept} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Why Learn This */}
      <Section spacing="xl">
        <Container size="md">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">
              Why Learn Agentic AI & MCP?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-primary">The Future is Agentic</h3>
              <p className="text-foreground/80 mb-4">
                AI systems are evolving from simple chatbots to intelligent agents that can 
                plan, reason, and execute complex tasks. Companies are racing to build these 
                systems, and the demand for engineers who understand agentic architectures 
                is exploding.
              </p>
              <p className="text-foreground/80">
                MCP (Model Context Protocol) is becoming the standard for connecting AI 
                systems to external tools and data sources, making it an essential skill 
                for modern AI engineering.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-primary">Competitive Advantage</h3>
              <p className="text-foreground/80 mb-4">
                While most developers are still learning basic prompt engineering, you'll 
                master the architectural patterns that power next-generation AI applications. 
                This knowledge translates directly to higher-impact roles and better compensation.
              </p>
              <p className="text-foreground/80">
                My teaching approach ensures you don't just follow tutorials - you understand 
                the underlying principles so you can architect your own solutions.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section spacing="xl" className="bg-primary/5 border-t border-primary/20 border-b border-primary/20">
        <Container size="md">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">
              Ready to Master Agentic AI?
            </h2>
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
              Join the growing community of engineers building the next generation of AI systems. 
              Start with fundamentals and progress to advanced production patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#learning-paths">
                <Button size="lg" variant="primary">
                  Choose Your Path
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