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
    id: 'ai-systems-intro',
    title: 'AI Systems: An Introduction',
    description: 'A beginner-friendly introduction to AI Systems, covering workflow engines, AI agents, LLMs, and MCP servers. Learn how these technologies work together to solve real-world problems.',
    level: 'Beginner',
    duration: '12 hours',
    topics: ['AI Systems', 'Workflow Engines', 'AI Agents', 'MCP Servers'],
    color: 'accent',
    outcomes: [
      'Understand what AI Systems are and their core components',
      'Visualize how workflow engines, agents, LLMs, and MCP servers work together',
      'Identify real-world applications for small businesses and personal use',
      'Build a simple but functional AI System using Python and the MCP SDK',
      'Create practical solutions that demonstrate the power of AI Systems'
    ],
    modules: [
      {
        id: 'what-are-ai-systems',
        title: 'What Are AI Systems?',
        description: 'Discover what AI Systems are and why they\'re transforming how we work and live',
        duration: '45 minutes',
        type: 'theory',
        content: 'Introduction to AI Systems concepts and real-world impact'
      },
      {
        id: 'the-building-blocks',
        title: 'The Building Blocks',
        description: 'Explore the key components: workflow engines, AI agents, LLMs, and MCP servers through visual diagrams',
        duration: '60 minutes',
        type: 'theory',
        content: 'Deep dive into each component with visual representations'
      },
      {
        id: 'real-world-applications',
        title: 'Real-World Applications',
        description: 'See practical examples of AI Systems solving problems for small businesses and everyday tasks',
        duration: '60 minutes',
        type: 'theory',
        content: 'Case studies and practical applications'
      },
      {
        id: 'how-ai-systems-think',
        title: 'How AI Systems Think',
        description: 'Understand how components work together using simple analogies and visual representations',
        duration: '60 minutes',
        type: 'theory',
        content: 'AI decision-making explained simply'
      },
      {
        id: 'benefits-of-ai-systems',
        title: 'The Benefits of AI Systems',
        description: 'Learn why AI Systems matter for your business or personal productivity',
        duration: '45 minutes',
        type: 'theory',
        content: 'ROI and value proposition of AI Systems'
      },
      {
        id: 'setting-up-your-first-ai-system',
        title: 'Setting Up Your First AI System',
        description: 'Get your development environment ready for building with Python and the MCP SDK',
        duration: '90 minutes',
        type: 'hands-on',
        content: 'Environment setup and project structure'
      },
      {
        id: 'building-your-first-mcp-server',
        title: 'Building Your First MCP Server',
        description: 'Create a simple MCP server using Python that can interact with AI agents',
        duration: '90 minutes',
        type: 'hands-on',
        content: 'Hands-on MCP server development'
      },
      {
        id: 'creating-an-ai-agent',
        title: 'Creating an AI Agent',
        description: 'Build an AI agent that connects to your MCP server and uses an LLM',
        duration: '90 minutes',
        type: 'hands-on',
        content: 'AI agent implementation'
      },
      {
        id: 'putting-it-all-together',
        title: 'Putting It All Together',
        description: 'Combine everything to create a complete AI System solving a real business problem',
        duration: '120 minutes',
        type: 'project',
        content: 'Complete system integration'
      },
      {
        id: 'next-steps-and-resources',
        title: 'Next Steps and Resources',
        description: 'Continue your AI Systems journey with advanced topics and community resources',
        duration: '30 minutes',
        type: 'theory',
        content: 'Resources and community connections'
      }
    ]
  },
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
  },
  {
    id: '12-factor-agent-development',
    title: '12-Factor Agent Development',
    description: 'Master the patterns and principles for building reliable, production-ready LLM applications based on Dex Horthy\'s 12-Factor Agent framework.',
    level: 'Intermediate',
    duration: '8-10 hours',
    topics: ['Agent Architecture', 'Control Flow', 'Prompt Engineering', 'Human-in-the-Loop', 'Production Patterns'],
    color: 'accent',
    prerequisites: ['mcp-fundamentals'],
    outcomes: [
      'Understand agents as reliable software systems, not magical AI',
      'Master JSON-based control flow and stateless agent design',
      'Build micro-agents that do one thing well',
      'Implement human-in-the-loop as first-class operations',
      'Deploy production-ready agent systems with proper observability'
    ],
    modules: [
      {
        id: 'rethinking-agents-as-software',
        title: 'Rethinking Agents as Software',
        description: 'Move beyond autonomous AI myths to build reliable, deterministic agent systems',
        duration: '1.5 hours',
        type: 'theory',
        content: 'Agents as stateless functions, JSON extraction fundamentals, and software engineering principles'
      },
      {
        id: 'control-flow-and-state-management',
        title: 'Control Flow and State Management',
        description: 'Master the four pillars of agent control: Prompt, Switch, Context, and Loop',
        duration: '2 hours',
        type: 'hands-on',
        content: 'Implementing structured outputs, conditional logic, and state management patterns'
      },
      {
        id: 'prompt-and-context-engineering',
        title: 'Prompt and Context Engineering',
        description: 'Build reusable prompt templates and optimize context windows for reliability',
        duration: '2 hours',
        type: 'hands-on',
        content: 'Advanced prompting techniques, context optimization, and template management'
      },
      {
        id: 'human-agent-collaboration',
        title: 'Human-Agent Collaboration',
        description: 'Design systems where human oversight is a feature, not a limitation',
        duration: '2 hours',
        type: 'hands-on',
        content: 'Approval workflows, graceful handoffs, and multi-channel agent support'
      },
      {
        id: 'building-production-micro-agents',
        title: 'Building Production Micro-Agents',
        description: 'Create and compose small, focused agents for complex workflows',
        duration: '2.5 hours',
        type: 'project',
        content: 'Build a complete micro-agent system with observability, testing, and deployment'
      }
    ]
  },
  {
    id: 'claude-code-mastery',
    title: 'Mastering Claude Code: From Terminal to Custom Integrations',
    description: 'Learn to leverage Claude Code\'s unopinionated approach to AI-assisted development. From understanding the evolution of programming tools to building custom integrations with the SDK.',
    level: 'Intermediate',
    duration: '10-12 hours',
    topics: ['Claude Code', 'AI Development', 'Terminal Integration', 'SDK Development', 'Developer Productivity'],
    color: 'primary',
    prerequisites: ['Basic programming knowledge', 'Familiarity with command line'],
    outcomes: [
      'Understand the evolution of programming tools and where AI fits',
      'Master Claude Code\'s terminal, IDE, and GitHub integrations',
      'Implement advanced workflows like TDD and parallel sessions',
      'Build custom integrations using the Claude Code SDK',
      'Apply unopinionated AI assistance to real-world projects'
    ],
    modules: [
      {
        id: 'evolution-of-programming-tools',
        title: 'Evolution of Programming Tools',
        description: 'Trace the journey from punch cards to AI assistants and understand why this history matters',
        duration: '2 hours',
        type: 'theory',
        content: 'Historical context and the exponential model challenge'
      },
      {
        id: 'claude-code-philosophy',
        title: 'Understanding Claude Code\'s Philosophy',
        description: 'Learn why Claude Code takes an unopinionated approach and how this benefits developers',
        duration: '2 hours',
        type: 'theory',
        content: 'Unopinionated design principles and practical implications'
      },
      {
        id: 'claude-code-integrations',
        title: 'Claude Code Integrations',
        description: 'Master terminal, IDE, and GitHub integrations to incorporate Claude Code into your workflow',
        duration: '2.5 hours',
        type: 'hands-on',
        content: 'Comprehensive integration setup and best practices'
      },
      {
        id: 'advanced-workflows',
        title: 'Advanced Workflows',
        description: 'Implement powerful patterns like TDD, plan mode, and memory management',
        duration: '2.5 hours',
        type: 'hands-on',
        content: 'TDD workflows, plan mode usage, and parallel sessions'
      },
      {
        id: 'building-with-sdk',
        title: 'Building with Claude Code SDK',
        description: 'Create custom integrations and Unix utilities using the Claude Code SDK',
        duration: '3 hours',
        type: 'project',
        content: 'SDK architecture and building production-ready tools'
      },
      {
        id: 'mastering-claude-hooks',
        title: 'Mastering Claude Hooks',
        description: 'Transform Claude Code into a proactive development partner with hooks for safety, observability, and automation',
        duration: '2 hours',
        type: 'hands-on',
        content: 'Hook system architecture, implementation patterns, and real-world use cases'
      },
      {
        id: 'building-multi-agent-systems',
        title: 'Building Multi-Agent Systems',
        description: 'Master the art of orchestrating multiple Claude agents for complex workflows, from sub-agents to meta-agents',
        duration: '3 hours',
        type: 'project',
        content: 'Multi-agent architecture, communication patterns, and orchestration strategies'
      }
    ]
  },
  {
    id: 'agent-memory-systems',
    title: 'Building Intelligent AI Agents with Memory',
    description: 'Master the architecture and implementation of memory systems for AI agents. Learn 10+ memory types, management patterns, and production deployment strategies inspired by neuroscience.',
    level: 'Intermediate',
    duration: '10-12 hours',
    topics: ['Agent Memory', 'Memory Architecture', 'Neuroscience-Inspired AI', 'MongoDB', 'Production Systems'],
    color: 'primary',
    prerequisites: ['mcp-fundamentals'],
    outcomes: [
      'Understand 10+ types of agent memory and their use cases',
      'Build comprehensive memory management systems',
      'Implement neuroscience-inspired memory patterns',
      'Deploy production-ready memory systems with MongoDB',
      'Create agents that learn and improve over time'
    ],
    modules: [
      {
        id: 'understanding-agent-memory',
        title: 'Understanding Agent Memory',
        description: 'Explore why memory transforms AI from stateless tools to intelligent partners',
        duration: '90 minutes',
        type: 'theory',
        content: 'Memory fundamentals, stateless vs stateful AI, and business impact'
      },
      {
        id: 'memory-types-architecture',
        title: 'Memory Types and Architecture',
        description: 'Deep dive into 10+ memory types with practical implementations',
        duration: '120 minutes',
        type: 'hands-on',
        content: 'Conversational, entity, episodic, procedural, semantic, and more'
      },
      {
        id: 'building-memory-management',
        title: 'Building Memory Management Systems',
        description: 'Create unified systems for storage, retrieval, and integration',
        duration: '150 minutes',
        type: 'hands-on',
        content: 'Memory lifecycle, signals, validation, and access control'
      },
      {
        id: 'advanced-memory-patterns',
        title: 'Advanced Memory Patterns',
        description: 'Implement forgetting, memory signals, and neuroscience-inspired patterns',
        duration: '120 minutes',
        type: 'hands-on',
        content: 'Consolidation, adaptive forgetting, attention mechanisms'
      },
      {
        id: 'production-memory-systems',
        title: 'Production Memory Systems',
        description: 'Scale, secure, and optimize memory systems for real-world use',
        duration: '180 minutes',
        type: 'project',
        content: 'MongoDB integration, sharding, monitoring, and deployment'
      }
    ]
  }
];

