import Link from 'next/link';
import Card from './Card';
import Button from './Button';
import { Concept } from '@/lib/learn';

interface ConceptCardProps {
  concept: Concept;
  className?: string;
  locale?: string;
}

export default function ConceptCard({ concept, className, locale = 'en' }: ConceptCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fundamentals':
        return '🎯';
      case 'architecture':
        return '🏗️';
      case 'implementation':
        return '⚙️';
      case 'patterns':
        return '🧩';
      default:
        return '📚';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-foreground/60';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Card variant="interactive" className={`h-full ${className || ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(concept.category)}</span>
          <span className="text-xs text-foreground/60 font-medium">
            {getCategoryLabel(concept.category)}
          </span>
        </div>
        <span className={`text-xs font-medium capitalize ${getDifficultyColor(concept.difficulty)}`}>
          {concept.difficulty}
        </span>
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-primary">
        {concept.title}
      </h3>
      
      <p className="text-foreground/80 mb-6">
        {concept.description}
      </p>

      {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground/70 mb-2">{locale === 'pt-BR' ? 'Conceitos Relacionados:' : 'Related Concepts:'}</h4>
          <div className="flex flex-wrap gap-2">
            {concept.relatedConcepts.map((related) => (
              <span 
                key={related}
                className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-xs text-primary"
              >
                {related}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-auto">
        <Link href={concept.learnMore}>
          <Button variant="secondary" size="sm" className="w-full">
            {locale === 'pt-BR' ? 'Saiba Mais →' : 'Learn More →'}
          </Button>
        </Link>
      </div>
    </Card>
  );
}