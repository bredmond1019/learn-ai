'use client';

import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/middleware';

interface LanguageSwitcherProps {
  currentLocale: string;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    
    // Map routes between languages
    const routeMap: Record<string, Record<string, string>> = {
      'pt-BR': {
        '/sobre': '/about',
        '/projetos': '/projects', 
        '/aprender': '/learn',
        '/contato': '/contact',
      },
      'en': {
        '/about': '/sobre',
        '/projects': '/projetos',
        '/learn': '/aprender', 
        '/contact': '/contato',
      }
    };

    let newPath = pathWithoutLocale;
    
    // Apply route mapping if switching languages
    if (routeMap[currentLocale] && routeMap[currentLocale][pathWithoutLocale]) {
      newPath = routeMap[currentLocale][pathWithoutLocale];
    } else if (routeMap[newLocale]) {
      // Check reverse mapping
      const reverseMap = Object.fromEntries(
        Object.entries(routeMap[newLocale]).map(([key, value]) => [value, key])
      );
      if (reverseMap[pathWithoutLocale]) {
        newPath = reverseMap[pathWithoutLocale];
      }
    }

    // Construct new URL
    const newUrl = `/${newLocale}${newPath}`;
    router.push(newUrl);
  };

  const getLanguageLabel = (locale: string) => {
    const labels: Record<string, string> = {
      'en': 'EN',
      'pt-BR': 'PT',
    };
    return labels[locale] || locale;
  };

  const getLanguageName = (locale: string) => {
    const names: Record<string, string> = {
      'en': 'English',
      'pt-BR': 'Português',
    };
    return names[locale] || locale;
  };

  return (
    <div className="relative">
      <select
        value={currentLocale}
        onChange={(e) => switchLanguage(e.target.value)}
        className="appearance-none bg-transparent border border-accent/20 rounded px-3 py-1 text-sm font-medium text-foreground hover:border-accent/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        aria-label="Select language"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale} className="bg-background text-foreground">
            {getLanguageLabel(locale)} - {getLanguageName(locale)}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground/60">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
}