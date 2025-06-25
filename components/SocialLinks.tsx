'use client';

import React from 'react';
import { Linkedin, Github, Instagram, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const socialLinks = [
  {
    name: 'LinkedIn',
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/bredmond1019/',
    ariaLabel: 'Visit my LinkedIn profile',
    className: 'hover:text-blue-400'
  },
  {
    name: 'GitHub',
    icon: Github,
    href: 'https://github.com/bredmond1019',
    ariaLabel: 'Visit my GitHub profile',
    className: 'hover:text-gray-300'
  },
  {
    name: 'Instagram',
    icon: Instagram,
    href: 'https://www.instagram.com/urbanlumberjack19',
    ariaLabel: 'Visit my Instagram profile',
    className: 'hover:text-pink-400'
  },
  {
    name: 'Email',
    icon: Mail,
    href: 'mailto:bredmond1019@gmail.com',
    ariaLabel: 'Send me an email',
    className: 'hover:text-green-400'
  }
];

export default function SocialLinks() {
  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <div className="flex flex-col items-center gap-6 p-4">
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.href}
              aria-label={link.ariaLabel}
              className={cn(
                'group relative flex h-12 w-12 items-center justify-center rounded-full',
                'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50',
                'text-gray-400 transition-all duration-300',
                'hover:bg-gray-800 hover:border-gray-600 hover:scale-110',
                link.className
              )}
            >
              <Icon className="h-5 w-5" />
              
              {/* Tooltip */}
              <span className="absolute left-full ml-4 px-3 py-1.5 text-sm font-medium text-gray-100 
                             bg-gray-800 rounded-md whitespace-nowrap opacity-0 pointer-events-none 
                             group-hover:opacity-100 transition-opacity duration-200">
                {link.name}
              </span>
            </a>
          );
        })}
        
        {/* Decorative line */}
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-gray-600 to-transparent mt-4" />
      </div>
    </div>
  );
}