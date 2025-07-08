# Project Content Guide for LLMs

This guide helps LLMs understand how to create and format project descriptions that match the existing style and structure in this portfolio. All project content is stored as JSON files in the `content/projects/published/` directory, with localized versions in language-specific subdirectories.

## JSON Structure

### Required Fields

Every project JSON file must include these fields:

```json
{
  "slug": "kebab-case-identifier",
  "title": "Project Display Name",
  "description": "One-line compelling description (80-120 characters)",
  "longDescription": "3-4 paragraphs of detailed project narrative",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6"],
  "featured": false,
  "icon": "LucideIconName",
  "isPrivate": false,
  "githubUrl": "https://github.com/username/repo",
  "demoUrl": "https://demo.example.com" // null if no demo
}
```

### Advanced Fields

Most projects should include these comprehensive fields:

```json
{
  "techStack": [
    {
      "category": "Category Name",
      "items": ["Tech1", "Tech2", "Tech3", "Tech4", "Tech5"]
    }
  ],
  "features": [
    "Feature description starting with action verb",
    "Another feature with specific technical details"
  ],
  "challenges": [
    "Challenge description focusing on technical complexity",
    "Another challenge showing problem-solving approach"
  ],
  "outcomes": [
    { "metric": "Metric Name", "value": "Quantified Result" }
  ]
}
```

### Optional Fields

Include these when relevant:

```json
{
  "educational": [
    "Learning point or pattern demonstrated",
    "Technical concept taught through implementation"
  ],
  "leadership": [
    "Leadership responsibility or achievement",
    "Team management accomplishment"
  ],
  "globalImpact": {
    "geographicReach": ["Country1", "Country2"],
    "usersWorldwide": 500,
    "socialImpact": "Description of positive social change",
    "environmentalImpact": "Description of environmental benefits",
    "accessibilityFeatures": ["Feature1", "Feature2"],
    "multilingualSupport": false,
    "economicImpact": "Description of economic value created",
    "knowledgeSharing": "How project contributes to community"
  },
  "localization": {
    "supportedLanguages": ["English"],
    "culturalAdaptations": ["Adaptation1", "Adaptation2"],
    "timeZoneHandling": true,
    "currencySupport": ["USD", "EUR"],
    "regionalCompliance": ["GDPR", "CCPA"]
  },
  "codeSnippets": [
    {
      "title": "Descriptive Title of Code Feature",
      "language": "python|typescript|rust",
      "code": "// Actual production-quality code demonstrating key concepts"
    }
  ]
}
```

## Writing Style Guidelines

### Description Field (80-120 characters)
- Start with action verb or noun phrase
- Include 1-2 key technologies
- Mention the primary achievement or metric
- Make it compelling and specific

**Examples:**
- "Production-ready AI chatbot with Retrieval-Augmented Generation and MCP server integration, achieving 92% query resolution rate"
- "Cross-platform AI agent management system with Flutter frontend achieving 90%+ test coverage"

### Long Description (3-4 paragraphs)
**Paragraph 1:** Set the context and highlight the main innovation
- Open with active voice describing what was built/architected/developed
- Emphasize the unique value proposition
- Connect to Brandon's expertise areas

**Paragraph 2:** Dive into technical implementation
- Describe key technical features and architecture
- Highlight innovative solutions or patterns used
- Show depth of technical knowledge

**Paragraph 3:** Discuss impact and educational value
- Quantify results where possible
- Explain how it serves as an educational example
- Connect to broader industry impact

### Tags (6-8 tags)
- Mix technology tags with conceptual tags
- Order from most to least important
- Include both specific techs and broader categories

**Good tag combinations:**
- ["Python", "LangChain", "RAG", "MCP", "Vector DB", "FastAPI"]
- ["Rust", "Microservices", "Apache Kafka", "Docker", "Kubernetes", "Event Sourcing", "CQRS"]

### Tech Stack Categories
Common categories and their typical items:

**AI/ML:**
- LLM frameworks (LangChain, Ollama, OpenAI)
- Vector databases (ChromaDB, Pinecone, Weaviate)
- ML libraries (Transformers, Sentence-Transformers)

**Backend:**
- Languages and frameworks
- Databases
- Message queues
- Caching solutions

**Frontend:**
- UI frameworks
- State management
- Styling solutions
- Build tools

**Infrastructure:**
- Container orchestration
- CI/CD tools
- Monitoring solutions
- Cloud platforms

### Features (8-10 items)
- Start with action verbs or descriptive adjectives
- Be specific about technical capabilities
- Mix user-facing and technical features
- Include performance or scale metrics where relevant

**Good feature patterns:**
- "Multi-agent parallel task execution with 3-5 concurrent agents"
- "Advanced RAG with semantic search and re-ranking"
- "Real-time updates with WebSocket communication"

### Challenges (4-6 items)
- Focus on technical complexity
- Show problem-solving approach
- Demonstrate deep understanding
- Avoid generic challenges

**Good challenge patterns:**
- "Implementing reliable MCP protocol communication across distributed services"
- "Coordinating multiple asynchronous agents with complex dependencies"
- "Building zero-cost abstractions over CLI processes in Rust"

### Outcomes (4-6 metrics)
Always quantify with specific metrics:

**Common metric patterns:**
- Performance: "Response Time", "Throughput", "Latency"
- Quality: "Test Coverage", "Code Quality", "Error Rate"
- Scale: "Concurrent Users", "Daily Volume", "Active Agents"
- Impact: "Time Saved", "Cost Reduction", "Efficiency Gain"

### Code Snippets
- Include 2-3 substantial code examples (80-120 lines each)
- Show real implementation patterns, not toy examples
- Include comprehensive comments explaining the approach
- Demonstrate advanced concepts and best practices
- Focus on the most innovative or educational aspects

**Code snippet titles should be descriptive:**
- "Multi-Agent Task Distribution Engine"
- "Event Sourcing Base Implementation"
- "WebSocket Actor System with Real-time Communication"

## Localization

Portuguese translations should:
- Maintain the same JSON structure
- Translate all text fields naturally
- Keep technical terms that are commonly used in English
- Adapt examples to be culturally relevant
- Preserve all metrics and technical details

## Icon Selection

Use appropriate Lucide icon names:
- Bot, Brain, Code2 - AI/ML projects
- Workflow, Network, Zap - System/platform projects
- MessageSquare, Users - Communication/social projects
- Database, Server - Infrastructure projects
- GraduationCap - Educational projects

## Private vs Public Projects

- Set `isPrivate: true` for proprietary/client work
- Include `githubUrl` even for private repos (they won't be accessible)
- Private projects can still include detailed descriptions and code snippets
- Be mindful of NDA constraints in descriptions

## Best Practices

1. **Be Specific:** Avoid generic descriptions. Include real metrics, technologies, and achievements
2. **Show Expertise:** Use technical language that demonstrates deep understanding
3. **Educational Focus:** Explain what others can learn from the project
4. **Consistent Voice:** Maintain professional, confident tone throughout
5. **Real Code:** Include actual implementation code, not simplified examples
6. **Quantify Impact:** Always include metrics and measurable outcomes
7. **Technical Depth:** Show understanding of underlying principles, not just tool usage

## Common Pitfalls to Avoid

- Generic descriptions like "A web application built with React"
- Vague metrics like "improved performance"
- Toy code examples that don't show real implementation
- Missing technical challenges or learning points
- Inconsistent formatting or structure
- Forgetting to translate all fields for Portuguese versions