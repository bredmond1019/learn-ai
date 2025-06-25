// Learning content data structure and utilities

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  topics: string[];
  color: 'primary' | 'accent';
  modules: LearningModule[];
  prerequisites?: string[];
  outcomes: string[];
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'theory' | 'hands-on' | 'project';
  content: string; // Will be MDX content in the future
}

export interface Concept {
  id: string;
  title: string;
  description: string;
  learnMore: string;
  category: 'fundamentals' | 'architecture' | 'implementation' | 'patterns';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relatedConcepts?: string[];
}

export const learningPaths: LearningPath[] = [
  {
    id: 'mcp-fundamentals',
    title: 'MCP Server Fundamentals',
    description: 'Build your first Model Context Protocol server from scratch. Learn the core concepts, architecture patterns, and best practices.',
    level: 'Beginner',
    duration: '4-6 hours',
    topics: ['MCP Architecture', 'Server Setup', 'Resource Management', 'Tool Integration'],
    color: 'primary',
    outcomes: [
      'Understand MCP protocol fundamentals',
      'Build a basic MCP server from scratch',
      'Implement resource and tool providers',
      'Connect MCP server to AI applications'
    ],
    modules: [
      {
        id: 'introduction-to-mcp',
        title: 'What is MCP?',
        description: 'Understanding the Model Context Protocol and its role in modern AI systems',
        duration: '30 minutes',
        type: 'theory',
        content: 'Introduction to MCP concepts and architecture'
      },
      {
        id: 'setting-up-environment',
        title: 'Setting Up Your First MCP Server',
        description: 'Hands-on setup of development environment and basic server structure',
        duration: '1 hour',
        type: 'hands-on',
        content: 'Step-by-step server setup with TypeScript'
      },
      {
        id: 'implementing-resources',
        title: 'Implementing Resource Providers',
        description: 'Learn to expose data and content through MCP resources',
        duration: '1.5 hours',
        type: 'hands-on',
        content: 'Building resource providers for different data types'
      },
      {
        id: 'creating-tools',
        title: 'Creating Tool Providers',
        description: 'Enable AI agents to perform actions through your MCP server',
        duration: '1.5 hours',
        type: 'hands-on',
        content: 'Implementing callable tools and functions'
      },
      {
        id: 'capstone-project',
        title: 'Build a Complete MCP Server',
        description: 'Capstone project: Build a weather data MCP server with multiple resources and tools',
        duration: '2 hours',
        type: 'project',
        content: 'End-to-end project implementation'
      }
    ]
  },
  {
    id: 'agentic-workflows',
    title: 'Agentic AI Workflows',
    description: 'Design intelligent systems that can reason, plan, and execute complex tasks autonomously with human oversight.',
    level: 'Intermediate',
    duration: '6-8 hours',
    topics: ['Agent Architecture', 'Planning Systems', 'Tool Use', 'Human-in-Loop'],
    color: 'accent',
    prerequisites: ['mcp-fundamentals'],
    outcomes: [
      'Design agent architectures for complex tasks',
      'Implement planning and reasoning systems',
      'Build human-in-the-loop workflows',
      'Create production-ready agentic systems'
    ],
    modules: [
      {
        id: 'agent-architecture-patterns',
        title: 'Agent Architecture Patterns',
        description: 'Common patterns for structuring intelligent agents',
        duration: '1 hour',
        type: 'theory',
        content: 'ReAct, Plan-and-Execute, and other agent patterns'
      },
      {
        id: 'building-planning-systems',
        title: 'Building Planning Systems',
        description: 'Implement goal-oriented planning in AI agents',
        duration: '2 hours',
        type: 'hands-on',
        content: 'Task decomposition and execution planning'
      },
      {
        id: 'tool-orchestration',
        title: 'Tool Orchestration',
        description: 'Coordinate multiple tools and services in agent workflows',
        duration: '1.5 hours',
        type: 'hands-on',
        content: 'Multi-tool coordination and error handling'
      },
      {
        id: 'human-in-the-loop-design',
        title: 'Human-in-the-Loop Design',
        description: 'Implement approval workflows and human oversight',
        duration: '1.5 hours',
        type: 'hands-on',
        content: 'Approval systems and intervention points'
      },
      {
        id: 'build-research-agent',
        title: 'Build a Research Agent',
        description: 'Create an agent that can research topics, synthesize information, and generate reports',
        duration: '3 hours',
        type: 'project',
        content: 'Complete research agent implementation'
      }
    ]
  },
  {
    id: 'production-ai',
    title: 'Production AI Systems',
    description: 'Deploy, monitor, and scale AI systems in production. Learn enterprise patterns for reliable AI applications.',
    level: 'Advanced',
    duration: '8-10 hours',
    topics: ['Deployment Strategies', 'Monitoring', 'Scaling', 'Security'],
    color: 'primary',
    prerequisites: ['mcp-fundamentals', 'agentic-workflows'],
    outcomes: [
      'Deploy AI systems to production environments',
      'Implement comprehensive monitoring and observability',
      'Design systems that scale with demand',
      'Secure AI applications against common threats'
    ],
    modules: [
      {
        id: 'deployment-strategies',
        title: 'Deployment Strategies',
        description: 'Patterns for deploying AI systems safely to production',
        duration: '1.5 hours',
        type: 'theory',
        content: 'Blue-green, canary, and feature flag deployments'
      },
      {
        id: 'monitoring-ai',
        title: 'AI System Monitoring',
        description: 'Monitor AI performance, costs, and reliability',
        duration: '2 hours',
        type: 'hands-on',
        content: 'Metrics, logging, and alerting for AI systems'
      },
      {
        id: 'scaling-strategies',
        title: 'Scaling AI Applications',
        description: 'Handle increased load and complexity in AI systems',
        duration: '2 hours',
        type: 'hands-on',
        content: 'Load balancing, caching, and auto-scaling'
      },
      {
        id: 'ai-security',
        title: 'AI Security Best Practices',
        description: 'Secure AI systems against prompt injection and other threats',
        duration: '1.5 hours',
        type: 'theory',
        content: 'Security patterns and threat mitigation'
      },
      {
        id: 'production-project',
        title: 'Deploy a Complete AI Platform',
        description: 'Deploy a full-stack AI application with monitoring, scaling, and security',
        duration: '4 hours',
        type: 'project',
        content: 'End-to-end production deployment'
      }
    ]
  }
];

