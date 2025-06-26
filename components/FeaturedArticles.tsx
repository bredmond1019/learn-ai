'use client';

import Container from './Container';
import Link from 'next/link';
import { ArrowRight, Sparkles, Briefcase, Users } from 'lucide-react';
import { createTranslator, type Locale } from '@/lib/translations';

interface FeaturedArticlesProps {
  locale: string;
}

interface ArticleCardProps {
  title: string;
  excerpt: string;
  slug: string;
  partNumber: number;
  icon: React.ElementType;
  locale: string;
}

function ArticleCard({ title, excerpt, slug, partNumber, icon: Icon, locale }: ArticleCardProps) {
  const t = createTranslator(locale as Locale);
  
  return (
    <Link href={`/${locale}/blog/${slug}`}>
      <article className="group h-full bg-card rounded-lg border border-border p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {t('featuredArticles.part')} {partNumber}
            </span>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {excerpt}
        </p>
        
        <div className="flex items-center text-primary font-medium">
          <span>{t('featuredArticles.readArticle')}</span>
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </article>
    </Link>
  );
}

export default function FeaturedArticles({ locale }: FeaturedArticlesProps) {
  const t = createTranslator(locale as Locale);
  
  const articles = [
    {
      title: t('featuredArticles.article1Title'),
      excerpt: t('featuredArticles.article1Excerpt'),
      slug: 'ai-for-everyday-person',
      partNumber: 1,
      icon: Sparkles,
    },
    {
      title: t('featuredArticles.article2Title'),
      excerpt: t('featuredArticles.article2Excerpt'),
      slug: 'ai-for-small-medium-business',
      partNumber: 2,
      icon: Briefcase,
    },
    {
      title: t('featuredArticles.article3Title'),
      excerpt: t('featuredArticles.article3Excerpt'),
      slug: 'why-ai-engineers-matter',
      partNumber: 3,
      icon: Users,
    },
  ];
  
  return (
    <section className="py-16 sm:py-24 bg-accent/5">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('featuredArticles.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            {t('featuredArticles.subtitle')}
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t('featuredArticles.description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              {...article}
              locale={locale}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Link href={`/${locale}/blog`}>
            <button className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
              {t('featuredArticles.viewAllArticles')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </Container>
    </section>
  );
}