import Section from './Section';
import Container from './Container';
import ProjectCard from './ProjectCard';
import Button from './Button';
import Link from 'next/link';

// Featured projects data
const featuredProjects = [
  {
    title: 'AI-Powered Document Intelligence System',
    description: 'Built an enterprise-grade document processing system using computer vision and NLP to extract, classify, and analyze information from millions of documents with 98% accuracy.',
    tags: ['PyTorch', 'Computer Vision', 'NLP', 'AWS', 'Kubernetes'],
    slug: 'document-intelligence',
    featured: true,
  },
  {
    title: 'Real-time Anomaly Detection Platform',
    description: 'Developed a scalable ML platform detecting anomalies in time-series data, processing 1M+ events/second for critical infrastructure monitoring with sub-second latency.',
    tags: ['TensorFlow', 'Apache Kafka', 'Time Series', 'MLOps', 'React'],
    slug: 'anomaly-detection',
    featured: true,
  },
  {
    title: 'Conversational AI Customer Support Agent',
    description: 'Created an advanced chatbot using LLMs and RAG architecture, reducing support ticket volume by 40% while maintaining 95% customer satisfaction scores.',
    tags: ['LangChain', 'GPT-4', 'RAG', 'Vector DB', 'FastAPI'],
    slug: 'ai-support-agent',
    featured: true,
  },
];

export default function FeaturedProjects() {
  return (
    <Section spacing="xl">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Featured Projects
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Showcasing AI solutions that drive real business value through 
            innovative applications of machine learning and deep learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>

        <div className="text-center">
          <Link href="/projects">
            <Button size="lg" variant="secondary">
              View All Projects
            </Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}