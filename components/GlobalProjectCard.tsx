'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Card, { CardHeader, CardTitle, CardContent } from './Card';
import { cn } from '@/lib/utils';

export interface GlobalProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  slug: string;
  featured?: boolean;
  demoUrl?: string;
  githubUrl?: string;
  image?: string;
  status?: 'completed' | 'inProgress' | 'planned';
  outcomes?: Array<{
    metric: string;
    value: string;
  }>;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export default function GlobalProjectCard({
  title,
  description,
  tags,
  slug,
  featured = false,
  demoUrl,
  githubUrl,
  image,
  status = 'completed',
  outcomes,
  className,
  variant = 'default',
}: GlobalProjectCardProps) {
  const router = useRouter();

  // Create project link
  const projectLink = `/projects/${slug}`;

  // Get status display info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-green-500/10 text-green-400 border-green-500/20',
        };
      case 'inProgress':
        return {
          label: 'In Progress',
          className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        };
      case 'planned':
        return {
          label: 'Planned',
          className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        };
      default:
        return {
          label: status,
          className: 'bg-accent/10 text-foreground/70 border-accent/20',
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  // Determine card size based on variant
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured' || featured;

  const handleCardClick = () => {
    // Use router navigation instead of Link wrapper to avoid nested anchor issues
    router.push(projectLink);
  };

  return (
    <div className={cn("group", className)}>
      <Card 
        variant="interactive" 
        className={cn(
          "h-full cursor-pointer transition-all duration-300",
          isFeatured && "ring-1 ring-primary/20 hover:ring-primary/40",
          isCompact ? "hover:scale-102" : "hover:scale-105"
        )}
        onClick={handleCardClick}
      >
        <div className="block h-full relative">
          {/* Project Image */}
          {image ? (
            <div className={cn(
              "relative -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-lg",
              isCompact ? "h-32" : "h-48"
            )}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 z-10" />
              <Image 
                src={image} 
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                width={400}
                height={isCompact ? 128 : 192}
              />
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-20">
                <span className={cn(
                  "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border",
                  statusInfo.className
                )}>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full mr-1.5",
                    status === 'completed' && "bg-green-400",
                    status === 'inProgress' && "bg-yellow-400 animate-pulse",
                    status === 'planned' && "bg-blue-400"
                  )} />
                  {statusInfo.label}
                </span>
              </div>

              {/* Featured Badge */}
              {isFeatured && (
                <div className="absolute top-4 right-4 z-20">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className={cn(
              "relative -mx-6 -mt-6 mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center",
              isCompact ? "h-32" : "h-48"
            )}>
              <span className={cn(
                "font-bold text-primary/20",
                isCompact ? "text-2xl" : "text-4xl"
              )}>AI</span>
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-20">
                <span className={cn(
                  "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border",
                  statusInfo.className
                )}>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full mr-1.5",
                    status === 'completed' && "bg-green-400",
                    status === 'inProgress' && "bg-yellow-400 animate-pulse",
                    status === 'planned' && "bg-blue-400"
                  )} />
                  {statusInfo.label}
                </span>
              </div>

              {/* Featured Badge */}
              {isFeatured && (
                <div className="absolute top-4 right-4 z-20">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                </div>
              )}
            </div>
          )}

          <CardHeader className={isCompact ? "pb-2" : undefined}>
            <CardTitle className={cn(
              "group-hover:text-primary transition-colors",
              isCompact ? "text-lg" : "text-xl"
            )}>
              {title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className={cn(
              "text-foreground/80",
              isCompact ? "text-sm line-clamp-2" : "line-clamp-3"
            )}>
              {description}
            </p>
            
            {/* Outcomes - only show on featured/default variants */}
            {!isCompact && outcomes && outcomes.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {outcomes.slice(0, 2).map((outcome, index) => (
                  <div key={index} className="text-center p-2 bg-accent/5 rounded-lg">
                    <div className="text-primary font-semibold text-sm">{outcome.value}</div>
                    <div className="text-xs text-foreground/60">{outcome.metric}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, isCompact ? 2 : 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-accent/10 rounded-full text-foreground/70 hover:bg-accent/20 transition-colors"
                >
                  {tag}
                </span>
              ))}
              {tags.length > (isCompact ? 2 : 3) && (
                <span className="px-2 py-1 text-xs text-foreground/50">
                  +{tags.length - (isCompact ? 2 : 3)} more
                </span>
              )}
            </div>

            {/* Action Links - only show on hover for compact, always show for others */}
            {(demoUrl || githubUrl) && (
              <div className={cn(
                "flex gap-2 pt-2",
                isCompact ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300" : "opacity-100"
              )}>
                {demoUrl && (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Live Demo
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 text-xs bg-accent/10 text-foreground/70 rounded-full hover:bg-accent/20 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    View Code
                  </a>
                )}
              </div>
            )}
          </CardContent>

          {/* Hover Effect Arrow */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
}