# MCP Workflow System | Customer Support

# Documentation

## Overview

This document provides a comprehensive guide to the MCP-based workflow system that transforms your original monolithic Rust AI workflow into a distributed, protocol-based architecture using the Model Context Protocol (MCP).

## Architecture Summary

**Original System**: Monolithic Rust workflow with embedded business logic nodes
**New System**: Distributed MCP-based system with:

- **MCP Server**: Hosts individual workflow nodes as standardized tools
- **MCP Client**: Orchestrates workflow execution through protocol calls
- **MCP Protocol**: JSON-RPC communication bridge between client and server

---

## MCP Server - Tools & Resources

### Core Tool Registry

The MCP Server exposes your original workflow nodes as standardized tools:

### 1. **analyze_ticket**

- **Purpose**: Analyzes customer support tickets for sentiment, urgency, and categorization
- **Input Schema**:
    
    ```json
    {  "type": "object",  "properties": {    "id": {"type": "string"},    "content": {"type": "string"},    "customer_id": {"type": "string"},    "priority": {"type": "string", "enum": ["low", "medium", "high"]},    "category": {"type": "string"}  },  "required": ["id", "content", "customer_id"]}
    
    ```
    
- **Output**: `AnalysisResult`
    
    ```json
    {  "sentiment": "negative|neutral|positive",  "urgency": "low|medium|high",  "category": "string",  "confidence": 0.0-1.0}
    
    ```
    
- **Business Logic**: Keyword analysis, sentiment detection, urgency classification

### 2. **determine_intent**

- **Purpose**: Extracts customer intent from ticket content
- **Input Schema**:
    
    ```json
    {  "type": "object",  "properties": {    "content": {"type": "string"}  },  "required": ["content"]}
    
    ```
    
- **Output**: `IntentResult`
    
    ```json
    {  "intent": "refund_request|cancellation|support_request|general_inquiry",  "confidence": 0.0-1.0,  "entities": ["array", "of", "extracted", "entities"]}
    
    ```
    
- **Business Logic**: Intent classification, entity extraction

### 3. **filter_spam**

- **Purpose**: Detects spam and fraudulent tickets
- **Input Schema**:
    
    ```json
    {  "type": "object",  "properties": {    "content": {"type": "string"},    "customer_id": {"type": "string"}  },  "required": ["content", "customer_id"]}
    
    ```
    
- **Output**: `SpamResult`
    
    ```json
    {  "is_spam": true|false,  "confidence": 0.0-1.0,  "reason": "optional explanation"}
    
    ```
    
- **Business Logic**: Keyword filtering, pattern matching, customer validation

### 4. **validate_ticket**

- **Purpose**: Validates ticket data structure and completeness
- **Input Schema**:
    
    ```json
    {  "type": "object",  "properties": {    "id": {"type": "string"},    "content": {"type": "string"},    "customer_id": {"type": "string"}  },  "required": ["id", "content", "customer_id"]}
    
    ```
    
- **Output**: `ValidationResult`
    
    ```json
    {  "is_valid": true|false,  "issues": ["array", "of", "validation", "errors"]}
    
    ```
    
- **Business Logic**: Data validation, completeness checks, format verification

### 5. **generate_response**

- **Purpose**: Creates appropriate customer responses based on analysis
- **Input Schema**:
    
    ```json
    {  "type": "object",  "properties": {    "ticket": {"type": "object"},    "analysis": {"type": "object"},    "intent": {"type": "object"}  },  "required": ["ticket", "analysis"]}
    
    ```
    
- **Output**: `ResponseData`
    
    ```json
    {  "content": "Generated response text",  "tone": "empathetic|professional|urgent",  "suggested_actions": ["follow_up", "escalate", "close"]}
    
    ```
    
- **Business Logic**: Response generation, tone matching, action recommendations

### 6. **send_reply**

- **Purpose**: Delivers responses to customers through appropriate channels
- **Input Schema**:
    
    ```json
    {  "type": "object",  "properties": {    "customer_id": {"type": "string"},    "response": {"type": "object"},    "channel": {"type": "string", "enum": ["email", "chat", "phone"]}  },  "required": ["customer_id", "response"]}
    
    ```
    
