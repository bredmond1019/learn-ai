# Blog Writing Style Guide for LLMs

This guide helps LLMs write blog posts that match the established style and standards of Brandon J. Redmond's AI engineering blog.

## Voice and Tone

### Writing Personality
- **Conversational yet Professional**: Write like you're explaining complex concepts to a smart friend over coffee
- **Personal and Relatable**: Use personal anecdotes, real-world examples, and occasional humor
- **Confident but Humble**: Share expertise without being preachy; acknowledge when things are hard
- **Direct and Action-Oriented**: Get to the point quickly, provide practical value

### Language Characteristics
- Use contractions naturally (it's, you'll, we're)
- Ask rhetorical questions to engage readers
- Use metaphors and analogies to explain complex concepts
- Include conversational transitions ("Now, here's where it gets interesting...")
- Occasionally break the fourth wall ("Let's be honest...")

## Post Structure

### Standard Format
1. **Hook Opening** (1-3 paragraphs)
   - Start with a relatable scenario, problem, or provocative statement
   - Immediately establish why the reader should care
   - Often uses personal anecdotes or industry observations

2. **Problem Definition** (2-4 paragraphs)
   - Clearly articulate the challenge being addressed
   - Use specific examples rather than abstract descriptions
   - Connect to reader's pain points

3. **Main Content** (60-80% of post)
   - Break into clear sections with descriptive headers
   - Mix conceptual explanation with practical implementation
   - Include code examples, diagrams, or frameworks
   - Progress from simple to complex

4. **Practical Application** (10-20% of post)
   - Show real-world usage
   - Provide concrete next steps
   - Include templates, calculators, or tools when relevant

5. **Conclusion** (2-3 paragraphs)
   - Summarize key takeaways
   - Inspire action with clear next steps
   - End with a thought-provoking statement or call-to-action

### Section Headers
- Use emoji sparingly but effectively (🚀, 💡, 🎯, 🔧, 📊)
- Make headers descriptive and benefit-oriented
- Use a mix of statement and question formats
- Keep headers concise (3-8 words typically)

## Content Patterns

### Code Examples
```typescript
// Always include explanatory comments
// Use TypeScript for type safety demonstrations
// Keep examples practical and runnable
interface ExampleStructure {
  concept: string;
  explanation: string;
  practicalUse: string[];
}
```

### Lists and Enumerations
- Use bullet points for non-sequential information
- Use numbered lists for steps or ranked items
- Bold the first few words of list items for scannability
- Keep list items parallel in structure

### MDX Components Usage
- `<Callout>` for important insights, warnings, or tips
- `<Card>` for grouping related information
- `<Tabs>` for showing alternative approaches or before/after comparisons
- `<Badge>` for highlighting key terms or categories

## Technical Depth

### Balancing Accessibility and Expertise
- Start with the "why" before diving into the "how"
- Define technical terms on first use
- Provide context for advanced concepts
- Include both beginner-friendly explanations and expert insights

### Code Philosophy
- Show working, practical examples
- Prefer clarity over cleverness
- Include error handling and edge cases
- Demonstrate progression from simple to complex

## Frontmatter Requirements

```yaml
---
title: "Clear, Benefit-Driven Title with Optional Colon Usage"
date: "YYYY-MM-DD"
excerpt: "One to two sentences that clearly explain what the reader will learn and why it matters. Focus on the value proposition."
tags: ["Primary Category", "Secondary Topic", "Technology", "Use Case"]
author: "Brandon"
featured: true  # Only for pillar content
---
```

### Title Conventions
- 50-70 characters ideal
- Use power words (Master, Build, Transform, Discover)
- Include the key technology or concept
- Make the benefit clear

### Tag Usage
- 3-5 tags per post
- First tag should be the primary category
- Include both broad (AI Engineering) and specific (MCP Servers) tags
- Maintain consistency with existing tag taxonomy

## Writing Process

### Research and Preparation
1. Define the specific problem being solved
2. Identify the target reader's skill level
3. Gather real-world examples and use cases
4. Outline the key learning objectives

### Drafting Guidelines
1. Write the hook first - make it compelling
2. Use the "tell them what you'll tell them" approach
3. Include at least 2-3 practical examples
4. Add code samples that readers can actually use
5. End with actionable next steps

### Quality Checklist
- [ ] Does the opening hook grab attention?
- [ ] Is the problem clearly defined?
- [ ] Are complex concepts explained simply?
- [ ] Do code examples work and add value?
- [ ] Are there clear takeaways and next steps?
- [ ] Is the tone conversational yet authoritative?
- [ ] Have you included personal insights or experiences?

## Common Patterns to Follow

### The "Real Problem" Pattern
Start by acknowledging what people think the problem is, then reveal the actual underlying issue.

Example: "Everyone thinks AI implementation fails because of the technology. But after working with dozens of companies, I've learned the real problem is..."

### The "Evolution" Pattern
Show how approaches have evolved, positioning your solution as the natural next step.

Example: "First, we tried X. Then Y made things better. But now, with Z, we can finally..."

### The "Framework Introduction" Pattern
Present complex systems as organized, memorable frameworks.

Example: "The 12-Factor Agent", "The Four Pillars of AI Value", "The Three-Layer Architecture"

### The "Behind the Scenes" Pattern
Share insider knowledge or personal experiences that readers can't get elsewhere.

Example: "In my experience building AI systems for enterprise clients, I've noticed a pattern..."

## Style Don'ts

- Don't use excessive jargon without explanation
- Don't make assumptions about reader's background
- Don't be overly academic or formal
- Don't forget to include practical applications
- Don't use generic examples - make them specific and memorable
- Don't write walls of text - break up content with headers, lists, and code blocks

## Ideal Post Characteristics

### Length
- **Short posts**: 1,200-2,000 words (quick tutorials, single concepts)
- **Standard posts**: 2,500-4,000 words (comprehensive guides)
- **Pillar content**: 4,000-6,000 words (definitive resources)

### Engagement Elements
- 2-4 code examples per post
- 1-2 diagrams or visualizations for complex concepts
- 3-5 section headers for easy scanning
- 1-2 callout boxes for key insights
- Real-world examples or case studies

### SEO Optimization
- Include the primary keyword in the first 100 words
- Use semantic variations throughout
- Create descriptive alt text for images
- Include internal links to related posts
- Add external links to authoritative sources

## Example Opening Styles

### The Problem Opening
"Picture this: You walk into a home improvement store and buy the most advanced power tools money can buy. Top of the line. All the bells and whistles. You get home, spread them out on your garage floor, and... now what?"

### The Confession Opening
"Personal confession time: My first agent was a DevOps automation bot. 'Here's my Makefile,' I told it. 'Go build the project.' Two hours later, after adding increasingly specific instructions to the prompt, I had essentially written a bash script in English."

### The Industry Insight Opening
"After talking to 100+ founders, builders, and engineers about their agent development experiences, I noticed something striking: most production agents aren't that agentic at all."

### The Contrarian Opening
"Everyone thinks building AI agents is about choosing the right framework. They're wrong. After building dozens of production systems, I've learned that the best agents use barely any framework magic at all."

## Publishing Process

### Directory Structure
Blog posts are organized by publication status and locale:
```
content/blog/
├── published/           # Published English posts (live on site)
├── en/
│   ├── published/      # Published English posts (locale-specific)
│   └── todo/          # Draft/unpublished English posts
└── pt-BR/
    └── published/      # Published Portuguese posts
```

### Publishing a Post
**Important: Post visibility is controlled entirely by directory structure, NOT by frontmatter fields.**

To publish a post:
1. Move the `.mdx` file from any `/todo/` directory to `/content/blog/published/`
2. Ensure the post has required frontmatter: `title`, `date`, and `excerpt`
3. There's no `status`, `published`, or `draft` field needed

To unpublish a post:
1. Move it to `/content/blog/en/todo/` or any other `/todo/` directory
2. The post will immediately stop appearing on the site

### Key Points
- **No status fields**: The system doesn't use `published`, `status`, or `draft` fields
- **No date filtering**: Future-dated posts will still show if in the published directory
- **Immediate effect**: Moving files between directories takes effect immediately
- **English posts**: Should go in `/content/blog/published/` (not in a locale subdirectory)
- **Portuguese posts**: Should go in `/content/blog/published/pt-BR/`

## Content Dating & Sequential Organization

### Publication Date Management
When setting publication dates for blog posts, follow these guidelines to maintain a logical content flow:

#### Date Range Considerations
- **Recent Content**: Keep all blog posts within a reasonable recent timeframe (typically last 2-3 months)
- **Consistent Spacing**: Space posts 3-7 days apart for regular cadence
- **Sequential Awareness**: Maintain proper spacing between related posts (see below)

#### Sequential Content Rules
Many blog posts are part of series or have logical progressions. When dating these posts:

1. **Explicit Series** (e.g., 12-Factor Agents)
   - Space 4-7 days between parts
   - Maintain chronological order of publication
   - Example: Part 1 → (4 days) → Part 2

2. **Thematic Progressions** (e.g., AI for Business)
   - General/introductory posts come first
   - Advanced/specialized posts follow
   - Example: "AI for Everyday Person" → "AI for SMB" → "AI Integration Guide"

3. **Technical Dependencies**
   - Foundation posts before implementation posts
   - Theory before practice
   - Example: "Why Memory Matters" → "Building Memory Systems"

#### Common Sequential Relationships

**Memory Systems Series**:
- Business perspective post → Technical implementation post

**12-Factor Agents Series**:
- Foundation methodology → Architecture patterns

**MCP (Model Context Protocol) Series**:
- Introduction/Guide → Use Cases → Implementation → Advanced Applications

**AI Business Progression**:
- Everyday/General → Small-Medium Business → Enterprise/Advanced

#### Translation Synchronization
- Portuguese translations must have the same date as their English counterparts
- This maintains consistency across languages
- Update both versions when adjusting dates

### Example Dating Pattern
For a 2-month publication window (e.g., May 8 - July 7):

```
Week 1-2: Foundation posts (AI basics, why it matters)
Week 3-4: Core skills (prompt engineering, memory concepts)
Week 5-6: Technical implementation (Python agents, architecture)
Week 7-8: Advanced topics (MCP series, production systems)
```

### Identifying Sequential Content
When creating or dating blog posts, look for these indicators of sequential relationships:

**Explicit Indicators**:
- Numbered parts (Part 1, Part 2)
- Direct references ("As we discussed in...")
- Continuation phrases ("Building on our previous post...")
- Series titles containing colons or progression words

**Implicit Indicators**:
- Shared technical concepts requiring prior knowledge
- Business → Technical perspectives on same topic
- General → Specific implementations
- Theory → Practice applications

**Title Patterns Suggesting Sequences**:
- "Introduction to X" → "Advanced X Techniques"
- "Why X Matters" → "How to Implement X"
- "X for Beginners" → "X for Professionals"
- Base technology → Specific use case

### Maintaining the Schedule
When adding new posts or adjusting dates:
1. Check for related/sequential content
2. Ensure proper spacing (3-7 days)
3. Update both English and Portuguese versions
4. Verify chronological logic (foundations → advanced)
5. Run a date check: `grep "^date:" content/blog/published/*.mdx | sort -k2`

## Final Notes

Remember: The goal is to educate and inspire while maintaining authenticity. Brandon's blog succeeds because it combines deep technical knowledge with accessible explanations and real-world practicality. Every post should leave readers feeling both smarter and more capable of taking action.

When in doubt, optimize for clarity and usefulness over cleverness or complexity. The best posts are those that readers bookmark and share because they solve real problems.