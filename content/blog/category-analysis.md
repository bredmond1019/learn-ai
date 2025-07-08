# Blog Post Category Analysis - English vs Portuguese

## Category Distribution Comparison

### English (24 posts total)
- 🤖 **Agent Architecture & Memory**: 3 posts (12.5%)
- 🔌 **Model Context Protocol (MCP)**: 3 posts (12.5%)
- 💼 **Business Strategy & ROI**: 8 posts (33.3%)
- 📚 **AI Engineering Fundamentals**: 4 posts (16.7%)
- 🚀 **Production & MLOps**: 3 posts (12.5%)
- 🌍 **Ethics, UX & Society**: 3 posts (12.5%)

### Portuguese (19 posts total)
- 🤖 **Agent Architecture & Memory**: 2 posts (10.5%)
- 🔌 **Model Context Protocol (MCP)**: 5 posts (26.3%)
- 💼 **Business Strategy & ROI**: 1 post (5.3%) ⚠️
- 📚 **AI Engineering Fundamentals**: 10 posts (52.6%) ⚠️
- 🚀 **Production & MLOps**: 1 post (5.3%)
- 🌍 **Ethics, UX & Society**: 0 posts (0.0%) ⚠️

## Missing Portuguese Translations (5 posts)

1. **12-factor-agents-building-reliable-llm-applications.mdx**
   - Category: Agent Architecture & Memory
   - Title: "The 12-Factor Agent: Building Reliable LLM Applications Without the Magic"

2. **agent-architecture-patterns-production-guide.mdx**
   - Category: Agent Architecture & Memory
   - Title: "Agent Architecture Patterns: A Production Guide for System Architects"

3. **ai-integration-business-guide.mdx**
   - Category: Business Strategy & ROI
   - Title: "AI Integration Gone Wrong: A Business Leader's Guide to Avoiding the New Clippy"

4. **ai-ux-dark-patterns-evolution-backwards.mdx**
   - Category: Ethics, UX & Society
   - Title: "The AI UX Crisis: How Tech Giants Are Breaking Software Design Principles"

5. **why-your-ai-assistant-needs-memory.mdx**
   - Category: Business Strategy & ROI
   - Title: "Why Your AI Assistant Needs Memory: A Business Guide"

## Posts Categorized Differently (10 posts)

These posts are categorized differently between English and Portuguese due to keyword translation issues:

1. **ai-ethics-in-practice.mdx**
   - EN: Ethics, UX & Society → PT: AI Engineering Fundamentals

2. **ai-for-everyday-person.mdx**
   - EN: Ethics, UX & Society → PT: AI Engineering Fundamentals

3. **ai-for-small-medium-business.mdx**
   - EN: Business Strategy & ROI → PT: AI Engineering Fundamentals

4. **building-ai-agents-pure-python.mdx**
   - EN: AI Engineering Fundamentals → PT: Agent Architecture & Memory

5. **claude-code-transforming-software-development.mdx**
   - EN: Business Strategy & ROI → PT: AI Engineering Fundamentals

6. **knowledge-graph-builder-documentation.mdx**
   - EN: Production & MLOps → PT: AI Engineering Fundamentals

7. **mcp-customer-support-triage-architecture.mdx**
   - EN: Business Strategy & ROI → PT: Model Context Protocol (MCP)

8. **mcp-python-development-guide.mdx**
   - EN: Business Strategy & ROI → PT: Model Context Protocol (MCP)

9. **vector-databases-for-ai-engineers.mdx**
   - EN: Production & MLOps → PT: AI Engineering Fundamentals

10. **why-ai-engineers-matter.mdx**
    - EN: Business Strategy & ROI → PT: AI Engineering Fundamentals

## Root Cause

The categorization algorithm uses English keywords only:
- "business", "roi", "strategy", "executive", "enterprise" → Not matched in Portuguese
- "ethics", "ux", "everyday" → Not matched in Portuguese
- Default category when no matches: AI Engineering Fundamentals

This explains why Portuguese has 10 posts in AI Engineering Fundamentals (52.6%) vs only 4 in English (16.7%).