- **Output**: `DeliveryResult`
    
    ```json
    {  "sent": true|false,  "timestamp": "ISO 8601 timestamp",  "delivery_id": "unique delivery identifier"}
    
    ```
    
- **Business Logic**: Channel routing, delivery confirmation, logging

### Server Infrastructure

### MCP Protocol Implementation

- **Protocol Version**: 2024-11-05
- **Transport**: WebSocket (JSON-RPC 2.0)
- **Port**: 127.0.0.1:8080 (configurable)
- **Capabilities**: Tools execution

### Error Handling

- **Validation Errors**: -32602 (Invalid params)
- **Tool Not Found**: -32601 (Method not found)
- **Execution Errors**: -32603 (Internal error)
- **Connection Errors**: Transport-level error handling

### Performance Characteristics

- **Concurrent Tool Execution**: Supported via async/await
- **Memory Usage**: Stateless per request
- **Scalability**: Horizontal scaling via load balancer

---

## MCP Client - Workflow Orchestrator

### Core Components

### WorkflowConfig

Defines the structure and flow of your workflow:

```rust
pub struct WorkflowConfig {
    pub name: String,
    pub description: String,
    pub nodes: Vec<NodeDefinition>,
}

```

### NodeDefinition

Represents individual workflow steps:

```rust
pub struct NodeDefinition {
    pub id: String,
    pub tool_name: String,        // Maps to MCP server tool
    pub description: String,
    pub connections: Vec<String>, // Next nodes to execute
    pub parallel_nodes: Vec<String>, // Nodes to run in parallel
    pub is_router: bool,         // Whether this node makes routing decisions
}

```

### WorkflowContext

Manages execution state and data flow:

```rust
pub struct WorkflowContext {
    pub ticket_id: String,
    pub data: HashMap<String, Value>, // Results from each node
    pub completed_nodes: Vec<String>,
    pub current_node: Option<String>,
}

```

### Predefined Workflows

### 1. Customer Care Workflow

- **Nodes**: analyze_ticket → [determine_intent, filter_spam, validate_ticket] → ticket_router → generate_response → send_reply
- **Use Case**: Complete customer support ticket processing
- **Features**: Parallel analysis, sentiment-based routing, automated response generation

### 2. Spam Filter Workflow

- **Nodes**: validate_input → filter_spam → spam_router → generate_response
- **Use Case**: Quick spam detection and handling
- **Features**: Fast filtering, automatic spam rejection

### 3. Priority Routing Workflow

- **Nodes**: analyze_priority → [determine_intent] → priority_router → generate_response → send_reply
- **Use Case**: Priority-based ticket routing
- **Features**: Urgency detection, priority-based response timing

### Client Capabilities

### Workflow Management

- `execute_workflow()` - Main workflow execution
- `execute_workflow_with_monitoring()` - Execution with real-time callbacks
- `validate_workflow_config()` - Pre-execution validation
- `generate_execution_plan()` - Execution roadmap generation

### Tool Discovery

- `list_available_tools()` - Query server capabilities
- `validate_workflow_config()` - Ensure tool availability

### Configuration Management

- `save_workflow_config()` - Persist workflows to files
- `load_workflow_config()` - Load saved workflows
- `get_workflow_templates()` - Access predefined workflows

### Monitoring & Reporting

- `get_execution_metrics()` - Performance analytics
- `create_status_report()` - Human-readable execution reports

---

## Big Picture Walkthrough

### Step 1: Starting the MCP Server (Your Tools)

The server hosts your workflow nodes as MCP tools:

```rust
// Server Machine/Process
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let server = McpServer::new();

    // Automatically registers workflow nodes as tools:
    // - analyze_ticket, determine_intent, filter_spam
    // - validate_ticket, generate_response, send_reply

    server.start_server("127.0.0.1:8080").await?;
    println!("🔧 MCP Server ready - tools available for workflow execution");
}

```

### Step 2: Client Connects and Discovers Tools

