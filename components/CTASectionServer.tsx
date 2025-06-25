import Section from './Section';
import Container from './Container';
import Button from './Button';
import Link from 'next/link';

export default function CTASectionServer() {
  const contactHref = '/contact';
  
  return (
    <Section spacing="xl" className="relative overflow-hidden">
      <Container>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Let&apos;s Build Something{' '}
            <span className="text-primary">Amazing Together</span>
          </h2>
          <p className="text-lg sm:text-xl text-foreground/80 mb-8">
            Whether you&apos;re looking to integrate AI into your business, need expertise on a 
            challenging ML project, or want to explore partnership opportunities, I&apos;m here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={contactHref}>
              <Button size="lg" variant="primary">
                Start a Conversation
              </Button>
            </Link>
            <a href="/resume.pdf" download>
              <Button size="lg" variant="ghost">
                Download Resume
              </Button>
            </a>
          </div>
        </div>
      </Container>
      
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 -z-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
    </Section>
  );
}