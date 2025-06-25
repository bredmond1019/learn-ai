import Section from '@/components/Section'
import Container from '@/components/Container'

export default function ProjectsLoading() {
  return (
    <main className="min-h-screen pt-24">
      {/* Hero Section Skeleton */}
      <Section spacing="lg">
        <Container>
          <div className="w-48 h-12 bg-gray-600 rounded animate-pulse mx-auto mb-6"></div>
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="w-full h-6 bg-gray-600 rounded animate-pulse"></div>
            <div className="w-5/6 h-6 bg-gray-600 rounded animate-pulse mx-auto"></div>
          </div>
        </Container>
      </Section>

      {/* Projects Grid Skeleton */}
      <Section spacing="xl">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-background rounded-lg border border-gray-700 p-6">
                {/* Image placeholder */}
                <div className="w-full h-48 bg-gray-600 rounded animate-pulse mb-4"></div>
                
                {/* Title */}
                <div className="w-4/5 h-6 bg-gray-600 rounded animate-pulse mb-3"></div>
                
                {/* Description */}
                <div className="space-y-2 mb-4">
                  <div className="w-full h-4 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-full h-4 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-gray-600 rounded animate-pulse"></div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-16 h-6 bg-gray-600 rounded-full animate-pulse"></div>
                  ))}
                </div>
                
                {/* Status and button */}
                <div className="flex items-center justify-between">
                  <div className="w-20 h-5 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-24 h-8 bg-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section Skeleton */}
      <Section spacing="lg" className="bg-background-secondary/30">
        <Container size="md">
          <div className="text-center">
            <div className="w-64 h-8 bg-gray-600 rounded animate-pulse mx-auto mb-4"></div>
            <div className="w-96 h-6 bg-gray-600 rounded animate-pulse mx-auto mb-6"></div>
            <div className="w-48 h-6 bg-gray-600 rounded animate-pulse mx-auto"></div>
          </div>
        </Container>
      </Section>
    </main>
  )
}