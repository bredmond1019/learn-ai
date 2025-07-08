import Link from 'next/link'
import Button from '@/components/Button'
import Section from '@/components/Section'
import Container from '@/components/Container'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Section spacing="xl">
        <Container size="md">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-foreground/80 mb-8 max-w-md mx-auto">
              Sorry, we couldn't find the page you're looking for. 
              The page may have been moved or doesn't exist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="primary">Go Home</Button>
              </Link>
              <Link href="/blog">
                <Button variant="secondary">Browse Blog</Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}