The workflow orchestrator establishes connection:

```rust
// Client Machine/Process (can be same or different machine)
let mut client = McpWorkflowClient::new("ws://127.0.0.1:8080".to_string());

// Establish WebSocket connection
client.connect().await?;

// Discover available tools
let available_tools = client.list_available_tools().await?;
println!("🔧 Available tools: {:?}", available_tools);
// Output: ["analyze_ticket", "determine_intent", "filter_spam",
//          "validate_ticket", "generate_response", "send_reply"]

```

### Step 3: Define Workflow Configuration

Client defines tool orchestration (replaces your WorkflowBuilder):

```rust
// CLIENT SIDE: Workflow definition
let workflow_config = WorkflowConfig {
    name: "customer_care".to_string(),
    nodes: vec![
        NodeDefinition {
            id: "analyze_ticket".to_string(),
            tool_name: "analyze_ticket".to_string(), // Maps to server tool
            connections: vec!["ticket_router".to_string()],
            parallel_nodes: vec![
                "determine_intent".to_string(),  // Run simultaneously
                "filter_spam".to_string(),
                "validate_ticket".to_string(),
            ],
            is_router: false,
        },
        NodeDefinition {
            id: "ticket_router".to_string(),
            tool_name: "ticket_router".to_string(),
            connections: vec!["generate_response".to_string()],
            is_router: true, // Makes routing decisions
        },
        // ... additional nodes
    ],
};

```

### Step 4: Execute Workflow - The Dance Begins

Customer support ticket triggers workflow:

```rust
// INPUT: Customer ticket (from API, web form, email, etc.)
let customer_ticket = json!({
    "id": "TICKET-001",
    "content": "I'm really frustrated! My order arrived damaged and I need this fixed immediately!",
    "customer_id": "CUST-12345",
    "priority": "high"
});

// CLIENT: Start workflow execution
println!("🚀 Starting workflow execution...");
let result = client.execute_workflow(workflow_config, customer_ticket).await?;

```

### Step 4a: First Tool Execution - Analyze Ticket

```rust
// CLIENT SIDE: Orchestration logic
async fn execute_node_chain() {
    // CLIENT: "Execute 'analyze_ticket' node"
    let arguments = json!({
        "id": "TICKET-001",
        "content": "I'm really frustrated! My order arrived damaged...",
        "customer_id": "CUST-12345",
        "priority": "high"
    });

    // CLIENT → SERVER: Tool call over WebSocket
    let analysis_result = self.call_tool("analyze_ticket", arguments).await?;
    println!("📊 CLIENT: Received analysis result from server");
}

```

```rust
// SERVER SIDE: Tool execution
async fn handle_tool_call(&self, tool_name: &str, arguments: &Value) -> McpResponse {
    match tool_name {
        "analyze_ticket" => {
            println!("🔍 SERVER: Executing analyze_ticket tool");
            let ticket: TicketData = serde_json::from_value(arguments.clone())?;

            // Your original AnalyzeTicketNode business logic
            let sentiment = if ticket.content.contains("frustrated") {
                "negative"
            } else if ticket.content.contains("thank") {
                "positive"
            } else {
                "neutral"
            };

            let urgency = if ticket.content.contains("immediately") {
                "high"
            } else {
                "medium"
            };

            // SERVER → CLIENT: Return result
            Ok(AnalysisResult {
                sentiment: sentiment.to_string(),
                urgency: urgency.to_string(),
                category: "order_issue".to_string(),
                confidence: 0.95,
            })
        }
    }
}

```

### Step 4b: Parallel Tool Execution

