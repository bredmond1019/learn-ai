# Blog Post Generation Prompt Template

Use this template to generate blog posts that match Brandon J. Redmond's established style and quality standards.

## Prompt Template

```
You are writing a blog post for Brandon J. Redmond's AI engineering blog. Brandon is an experienced AI Systems Engineer & Agentic AI Architect who writes practical, actionable content for developers and business leaders interested in AI implementation.

## Post Requirements

**Topic**: [INSERT SPECIFIC TOPIC HERE]
**Target Audience**: [e.g., "AI engineers building production systems" or "Business leaders evaluating AI investments"]
**Post Type**: [Tutorial/Conceptual Guide/Case Study/Framework Introduction]
**Desired Length**: [Short (1,200-2,000 words) / Standard (2,500-4,000 words) / Pillar (4,000-6,000 words)]

## Key Points to Cover
1. [First main point or learning objective]
2. [Second main point or learning objective]
3. [Third main point or learning objective]

## Specific Examples/Scenarios to Include
- [Example 1: Real-world scenario or use case]
- [Example 2: Technical implementation example]
- [Example 3: Business application or result]

## Voice and Style Guidelines

Write in a conversational yet professional tone, as if explaining complex concepts to a smart friend. Use:
- Personal anecdotes and real-world examples
- Direct, action-oriented language
- Natural contractions (it's, you'll, we're)
- Rhetorical questions to engage readers
- Metaphors to explain complex concepts

Start with a compelling hook that immediately establishes why the reader should care. This could be:
- A relatable problem scenario
- A personal confession or learning experience  
- An industry insight or contrarian take
- A provocative question or statement

## Structure Requirements

1. **Opening Hook** (1-3 paragraphs): Grab attention and establish relevance
2. **Problem Definition** (2-4 paragraphs): Clearly articulate the challenge with specific examples
3. **Main Content** (60-80% of post):
   - Break into clear sections with descriptive headers
   - Progress from simple to complex concepts
   - Include practical code examples in TypeScript/Python
   - Mix explanation with implementation
4. **Practical Application** (10-20% of post): Show real-world usage with concrete next steps
5. **Conclusion** (2-3 paragraphs): Summarize key takeaways and inspire action

## Technical Requirements

- Include 2-4 working code examples with explanatory comments
- Use TypeScript for type safety demonstrations, Python for AI/ML code
- Show progression from basic to advanced implementations
- Include error handling and edge cases
- Provide complete, runnable examples where possible

## MDX Components to Use

- `<Callout>` for important insights, warnings, or tips
- `<Card>` for grouping related information or resources
- `<Tabs>` for showing alternative approaches or before/after code
- `<Badge>` for highlighting key terms or categories

## Frontmatter Format

```yaml
---
title: "[Compelling title with clear benefit]"
date: "[YYYY-MM-DD]"
excerpt: "[1-2 sentences explaining what reader will learn and why it matters]"
tags: ["Primary Category", "Technology", "Use Case", "Skill Level"]
author: "Brandon"
---
```

## Additional Instructions

- Define technical terms on first use
- Include both beginner-friendly explanations and expert insights
- Add section headers with optional emojis (🚀, 💡, 🎯, 🔧)
- End with clear, actionable next steps
- Maintain an encouraging, "you can do this" tone throughout

## Example Patterns to Consider

- **The "Real Problem" Pattern**: Reveal the actual issue behind surface-level symptoms
- **The "Evolution" Pattern**: Show how approaches have evolved over time
- **The "Framework Introduction" Pattern**: Present complex systems as memorable frameworks
- **The "Behind the Scenes" Pattern**: Share insider knowledge from real implementations

Now, generate a blog post following these guidelines on the topic specified above.
```

## Usage Instructions

1. **Fill in the Requirements**: Replace all bracketed placeholders with specific information about your blog post topic

2. **Customize the Examples**: Provide concrete scenarios, use cases, or technical examples relevant to your topic

3. **Adjust for Audience**: Modify the technical depth based on your target reader's expertise level

4. **Review and Edit**: After generation, ensure:
   - The opening hook is compelling
   - Technical explanations are accurate
   - Code examples are functional
   - The tone remains conversational yet authoritative
   - All sections flow logically

5. **Enhance with Visuals**: Consider adding:
   - Architecture diagrams for system design posts
   - Flowcharts for process explanations
   - Screenshots for tool tutorials
   - Comparison tables for framework evaluations

## Example Customizations

### For a Technical Tutorial
```
**Topic**: Building a production-ready MCP server for document processing
**Target Audience**: AI engineers familiar with Node.js but new to MCP
**Post Type**: Technical Tutorial
**Desired Length**: Standard (2,500-4,000 words)

**Key Points to Cover**:
1. MCP architecture and core concepts
2. Step-by-step server implementation
3. Best practices for error handling and security
4. Deployment and monitoring strategies
```

### For a Business Strategy Post
```
**Topic**: Measuring ROI on AI agent implementations
**Target Audience**: CTOs and technical decision-makers
**Post Type**: Framework Introduction
**Desired Length**: Standard (2,500-4,000 words)

**Key Points to Cover**:
1. Why traditional ROI metrics fail for AI projects
2. The four-pillar framework for AI value measurement
3. Industry-specific calculators and examples
4. Building a compelling business case
```

### For a Conceptual Guide
```
**Topic**: Why AI agents need memory systems
**Target Audience**: Developers building their first AI applications
**Post Type**: Conceptual Guide
**Desired Length**: Short (1,200-2,000 words)

**Key Points to Cover**:
1. The limitations of stateless AI interactions
2. Types of memory systems and when to use each
3. Simple implementation patterns
4. Common pitfalls and how to avoid them
```

## Quality Checklist

Before publishing, verify:
- [ ] Hook immediately engages the target audience
- [ ] Problem is clearly defined with specific examples
- [ ] Technical content is accurate and well-explained
- [ ] Code examples are functional and well-commented
- [ ] Progression from simple to complex is smooth
- [ ] Practical applications are clearly demonstrated
- [ ] Next steps are actionable and specific
- [ ] Tone is conversational yet authoritative
- [ ] Post provides genuine value to readers

## Final Tips

- **Be Specific**: Use real numbers, actual tools, and concrete examples
- **Show Progress**: Demonstrate how concepts build on each other
- **Stay Practical**: Every concept should connect to real-world application
- **Encourage Action**: Make readers feel capable of implementing what they've learned
- **Add Personality**: Include appropriate humor, personal insights, or industry observations

Remember: The goal is to create content that readers will bookmark, share, and return to because it solves real problems in an accessible way.