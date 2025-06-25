'use client';

import Link from 'next/link';
import { createTranslator, type Locale } from '@/lib/translations';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const t = createTranslator(locale as Locale);
  
  const quickLinks = [
    { name: t('nav.home'), href: `/${locale}` },
    { name: t('nav.about'), href: `/${locale}/${locale === 'pt-BR' ? 'sobre' : 'about'}` },
    { name: t('nav.projects'), href: `/${locale}/${locale === 'pt-BR' ? 'projetos' : 'projects'}` },
    { name: t('nav.blog'), href: `/${locale}/blog` },
    { name: t('nav.contact'), href: `/${locale}/${locale === 'pt-BR' ? 'contato' : 'contact'}` },
  ];

  const platformLinks = [
    { name: t('nav.learn'), href: `/${locale}/${locale === 'pt-BR' ? 'aprender' : 'learn'}` },
  ];

  // Use a stable year to avoid hydration mismatches
  const currentYear = 2024;

  return (
    <footer className="bg-background-secondary border-t border-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link href={`/${locale}`} className="text-xl font-bold text-primary hover:text-primary-hover transition-colors">
              Brandon J. Redmond
            </Link>
            <p className="mt-4 text-foreground/60 max-w-md">
              {t('about.subtitle')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              {t('footer.platforms')}
            </h3>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-accent/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-foreground/40 text-sm">
              © {currentYear} Brandon J. Redmond. {t('footer.copyright')}.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link
                href="/privacy"
                className="text-foreground/40 hover:text-primary text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-foreground/40 hover:text-primary text-sm transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}