// Learning content data structure and utilities

export type Locale = 'en' | 'pt-BR';

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

// English learning paths
const learningPathsEn: LearningPath[] = [
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

// Portuguese learning paths
const learningPathsPtBR: LearningPath[] = [
  {
    id: 'mcp-fundamentals',
    title: 'Fundamentos de Servidor MCP',
    description: 'Construa seu primeiro servidor Model Context Protocol do zero. Aprenda os conceitos centrais, padrões de arquitetura e melhores práticas.',
    level: 'Beginner',
    duration: '4-6 horas',
    topics: ['Arquitetura MCP', 'Configuração de Servidor', 'Gerenciamento de Recursos', 'Integração de Ferramentas'],
    color: 'primary',
    outcomes: [
      'Entender os fundamentos do protocolo MCP',
      'Construir um servidor MCP básico do zero',
      'Implementar provedores de recursos e ferramentas',
      'Conectar servidor MCP a aplicações de IA'
    ],
    modules: [
      {
        id: 'introduction-to-mcp',
        title: 'O que é MCP?',
        description: 'Entendendo o Model Context Protocol e seu papel em sistemas de IA modernos',
        duration: '30 minutos',
        type: 'theory',
        content: 'Introdução aos conceitos e arquitetura MCP'
      },
      {
        id: 'setting-up-environment',
        title: 'Configurando Seu Primeiro Servidor MCP',
        description: 'Configuração prática do ambiente de desenvolvimento e estrutura básica do servidor',
        duration: '1 hora',
        type: 'hands-on',
        content: 'Configuração passo a passo do servidor com TypeScript'
      },
      {
        id: 'implementing-resources',
        title: 'Implementando Provedores de Recursos',
        description: 'Aprenda a expor dados e conteúdo através de recursos MCP',
        duration: '1.5 horas',
        type: 'hands-on',
        content: 'Construindo provedores de recursos para diferentes tipos de dados'
      },
      {
        id: 'creating-tools',
        title: 'Criando Provedores de Ferramentas',
        description: 'Permita que agentes de IA realizem ações através do seu servidor MCP',
        duration: '1.5 horas',
        type: 'hands-on',
        content: 'Implementando ferramentas e funções executáveis'
      },
      {
        id: 'capstone-project',
        title: 'Construa um Servidor MCP Completo',
        description: 'Projeto final: Construa um servidor MCP de dados meteorológicos com múltiplos recursos e ferramentas',
        duration: '2 horas',
        type: 'project',
        content: 'Implementação de projeto de ponta a ponta'
      }
    ]
  },
  {
    id: 'agentic-workflows',
    title: 'Fluxos de Trabalho de IA Agêntica',
    description: 'Projete sistemas inteligentes que podem raciocinar, planejar e executar tarefas complexas de forma autônoma com supervisão humana.',
    level: 'Intermediate',
    duration: '6-8 horas',
    topics: ['Arquitetura de Agente', 'Sistemas de Planejamento', 'Uso de Ferramentas', 'Humano no Loop'],
    color: 'accent',
    prerequisites: ['mcp-fundamentals'],
    outcomes: [
      'Projetar arquiteturas de agente para tarefas complexas',
      'Implementar sistemas de planejamento e raciocínio',
      'Construir fluxos de trabalho com humano no loop',
      'Criar sistemas agênticos prontos para produção'
    ],
    modules: [
      {
        id: 'agent-architecture-patterns',
        title: 'Padrões de Arquitetura de Agente',
        description: 'Padrões comuns para estruturar agentes inteligentes',
        duration: '1 hora',
        type: 'theory',
        content: 'ReAct, Plan-and-Execute, e outros padrões de agente'
      },
      {
        id: 'building-planning-systems',
        title: 'Construindo Sistemas de Planejamento',
        description: 'Implemente planejamento orientado a objetivos em agentes de IA',
        duration: '2 horas',
        type: 'hands-on',
        content: 'Decomposição de tarefas e planejamento de execução'
      },
      {
        id: 'tool-orchestration',
        title: 'Orquestração de Ferramentas',
        description: 'Coordene múltiplas ferramentas e serviços em fluxos de trabalho de agente',
        duration: '1.5 horas',
        type: 'hands-on',
        content: 'Coordenação multi-ferramenta e tratamento de erros'
      },
      {
        id: 'human-in-the-loop-design',
        title: 'Design com Humano no Loop',
        description: 'Implemente fluxos de trabalho de aprovação e supervisão humana',
        duration: '1.5 horas',
        type: 'hands-on',
        content: 'Sistemas de aprovação e pontos de intervenção'
      },
      {
        id: 'build-research-agent',
        title: 'Construa um Agente de Pesquisa',
        description: 'Crie um agente que pode pesquisar tópicos, sintetizar informações e gerar relatórios',
        duration: '3 horas',
        type: 'project',
        content: 'Implementação completa de agente de pesquisa'
      }
    ]
  },
  {
    id: 'production-ai',
    title: 'Sistemas de IA em Produção',
    description: 'Implante, monitore e escale sistemas de IA em produção. Aprenda padrões empresariais para aplicações de IA confiáveis.',
    level: 'Advanced',
    duration: '8-10 horas',
    topics: ['Estratégias de Deploy', 'Monitoramento', 'Escalabilidade', 'Segurança'],
    color: 'primary',
    prerequisites: ['mcp-fundamentals', 'agentic-workflows'],
    outcomes: [
      'Implantar sistemas de IA em ambientes de produção',
      'Implementar monitoramento e observabilidade abrangentes',
      'Projetar sistemas que escalam com a demanda',
      'Proteger aplicações de IA contra ameaças comuns'
    ],
    modules: [
      {
        id: 'deployment-strategies',
        title: 'Estratégias de Deploy',
        description: 'Padrões para implantar sistemas de IA com segurança em produção',
        duration: '1.5 horas',
        type: 'theory',
        content: 'Deploys blue-green, canary e feature flag'
      },
      {
        id: 'monitoring-ai',
        title: 'Monitoramento de Sistema de IA',
        description: 'Monitore performance, custos e confiabilidade de IA',
        duration: '2 horas',
        type: 'hands-on',
        content: 'Métricas, logging e alertas para sistemas de IA'
      },
      {
        id: 'scaling-strategies',
        title: 'Escalando Aplicações de IA',
        description: 'Gerencie carga e complexidade aumentadas em sistemas de IA',
        duration: '2 horas',
        type: 'hands-on',
        content: 'Balanceamento de carga, cache e auto-scaling'
      },
      {
        id: 'ai-security',
        title: 'Melhores Práticas de Segurança de IA',
        description: 'Proteja sistemas de IA contra injeção de prompt e outras ameaças',
        duration: '1.5 horas',
        type: 'theory',
        content: 'Padrões de segurança e mitigação de ameaças'
      },
      {
        id: 'production-project',
        title: 'Implantar uma Plataforma de IA Completa',
        description: 'Implante uma aplicação de IA full-stack com monitoramento, escalabilidade e segurança',
        duration: '4 horas',
        type: 'project',
        content: 'Deploy de produção de ponta a ponta'
      }
    ]
  }
];

// Learning paths by locale
export const learningPaths: Record<Locale, LearningPath[]> = {
  'en': learningPathsEn,
  'pt-BR': learningPathsPtBR
};

// English concepts
const conceptsEn: Concept[] = [
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

// Portuguese concepts
const conceptsPtBR: Concept[] = [
  {
    id: 'mcp',
    title: 'Model Context Protocol (MCP)',
    description: 'Uma maneira padronizada para aplicações de IA se conectarem com fontes de dados e ferramentas externas, permitindo sistemas de IA mais poderosos e flexíveis.',
    learnMore: '/aprender/conceitos/mcp',
    category: 'fundamentals',
    difficulty: 'beginner',
    relatedConcepts: ['tool-use', 'ai-integration']
  },
  {
    id: 'agentic-ai',
    title: 'Sistemas de IA Agêntica',
    description: 'Sistemas de IA que podem planejar, raciocinar e executar tarefas complexas de forma autônoma, mantendo supervisão e controle humano.',
    learnMore: '/aprender/conceitos/agentic-ai',
    category: 'architecture',
    difficulty: 'intermediate',
    relatedConcepts: ['planning', 'tool-use', 'human-in-loop']
  },
  {
    id: 'tool-use',
    title: 'IA com Uso de Ferramentas',
    description: 'Modelos de IA aprimorados com a capacidade de usar ferramentas, APIs e serviços externos para realizar tarefas além da geração de texto puro.',
    learnMore: '/aprender/conceitos/tool-use',
    category: 'implementation',
    difficulty: 'beginner',
    relatedConcepts: ['mcp', 'function-calling']
  },
  {
    id: 'human-in-loop',
    title: 'Humano no Loop',
    description: 'Padrões de design que mantêm humanos envolvidos em processos de tomada de decisão de IA, aproveitando a IA para eficiência e escala.',
    learnMore: '/aprender/conceitos/human-in-loop',
    category: 'patterns',
    difficulty: 'intermediate',
    relatedConcepts: ['agentic-ai', 'approval-workflows']
  },
  {
    id: 'planning',
    title: 'Sistemas de Planejamento de IA',
    description: 'Sistemas que permitem que agentes de IA decomponham objetivos complexos em passos acionáveis e os executem sistematicamente.',
    learnMore: '/aprender/conceitos/planning',
    category: 'architecture',
    difficulty: 'advanced',
    relatedConcepts: ['agentic-ai', 'task-decomposition']
  },
  {
    id: 'function-calling',
    title: 'Chamada de Funções',
    description: 'A capacidade de modelos de linguagem chamarem funções e APIs externas de forma estruturada e confiável.',
    learnMore: '/aprender/conceitos/function-calling',
    category: 'implementation',
    difficulty: 'beginner',
    relatedConcepts: ['tool-use', 'api-integration']
  }
];

// Concepts by locale
export const concepts: Record<Locale, Concept[]> = {
  'en': conceptsEn,
  'pt-BR': conceptsPtBR
};

// Utility functions
export function getLearningPathById(id: string, locale: Locale = 'en'): LearningPath | undefined {
  return learningPaths[locale].find(path => path.id === id);
}

export function getConceptById(id: string, locale: Locale = 'en'): Concept | undefined {
  return concepts[locale].find(concept => concept.id === id);
}

export function getLearningPathsByLevel(level: LearningPath['level'], locale: Locale = 'en'): LearningPath[] {
  return learningPaths[locale].filter(path => path.level === level);
}

export function getConceptsByCategory(category: Concept['category'], locale: Locale = 'en'): Concept[] {
  return concepts[locale].filter(concept => concept.category === category);
}

export function getPrerequisitePaths(pathId: string, locale: Locale = 'en'): LearningPath[] {
  const path = getLearningPathById(pathId, locale);
  if (!path?.prerequisites) return [];
  
  return path.prerequisites
    .map(prereqId => getLearningPathById(prereqId, locale))
    .filter((path): path is LearningPath => path !== undefined);
}

export function getRelatedConcepts(conceptId: string, locale: Locale = 'en'): Concept[] {
  const concept = getConceptById(conceptId, locale);
  if (!concept?.relatedConcepts) return [];
  
  return concept.relatedConcepts
    .map(relatedId => getConceptById(relatedId, locale))
    .filter((concept): concept is Concept => concept !== undefined);
}