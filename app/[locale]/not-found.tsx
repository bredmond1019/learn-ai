import Link from 'next/link'
import Button from '@/components/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-foreground/60 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/en">
          <Button variant="primary">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}