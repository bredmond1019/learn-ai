'use client';

import { useState } from 'react';
import Section from './Section';
import Container from './Container';
import Card from './Card';
import { cn } from '@/lib/utils';

type TechCategory = {
  name: string;
  skills: {
    name: string;
    level: number; // 1-5
    description: string;
  }[];
};

const techStack: TechCategory[] = [
  {
    name: 'Core Languages',
    skills: [
      { name: 'Rust', level: 5, description: 'High-performance systems & workflow engines' },
      { name: 'Python', level: 5, description: 'AI/ML development & data processing' },
      { name: 'TypeScript', level: 5, description: 'Full-stack development & modern web apps' },
      { name: 'Ruby', level: 4, description: 'Rapid prototyping & web development' },
    ],
  },
  {
    name: 'AI & Agents',
    skills: [
      { name: 'Agentic Workflows', level: 5, description: 'Designing & implementing intelligent agent systems' },
      { name: 'MCP Servers', level: 5, description: 'Building Model Context Protocol integrations' },
      { name: 'LLM Integration', level: 5, description: 'Production-ready language model applications' },
      { name: 'RAG Systems', level: 4, description: 'Retrieval-augmented generation pipelines' },
    ],
  },
  {
    name: 'Teaching & Communication',
    skills: [
      { name: 'Technical Writing', level: 5, description: 'Clear documentation & educational content' },
      { name: 'System Architecture', level: 4, description: 'Breaking down complex systems for understanding' },
      { name: 'Code Reviews', level: 5, description: 'Mentoring through constructive feedback' },
      { name: 'Workshop Design', level: 4, description: 'Creating hands-on learning experiences' },
    ],
  },
  {
    name: 'Infrastructure & Tools',
    skills: [
      { name: 'Docker/K8s', level: 4, description: 'Containerized deployment & orchestration' },
      { name: 'AWS/GCP', level: 4, description: 'Cloud infrastructure & AI services' },
      { name: 'CI/CD', level: 4, description: 'Automated testing & deployment pipelines' },
      { name: 'Database Design', level: 4, description: 'SQL & NoSQL for AI applications' },
    ],
  },
];

export default function ExpertiseOverview() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <Section spacing="xl" className="bg-background-secondary/50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What I Build & Teach
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            From high-performance Rust systems to agentic AI workflows, 
            I build production-ready solutions and teach others how to do the same
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {techStack.map((category) => (
            <Card
              key={category.name}
              variant="interactive"
              className={cn(
                'cursor-pointer transition-all duration-300',
                selectedCategory === category.name && 'ring-2 ring-primary'
              )}
              onClick={() => setSelectedCategory(
                selectedCategory === category.name ? null : category.name
              )}
            >
              <h3 className="text-xl font-semibold mb-6 text-primary">
                {category.name}
              </h3>
              
              <div className="space-y-4">
                {category.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="relative"
                    onMouseEnter={() => setHoveredSkill(skill.name)}
                    onMouseLeave={() => setHoveredSkill(null)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-foreground/60">
                        {skill.level}/5
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-2 bg-accent/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500"
                        style={{ width: `${(skill.level / 5) * 100}%` }}
                      />
                    </div>
                    
                    {/* Tooltip */}
                    {hoveredSkill === skill.name && (
                      <div className="absolute z-10 bottom-full left-0 mb-2 p-3 bg-background border border-accent/20 rounded-lg shadow-xl w-64 transition-opacity duration-200">
                        <p className="text-sm text-foreground/80">
                          {skill.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Skills */}
        <div className="mt-12 text-center">
          <p className="text-foreground/60 mb-4">Also fluent in:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Git', 'REST APIs', 'GraphQL', 'PostgreSQL', 'Redis', 
              'FastAPI', 'Next.js', 'WebAssembly', 'gRPC', 'Tokio', 'Serde', 'Tauri'].map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-accent/10 rounded-full text-sm hover:bg-accent/20 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}