export const concepts: Concept[] = [
  {
    id: 'mcp',
    title: 'Model Context Protocol (MCP)',
    description: 'A standardized way for AI applications to connect with external data sources and tools, enabling more powerful and flexible AI systems.',
    learnMore: '/learn/concepts/mcp',
    category: 'fundamentals',
    difficulty: 'beginner',
    relatedConcepts: ['tool-use', 'ai-integration']
  },
  {
    id: 'agentic-ai',
    title: 'Agentic AI Systems',
    description: 'AI systems that can autonomously plan, reason, and execute complex tasks while maintaining human oversight and control.',
    learnMore: '/learn/concepts/agentic-ai',
    category: 'architecture',
    difficulty: 'intermediate',
    relatedConcepts: ['planning', 'tool-use', 'human-in-loop']
  },
  {
    id: 'tool-use',
    title: 'Tool-Using AI',
    description: 'AI models enhanced with the ability to use external tools, APIs, and services to accomplish tasks beyond pure text generation.',
    learnMore: '/learn/concepts/tool-use',
    category: 'implementation',
    difficulty: 'beginner',
    relatedConcepts: ['mcp', 'function-calling']
  },
  {
    id: 'human-in-loop',
    title: 'Human-in-the-Loop',
    description: 'Design patterns that keep humans involved in AI decision-making processes while leveraging AI for efficiency and scale.',
    learnMore: '/learn/concepts/human-in-loop',
    category: 'patterns',
    difficulty: 'intermediate',
    relatedConcepts: ['agentic-ai', 'approval-workflows']
  },
  {
    id: 'planning',
    title: 'AI Planning Systems',
    description: 'Systems that enable AI agents to break down complex goals into actionable steps and execute them systematically.',
    learnMore: '/learn/concepts/planning',
    category: 'architecture',
    difficulty: 'advanced',
    relatedConcepts: ['agentic-ai', 'task-decomposition']
  },
  {
    id: 'function-calling',
    title: 'Function Calling',
    description: 'The ability for language models to call external functions and APIs in a structured, reliable way.',
    learnMore: '/learn/concepts/function-calling',
    category: 'implementation',
    difficulty: 'beginner',
    relatedConcepts: ['tool-use', 'api-integration']
  }
];

// Utility functions
export function getLearningPathById(id: string): LearningPath | undefined {
  return learningPaths.find(path => path.id === id);
}

export function getConceptById(id: string): Concept | undefined {
  return concepts.find(concept => concept.id === id);
}

export function getLearningPathsByLevel(level: LearningPath['level']): LearningPath[] {
  return learningPaths.filter(path => path.level === level);
}

export function getConceptsByCategory(category: Concept['category']): Concept[] {
  return concepts.filter(concept => concept.category === category);
}

export function getPrerequisitePaths(pathId: string): LearningPath[] {
  const path = getLearningPathById(pathId);
  if (!path?.prerequisites) return [];
  
  return path.prerequisites
    .map(prereqId => getLearningPathById(prereqId))
    .filter((path): path is LearningPath => path !== undefined);
}

export function getRelatedConcepts(conceptId: string): Concept[] {
  const concept = getConceptById(conceptId);
  if (!concept?.relatedConcepts) return [];
  
  return concept.relatedConcepts
    .map(relatedId => getConceptById(relatedId))
    .filter((concept): concept is Concept => concept !== undefined);
}