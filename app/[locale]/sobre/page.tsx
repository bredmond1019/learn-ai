import Section from '@/components/Section';
import Container from '@/components/Container';
import Card from '@/components/Card';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { generateBlurDataURL } from '@/lib/image-optimization';
import { getTranslations } from '@/lib/translations';
import { type Locale } from '@/lib/learn';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section spacing="lg">
        <Container size="md">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
            {t.about.heroTitle}
          </h1>
          <p className="text-xl text-center text-foreground/80 max-w-3xl mx-auto">
            {t.about.heroSubtitle}
          </p>
        </Container>
      </Section>

      {/* My Journey: Teacher to Tech Leader */}
      <Section spacing="xl">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-semibold mb-6">
                {t.about.greeting} <span className="text-primary">{t.about.name}</span>
              </h2>
              <div className="space-y-4 text-lg text-foreground/80">
                <p>{t.about.intro.paragraph1}</p>
                <p>{t.about.intro.paragraph2}</p>
                <p>{t.about.intro.paragraph3}</p>
              </div>
            </div>
            
            {/* Professional Photo */}
            <div className="order-1 lg:order-2 flex items-center justify-center">
              <div className="relative max-w-sm w-full p-1">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-teal-500/40 rounded-2xl blur-md" />
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-background-secondary border border-white/10">
                  <OptimizedImage
                    src="/images/profile/ProfilePic.jpg" 
                    alt="Brandon J. Redmond - Professional headshot"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    priority={true}
                    placeholder="blur"
                    blurDataURL={generateBlurDataURL(400, 400, '#f0f0f0')}
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* The Pivot */}
      <Section spacing="xl" className="bg-background-secondary/50">
        <Container size="md">
          <h2 className="text-3xl font-semibold text-center mb-8">
            {t.about.pivotTitle}
          </h2>
          <div className="prose prose-lg max-w-none text-foreground/80">
            <p className="text-center mb-8">
              {t.about.pivotIntro}
            </p>
            <div className="bg-background-secondary/50 rounded-lg p-6 border border-accent/10">
              <p className="mb-4">
                <strong className="text-primary">{t.about.boldMove}</strong> {t.about.boldMoveText}
              </p>
              <p>
                <strong className="text-primary">{t.about.whatIBrought}</strong> {t.about.whatIBroughtText}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 0 to Team Lead in 3 Years */}
      <Section spacing="xl">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            {t.about.timelineTitle}
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Timeline items */}
              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">{t.about.timeline.current.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t.about.timeline.current.title}</h3>
                <p className="text-foreground/70">{t.about.timeline.current.description}</p>
              </div>

              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">{t.about.timeline.teamLead.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t.about.timeline.teamLead.title}</h3>
                <p className="text-foreground/70">{t.about.timeline.teamLead.description}</p>
              </div>

              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">{t.about.timeline.firstDev.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t.about.timeline.firstDev.title}</h3>
                <p className="text-foreground/70">{t.about.timeline.firstDev.description}</p>
              </div>

              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">{t.about.timeline.selfTaught.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t.about.timeline.selfTaught.title}</h3>
                <p className="text-foreground/70">{t.about.timeline.selfTaught.description}</p>
              </div>

              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">{t.about.timeline.hsTeacher.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t.about.timeline.hsTeacher.title}</h3>
                <p className="text-foreground/70">{t.about.timeline.hsTeacher.description}</p>
              </div>

              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">{t.about.timeline.msTeacher.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t.about.timeline.msTeacher.title}</h3>
                <p className="text-foreground/70">{t.about.timeline.msTeacher.description}</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Teaching Shapes My Engineering */}
      <Section spacing="xl" className="bg-background-secondary/50">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            {t.about.teachingShapesTitle}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {t.about.teachingShapes.problemSolving.title}
              </h3>
              <p className="text-foreground/80">
                {t.about.teachingShapes.problemSolving.description}
              </p>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {t.about.teachingShapes.communication.title}
              </h3>
              <p className="text-foreground/80">
                {t.about.teachingShapes.communication.description}
              </p>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {t.about.teachingShapes.debugging.title}
              </h3>
              <p className="text-foreground/80">
                {t.about.teachingShapes.debugging.description}
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Technical Proficiency */}
      <Section spacing="xl">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            {t.about.technicalStackTitle}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {t.about.technicalStack.ai.title}
              </h3>
              <ul className="space-y-2 text-foreground/80">
                {t.about.technicalStack.ai.items.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {t.about.technicalStack.languages.title}
              </h3>
              <ul className="space-y-2 text-foreground/80">
                {t.about.technicalStack.languages.items.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {t.about.technicalStack.infrastructure.title}
              </h3>
              <ul className="space-y-2 text-foreground/80">
                {t.about.technicalStack.infrastructure.items.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Beyond Code */}
      <Section spacing="xl" className="bg-background-secondary/30">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            {t.about.beyondCodeTitle}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-6 text-primary">{t.about.globalPerspective}</h3>
              <div className="space-y-4 text-foreground/80">
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">🌍</span>
                  <div>
                    <strong>{t.about.dualLocation}</strong> {t.about.dualLocationText}
                    <p className="text-sm text-foreground/60 mt-1">
                      {t.about.dualLocationSubtext}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">🗣️</span>
                  <div>
                    <strong>{t.about.languages}</strong> {t.about.languagesText}
                    <p className="text-sm text-foreground/60 mt-1">
                      {t.about.languagesSubtext}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">🎓</span>
                  <div>
                    <strong>{t.about.education}</strong> {t.about.educationText}
                    <p className="text-sm text-foreground/60 mt-1">
                      {t.about.educationSubtext}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-6 text-primary">{t.about.personalInterests}</h3>
              <div className="space-y-4 text-foreground/80">
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">🧗</span>
                  <div>
                    <strong>{t.about.rockClimbing}</strong> {t.about.rockClimbingText}
                    <p className="text-sm text-foreground/60 mt-1">
                      {t.about.rockClimbingSubtext}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">🎹</span>
                  <div>
                    <strong>{t.about.piano}</strong> {t.about.pianoText}
                    <p className="text-sm text-foreground/60 mt-1">
                      {t.about.pianoSubtext}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✈️</span>
                  <div>
                    <strong>{t.about.travel}</strong> {t.about.travelText}
                    <p className="text-sm text-foreground/60 mt-1">
                      {t.about.travelSubtext}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Achievement Callout */}
          <div className="mt-12 text-center">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-primary mb-3">
                {t.about.keyAchievementTitle}
              </h3>
              <p className="text-foreground/80">
                {t.about.keyAchievementText}
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}