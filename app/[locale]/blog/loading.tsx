export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Title skeleton */}
        <div className="h-12 bg-accent/20 rounded-lg w-48 mb-8"></div>
        
        {/* Blog posts skeleton */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              {/* Image skeleton */}
              <div className="h-48 bg-accent/20 rounded-lg"></div>
              
              {/* Title skeleton */}
              <div className="h-6 bg-accent/20 rounded-lg w-3/4"></div>
              
              {/* Date skeleton */}
              <div className="h-4 bg-accent/20 rounded-lg w-1/4"></div>
              
              {/* Excerpt skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-accent/20 rounded-lg"></div>
                <div className="h-4 bg-accent/20 rounded-lg w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}