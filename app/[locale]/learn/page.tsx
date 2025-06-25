import Section from '@/components/Section';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Button from '@/components/Button';
import LearnCardServer from '@/components/LearnCardServer';
import ConceptCard from '@/components/ConceptCard';
import Link from 'next/link';
import { learningPaths, concepts, type Locale } from '@/lib/learn';
import { createTranslator } from '@/lib/translations';

export const metadata = {
  title: 'Learn Agentic AI & MCP Servers',
  description: 'Master the fundamentals of agentic AI systems and MCP servers with Brandon\'s teaching-focused approach to complex AI concepts.',
};


const getTeachingPhilosophy = (locale: string) => {
  const t = createTranslator(locale as Locale);
  return {
    title: t('learn.teachingPhilosophy'),
    points: [
      locale === 'pt-BR' ? 'Comece com o "porquê" - entenda o problema antes de mergulhar nas soluções' : "Start with the 'why' - understand the problem before diving into solutions",
      locale === 'pt-BR' ? 'Divida sistemas complexos em componentes gerenciáveis e lógicos' : "Break complex systems into manageable, logical components",
      locale === 'pt-BR' ? 'Aprenda construindo - cada conceito é pareado com implementação prática' : "Learn by building - every concept is paired with hands-on implementation",
      locale === 'pt-BR' ? 'Conecte novos conceitos ao conhecimento existente que você já tem' : "Connect new concepts to existing knowledge you already have",
      locale === 'pt-BR' ? 'A prática torna permanente - a repetição constrói compreensão' : "Practice makes permanent - repetition builds understanding"
    ]
  };
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function LearnPage({ params }: Props) {
  const { locale } = await params;
  const t = createTranslator(locale as Locale);
  const currentLearningPaths = learningPaths[locale as Locale] || learningPaths['en'];
  const currentConcepts = concepts[locale as Locale] || concepts['en'];
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section spacing="xl">
        <Container size="lg">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {locale === 'pt-BR' ? (
                <>
                  Aprender <span className="text-primary">IA Agêntica</span> & 
                  <br />
                  <span className="text-primary">Servidores MCP</span>
                </>
              ) : (
                <>
                  Learn <span className="text-primary">Agentic AI</span> & 
                  <br />
                  <span className="text-primary">MCP Servers</span>
                </>
              )}
            </h1>
            <p className="text-xl text-foreground/80 mb-8 leading-relaxed">
              {t('learn.subtitleMain')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#learning-paths">
                <Button size="lg" variant="primary">
                  {t('learn.startLearning')}
                </Button>
              </Link>
              <Link href="#concepts">
                <Button size="lg" variant="secondary">
                  {t('learn.exploreConcepts')}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">10+</p>
              <p className="text-sm text-foreground/60">{t('learn.stats.mcpServers')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">100+</p>
              <p className="text-sm text-foreground/60">{t('learn.stats.students')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">5+</p>
              <p className="text-sm text-foreground/60">{t('learn.stats.yearsTeaching')}</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Teaching Philosophy */}
      <Section spacing="xl" className="bg-background-secondary/30">
        <Container size="md">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">
              {getTeachingPhilosophy(locale).title}
            </h2>
            <p className="text-lg text-foreground/80">
              {t('learn.teachingSubtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getTeachingPhilosophy(locale).points.map((point, index) => (
              <Card key={index} className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">{index + 1}</span>
                </div>
                <p className="text-foreground/80">{point}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Learning Paths */}
      <Section spacing="xl" id="learning-paths">
        <Container size="lg">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">
              {t('learn.learningPaths')}
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              {t('learn.learningPathsSubtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentLearningPaths.map((path) => (
              <LearnCardServer key={path.id} path={path} locale={locale} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Key Concepts */}
      <Section spacing="xl" id="concepts" className="bg-background-secondary/30">
        <Container size="lg">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">
              {t('learn.keyConcepts')}
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              {t('learn.keyConceptsSubtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentConcepts.slice(0, 6).map((concept) => (
              <ConceptCard key={concept.id} concept={concept} locale={locale} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Why Learn This */}
      <Section spacing="xl">
        <Container size="md">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">
              {t('learn.whyLearn')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-primary">{t('learn.futureIsAgentic')}</h3>
              <p className="text-foreground/80 mb-4">
                {t('learn.futureIsAgenticText')}
              </p>
              <p className="text-foreground/80">
                {t('learn.mcpStandard')}
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-primary">{t('learn.competitiveAdvantage')}</h3>
              <p className="text-foreground/80 mb-4">
                {t('learn.competitiveAdvantageText')}
              </p>
              <p className="text-foreground/80">
                {t('learn.teachingApproach')}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section spacing="xl" className="bg-primary/5 border-t border-primary/20 border-b border-primary/20">
        <Container size="md">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">
              {t('learn.readyToMaster')}
            </h2>
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
              {t('learn.readyToMasterSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#learning-paths">
                <Button size="lg" variant="primary">
                  {t('learn.chooseYourPath')}
                </Button>
              </Link>
              <Link href={`/${locale}/${locale === 'pt-BR' ? 'contato' : 'contact'}`}>
                <Button size="lg" variant="secondary">
                  {t('learn.getPersonalGuidance')}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}