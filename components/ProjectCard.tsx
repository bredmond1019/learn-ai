'use client';

import Link from 'next/link';
import { ThumbnailImage } from './ui/optimized-image';
import Card, { CardHeader, CardTitle, CardContent } from './Card';
import { cn } from '@/lib/utils';
import { getProjectIcon, isRepoPrivate } from '@/lib/icons';
import { Lock } from 'lucide-react';

export interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  slug: string;
  featured?: boolean;
  icon?: string;
  isPrivate?: boolean;
  demoUrl?: string;
  githubUrl?: string;
  image?: string;
}

export default function ProjectCard({
  title,
  description,
  tags,
  slug,
  featured = false,
  icon,
  isPrivate,
  image,
}: ProjectCardProps) {
  const ProjectIcon = getProjectIcon(icon);
  return (
    <Link href={`/projects/${slug}`}>
      <Card 
        variant="interactive" 
        className={cn(
          "h-full cursor-pointer group",
          featured && "ring-1 ring-primary/20"
        )}
      >
        {/* Project Image Placeholder */}
        {image ? (
          <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background-secondary/50" />
            <ThumbnailImage
              src={image} 
              alt={title}
              width={400}
              height={192}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              enableIntersectionObserver={true}
              rootMargin="100px"
            />
          </div>
        ) : (
          <div className="h-48 -mx-6 -mt-6 mb-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center">
            <ProjectIcon className="w-16 h-16 text-primary/30" />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="group-hover:text-primary transition-colors flex-1">
              {title}
            </CardTitle>
            {isPrivate && (
              <Lock className="w-4 h-4 text-foreground/40 ml-2 flex-shrink-0" />
            )}
          </div>
          {featured && (
            <span className="inline-block px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full mt-2">
              Featured
            </span>
          )}
        </CardHeader>
        
        <CardContent>
          <p className="mb-4 line-clamp-3">{description}</p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs bg-accent/10 rounded-full text-foreground/70"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-3 py-1 text-xs text-foreground/50">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        </CardContent>

        {/* Hover Effect Arrow */}
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
      </Card>
    </Link>
  );
}