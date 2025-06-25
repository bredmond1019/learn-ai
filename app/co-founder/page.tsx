import Section from '@/components/Section';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';

export const metadata = {
  title: 'Co-founder Partnership - Brandon J. Redmond',
  description: 'Looking for a technical co-founder? Partner with an AI Engineer who brings teaching skills, technical expertise, and a proven track record of building teams and products.',
};

export default function CoFounderPage() {
  return (
    <main className="min-h-screen pt-24">
      {/* Hero Section */}
      <Section spacing="lg">
        <Container size="md">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Build the Future of AI Together?
            </h1>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto mb-8">
              I&apos;m seeking a visionary co-founder to partner with on groundbreaking AI ventures. 
              Let&apos;s combine your business acumen with my technical expertise to create something extraordinary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="primary">
                  Start a Conversation
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="secondary">
                  See My Technical Work
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* Why Partner With Me */}
      <Section spacing="xl" className="bg-background-secondary/30">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            Why Partner With Me?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Proven Track Record
                </h3>
                <p className="text-foreground/80">
                  Built and led engineering teams from scratch. Went from zero programming 
                  experience to team leadership in 3 years - I know how to execute fast and scale effectively.
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  AI Expertise That Matters
                </h3>
                <p className="text-foreground/80">
                  Deep experience in agentic AI systems, MCP servers, and production AI deployment. 
                  I don&apos;t just follow trends - I understand the technology at a fundamental level.
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Teaching Superpower
                </h3>
                <p className="text-foreground/80">
                  Former educator who can break down complex concepts for any audience. 
                  This translates to better team communication, user experience, and investor presentations.
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* What I Bring to the Table */}
      <Section spacing="xl">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            What I Bring to the Table
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-primary">Technical Leadership</h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>System Architecture:</strong> Design scalable, production-ready AI systems from the ground up
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>Team Building:</strong> Recruit, mentor, and scale engineering teams efficiently
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>Technology Stack:</strong> Rust, Python, TypeScript - choosing the right tool for each job
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>AI Integration:</strong> Practical experience deploying LLMs, agentic systems, and automation
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 text-primary">Operational Excellence</h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>Process Design:</strong> Create systems that eliminate manual work and scale with growth
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>Quality Focus:</strong> Comprehensive testing, monitoring, and reliability practices
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>Documentation:</strong> Clear communication that makes complex systems accessible
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-primary">Unique Perspective</h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>Global Mindset:</strong> Dual presence in São Paulo and New York, multilingual communication
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>Rapid Learning:</strong> Self-taught developer who masters new technologies quickly
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>User-Centric Design:</strong> Teaching background ensures products are truly usable
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>Problem Solving:</strong> Systematic approach to breaking down complex challenges
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 text-primary">Reliability & Commitment</h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>Execution Track Record:</strong> Built internal tools team from zero to company-wide impact
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>Long-term Thinking:</strong> Focus on sustainable growth over quick wins
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-3 mt-1">•</span>
                    <div>
                      <strong>Collaborative Spirit:</strong> Years of teaching developed patience and mentoring skills
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* What I&apos;m Looking For */}
      <Section spacing="xl" className="bg-background-secondary/30">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            What I&apos;m Looking For in a Co-founder
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Business & Strategy
                </h3>
                <ul className="space-y-2 text-foreground/80">
                  <li>• Market insight and customer development expertise</li>
                  <li>• Experience with fundraising and investor relations</li>
                  <li>• Strategic thinking and business model innovation</li>
                  <li>• Sales and partnership development skills</li>
                  <li>• Financial planning and business operations</li>
                </ul>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Domain Expertise
                </h3>
                <ul className="space-y-2 text-foreground/80">
                  <li>• Deep knowledge in a specific industry or vertical</li>
                  <li>• Understanding of regulatory and compliance requirements</li>
                  <li>• Existing networks and industry relationships</li>
                  <li>• Product vision and user experience insight</li>
                  <li>• Go-to-market strategy and execution</li>
                </ul>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Complementary Skills
                </h3>
                <ul className="space-y-2 text-foreground/80">
                  <li>• Design thinking and user interface expertise</li>
                  <li>• Marketing and brand development experience</li>
                  <li>• Operations and scaling experience</li>
                  <li>• Legal and intellectual property knowledge</li>
                  <li>• International expansion capabilities</li>
                </ul>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Personal Qualities
                </h3>
                <ul className="space-y-2 text-foreground/80">
                  <li>• Shared values and long-term vision alignment</li>
                  <li>• High integrity and transparent communication</li>
                  <li>• Resilience and adaptability in uncertainty</li>
                  <li>• Complementary working styles and decision-making</li>
                  <li>• Commitment to building something meaningful</li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* Partnership Philosophy */}
      <Section spacing="xl">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            My Partnership Philosophy
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Complementary Strengths</h3>
                <p className="text-foreground/80 mb-6">
                  The best partnerships combine different but compatible skill sets. While I bring 
                  deep technical expertise and systematic thinking, I&apos;m looking for someone who 
                  excels in areas where I&apos;m still growing - business strategy, market development, 
                  and industry-specific knowledge.
                </p>
                
                <h3 className="text-xl font-semibold mb-4 text-primary">Shared Vision</h3>
                <p className="text-foreground/80">
                  I believe AI should solve real problems and make life better for actual people. 
                  I&apos;m not interested in technology for its own sake - I want to build products 
                  that have meaningful impact and create genuine value.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Long-term Commitment</h3>
                <p className="text-foreground/80 mb-6">
                  Building something significant takes time. I&apos;m looking for a partner who 
                  shares my commitment to the long game - someone who understands that the 
                  best products and companies are built through consistent effort over years, 
                  not months.
                </p>
                
                <h3 className="text-xl font-semibold mb-4 text-primary">Open Communication</h3>
                <p className="text-foreground/80">
                  My teaching background taught me that clear communication prevents most problems. 
                  I value direct, honest feedback and expect the same in return. The best 
                  partnerships are built on trust and transparency.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Potential Venture Areas */}
      <Section spacing="xl" className="bg-background-secondary/30">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            Potential Venture Areas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Agentic AI Platforms
              </h3>
              <p className="text-foreground/80 mb-4">
                Building intelligent agent systems that can automate complex workflows 
                and decision-making processes across industries.
              </p>
              <div className="text-sm text-foreground/60">
                <strong>My expertise:</strong> MCP servers, agent architecture, system integration
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                AI-Powered Education
              </h3>
              <p className="text-foreground/80 mb-4">
                Leveraging my teaching background to create personalized learning 
                experiences powered by advanced AI systems.
              </p>
              <div className="text-sm text-foreground/60">
                <strong>My expertise:</strong> Educational methodology, learning systems, AI tutoring
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Developer Tools & APIs
              </h3>
              <p className="text-foreground/80 mb-4">
                Creating tools that make AI development more accessible and efficient 
                for engineering teams worldwide.
              </p>
              <div className="text-sm text-foreground/60">
                <strong>My expertise:</strong> Developer experience, API design, documentation
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Process Automation
              </h3>
              <p className="text-foreground/80 mb-4">
                AI-driven automation solutions that eliminate repetitive tasks 
                and optimize business operations.
              </p>
              <div className="text-sm text-foreground/60">
                <strong>My expertise:</strong> Workflow design, system integration, optimization
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Global AI Solutions
              </h3>
              <p className="text-foreground/80 mb-4">
                Products designed for international markets, leveraging my 
                multicultural perspective and language skills.
              </p>
              <div className="text-sm text-foreground/60">
                <strong>My expertise:</strong> International perspective, multilingual UX
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Your Vision Here
              </h3>
              <p className="text-foreground/80 mb-4">
                I&apos;m open to exploring ideas in your area of expertise. The best 
                ventures often come from unexpected combinations of skills and insights.
              </p>
              <div className="text-sm text-foreground/60">
                <strong>Let&apos;s discuss:</strong> What problems are you passionate about solving?
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Success Stories */}
      <Section spacing="xl">
        <Container>
          <h2 className="text-3xl font-semibold text-center mb-12">
            Track Record of Success
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <Card>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🏗️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">
                    Built Internal Tools Team from Zero
                  </h3>
                  <p className="text-foreground/80 mb-3">
                    Created and led a new engineering team that built automation systems used 
                    company-wide. Eliminated hours of manual work daily and became the foundation 
                    for operational efficiency improvements across all departments.
                  </p>
                  <div className="text-sm text-foreground/60">
                    <strong>Impact:</strong> 40+ hours saved weekly across the organization, 
                    90% reduction in manual data processing errors
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📈</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">
                    Rapid Career Progression
                  </h3>
                  <p className="text-foreground/80 mb-3">
                    Went from zero programming experience to technical team leadership in just 3 years. 
                    This demonstrates my ability to learn quickly, execute effectively, and earn the 
                    trust of both technical and non-technical stakeholders.
                  </p>
                  <div className="text-sm text-foreground/60">
                    <strong>Timeline:</strong> Self-taught developer → Junior → Mid-level → Team Lead in 36 months
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">
                    Successful Career Transition
                  </h3>
                  <p className="text-foreground/80 mb-3">
                    Made a successful career change from education to technology during a global 
                    pandemic, demonstrating adaptability, determination, and strategic thinking 
                    under challenging circumstances.
                  </p>
                  <div className="text-sm text-foreground/60">
                    <strong>Transferable skills:</strong> Systematic problem-solving, clear communication, 
                    team leadership, and ability to make complex topics accessible
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Call to Action */}
      <Section spacing="xl" className="bg-primary/5">
        <Container size="md">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-6">
              Ready to Change the World Together?
            </h2>
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              If you&apos;re a visionary entrepreneur looking for a technical co-founder who can 
              execute, lead, and teach, let&apos;s start a conversation. The future of AI is 
              waiting to be built.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/contact">
                <Button size="lg" variant="primary">
                  Get In Touch
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="secondary">
                  Review My Work
                </Button>
              </Link>
            </div>
            
            <div className="text-foreground/60">
              <p className="mb-2">Based in São Paulo, Brazil and New York, NY</p>
              <p>Available for partnerships worldwide</p>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}