// Portuguese learning paths
const learningPathsPtBR: LearningPath[] = [
  {
    id: 'ai-systems-intro',
    title: 'Sistemas de IA: Uma Introdução',
    description: 'Uma introdução amigável aos Sistemas de IA, cobrindo motores de fluxo de trabalho, agentes de IA, LLMs e servidores MCP. Aprenda como essas tecnologias funcionam juntas para resolver problemas do mundo real.',
    level: 'Beginner',
    duration: '12 horas',
    topics: ['Sistemas de IA', 'Motores de Fluxo', 'Agentes de IA', 'Servidores MCP'],
    color: 'accent',
    outcomes: [
      'Entender o que são Sistemas de IA e seus componentes principais',
      'Visualizar como motores de fluxo, agentes, LLMs e servidores MCP trabalham juntos',
      'Identificar aplicações do mundo real para pequenas empresas e uso pessoal',
      'Construir um Sistema de IA simples mas funcional usando Python e o SDK MCP',
      'Criar soluções práticas que demonstram o poder dos Sistemas de IA'
    ],
    modules: [
      {
        id: 'what-are-ai-systems',
        title: 'O Que São Sistemas de IA?',
        description: 'Descubra o que são Sistemas de IA e por que estão transformando como trabalhamos e vivemos',
        duration: '45 minutos',
        type: 'theory',
        content: 'Introdução aos conceitos de Sistemas de IA e impacto no mundo real'
      },
      {
        id: 'the-building-blocks',
        title: 'Os Blocos de Construção',
        description: 'Explore os componentes-chave: motores de fluxo, agentes de IA, LLMs e servidores MCP através de diagramas visuais',
        duration: '60 minutos',
        type: 'theory',
        content: 'Mergulho profundo em cada componente com representações visuais'
      },
      {
        id: 'real-world-applications',
        title: 'Aplicações do Mundo Real',
        description: 'Veja exemplos práticos de Sistemas de IA resolvendo problemas para pequenas empresas e tarefas cotidianas',
        duration: '60 minutos',
        type: 'theory',
        content: 'Estudos de caso e aplicações práticas'
      },
      {
        id: 'how-ai-systems-think',
        title: 'Como os Sistemas de IA Pensam',
        description: 'Entenda como os componentes trabalham juntos usando analogias simples e representações visuais',
        duration: '60 minutos',
        type: 'theory',
        content: 'Tomada de decisão de IA explicada de forma simples'
      },
      {
        id: 'benefits-of-ai-systems',
        title: 'Os Benefícios dos Sistemas de IA',
        description: 'Aprenda por que os Sistemas de IA importam para seu negócio ou produtividade pessoal',
        duration: '45 minutos',
        type: 'theory',
        content: 'ROI e proposta de valor dos Sistemas de IA'
      },
      {
        id: 'setting-up-your-first-ai-system',
        title: 'Configurando Seu Primeiro Sistema de IA',
        description: 'Prepare seu ambiente de desenvolvimento para construir com Python e o SDK MCP',
        duration: '90 minutos',
        type: 'hands-on',
        content: 'Configuração do ambiente e estrutura do projeto'
      },
      {
        id: 'building-your-first-mcp-server',
        title: 'Construindo Seu Primeiro Servidor MCP',
        description: 'Crie um servidor MCP simples usando Python que pode interagir com agentes de IA',
        duration: '90 minutos',
        type: 'hands-on',
        content: 'Desenvolvimento prático de servidor MCP'
      },
      {
        id: 'creating-an-ai-agent',
        title: 'Criando um Agente de IA',
        description: 'Construa um agente de IA que se conecta ao seu servidor MCP e usa um LLM',
        duration: '90 minutos',
        type: 'hands-on',
        content: 'Implementação de agente de IA'
      },
      {
        id: 'putting-it-all-together',
        title: 'Juntando Tudo',
        description: 'Combine tudo para criar um Sistema de IA completo resolvendo um problema real de negócios',
        duration: '120 minutos',
        type: 'project',
        content: 'Integração completa do sistema'
      },
      {
        id: 'next-steps-and-resources',
        title: 'Próximos Passos e Recursos',
        description: 'Continue sua jornada em Sistemas de IA com tópicos avançados e recursos da comunidade',
        duration: '30 minutos',
        type: 'theory',
        content: 'Recursos e conexões com a comunidade'
      }
    ]
  },
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
  },
  {
    id: '12-factor-agent-development',
    title: 'Desenvolvimento de Agentes 12-Fatores',
    description: 'Domine os padrões e princípios para construir aplicações LLM confiáveis e prontas para produção baseadas no framework 12-Factor Agent de Dex Horthy.',
    level: 'Intermediate',
    duration: '8-10 horas',
    topics: ['Arquitetura de Agente', 'Fluxo de Controle', 'Engenharia de Prompt', 'Humano no Loop', 'Padrões de Produção'],
    color: 'accent',
    prerequisites: ['mcp-fundamentals'],
    outcomes: [
      'Entender agentes como sistemas de software confiáveis, não IA mágica',
      'Dominar fluxo de controle baseado em JSON e design de agente sem estado',
      'Construir micro-agentes que fazem uma coisa bem',
      'Implementar humano no loop como operações de primeira classe',
      'Implantar sistemas de agente prontos para produção com observabilidade adequada'
    ],
    modules: [
      {
        id: 'rethinking-agents-as-software',
        title: 'Repensando Agentes como Software',
        description: 'Vá além dos mitos de IA autônoma para construir sistemas de agente confiáveis e determinísticos',
        duration: '1.5 horas',
        type: 'theory',
        content: 'Agentes como funções sem estado, fundamentos de extração JSON e princípios de engenharia de software'
      },
      {
        id: 'control-flow-and-state-management',
        title: 'Fluxo de Controle e Gerenciamento de Estado',
        description: 'Domine os quatro pilares do controle de agente: Prompt, Switch, Context e Loop',
        duration: '2 horas',
        type: 'hands-on',
        content: 'Implementando saídas estruturadas, lógica condicional e padrões de gerenciamento de estado'
      },
      {
        id: 'prompt-and-context-engineering',
        title: 'Engenharia de Prompt e Contexto',
        description: 'Construa templates de prompt reutilizáveis e otimize janelas de contexto para confiabilidade',
        duration: '2 horas',
        type: 'hands-on',
        content: 'Técnicas avançadas de prompting, otimização de contexto e gerenciamento de templates'
      },
      {
        id: 'human-agent-collaboration',
        title: 'Colaboração Humano-Agente',
        description: 'Projete sistemas onde a supervisão humana é um recurso, não uma limitação',
        duration: '2 horas',
        type: 'hands-on',
        content: 'Fluxos de trabalho de aprovação, transferências graciosas e suporte a agente multicanal'
      },
      {
        id: 'building-production-micro-agents',
        title: 'Construindo Micro-Agentes de Produção',
        description: 'Crie e componha agentes pequenos e focados para fluxos de trabalho complexos',
        duration: '2.5 horas',
        type: 'project',
        content: 'Construa um sistema completo de micro-agente com observabilidade, testes e deploy'
      }
    ]
  },
  {
    id: 'claude-code-mastery',
    title: 'Dominando Claude Code: Do Terminal a Integrações Customizadas',
    description: 'Aprenda a aproveitar a abordagem sem opinião do Claude Code para desenvolvimento assistido por IA. Desde entender a evolução das ferramentas de programação até construir integrações customizadas com o SDK.',
    level: 'Intermediate',
    duration: '10-12 horas',
    topics: ['Claude Code', 'Desenvolvimento com IA', 'Integração Terminal', 'Desenvolvimento SDK', 'Produtividade do Desenvolvedor'],
    color: 'primary',
    prerequisites: ['Conhecimento básico de programação', 'Familiaridade com linha de comando'],
    outcomes: [
      'Entender a evolução das ferramentas de programação e onde a IA se encaixa',
      'Dominar as integrações de terminal, IDE e GitHub do Claude Code',
      'Implementar fluxos de trabalho avançados como TDD e sessões paralelas',
      'Construir integrações customizadas usando o SDK do Claude Code',
      'Aplicar assistência de IA sem opinião a projetos do mundo real'
    ],
    modules: [
      {
        id: 'evolution-of-programming-tools',
        title: 'Evolução das Ferramentas de Programação',
        description: 'Trace a jornada dos cartões perfurados aos assistentes de IA e entenda por que essa história importa',
        duration: '2 horas',
        type: 'theory',
        content: 'Contexto histórico e o desafio do modelo exponencial'
      },
      {
        id: 'claude-code-philosophy',
        title: 'Entendendo a Filosofia do Claude Code',
        description: 'Aprenda por que o Claude Code adota uma abordagem sem opinião e como isso beneficia os desenvolvedores',
        duration: '2 horas',
        type: 'theory',
        content: 'Princípios de design sem opinião e implicações práticas'
      },
      {
        id: 'claude-code-integrations',
        title: 'Integrações do Claude Code',
        description: 'Domine as integrações de terminal, IDE e GitHub para incorporar o Claude Code ao seu fluxo de trabalho',
        duration: '2.5 horas',
        type: 'hands-on',
        content: 'Configuração abrangente de integração e melhores práticas'
      },
      {
        id: 'advanced-workflows',
        title: 'Fluxos de Trabalho Avançados',
        description: 'Implemente padrões poderosos como TDD, modo de planejamento e gerenciamento de memória',
        duration: '2.5 horas',
        type: 'hands-on',
        content: 'Fluxos de trabalho TDD, uso do modo de planejamento e sessões paralelas'
      },
      {
        id: 'building-with-sdk',
        title: 'Construindo com o SDK do Claude Code',
        description: 'Crie integrações customizadas e utilitários Unix usando o SDK do Claude Code',
        duration: '3 horas',
        type: 'project',
        content: 'Arquitetura do SDK e construção de ferramentas prontas para produção'
      },
      {
        id: 'mastering-claude-hooks',
        title: 'Dominando Claude Hooks',
        description: 'Transforme o Claude Code em um parceiro de desenvolvimento proativo com hooks para segurança, observabilidade e automação',
        duration: '2 horas',
        type: 'hands-on',
        content: 'Arquitetura do sistema de hooks, padrões de implementação e casos de uso do mundo real'
      },
      {
        id: 'building-multi-agent-systems',
        title: 'Construindo Sistemas Multi-Agentes',
        description: 'Domine a arte de orquestrar múltiplos agentes Claude para fluxos de trabalho complexos, de sub-agentes a meta-agentes',
        duration: '3 horas',
        type: 'project',
        content: 'Arquitetura multi-agente, padrões de comunicação e estratégias de orquestração'
      }
    ]
  },
  {
    id: 'agent-memory-systems',
    title: 'Construindo Agentes de IA Inteligentes com Memória',
    description: 'Domine a arquitetura e implementação de sistemas de memória para agentes de IA. Aprenda mais de 10 tipos de memória, padrões de gerenciamento e estratégias de implantação em produção inspiradas pela neurociência.',
    level: 'Intermediate',
    duration: '10-12 horas',
    topics: ['Memória de Agentes', 'Arquitetura de Memória', 'IA Inspirada em Neurociência', 'MongoDB', 'Sistemas em Produção'],
    color: 'primary',
    prerequisites: ['mcp-fundamentals'],
    outcomes: [
      'Entender mais de 10 tipos de memória de agentes e seus casos de uso',
      'Construir sistemas abrangentes de gerenciamento de memória',
      'Implementar padrões de memória inspirados em neurociência',
      'Implantar sistemas de memória prontos para produção com MongoDB',
      'Criar agentes que aprendem e melhoram com o tempo'
    ],
    modules: [
      {
        id: 'understanding-agent-memory',
        title: 'Entendendo a Memória de Agentes',
        description: 'Explore por que a memória transforma IA de ferramentas sem estado em parceiros inteligentes',
        duration: '90 minutos',
        type: 'theory',
        content: 'Fundamentos de memória, IA sem estado vs com estado, e impacto nos negócios'
      },
      {
        id: 'memory-types-architecture',
        title: 'Tipos de Memória e Arquitetura',
        description: 'Mergulho profundo em mais de 10 tipos de memória com implementações práticas',
        duration: '120 minutos',
        type: 'hands-on',
        content: 'Conversacional, entidade, episódica, procedural, semântica, e mais'
      },
      {
        id: 'building-memory-management',
        title: 'Construindo Sistemas de Gerenciamento de Memória',
        description: 'Crie sistemas unificados para armazenamento, recuperação e integração',
        duration: '150 minutos',
        type: 'hands-on',
        content: 'Ciclo de vida da memória, sinais, validação e controle de acesso'
      },
      {
        id: 'advanced-memory-patterns',
        title: 'Padrões Avançados de Memória',
        description: 'Implemente esquecimento, sinais de memória e padrões inspirados em neurociência',
        duration: '120 minutos',
        type: 'hands-on',
        content: 'Consolidação, esquecimento adaptativo, mecanismos de atenção'
      },
      {
        id: 'production-memory-systems',
        title: 'Sistemas de Memória em Produção',
        description: 'Escale, proteja e otimize sistemas de memória para uso no mundo real',
        duration: '180 minutos',
        type: 'project',
        content: 'Integração MongoDB, sharding, monitoramento e implantação'
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