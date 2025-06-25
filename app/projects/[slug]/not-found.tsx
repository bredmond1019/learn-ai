'use client';

import Section from '@/components/Section';
import Container from '@/components/Container';
import Button from '@/components/Button';
import Link from 'next/link';

export default function ProjectNotFound() {
  return (
    <main className="min-h-screen pt-24">
      <Section spacing="xl">
        <Container>
          <div className="text-center">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl font-semibold mb-4">Project Not Found</h2>
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              The project you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/projects">
                <Button variant="primary">
                  View All Projects
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}