```rust
// CLIENT SIDE: Execute parallel nodes simultaneously
let analysis_result = {
    "sentiment": "negative",
    "urgency": "high",
    "category": "order_issue",
    "confidence": 0.95
};

// Store result for later use
context.data.insert("analyze_ticket_result", analysis_result);

// CLIENT: Launch 3 parallel tool calls to server
println!("🔀 CLIENT: Executing parallel analysis tools");

// Simultaneous execution:
let (intent_result, spam_result, validation_result) = tokio::join!(
    // Call 1: CLIENT → SERVER
    self.call_tool("determine_intent", json!({
        "content": "I'm really frustrated! My order arrived damaged..."
    })),

    // Call 2: CLIENT → SERVER
    self.call_tool("filter_spam", json!({
        "content": "I'm really frustrated! My order arrived damaged...",
        "customer_id": "CUST-12345"
    })),

    // Call 3: CLIENT → SERVER
    self.call_tool("validate_ticket", json!({
        "id": "TICKET-001",
        "content": "I'm really frustrated! My order arrived damaged...",
        "customer_id": "CUST-12345"
    }))
);

println!("✅ CLIENT: All parallel tools completed");

```

### Step 4c: Router Logic (Client-Side Decision Making)

```rust
// CLIENT SIDE: Intelligent routing based on analysis
async fn determine_route(&self, node: &NodeDefinition, context: &WorkflowContext) {
    if node.tool_name == "ticket_router" {
        let analysis = context.data.get("analyze_ticket_result").unwrap();
        let urgency = analysis.get("urgency").unwrap().as_str().unwrap();

        match urgency {
            "high" => {
                println!("🚨 CLIENT: High priority detected - express routing");
                return Ok(Some("generate_response".to_string()));
            }
            "low" => {
                println!("📋 CLIENT: Low priority - standard routing");
                return Ok(Some("auto_response".to_string()));
            }
            _ => {
                println!("⚖️ CLIENT: Medium priority - normal flow");
                return Ok(Some("generate_response".to_string()));
            }
        }
    }
}

```

### Step 4d: Response Generation

```rust
// CLIENT: Prepare comprehensive context for response generation
let response_args = json!({
    "ticket": {
        "id": "TICKET-001",
        "content": "I'm really frustrated! My order arrived damaged...",
        "customer_id": "CUST-12345"
    },
    "analysis": {
        "sentiment": "negative",
        "urgency": "high",
        "category": "order_issue"
    },
    "intent": {
        "intent": "complaint_damaged_product",
        "confidence": 0.92
    }
});

// CLIENT → SERVER: Generate empathetic response
println!("💬 CLIENT: Requesting response generation for upset customer");
let response = self.call_tool("generate_response", response_args).await?;

```

```rust
// SERVER SIDE: Smart response generation
async fn execute_generate_response(&self, args: &Value) -> Result<ResponseData, String> {
    println!("🎯 SERVER: Generating customer response");

    let analysis = args.get("analysis").unwrap();
    let sentiment = analysis.get("sentiment").unwrap().as_str().unwrap();
    let urgency = analysis.get("urgency").unwrap().as_str().unwrap();

    // Your original GenerateResponseNode logic
    let content = match (sentiment, urgency) {
        ("negative", "high") => {
            "I sincerely apologize for the damaged order and understand your frustration. \
             I'm escalating this to our priority team and we'll resolve this within 24 hours \
             with either a replacement or full refund plus compensation."
        },
        ("positive", _) => {
            "Thank you for your feedback! I'm glad we could help."
        },
        _ => {
            "Thank you for contacting us. I'll be happy to assist you."
        }
    };

    Ok(ResponseData {
        content: content.to_string(),
        tone: "empathetic_urgent".to_string(),
        suggested_actions: vec!["priority_escalation".to_string(), "follow_up_24h".to_string()],
    })
}

```

### Step 4e: Final Delivery

```rust
// CLIENT: Send the crafted response
let send_args = json!({
    "customer_id": "CUST-12345",
    "response": {
        "content": "I sincerely apologize for the damaged order...",
        "tone": "empathetic_urgent"
    },
    "channel": "email"
});

// CLIENT → SERVER: Deliver response
println!("📧 CLIENT: Sending response to customer");
let delivery_result = self.call_tool("send_reply", send_args).await?;

```

