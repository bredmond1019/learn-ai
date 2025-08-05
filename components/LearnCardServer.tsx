import Link from 'next/link';
import Card from './Card';
import Button from './Button';
import { LearningPath, type Locale } from '@/lib/content/learning/learn';
import { createTranslator } from '@/lib/translations';

interface LearnCardServerProps {
  path: LearningPath;
  className?: string;
  locale?: string;
}

export default function LearnCardServer({ path, className, locale = 'en' }: LearnCardServerProps) {
  const t = createTranslator(locale as Locale);
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
      case 'Iniciante':
        return 'bg-green-500/20 text-green-400';
      case 'Intermediate':
      case 'Intermediário':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced':
      case 'Avançado':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-accent/20 text-accent';
    }
  };

  return (
    <Card variant="interactive" className={`h-full flex flex-col ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(path.level)}`}>
          {path.level}
        </span>
        <span className="text-sm text-foreground/60">{path.duration}</span>
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-primary">
        {path.title}
      </h3>
      
      <p className="text-foreground/80 mb-6">
        {path.description}
      </p>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground/70 mb-2">{locale === 'pt-BR' ? 'Você Aprenderá:' : "You'll Learn:"}</h4>
        <div className="flex flex-wrap gap-2">
          {path.topics.map((topic) => (
            <span 
              key={topic}
              className="px-2 py-1 bg-accent/20 rounded text-xs text-foreground/80"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {path.prerequisites && path.prerequisites.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground/70 mb-2">{t('learn.prerequisites')}:</h4>
          <div className="flex flex-wrap gap-2">
            {path.prerequisites.map((prereq) => (
              <span 
                key={prereq}
                className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-xs text-primary"
              >
                {prereq}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex-grow">
        <h4 className="text-sm font-medium text-foreground/70 mb-2">{t('learn.outcomes')}:</h4>
        <ul className="space-y-1">
          {path.outcomes.slice(0, 3).map((outcome, index) => (
            <li key={index} className="text-sm text-foreground/70 flex items-start">
              <span className="text-primary mr-2 mt-1">•</span>
              {outcome}
            </li>
          ))}
          {path.outcomes.length > 3 && (
            <li className="text-sm text-foreground/50">
              +{path.outcomes.length - 3} {locale === 'pt-BR' ? 'mais resultados' : 'more outcomes'}
            </li>
          )}
        </ul>
      </div>
      
      <div className="flex flex-col gap-2">
        <Link href={`/${locale}/${locale === 'pt-BR' ? 'aprender' : 'learn'}/paths/${path.id}`}>
          <Button variant="primary" className="w-full">
            {t('learn.startPath')}
          </Button>
        </Link>
        <Link href={`/${locale}/${locale === 'pt-BR' ? 'aprender' : 'learn'}/paths/${path.id}/preview`}>
          <Button variant="secondary" className="w-full">
            {locale === 'pt-BR' ? 'Visualizar Conteúdo' : 'Preview Content'}
          </Button>
        </Link>
      </div>
    </Card>
  );
}