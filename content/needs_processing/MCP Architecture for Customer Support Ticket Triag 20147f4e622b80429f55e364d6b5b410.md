# MCP Architecture for Customer Support Ticket Triage

## Overview

This document explains how to use Model Context Protocol (MCP) Server and Client architecture to build an automated customer support ticket triage system.

---

## Problem Statement

We need an agentic AI system that can:

- **Triage** customer support tickets to appropriate queues
- **Escalate** urgent issues automatically
- **Trigger Slack communications** to relevant teams
- **Create bug cards** in Shortcut for development issues
- **Assign tickets** to appropriate squads
- **Send notifications** to squad-specific Slack channels

---

## MCP Architecture Overview

### Host Application (MCP Client)

**Support Triage Agent** - Main microservice that:

- Receives incoming support tickets (via webhook, polling, or event stream)
- Uses the MCP client library to communicate with multiple MCP servers
- Contains the core business logic for ticket processing
- Makes final decisions on actions to take

### MCP Servers (Multiple Specialized Servers)

### 1. Support System MCP Server

- **Tools**: Create tickets, update status, assign to queues, set priority
- **Resources**: Existing ticket data, queue information, historical patterns
- **Capabilities**: Full CRUD operations on support tickets

### 2. Slack MCP Server

- **Tools**: Send messages, create channels, post to specific channels
- **Resources**: Channel lists, user directory, team mappings
- **Capabilities**: All Slack API operations

### 3. Shortcut MCP Server

- **Tools**: Create stories/bugs, assign to teams, set priorities, add labels
- **Resources**: Project data, team assignments, current sprint information
- **Capabilities**: Full Shortcut project management operations

### 4. Knowledge Base MCP Server

- **Tools**: Search documentation, create/update articles
- **Resources**: FAQ database, troubleshooting guides, escalation procedures
- **Capabilities**: Content management and search

---

## Detailed Workflow Analysis

### Phase 1: Initial Ticket Assessment

**Input**: New support ticket arrives with customer message, contact info, product area, etc.

**MCP Flow**:

1. **Capability Discovery**: Client queries all registered MCP servers for their capabilities
2. **Resource Gathering**:
    - Query Support System server for similar historical tickets
    - Query Knowledge Base server for relevant documentation
    - Query Shortcut server for existing related bugs/issues

**LLM Decision Point**:

- "Given this ticket content and historical data, what type of issue is this?"
- "Does this match any known bugs or documentation?"
- "What's the appropriate severity level?"

### Phase 2: Classification and Routing

**Resource Analysis**: LLM analyzes gathered data to determine:

- **Issue Category**: Bug, Feature Request, General Support, Account Issue
- **Urgency Level**: Critical, High, Medium, Low
- **Technical Area**: Frontend, Backend, API, Database, Infrastructure
- **Squad Assignment**: Based on technical area and current workload

> Key Point: The LLM doesn't make final decisions - it provides recommendations that the client code evaluates against business rules.
> 

### Phase 3: Action Execution

**Tool Invocation Sequence**:

### For Bug Issues:

1. **Shortcut Server**: Create bug card with appropriate labels, description, and initial assignment
2. **Slack Server**: Post message to squad's channel with bug details and Shortcut link
3. **Support System Server**: Update original ticket status and link to Shortcut card

### For Urgent Issues:

1. **Support System Server**: Set high priority flag and assign to escalation queue
2. **Slack Server**: Send immediate notification to on-call channel
3. **Knowledge Base Server**: Log escalation for pattern analysis

### For Standard Issues:

1. **Support System Server**: Route to appropriate queue based on category
2. **Slack Server**: Optional notification to relevant team channel

---

## Key Architectural Decisions

### 1. Multiple Specialized Servers

**Decision**: Use separate MCP servers for each external system (Slack, Shortcut, Support System)

**Rationale**:

- **Separation of Concerns**: Each server handles one integration
- **Independent Development**: Teams can update Slack integration without affecting Shortcut
- **Reusability**: Other applications can use the same Slack MCP server
- **Security**: Different authentication/authorization per system
- **Scalability**: Can deploy servers independently based on load

