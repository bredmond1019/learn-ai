#!/usr/bin/env tsx
/**
 * Mapping of YouTube video summaries to related blog posts
 */

export interface ContentMapping {
  videoSummary: string
  videoTitle: string
  blogPost?: string
  blogTitle?: string
  learningPath: 'claude-code' | 'reliable-agents' | 'fundamentals' | 'production'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  keyOutcomes: string[]
}

export const VIDEO_BLOG_MAPPINGS: ContentMapping[] = [
  // Claude Code Mastery Path
  {
    videoSummary: 'how-claude-code-changed-engineering-forever-and-whats-next',
    videoTitle: 'How Claude Code Changed Engineering Forever (And What\'s Next)',
    blogPost: 'claude-code-evolution-programming-ai',
    blogTitle: 'Claude Code: The Evolution of Programming and the Unopinionated AI Assistant',
    learningPath: 'claude-code',
    difficulty: 'beginner',
    duration: '24 min',
    keyOutcomes: [
      'Understand Claude Code as a new engineering primitive',
      'Learn why simplicity beats complex frameworks',
      'Master the agent architecture fundamentals'
    ]
  },
  {
    videoSummary: 'my-claude-code-sub-agents-build-themselves',
    videoTitle: 'My Claude Code Sub-Agents Build Themselves',
    blogPost: 'self-building-ai-meta-agents-and-sub-agent-architecture',
    blogTitle: 'Self-Building AI: Meta-Agents and Sub-Agent Architecture',
    learningPath: 'claude-code',
    difficulty: 'advanced',
    duration: '18 min',
    keyOutcomes: [
      'Build self-improving agent systems',
      'Implement meta-agent architectures',
      'Create agents that spawn specialized sub-agents'
    ]
  },
  {
    videoSummary: 'i-can-see-everything-claude-code-hooks-for-multi-agent-observability',
    videoTitle: 'I Can See Everything: Claude Code Hooks for Multi-Agent Observability',
    blogPost: 'multi-agent-observability-see-everything-your-ai-agents-do',
    blogTitle: 'Multi-Agent Observability: See Everything Your AI Agents Do',
    learningPath: 'claude-code',
    difficulty: 'intermediate',
    duration: '20 min',
    keyOutcomes: [
      'Monitor multiple agents in real-time',
      'Build observability systems with webhooks',
      'Scale from 1 to 10+ agents effectively'
    ]
  },
  {
    videoSummary: 'im-addicted-to-claude-code-rate-limits-agent-models-and-cc-alternatives',
    videoTitle: 'I\'m Addicted to Claude Code: Rate Limits, Agent Models, and CC Alternatives',
    blogPost: 'navigating-claude-code-rate-limits-model-selection-mastery',
    blogTitle: 'Navigating Claude Code Rate Limits & Model Selection Mastery',
    learningPath: 'claude-code',
    difficulty: 'intermediate',
    duration: '15 min',
    keyOutcomes: [
      'Navigate rate limits strategically',
      'Choose the right model for each task',
      'Understand Claude Code alternatives'
    ]
  },

  // Building Reliable AI Agents Path
  {
    videoSummary: 'how-to-build-reliable-ai-agents-in-2025',
    videoTitle: 'How to Build Reliable AI Agents in 2025',
    blogPost: 'the-7-building-blocks-of-reliable-ai-agents-skip-the-frameworks',
    blogTitle: 'The 7 Building Blocks of Reliable AI Agents (Skip the Frameworks)',
    learningPath: 'reliable-agents',
    difficulty: 'intermediate',
    duration: '27 min',
    keyOutcomes: [
      'Master the 7 core building blocks',
      'Build without complex frameworks',
      'Create deterministic agent workflows'
    ]
  },
  {
    videoSummary: 'architecting-agent-memory-principles-patterns-and-best-practices-richmond-alake-mongodb',
    videoTitle: 'Architecting Agent Memory: Principles, Patterns, and Best Practices',
    blogPost: 'building-intelligent-ai-agents-with-memory',
    blogTitle: 'Building Intelligent AI Agents with Memory',
    learningPath: 'reliable-agents',
    difficulty: 'advanced',
    duration: '17 min',
    keyOutcomes: [
      'Implement sophisticated memory systems',
      'Use MongoDB for agent memory',
      'Build context-aware AI applications'
    ]
  },

  // AI Engineering Fundamentals Path
  {
    videoSummary: 'software-is-evolving-backwards',
    videoTitle: 'Software is Evolving Backwards',
    blogPost: 'ai-ux-dark-patterns-evolution-backwards',
    blogTitle: 'AI UX Dark Patterns: Evolution Backwards',
    learningPath: 'fundamentals',
    difficulty: 'beginner',
    duration: '22 min',
    keyOutcomes: [
      'Understand AI\'s impact on software design',
      'Recognize and avoid dark patterns',
      'Build user-centric AI experiences'
    ]
  },
  {
    videoSummary: 'the-new-code-sean-grove-openai',
    videoTitle: 'The New Code - Sean Grove (OpenAI)',
    blogPost: 'the-new-code-why-specifications-will-replace-programming',
    blogTitle: 'The New Code: Why Specifications Will Replace Programming',
    learningPath: 'fundamentals',
    difficulty: 'advanced',
    duration: '25 min',
    keyOutcomes: [
      'Understand the future of programming',
      'Learn specification-driven development',
      'Prepare for the AI-first coding paradigm'
    ]
  },
  {
    videoSummary: 'make-your-llm-app-a-domain-expert-how-to-build-an-expert-system-christopher-lovejoy-anterior',
    videoTitle: 'Make Your LLM App a Domain Expert',
    blogPost: 'building-domain-expert-ai-the-last-mile-problem-nobody-talks-about',
    blogTitle: 'Building Domain Expert AI: The Last Mile Problem Nobody Talks About',
    learningPath: 'fundamentals',
    difficulty: 'advanced',
    duration: '30 min',
    keyOutcomes: [
      'Build domain-specific AI systems',
      'Solve the "last mile" problem',
      'Create expert-level AI applications'
    ]
  },

  // Production & Business Path
  {
    videoSummary: 'poc-to-prod-hard-lessons-from-200-enterprise-genai-deployments-randall-hunt-caylent',
    videoTitle: 'POC to Prod: Hard Lessons from 200 Enterprise GenAI Deployments',
    blogPost: 'poc-to-production-200-enterprise-genai-deployments-taught-us-this',
    blogTitle: 'POC to Production: What 200 Enterprise GenAI Deployments Taught Us',
    learningPath: 'production',
    difficulty: 'advanced',
    duration: '28 min',
    keyOutcomes: [
      'Navigate enterprise AI challenges',
      'Scale from proof-of-concept to production',
      'Avoid common deployment pitfalls'
    ]
  },
  {
    videoSummary: 'i-cloned-3-apps-and-now-make-35k-month',
    videoTitle: 'I Cloned 3 Apps and Now Make $35k/Month',
    blogPost: 'the-35k-month-copycat-strategy-how-to-build-successful-saas-by-cloning',
    blogTitle: 'The $35k/Month Copycat Strategy: How to Build Successful SaaS by Cloning',
    learningPath: 'production',
    difficulty: 'intermediate',
    duration: '20 min',
    keyOutcomes: [
      'Identify profitable app opportunities',
      'Execute the copycat strategy ethically',
      'Build and scale SaaS businesses'
    ]
  }
]

