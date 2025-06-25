'use client';

import Container from './Container';
import Button from './Button';
import Link from 'next/link';
import { HeroImage } from './ui/optimized-image';
import { generateBlurDataURL } from '@/lib/image-optimization';
import { createTranslator, type Locale } from '@/lib/translations';

interface HeroProps {
  locale: string;
}

export default function Hero({ locale }: HeroProps) {
  const t = createTranslator(locale as Locale);
  return (
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-32 sm:pb-24">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t('hero.title')}{' '}
              <span className="text-primary">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-xl text-foreground/80 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/${locale}/projects`}>
                <Button size="lg" variant="primary">
                  {t('hero.ctaPrimary')}
                </Button>
              </Link>
              <Link href={`/${locale}/learn`}>
                <Button size="lg" variant="secondary">
                  {t('hero.ctaSecondary')}
                </Button>
              </Link>
            </div>
            
            {/* Location Badges */}
            <div className="flex flex-wrap gap-3 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">{t('hero.locationSP')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">{t('hero.locationNY')}</span>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <p className="text-3xl font-bold text-primary">{t('hero.statsYearsValue')}</p>
                <p className="text-sm text-foreground/60">{t('hero.statsYearsLabel')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{t('hero.statsMCPValue')}</p>
                <p className="text-sm text-foreground/60">{t('hero.statsMCPLabel')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{t('hero.statsStudentsValue')}</p>
                <p className="text-sm text-foreground/60">{t('hero.statsStudentsLabel')}</p>
              </div>
            </div>
          </div>
          
          {/* Profile Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative w-full max-w-md mx-auto">
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl" />
              <div className="relative aspect-square rounded-full overflow-hidden border-4 border-accent/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <HeroImage
                  src="/images/profile/brandon-ai.png" 
                  alt="Brandon J. Redmond - AI Engineer and Technical Leader"
                  fill={true}
                  className="w-full h-full"
                  objectFit="cover"
                  objectPosition="60% 60%"
                  blurDataURL={generateBlurDataURL(400, 400, '#f0f0f0')}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
    </section>
  );
}