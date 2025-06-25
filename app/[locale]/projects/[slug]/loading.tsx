import Section from '@/components/Section'
import Container from '@/components/Container'

export default function ProjectLoading() {
  return (
    <main className="min-h-screen pt-24">
      {/* Hero Section Skeleton */}
      <Section spacing="lg">
        <Container>
          {/* Back button skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
            <div className="w-24 h-4 bg-gray-600 rounded animate-pulse"></div>
          </div>
          
          {/* Title skeleton */}
          <div className="w-3/4 h-12 bg-gray-600 rounded animate-pulse mb-6"></div>
          
          {/* Description skeleton */}
          <div className="space-y-3 mb-8">
            <div className="w-full h-6 bg-gray-600 rounded animate-pulse"></div>
            <div className="w-5/6 h-6 bg-gray-600 rounded animate-pulse"></div>
          </div>
          
          {/* Tags skeleton */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-20 h-8 bg-gray-600 rounded-full animate-pulse"></div>
            ))}
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex gap-4">
            <div className="w-32 h-10 bg-gray-600 rounded animate-pulse"></div>
            <div className="w-24 h-10 bg-gray-600 rounded animate-pulse"></div>
          </div>
        </Container>
      </Section>

      {/* Overview Section Skeleton */}
      <Section spacing="xl">
        <Container>
          <div className="w-32 h-8 bg-gray-600 rounded animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full h-4 bg-gray-600 rounded animate-pulse"></div>
            ))}
            <div className="w-3/4 h-4 bg-gray-600 rounded animate-pulse"></div>
          </div>
        </Container>
      </Section>

      {/* Technical Stack Section Skeleton */}
      <Section spacing="xl" className="bg-background-secondary/50">
        <Container>
          <div className="w-40 h-8 bg-gray-600 rounded animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 bg-background rounded-lg border border-gray-700">
                <div className="w-24 h-6 bg-gray-600 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Key Features Section Skeleton */}
      <Section spacing="xl">
        <Container>
          <div className="w-36 h-8 bg-gray-600 rounded animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-600 rounded-full animate-pulse flex-shrink-0 mt-0.5"></div>
                <div className="w-full h-4 bg-gray-600 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Challenges Section Skeleton */}
      <Section spacing="xl" className="bg-background-secondary/30">
        <Container>
          <div className="w-48 h-8 bg-gray-600 rounded animate-pulse mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 bg-background rounded-lg border border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg animate-pulse flex-shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="w-full h-4 bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-4/5 h-4 bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Outcomes Section Skeleton */}
      <Section spacing="xl">
        <Container>
          <div className="w-48 h-8 bg-gray-600 rounded animate-pulse mb-8 mx-auto"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-8 bg-gray-600 rounded animate-pulse mb-2 mx-auto"></div>
                <div className="w-20 h-4 bg-gray-600 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Final CTA Section Skeleton */}
      <Section spacing="lg">
        <Container>
          <div className="text-center">
            <div className="w-40 h-10 bg-gray-600 rounded animate-pulse mx-auto"></div>
          </div>
        </Container>
      </Section>
    </main>
  )
}