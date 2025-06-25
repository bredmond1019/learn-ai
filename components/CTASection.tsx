'use client';

import Section from './Section';
import Container from './Container';
import Button from './Button';
import Link from 'next/link';
import { createTranslator, type Locale } from '@/lib/translations';

interface CTASectionProps {
  locale: string;
}

export default function CTASection({ locale }: CTASectionProps) {
  const t = createTranslator(locale as Locale);
  return (
    <Section spacing="xl" className="relative overflow-hidden">
      <Container>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-lg sm:text-xl text-foreground/80 mb-8">
            {t('cta.subtitle')}
          </p>
          <div className="flex justify-center">
            <Link href={`/${locale}/contact`}>
              <Button size="lg" variant="primary">
                {t('cta.button')}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
      
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 -z-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
    </Section>
  );
}