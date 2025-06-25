'use client';

import React from 'react';
import { Lock, Globe } from 'lucide-react';

interface GitHubButtonProps {
  githubUrl: string;
  isPrivate: boolean;
}

export default function GitHubButton({ githubUrl, isPrivate }: GitHubButtonProps) {
  return (
    <div className="flex items-center gap-2 mb-12">
      <a 
        href={isPrivate ? '#' : githubUrl}
        className={`px-6 py-3 bg-accent/20 text-primary rounded-lg transition-colors ${
          isPrivate 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-accent/30'
        }`}
        onClick={isPrivate ? (e) => e.preventDefault() : undefined}
        title={isPrivate ? 'This repository is private' : 'View on GitHub'}
      >
        View on GitHub
      </a>
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
        isPrivate 
          ? 'bg-orange-500/10 text-orange-500' 
          : 'bg-green-500/10 text-green-500'
      }`}>
        {isPrivate ? (
          <>
            <Lock className="w-3 h-3" />
            Private
          </>
        ) : (
          <>
            <Globe className="w-3 h-3" />
            Public
          </>
        )}
      </span>
    </div>
  );
}