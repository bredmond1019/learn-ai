---
title: Setting Up Your First MCP Server with Python (Part 3/5)
published: true
tags: python, mcp, tutorial, ai
series: Building AI Systems
---

It's time to get our hands dirty! In this part, we'll set up our development environment and create our first MCP server. Don't worry if you've never coded before - we'll go step by step.

## What We're Building

Remember Maria's café from Part 1? We're creating a feedback collection system that:
- Stores customer feedback
- Analyzes sentiment (happy, neutral, unhappy)
- Generates summary reports
- Identifies improvement areas

## Step 1: Setting Up Your Environment

### Installing Python

First, we need Python (version 3.8 or higher):

**Windows:**
1. Visit [python.org](https://python.org)
2. Download the installer
3. **Important**: Check "Add Python to PATH"
4. Click Install

**Mac:**
```bash
# If you have Homebrew
brew install python3

# Or download from python.org
```

**Linux:**
```bash
sudo apt update
sudo apt install python3 python3-pip
```

### Creating Your Project

Open your terminal (Command Prompt on Windows) and run:

```bash
# Create a new directory
mkdir mcp-feedback-system
cd mcp-feedback-system

# Create a virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install the MCP SDK
pip install mcp
```

## Step 2: Understanding MCP Server Basics

An MCP server has three main parts:

### Resources (What data do we have?)
```python
# Like items on a menu
- "Recent feedback from customers"
- "Summary of this week's feedback"
- "List of improvement suggestions"
```

### Tools (What can we do?)
```python
# Like kitchen equipment
- "Collect new feedback"
- "Analyze sentiment"
- "Generate report"
```

### Server (How do we serve it?)
```python
# Like the restaurant itself
- Handles requests
- Manages connections
- Provides the interface
```

## Step 3: Building Our First MCP Server

Create a file called `feedback_server.py`:

```python
#!/usr/bin/env python3
"""
Customer Feedback MCP Server
A simple server for collecting and analyzing customer feedback
"""

import json
import asyncio
from datetime import datetime
from typing import Any, Dict, List

# MCP SDK imports
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp.types import Resource, Tool, TextContent

class FeedbackServer:
    def __init__(self):
        self.server = Server("customer-feedback")
        self.feedback_list = []
        self.setup_handlers()
    
    def setup_handlers(self):
        """Set up all the server handlers"""
        
        @self.server.list_resources()
        async def handle_list_resources() -> List[Resource]:
            """List available resources"""
            return [
                Resource(
                    uri="feedback://recent",
                    name="Recent Feedback",
                    description="View recent customer feedback",
                    mimeType="application/json"
                ),
                Resource(
                    uri="feedback://summary",
                    name="Feedback Summary",
                    description="Get a summary of all feedback",
                    mimeType="text/plain"
                )
            ]
        
        @self.server.read_resource()
        async def handle_read_resource(uri: str) -> str:
            """Read a specific resource"""
            if uri == "feedback://recent":
                # Return last 5 feedback entries
                recent = self.feedback_list[-5:] if self.feedback_list else []
                return json.dumps(recent, indent=2)
            
            elif uri == "feedback://summary":
                # Generate summary
                if not self.feedback_list:
                    return "No feedback collected yet."
                
                total = len(self.feedback_list)
                sentiments = {"positive": 0, "neutral": 0, "negative": 0}
                
                for feedback in self.feedback_list:
                    sentiments[feedback["sentiment"]] += 1
                
                return f"""
Feedback Summary
================
Total Feedback: {total}
Positive: {sentiments['positive']} ({sentiments['positive']/total*100:.1f}%)
Neutral: {sentiments['neutral']} ({sentiments['neutral']/total*100:.1f}%)  
Negative: {sentiments['negative']} ({sentiments['negative']/total*100:.1f}%)
"""
            
            raise ValueError(f"Unknown resource: {uri}")
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[Tool]:
            """List available tools"""
            return [
                Tool(
                    name="collect_feedback",
                    description="Collect new customer feedback",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "customer_name": {
                                "type": "string",
                                "description": "Name of the customer"
                            },
                            "feedback": {
                                "type": "string", 
                                "description": "The feedback text"
                            },
                            "rating": {
                                "type": "integer",
                                "description": "Rating from 1-5",
                                "minimum": 1,
                                "maximum": 5
                            }
                        },
                        "required": ["customer_name", "feedback", "rating"]
                    }
                ),
                Tool(
                    name="analyze_sentiment",
                    description="Analyze sentiment of feedback text",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "text": {
                                "type": "string",
                                "description": "Text to analyze"
                            }
                        },
                        "required": ["text"]
                    }
                )
            ]
        
        @self.server.call_tool()
        async def handle_call_tool(
            name: str, 
            arguments: Dict[str, Any]
        ) -> List[TextContent]:
            """Handle tool calls"""
            
            if name == "collect_feedback":
                # Analyze sentiment based on rating
                rating = arguments["rating"]
                if rating >= 4:
                    sentiment = "positive"
                elif rating == 3:
                    sentiment = "neutral"
                else:
                    sentiment = "negative"
                
                # Store feedback
                feedback_entry = {
                    "id": len(self.feedback_list) + 1,
                    "timestamp": datetime.now().isoformat(),
                    "customer_name": arguments["customer_name"],
                    "feedback": arguments["feedback"],
                    "rating": rating,
                    "sentiment": sentiment
                }
                
                self.feedback_list.append(feedback_entry)
                
                return [TextContent(
                    type="text",
                    text=f"Feedback collected successfully! ID: {feedback_entry['id']}"
                )]
            
            elif name == "analyze_sentiment":
                text = arguments["text"].lower()
                
                # Simple sentiment analysis
                positive_words = ["great", "excellent", "love", "amazing", "wonderful"]
                negative_words = ["bad", "terrible", "hate", "awful", "horrible"]
                
                positive_count = sum(1 for word in positive_words if word in text)
                negative_count = sum(1 for word in negative_words if word in text)
                
                if positive_count > negative_count:
                    sentiment = "positive"
                elif negative_count > positive_count:
                    sentiment = "negative"
                else:
                    sentiment = "neutral"
                
                return [TextContent(
                    type="text",
                    text=f"Sentiment: {sentiment}"
                )]
            
            raise ValueError(f"Unknown tool: {name}")
    
    async def run(self):
        """Run the server"""
        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="customer-feedback",
                    server_version="0.1.0",
                    capabilities=self.server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={}
                    )
                )
            )

# Main entry point
async def main():
    server = FeedbackServer()
    await server.run()

if __name__ == "__main__":
    asyncio.run(main())
```

## Step 4: Testing Your Server

Let's make sure everything works! First, make the script executable:

```bash
# On Mac/Linux:
chmod +x feedback_server.py

# On Windows, you can skip this step
```

Now test it with the MCP inspector:

```bash
# Install the MCP inspector tool
pip install mcp-inspector

# Run your server with the inspector
mcp-inspector feedback_server.py
```

You should see:
- Your server starting up
- Available resources (Recent Feedback, Feedback Summary)
- Available tools (collect_feedback, analyze_sentiment)

Try these commands in the inspector:
1. Call `collect_feedback` with some test data
2. Read the `feedback://recent` resource
3. Read the `feedback://summary` resource

## Step 5: Understanding What We Built

Let's break down the key parts:

### Resources
We created two resources that agents can read:
- `feedback://recent`: Shows the last 5 feedback entries
- `feedback://summary`: Provides statistics about all feedback

### Tools
We implemented two tools that agents can use:
- `collect_feedback`: Saves new feedback with automatic sentiment based on rating
- `analyze_sentiment`: Simple sentiment analysis based on keywords

### The Server
Our server:
- Stores feedback in memory (we'll add persistence later)
- Provides a standard MCP interface
- Can be used by any MCP-compatible AI agent

## Common Issues and Solutions

**"Python not found"**
- Make sure Python is in your PATH
- Try `python3` instead of `python`

**"Module not found"**
- Ensure your virtual environment is activated
- Reinstall: `pip install mcp`

**"Permission denied"**
- On Mac/Linux: Use `chmod +x feedback_server.py`
- On Windows: Run as administrator if needed

## What's Next?

Congratulations! You've built your first MCP server. In Part 4, we'll:
- Create an AI agent that uses our server
- Connect it to an LLM for intelligent responses
- Build automated workflows
- Add data persistence

Your server is now ready to be used by AI agents. How would you extend this to handle your specific use case? Share your ideas in the comments!

Ready for more? The complete tutorial with additional examples is available at [brandonredmond.com/learn/paths/ai-systems-intro](https://brandonredmond.com/learn/paths/ai-systems-intro).