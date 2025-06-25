export default function LearnLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Title skeleton */}
        <div className="h-12 bg-accent/20 rounded-lg w-64 mb-4"></div>
        
        {/* Subtitle skeleton */}
        <div className="h-6 bg-accent/20 rounded-lg w-96 mb-12"></div>
        
        {/* Learning paths section */}
        <div className="mb-16">
          <div className="h-8 bg-accent/20 rounded-lg w-48 mb-6"></div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-accent/10 rounded-lg space-y-4">
                {/* Icon skeleton */}
                <div className="h-12 w-12 bg-accent/20 rounded-lg"></div>
                
                {/* Title skeleton */}
                <div className="h-6 bg-accent/20 rounded-lg w-3/4"></div>
                
                {/* Description skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-accent/20 rounded-lg"></div>
                  <div className="h-4 bg-accent/20 rounded-lg w-5/6"></div>
                </div>
                
                {/* Progress skeleton */}
                <div className="h-2 bg-accent/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Concepts section */}
        <div>
          <div className="h-8 bg-accent/20 rounded-lg w-48 mb-6"></div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-accent/10 rounded-lg space-y-2">
                <div className="h-5 bg-accent/20 rounded-lg w-2/3"></div>
                <div className="h-4 bg-accent/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}