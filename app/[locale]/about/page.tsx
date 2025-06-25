import Section from '@/components/Section';
import Container from '@/components/Container';
import Card from '@/components/Card';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { generateBlurDataURL } from '@/lib/image-optimization';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section spacing="lg">
        <Container size="md">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
            About Me
          </h1>
          <p className="text-xl text-center text-foreground/80 max-w-3xl mx-auto">
            From teaching mathematics in middle school classrooms to building AI systems that 
            solve real problems - my journey brings a unique perspective to engineering.
          </p>
        </Container>
      </Section>

      {/* My Journey: Teacher to Tech Leader */}
      <Section spacing="xl">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-semibold mb-6">
                Hi, I&apos;m <span className="text-primary">Brandon J. Redmond</span>
              </h2>
              <div className="space-y-4 text-lg text-foreground/80">
                <p>
                  Picture this: I was standing in front of a classroom of middle schoolers, 
                  trying to explain quadratic equations, when it hit me - the same systematic 
                  thinking that makes a great teacher could revolutionize how we build technology.
                </p>
                <p>
                  That moment sparked a journey that took me from mathematics education to 
                  leading engineering teams, but I never stopped being a teacher at heart. 
                  Today, I specialize in building production-ready AI systems while sharing 
                  that knowledge with the next generation of engineers.
                </p>
                <p>
                  My superpower? I break down complex AI concepts into learnable, logical 
                  components - whether I&apos;m architecting agentic workflows or explaining 
                  MCP servers to fellow developers.
                </p>
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
            The Pivot
          </h2>
          <div className="prose prose-lg max-w-none text-foreground/80">
            <p className="text-center mb-8">
              When the pandemic hit in 2020, I made a decision that changed everything. 
              After years of teaching mathematics - first middle school, then high school 
              computer science - I realized technology could amplify my impact far beyond 
              any single classroom.
            </p>
            <div className="bg-background-secondary/50 rounded-lg p-6 border border-accent/10">
              <p className="mb-4">
                <strong className="text-primary">The Bold Move:</strong> I left my secure 
                teaching position to teach myself software development. No bootcamp, no 
                formal CS degree - just pure determination and 18 months of intensive 
                self-study.
              </p>
              <p>
                <strong className="text-primary">What I Brought Forward:</strong> The ability 
                to break complex problems into teachable steps, systematic thinking, and 
                an obsession with making difficult concepts accessible. These weren&apos;t just 
                teaching skills - they were engineering superpowers.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 0 to Team Lead in 3 Years */}
      <Section spacing="xl">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            0 to Team Lead in 3 Years
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Timeline items */}
              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">2024 - Present</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Engineering Focus</h3>
                <p className="text-foreground/70">
                  Building agentic AI systems and MCP servers. Teaching complex AI concepts 
                  to engineering teams while architecting production-ready solutions.
                </p>
              </div>

              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">2023 - Present</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Team Lead - Internal Tools</h3>
                <p className="text-foreground/70">
                  Built the Internal Tools team from scratch. Created automation systems 
                  that transformed company workflows and eliminated hours of manual work daily.
                </p>
              </div>

              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">2022 - 2023</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">First Developer Role</h3>
                <p className="text-foreground/70">
                  Rapid growth from junior to mid-level developer. Proved that teaching 
                  skills translate directly to mentoring teammates and leading technical discussions.
                </p>
              </div>

              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">2020 - 2022</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Self-Taught Developer Journey</h3>
                <p className="text-foreground/70">
                  18 months of intensive learning: Python, JavaScript, React, databases, 
                  cloud platforms. Applied teaching methodologies to master technical concepts rapidly.
                </p>
              </div>

              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">2018 - 2020</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">High School CS Teacher</h3>
                <p className="text-foreground/70">
                  Taught computer science fundamentals while developing deeper 
                  understanding of technology&apos;s potential to solve real-world problems.
                </p>
              </div>

              <div className="relative pl-8 border-l-2 border-accent/20">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <div className="mb-1">
                  <span className="text-sm text-primary font-medium">2015 - 2018</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Middle School Math Teacher</h3>
                <p className="text-foreground/70">
                  Masters in Mathematics. Developed systematic approaches to 
                  breaking down complex problems - skills that now drive my engineering process.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Teaching Shapes My Engineering */}
      <Section spacing="xl" className="bg-background-secondary/50">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            Teaching Shapes My Engineering
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Systematic Problem Solving
              </h3>
              <p className="text-foreground/80">
                Every complex system gets broken down into learnable components. 
                Whether it&apos;s explaining fractions or architecting microservices, 
                the approach is the same: start simple, build understanding step by step.
              </p>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Clear Communication
              </h3>
              <p className="text-foreground/80">
                Technical concepts mean nothing if you can&apos;t explain them clearly. 
                My teaching background helps me write better documentation, lead 
                more effective meetings, and mentor junior developers.
              </p>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Patient Debugging
              </h3>
              <p className="text-foreground/80">
                Years of helping struggling students taught me that every bug 
                has a logical explanation. I approach debugging the same way I 
                approached helping students: methodically and without judgment.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Technical Proficiency */}
      <Section spacing="xl">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            Technical Stack
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                AI & Automation
              </h3>
              <ul className="space-y-2 text-foreground/80">
                <li>• Agentic AI Systems</li>
                <li>• MCP Server Development</li>
                <li>• LLM Integration & RAG</li>
                <li>• Workflow Automation</li>
                <li>• Production AI Deployment</li>
              </ul>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Languages & Frameworks
              </h3>
              <ul className="space-y-2 text-foreground/80">
                <li>• Rust (Systems & Performance)</li>
                <li>• Python (AI & Data)</li>
                <li>• TypeScript/React (Frontend)</li>
                <li>• Ruby on Rails (Backend)</li>
                <li>• SQL & NoSQL Databases</li>
              </ul>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Infrastructure & Tools
              </h3>
              <ul className="space-y-2 text-foreground/80">
                <li>• Cloud Platforms (AWS, GCP)</li>
                <li>• Docker & Containerization</li>
                <li>• CI/CD Pipeline Design</li>
                <li>• Microservices Architecture</li>
                <li>• Monitoring & Observability</li>
              </ul>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Beyond Code */}
      <Section spacing="xl" className="bg-background-secondary/30">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            Beyond Code
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-6 text-primary">Global Perspective</h3>
              <div className="space-y-4 text-foreground/80">
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">🌍</span>
                  <div>
                    <strong>Dual Location:</strong> São Paulo, Brazil ↔ New York, NY
                    <p className="text-sm text-foreground/60 mt-1">
                      Multicultural perspective shapes how I approach global products
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">🗣️</span>
                  <div>
                    <strong>Languages:</strong> English, Portuguese, Italian
                    <p className="text-sm text-foreground/60 mt-1">
                      Communication skills that open doors across cultures
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">🎓</span>
                  <div>
                    <strong>Education:</strong> Masters in Mathematics
                    <p className="text-sm text-foreground/60 mt-1">
                      Strong analytical foundation for complex problem solving
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-6 text-primary">Personal Interests</h3>
              <div className="space-y-4 text-foreground/80">
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">🧗</span>
                  <div>
                    <strong>Rock Climbing:</strong> Mental and physical challenges
                    <p className="text-sm text-foreground/60 mt-1">
                      Problem-solving under pressure, just like debugging production issues
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">🎹</span>
                  <div>
                    <strong>Piano:</strong> Pattern recognition and practice
                    <p className="text-sm text-foreground/60 mt-1">
                      Music theory parallels system architecture in surprising ways
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✈️</span>
                  <div>
                    <strong>Travel & Family:</strong> Global adventures
                    <p className="text-sm text-foreground/60 mt-1">
                      Understanding different cultures enhances product design
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
                Key Achievement
              </h3>
              <p className="text-foreground/80">
                Built the Internal Tools team from scratch, creating automation systems 
                that eliminated hours of manual work daily and became the foundation 
                for company-wide productivity improvements.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}