### 2. Synchronous vs. Asynchronous Processing

**Decision**: Hybrid approach with immediate classification, asynchronous action execution

**Architecture**:

- **Immediate**: Ticket classification and urgency assessment
- **Asynchronous**: Bug card creation, Slack notifications (using MCP's notification capabilities)
- **Batch Processing**: Pattern analysis and knowledge base updates

### 3. LLM Decision Boundaries

**Critical Decision**: What the LLM decides vs. what business logic decides

### LLM Responsibilities:

- Content analysis and categorization
- Similarity matching with historical data
- Technical area identification
- Urgency assessment based on customer language

### Business Logic Responsibilities:

- Final routing decisions based on current queue loads
- Escalation thresholds and procedures
- Squad assignment algorithms
- Compliance and audit trail requirements

### 4. Error Handling and Fallbacks

**Decision**: Cascading fallback system with human intervention points

**Architecture**:

- **Level 1**: If LLM can't classify, route to general support queue
- **Level 2**: If external system is down, queue actions for retry
- **Level 3**: If critical systems fail, alert human operators immediately

### 5. Data Flow and State Management

**Decision**: Event-driven architecture with state tracking

**Implementation**:

- Each ticket gets a unique workflow ID
- State stored in Support System server
- MCP servers can send async notifications back to client about status changes
- Audit trail maintained across all systems

---

## Resource and Tool Design Considerations

### Resource Descriptions (Critical for LLM Decision Making)

### Support System Resources:

```
"historical_tickets": "Database of resolved tickets with categories, resolution times, and customer satisfaction scores"

"queue_status": "Current workload and average response times for each support queue"

"escalation_patterns": "Analysis of what types of issues typically require escalation"

```

### Shortcut Resources:

```
"team_workload": "Current sprint commitments and capacity for each development squad"

"bug_patterns": "Common bug types and their typical assignment patterns"

"priority_matrix": "Business rules for assigning bug priorities based on customer impact"

```

### Tool Parameter Design

Tools need rich parameter schemas that the LLM can populate:

### Create Bug Card Tool:

- `title`: String (LLM generates from ticket content)
- `description`: String (LLM formats with customer details)
- `labels`: Array (LLM selects from predefined list)
- `assignee_team`: String (LLM recommends based on technical area)
- `priority`: Enum (LLM suggests based on urgency analysis)
- `customer_impact`: String (LLM assesses from ticket content)

---

## Monitoring and Observability

**Decision**: Built-in monitoring across the MCP ecosystem

**Implementation**:

- Each MCP server reports health metrics
- Client tracks decision accuracy and processing times
- Feedback loop: Human corrections feed back into LLM training data
- Dashboard showing ticket flow through the entire system

---

## Security and Compliance Considerations

- **Authentication**: Each MCP server handles its own auth (Slack tokens, Shortcut API keys, etc.)
- **Authorization**: Client implements role-based access control for different action types
- **Audit Trail**: All tool invocations logged with justification from LLM
- **Data Privacy**: Customer data stays within appropriate systems, servers don't cache sensitive info

---

## Benefits of This Architecture

### Pluggability

- Easy to add new integrations (e.g., JIRA server, Teams server)
- Servers can be developed and deployed independently
- No need to modify core triage logic for new tools

### Discoverability

- Client automatically learns about available capabilities
- New servers can be registered without code changes
- Dynamic adaptation to available services

### Composability

- Servers can chain together (e.g., Shortcut server uses Slack server for notifications)
- Complex workflows emerge from simple server interactions
- Reusable components across different applications

---

## Implementation Notes

This architecture provides a scalable, maintainable solution that leverages MCP's pluggability while maintaining proper separation of concerns and business control over critical decisions.

The key insight is that MCP allows us to build enterprise-grade agentic AI that's both powerful and controllable, with clear boundaries between AI decision-making and business logic enforcement.