# Project Entry Generation Prompt

You are tasked with creating a new project entry for Brandon J. Redmond's AI Engineering portfolio. Follow this template to generate a properly formatted JSON file that matches the existing project style.

## Context
Brandon is an AI Engineer & Agentic Systems Architect with expertise in:
- Multi-agent AI systems and workflow orchestration
- Production-ready implementations with comprehensive testing
- Educational content that teaches through practical examples
- Cross-platform development with modern tech stacks
- Enterprise-grade solutions with real-world impact

## Task
Create a complete project JSON entry including all required and relevant optional fields. The project should demonstrate technical excellence, educational value, and real-world impact.

## Required Information to Provide

1. **Project Basics**
   - Project name and one-line description
   - GitHub URL (or indication if private)
   - Demo URL (if applicable)
   - Whether it should be featured
   - Privacy status

2. **Technical Details**
   - Primary technologies used
   - Architecture patterns implemented
   - Key features and capabilities
   - Technical challenges overcome
   - Measurable outcomes

3. **Project Narrative**
   - What problem does it solve?
   - What makes it innovative?
   - How was it implemented?
   - What can others learn from it?

4. **Code Examples**
   - 2-3 significant code snippets
   - Real implementation patterns
   - Well-commented and educational

## JSON Template

```json
{
  "slug": "[kebab-case-project-name]",
  "title": "[Project Display Name]",
  "description": "[80-120 char description with key tech and primary achievement]",
  "longDescription": "[3-4 paragraphs: 1) Context and innovation, 2) Technical implementation, 3) Impact and educational value]",
  "tags": ["[Primary Tech]", "[Framework]", "[Pattern]", "[Domain]", "[Tool]", "[Concept]"],
  "featured": [true/false],
  "icon": "[LucideIconName]",
  "isPrivate": [true/false],
  "githubUrl": "[URL or null]",
  "demoUrl": "[URL or null]",
  "techStack": [
    {
      "category": "[Category Name]",
      "items": ["[Tech1]", "[Tech2]", "[Tech3]", "[Tech4]", "[Tech5]"]
    },
    {
      "category": "[Another Category]",
      "items": ["[Tech1]", "[Tech2]", "[Tech3]", "[Tech4]"]
    }
  ],
  "features": [
    "[Feature starting with action verb, specific and technical]",
    "[Another feature with measurable impact or capability]",
    "[Feature highlighting unique aspect or innovation]",
    "[Technical feature showing depth of implementation]",
    "[User-facing feature with benefit]",
    "[Infrastructure or architecture feature]",
    "[Performance or scale feature with metrics]",
    "[Integration or compatibility feature]"
  ],
  "challenges": [
    "[Technical challenge focusing on complexity]",
    "[Architectural challenge showing design decisions]",
    "[Performance or scale challenge]",
    "[Integration or compatibility challenge]",
    "[Team or process challenge if applicable]"
  ],
  "outcomes": [
    { "metric": "[Performance Metric]", "value": "[Specific number/percentage]" },
    { "metric": "[Quality Metric]", "value": "[Specific achievement]" },
    { "metric": "[Scale Metric]", "value": "[Quantified result]" },
    { "metric": "[Impact Metric]", "value": "[Measurable outcome]" }
  ],
  "educational": [
    "[Key learning or pattern demonstrated]",
    "[Technical concept taught through implementation]",
    "[Best practice or architecture pattern shown]",
    "[Tool or framework usage example]",
    "[Problem-solving approach illustrated]"
  ],
  "globalImpact": {
    "geographicReach": ["[Country1]", "[Country2]", "[Country3]"],
    "usersWorldwide": [number],
    "socialImpact": "[How project creates positive social change]",
    "environmentalImpact": "[Environmental benefits or efficiency gains]",
    "accessibilityFeatures": ["[Feature1]", "[Feature2]", "[Feature3]"],
    "multilingualSupport": [true/false],
    "economicImpact": "[Economic value created or costs saved]",
    "knowledgeSharing": "[How project contributes to developer community]"
  },
  "localization": {
    "supportedLanguages": ["English"],
    "culturalAdaptations": ["[Adaptation1]", "[Adaptation2]"],
    "timeZoneHandling": [true/false],
    "currencySupport": ["[Currency1]", "[Currency2]"],
    "regionalCompliance": ["[Compliance1]", "[Compliance2]"]
  },
  "codeSnippets": [
    {
      "title": "[Descriptive Title of Key Implementation]",
      "language": "[python/typescript/rust]",
      "code": "[80-120 lines of production-quality code with comments]"
    },
    {
      "title": "[Another Key Feature Implementation]",
      "language": "[language]",
      "code": "[Another substantial code example]"
    }
  ]
}
```

## Style Guidelines

### Description Examples
- "Multi-agent research system that creates personalized learning experiences using MCP orchestration, achieving real-time knowledge synthesis"
- "Production-ready AI workflow orchestration platform built in Rust, featuring event sourcing and 15,000+ req/s throughput"
- "Type-safe, async-first Rust SDK wrapping Claude Code CLI with advanced security features, achieving 100% safe abstractions"

### Tag Examples
- AI/ML: ["Python", "LangChain", "RAG", "MCP", "Vector DB", "FastAPI"]
- Systems: ["Rust", "Event Sourcing", "Microservices", "WebAssembly", "CQRS"]
- Frontend: ["React", "TypeScript", "GraphQL", "Tailwind CSS", "Real-time"]

### Feature Examples
- "Multi-agent parallel task execution with intelligent load balancing"
- "Event-driven architecture with PostgreSQL event sourcing and replay capabilities"
- "Comprehensive test coverage exceeding 90% across all components"
- "Real-time collaboration with WebSocket support for 10,000+ concurrent users"

### Outcome Metric Examples
- { "metric": "Response Time", "value": "<100ms p95" }
- { "metric": "Test Coverage", "value": "90%+" }
- { "metric": "Concurrent Users", "value": "10,000+" }
- { "metric": "Cost Reduction", "value": "70%" }

### Code Snippet Guidelines
- Show real implementation patterns, not simplified examples
- Include error handling and production considerations
- Add comments explaining key concepts and decisions
- Demonstrate advanced language features appropriately
- Focus on the most innovative aspects of the implementation

## Checklist

Before submitting, ensure:
- [ ] All required fields are complete
- [ ] Description is 80-120 characters
- [ ] Long description has 3-4 substantial paragraphs
- [ ] 6-8 relevant tags included
- [ ] 8-10 specific features listed
- [ ] 4-6 technical challenges described
- [ ] 4-6 quantified outcomes provided
- [ ] 2-3 substantial code snippets included
- [ ] Educational value is clearly articulated
- [ ] Global impact section is comprehensive
- [ ] Technical depth demonstrates expertise
- [ ] Style matches existing projects

## Final Notes

Remember that these projects serve multiple purposes:
1. Demonstrating Brandon's technical expertise
2. Teaching others through practical examples
3. Showing real-world impact and scale
4. Highlighting innovative solutions to complex problems

The tone should be confident and professional while remaining educational and accessible. Focus on what makes each project unique and valuable to the broader developer community.