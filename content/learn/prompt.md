# Learning Module Generation Prompt Template

Use this template to generate new learning modules that match the AI Engineering portfolio's style and structure.

## Base Prompt

```
You are creating a learning module for an AI Engineering education platform. The module should follow these specifications:

**Learning Path**: [PATH_NAME] ([PATH_ID])
**Module Title**: [MODULE_TITLE]
**Duration**: [DURATION] minutes
**Difficulty**: [beginner|intermediate|advanced]
**Prerequisites**: [List any required prior knowledge]

**Learning Objectives**:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

**Target Audience**: [Describe the learner profile]

**Module Type**: [theory|concept|practice|project|assessment]

Please create:
1. A module JSON metadata file
2. A complete MDX content file

The content should include:
- Introduction with clear value proposition
- Core concepts broken into digestible sections
- At least 3 code examples with different complexity levels
- Interactive elements (Quiz, Callouts, Diagrams)
- Practical exercises or hands-on activities
- Real-world applications and use cases
- Common pitfalls and how to avoid them
- Summary of key takeaways
- Clear next steps

Use a conversational, encouraging tone that explains complex concepts through relatable analogies.
```

## Specific Module Type Templates

### Concept Module Template

```
Create a CONCEPT module for [TOPIC] that:

1. **Introduces the concept** using a relatable analogy
2. **Explains the theory** with visual aids (diagrams/flowcharts)
3. **Shows practical examples** with progressively complex code
4. **Compares approaches** (before/after, different methods)
5. **Includes a quiz** testing understanding (5-7 questions)
6. **Provides exercises** for hands-on practice

Structure:
- Introduction: Why this concept matters
- Core Theory: How it works under the hood
- Implementation: Code examples from basic to advanced
- Best Practices: Do's and don'ts
- Real-World Usage: Industry applications
- Practice Exercise: Apply the concept
- Knowledge Check: Quiz on key points
```

### Technical Tutorial Template

```
Create a TUTORIAL module for building [PROJECT/FEATURE] that:

1. **Project Overview**: What we're building and why
2. **Environment Setup**: Required tools and configuration
3. **Step-by-Step Implementation**: 
   - Break into 3-5 major steps
   - Each step has starter code and solution
   - Include validation checkpoints
4. **Testing**: How to verify it works
5. **Enhancement Ideas**: Ways to extend the project

Include:
- Architecture diagram
- File structure overview
- Code snippets for each step
- Common errors and solutions
- Performance considerations
- Deployment notes
```

### Project Module Template

```
Create a PROJECT module for [PROJECT_NAME] that:

1. **Project Requirements**: Clear specifications
2. **Architecture Design**: System design and components
3. **Implementation Phases**:
   - Phase 1: Core functionality
   - Phase 2: Enhanced features
   - Phase 3: Production readiness
4. **Testing Strategy**: Unit, integration, and E2E tests
5. **Deployment Guide**: How to ship to production

Deliverables:
- Complete project structure
- Multiple implementation exercises
- Test cases and validation
- Documentation requirements
- Code review checklist
```

## Content Patterns to Include

### For Beginners
```
- Start with "Why should I care?"
- Use everyday analogies
- Provide extensive code comments
- Include "Try it yourself" prompts
- Celebrate small wins with encouraging callouts
```

### For Intermediate
```
- Focus on best practices
- Compare different approaches
- Include performance considerations
- Show real-world scenarios
- Discuss trade-offs and decision making
```

### For Advanced
```
- Deep dive into internals
- Production-scale considerations
- Advanced patterns and optimizations
- Integration with other systems
- Monitoring and debugging strategies
```

## Interactive Elements Guide

### Quiz Questions
```
Generate quiz questions that:
- Test conceptual understanding (not memorization)
- Use real-world scenarios
- Provide educational explanations
- Mix difficulty levels
- Include code-based questions

Example format:
<Question
  question="In a production MCP server, what's the primary benefit of using a provider registry pattern?"
  options={[
    "It makes the code shorter",
    "It enables dynamic provider registration and better testing",
    "It improves performance",
    "It's required by the MCP specification"
  ]}
  correct={1}
  explanation="The provider registry pattern allows for dynamic registration of providers at runtime, making the system more flexible and testable. You can easily mock providers for testing and add new providers without modifying core server code."
/>
```

### Code Examples
```
Structure code examples with:
- Descriptive title explaining the purpose
- Brief comment explaining the approach
- Highlighted lines for important parts
- Progressive complexity (basic → advanced)

Example:
<CodeExample
  title="Basic MCP Server with Provider Registry"
  language="typescript"
  code={`
// Initialize the provider registry
const registry = new ProviderRegistry(config, logger);

// Register providers dynamically
await registry.register(new FileSystemProvider());
await registry.register(new DatabaseProvider());
await registry.register(new GitProvider());

// Server automatically uses all registered providers
const resources = await registry.getAllResources();
  `}
  highlightLines={[5, 6, 7]}
/>
```

### Callout Patterns
```
Info Callout (💡 Tips and insights):
<Callout type="info">
  **Pro Tip**: Start with a single provider and gradually add more as you understand the pattern.
</Callout>

Warning Callout (⚠️ Common mistakes):
<Callout type="warning">
  **Watch Out**: Always validate provider health before registration to prevent server startup failures.
</Callout>

Success Callout (✅ Best practices):
<Callout type="success">
  **Best Practice**: Use environment-specific configuration to enable/disable providers based on deployment needs.
</Callout>
```

## Module Sections Template

### Standard Section Structure
```mdx
## Section Title {#section-id}

Brief introduction to what this section covers.

### Sub-concept 1

Explanation with example...

<CodeExample .../>

### Sub-concept 2

More detailed explanation...

**Key Points:**
- Important point 1
- Important point 2
- Important point 3

<Callout type="info">
  Helpful tip or additional context
</Callout>

### Practical Application

How to use this in real projects...
```

## Complete Example Request

```
Create a complete learning module for the "agentic-workflows" path:

Title: "Building Multi-Step Agent Workflows"
Duration: 60 minutes
Difficulty: Intermediate
Prerequisites: Basic understanding of agents and MCP

Objectives:
1. Design multi-step workflows for complex tasks
2. Implement error handling and recovery
3. Add human-in-the-loop checkpoints
4. Monitor and debug agent workflows

The module should teach learners how to build agents that can:
- Break down complex goals into steps
- Execute steps in sequence with proper error handling
- Request human input when needed
- Provide progress updates
- Recover from failures gracefully

Include practical examples like:
- Research agent that gathers and summarizes information
- Code review agent with human approval steps
- Data processing pipeline with validation checkpoints
```

## Validation Checklist

After generating content, verify:
- [ ] JSON metadata matches MDX frontmatter
- [ ] All section anchors are properly defined
- [ ] Code examples are complete and runnable
- [ ] Quiz has 5+ questions with explanations
- [ ] Callouts emphasize key learning points
- [ ] Progression from simple to complex is smooth
- [ ] Real-world context is provided
- [ ] Next steps guide learners forward
- [ ] Time estimate is realistic
- [ ] All imports are included in MDX