// Blog posts without video summaries
export const BLOG_ONLY_CONTENT = [
  {
    blogPost: '12-factor-agents-building-reliable-llm-applications',
    blogTitle: '12-Factor Agents: Building Reliable LLM Applications',
    learningPath: 'reliable-agents',
    difficulty: 'advanced',
    keyOutcomes: [
      'Apply 12-factor methodology to AI agents',
      'Build production-ready agent systems',
      'Ensure reliability and scalability'
    ]
  },
  {
    blogPost: 'agent-architecture-patterns-production-guide',
    blogTitle: 'Agent Architecture Patterns: Production Guide',
    learningPath: 'reliable-agents',
    difficulty: 'advanced',
    keyOutcomes: [
      'Master production architecture patterns',
      'Design scalable agent systems',
      'Implement best practices'
    ]
  },
  {
    blogPost: 'why-ai-engineers-matter',
    blogTitle: 'Why AI Engineers Matter',
    learningPath: 'fundamentals',
    difficulty: 'beginner',
    keyOutcomes: [
      'Understand the AI engineer role',
      'Learn key skills and responsibilities',
      'Plan your AI engineering career'
    ]
  },
  {
    blogPost: 'mastering-claude-code-hooks-building-observable-ai-systems',
    blogTitle: 'Mastering Claude Code Hooks: Building Observable AI Systems',
    learningPath: 'claude-code',
    difficulty: 'intermediate',
    keyOutcomes: [
      'Implement Claude Code hooks',
      'Build observable systems',
      'Debug and monitor effectively'
    ]
  },
  {
    blogPost: 'the-claude-code-revolution-how-ai-transformed-software-engineering',
    blogTitle: 'The Claude Code Revolution: How AI Transformed Software Engineering',
    learningPath: 'claude-code',
    difficulty: 'beginner',
    keyOutcomes: [
      'Understand the AI revolution in coding',
      'Learn Claude Code fundamentals',
      'Transform your development workflow'
    ]
  },
  {
    blogPost: 'claude-hooks-automate-your-ai-development-workflow',
    blogTitle: 'Claude Hooks: Automate Your AI Development Workflow',
    learningPath: 'claude-code',
    difficulty: 'intermediate',
    keyOutcomes: [
      'Automate repetitive tasks',
      'Build custom development workflows',
      'Increase productivity with hooks'
    ]
  },
  {
    blogPost: 'claude-code-transforming-software-development',
    blogTitle: 'Claude Code: Transforming Software Development',
    learningPath: 'claude-code',
    difficulty: 'beginner',
    keyOutcomes: [
      'Transform your coding practice',
      'Leverage AI for development',
      'Build faster and better'
    ]
  },
  {
    blogPost: 'the-cair-metric-hidden-key-to-ai-product-success',
    blogTitle: 'The CAIR Metric: Hidden Key to AI Product Success',
    learningPath: 'production',
    difficulty: 'intermediate',
    keyOutcomes: [
      'Measure AI product effectiveness',
      'Optimize for user satisfaction',
      'Build successful AI products'
    ]
  },
  {
    blogPost: 'roi-driven-ai-measuring-maximizing-returns',
    blogTitle: 'ROI-Driven AI: Measuring & Maximizing Returns',
    learningPath: 'production',
    difficulty: 'intermediate',
    keyOutcomes: [
      'Calculate AI project ROI',
      'Maximize business value',
      'Justify AI investments'
    ]
  },
  {
    blogPost: 'vector-databases-for-ai-engineers',
    blogTitle: 'Vector Databases for AI Engineers',
    learningPath: 'fundamentals',
    difficulty: 'intermediate',
    keyOutcomes: [
      'Master vector database concepts',
      'Implement semantic search',
      'Build RAG applications'
    ]
  },
  {
    blogPost: 'building-ai-agents-pure-python',
    blogTitle: 'Building AI Agents in Pure Python',
    learningPath: 'reliable-agents',
    difficulty: 'beginner',
    keyOutcomes: [
      'Build agents without frameworks',
      'Use pure Python for AI development',
      'Create maintainable agent code'
    ]
  },
  {
    blogPost: 'why-multi-agent-systems-are-a-trap',
    blogTitle: 'Why Multi-Agent Systems Are a Trap',
    learningPath: 'reliable-agents',
    difficulty: 'advanced',
    keyOutcomes: [
      'Avoid multi-agent pitfalls',
      'Know when NOT to use multiple agents',
      'Build simpler, better systems'
    ]
  },
  {
    blogPost: 'why-your-ai-assistant-needs-memory',
    blogTitle: 'Why Your AI Assistant Needs Memory',
    learningPath: 'reliable-agents',
    difficulty: 'beginner',
    keyOutcomes: [
      'Understand memory importance',
      'Implement basic memory systems',
      'Create context-aware assistants'
    ]
  },
  {
    blogPost: 'mastering-prompt-engineering',
    blogTitle: 'Mastering Prompt Engineering',
    learningPath: 'fundamentals',
    difficulty: 'beginner',
    keyOutcomes: [
      'Write effective prompts',
      'Understand prompt patterns',
      'Optimize AI responses'
    ]
  },
  {
    blogPost: 'ai-ethics-in-practice',
    blogTitle: 'AI Ethics in Practice',
    learningPath: 'fundamentals',
    difficulty: 'intermediate',
    keyOutcomes: [
      'Implement ethical AI practices',
      'Avoid bias and harm',
      'Build responsible AI systems'
    ]
  },
  {
    blogPost: 'ai-for-everyday-person',
    blogTitle: 'AI for the Everyday Person',
    learningPath: 'fundamentals',
    difficulty: 'beginner',
    keyOutcomes: [
      'Understand AI basics',
      'Use AI in daily life',
      'Demystify AI technology'
    ]
  },
  {
    blogPost: 'ai-for-small-medium-business',
    blogTitle: 'AI for Small & Medium Business',
    learningPath: 'production',
    difficulty: 'beginner',
    keyOutcomes: [
      'Implement AI in SMBs',
      'Find quick wins with AI',
      'Scale AI adoption gradually'
    ]
  },
  // MCP (Model Context Protocol) Series
  {
    blogPost: 'mastering-mcp-servers-guide',
    blogTitle: 'Mastering MCP Servers: Complete Guide',
    learningPath: 'fundamentals',
    difficulty: 'intermediate',
    keyOutcomes: [
      'Understand MCP architecture',
      'Build custom MCP servers',
      'Integrate with AI applications'
    ]
  },
  {
    blogPost: 'mcp-python-development-guide',
    blogTitle: 'MCP Python Development Guide',
    learningPath: 'fundamentals',
    difficulty: 'intermediate',
    keyOutcomes: [
      'Build MCP servers in Python',
      'Implement tools and resources',
      'Handle async operations'
    ]
  },
  {
    blogPost: 'mcp-workflow-system-implementation',
    blogTitle: 'MCP Workflow System Implementation',
    learningPath: 'reliable-agents',
    difficulty: 'advanced',
    keyOutcomes: [
      'Design workflow systems',
      'Implement state management',
      'Build production workflows'
    ]
  },
  {
    blogPost: 'mcp-customer-support-triage-architecture',
    blogTitle: 'MCP Customer Support Triage Architecture',
    learningPath: 'production',
    difficulty: 'advanced',
    keyOutcomes: [
      'Build support automation',
      'Implement triage systems',
      'Scale customer service'
    ]
  },
  {
    blogPost: 'mcp-professional-agentic-ai-applications',
    blogTitle: 'MCP Professional Agentic AI Applications',
    learningPath: 'reliable-agents',
    difficulty: 'advanced',
    keyOutcomes: [
      'Build professional AI agents',
      'Implement MCP patterns',
      'Create scalable architectures'
    ]
  },
  // Implementation Guides
  {
    blogPost: 'ai-integration-business-guide',
    blogTitle: 'AI Integration Business Guide',
    learningPath: 'production',
    difficulty: 'intermediate',
    keyOutcomes: [
      'Plan AI integration strategy',
      'Navigate implementation challenges',
      'Measure business impact'
    ]
  },
  {
    blogPost: 'building-ai-powered-applications',
    blogTitle: 'Building AI-Powered Applications',
    learningPath: 'fundamentals',
    difficulty: 'intermediate',
    keyOutcomes: [
      'Design AI-first applications',
      'Implement core features',
      'Handle edge cases'
    ]
  },
  {
    blogPost: 'knowledge-graph-builder-documentation',
    blogTitle: 'Knowledge Graph Builder Documentation',
    learningPath: 'fundamentals',
    difficulty: 'advanced',
    keyOutcomes: [
      'Build knowledge graphs',
      'Implement graph algorithms',
      'Query and traverse graphs'
    ]
  },
  {
    blogPost: 'mlops-production-deployment',
    blogTitle: 'MLOps Production Deployment',
    learningPath: 'production',
    difficulty: 'advanced',
    keyOutcomes: [
      'Deploy ML models at scale',
      'Implement MLOps practices',
      'Monitor production systems'
    ]
  }
]

// Helper function to get all blog posts
export function getAllBlogPosts(): string[] {
  const fromMappings = VIDEO_BLOG_MAPPINGS
    .filter(m => m.blogPost)
    .map(m => m.blogPost!)
  
  const blogOnly = BLOG_ONLY_CONTENT.map(b => b.blogPost)
  
  return [...new Set([...fromMappings, ...blogOnly])]
}

// Helper to get learning path info
export function getLearningPathInfo(path: string) {
  const paths = {
    'claude-code': {
      title: '🚀 Claude Code Mastery',
      description: 'Master Claude Code from basics to advanced multi-agent systems',
      icon: '🚀'
    },
    'reliable-agents': {
      title: '🏗️ Building Reliable AI Agents',
      description: 'Learn to build production-ready AI agents that actually work',
      icon: '🏗️'
    },
    'fundamentals': {
      title: '🧠 AI Engineering Fundamentals',
      description: 'Essential knowledge for every AI engineer',
      icon: '🧠'
    },
    'production': {
      title: '💼 Production & Business',
      description: 'Take AI from proof-of-concept to profitable production',
      icon: '💼'
    }
  }
  
  return paths[path as keyof typeof paths]
}