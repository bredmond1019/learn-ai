'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { createTranslator, type Locale } from '@/lib/translations';
import LanguageSwitcher from './LanguageSwitcher';

interface NavItem {
  key: string;
  route: string;
}

const navItems: NavItem[] = [
  { key: 'nav.home', route: '' },
  { key: 'nav.about', route: 'about' },
  { key: 'nav.projects', route: 'projects' },
  { key: 'nav.learn', route: 'learn' },
  { key: 'nav.blog', route: 'blog' },
  { key: 'nav.contact', route: 'contact' },
];

interface NavigationProps {
  locale: string;
}

export default function Navigation({ locale }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = createTranslator(locale as Locale);

  // Get localized route
  const getLocalizedRoute = (route: string) => {
    const baseRoute = route === '' ? '' : `/${route}`;
    return `/${locale}${baseRoute}`;
  };

  // Map English routes to Portuguese routes
  const getPortugueseRoute = (route: string) => {
    const routeMap: Record<string, string> = {
      'about': 'sobre',
      'projects': 'projetos', 
      'learn': 'aprender',
      'contact': 'contato',
      'blog': 'blog',
    };
    return locale === 'pt-BR' ? (routeMap[route] || route) : route;
  };

  // Helper function to check if current path matches nav item
  const isCurrentPath = (route: string) => {
    const localizedRoute = getLocalizedRoute(getPortugueseRoute(route));
    return pathname === localizedRoute || (localizedRoute !== `/${locale}` && pathname.startsWith(localizedRoute + '/'));
  };

  return (
    <>
      {/* Skip Link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:m-2"
      >
        Skip to main content
      </a>
      
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="text-xl font-bold text-primary hover:text-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md">
              Brandon J. Redmond
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="flex items-baseline space-x-6">
              {navItems.map((item) => {
                const href = getLocalizedRoute(getPortugueseRoute(item.route));
                return (
                  <Link
                    key={item.key}
                    href={href}
                    className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md ${
                      isCurrentPath(item.route)
                        ? 'text-primary'
                        : 'text-foreground/80 hover:text-foreground'
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>
            <LanguageSwitcher currentLocale={locale} />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher currentLocale={locale} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background-secondary">
          {navItems.map((item) => {
            const href = getLocalizedRoute(getPortugueseRoute(item.route));
            return (
              <Link
                key={item.key}
                href={href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-accent/20 ${
                  isCurrentPath(item.route)
                    ? 'text-primary bg-accent/10'
                    : 'text-foreground/80 hover:text-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
    </>
  );
}