```rust
// SERVER SIDE: Multi-channel delivery
async fn execute_send_reply(&self, args: &Value) -> Result<Value, String> {
    println!("🚀 SERVER: Delivering customer response");

    let customer_id = args.get("customer_id").unwrap().as_str().unwrap();
    let response = args.get("response").unwrap();

    // Your original SendReplyNode logic
    // Integration points:
    // - Email service API (SendGrid, AWS SES)
    // - SMS gateway (Twilio)
    // - Chat system webhook (Slack, Teams)
    // - CRM system updates

    println!("📧 SERVER: Email sent to customer {}", customer_id);

    Ok(json!({
        "sent": true,
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "delivery_id": "EMAIL-12345-67890",
        "channel": "email"
    }))
}

```

### Step 5: Final Results & Reporting

```rust
// CLIENT SIDE: Workflow completion
let final_result = WorkflowResult {
    success: true,
    execution_path: vec![
        "analyze_ticket".to_string(),
        "determine_intent".to_string(),    // parallel
        "filter_spam".to_string(),         // parallel
        "validate_ticket".to_string(),     // parallel
        "ticket_router".to_string(),
        "generate_response".to_string(),
        "send_reply".to_string()
    ],
    final_data: {
        "analyze_ticket_result": { "sentiment": "negative", "urgency": "high" },
        "determine_intent_result": { "intent": "complaint_damaged_product" },
        "filter_spam_result": { "is_spam": false },
        "validate_ticket_result": { "is_valid": true },
        "generate_response_result": { "content": "I sincerely apologize..." },
        "send_reply_result": { "sent": true, "delivery_id": "EMAIL-12345-67890" }
    },
    errors: vec![]
};

// Generate comprehensive report
let report = client.create_status_report(&final_result);
println!("📊 WORKFLOW COMPLETED:\n{}", report);

/*
Output:
Workflow Execution Report
========================
Status: SUCCESS
Total Nodes: 7
Successful: 7
Failed: 0
Execution Path: ["analyze_ticket", "determine_intent", "filter_spam",
                "validate_ticket", "ticket_router", "generate_response", "send_reply"]

No errors occurred.
*/

```

---

## Responsibility Separation

### CLIENT (Workflow Orchestrator) Handles:

- ✅ **Workflow Definition**: Node connections, parallel execution, routing logic
- ✅ **Execution Orchestration**: Order management, dependency resolution
- ✅ **Context Management**: Data flow between tools, result aggregation
- ✅ **Error Handling**: Retry logic, fallback strategies, workflow recovery
- ✅ **Monitoring**: Progress tracking, performance metrics, reporting

### SERVER (Tool Provider) Handles:

- ✅ **Business Logic Execution**: Core algorithm implementation
- ✅ **Data Processing**: Input validation, transformation, output formatting
- ✅ **External Integrations**: Database connections, API calls, service integrations
- ✅ **Tool-Specific Errors**: Input validation, processing failures
- ✅ **Resource Management**: Memory, computation, I/O operations

### API Integration Points:

1. **Client → Server**: Every workflow node execution (WebSocket/JSON-RPC)
2. **Server → External APIs**: Tool-specific integrations (REST/GraphQL/gRPC)
    - Email services (SendGrid, AWS SES)
    - ML/AI services (OpenAI, Anthropic)
    - Databases (PostgreSQL, Redis)
    - CRM systems (Salesforce, HubSpot)
    - Monitoring (DataDog, Prometheus)

---

## Benefits of MCP Architecture

### Development Benefits

- **Language Flexibility**: Tools can be implemented in optimal languages
- **Team Independence**: Different teams can own different tools
- **Rapid Prototyping**: Easy A/B testing of tool implementations
- **Version Management**: Independent tool versioning and deployment

### Operational Benefits

- **Horizontal Scaling**: Distribute tools across multiple servers
- **Fault Isolation**: Tool failures don't crash entire workflow
- **Resource Optimization**: Scale individual tools based on usage
- **Monitoring Granularity**: Per-tool metrics and observability

### Business Benefits

- **Tool Reusability**: Same tools across multiple workflows
- **Standardized Interface**: Easy integration with AI systems
- **Vendor Independence**: Mix and match tool providers
- **Future-Proofing**: Standard protocol for long-term compatibility

---