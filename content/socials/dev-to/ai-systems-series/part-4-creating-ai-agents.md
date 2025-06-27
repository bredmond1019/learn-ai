---
title: Creating AI Agents That Use Your MCP Server (Part 4/5)
published: true
tags: ai, python, agents, llm
series: Building AI Systems
---

Now comes the magic! In Part 3, we built an MCP server that can collect and analyze feedback. Today, we'll create an AI agent that uses this server to intelligently handle customer interactions. By the end, you'll have a working AI system!

## What We're Building

We'll create an AI agent that:
- Connects to our MCP server
- Uses an LLM to understand customer needs
- Automatically collects and analyzes feedback
- Generates intelligent reports
- Suggests business improvements

## Step 1: Setting Up LLM Integration

First, let's install what we need:

```bash
# Make sure your virtual environment is activated
pip install openai python-dotenv aiohttp
```

Create a `.env` file for your API keys:

```bash
# .env file
OPENAI_API_KEY=your-api-key-here
# Get your key from: https://platform.openai.com/api-keys
```

## Step 2: Building Our AI Agent

Create `feedback_agent.py`:

```python
#!/usr/bin/env python3
"""
AI Agent for Customer Feedback System
Intelligently handles feedback collection and analysis
"""

import os
import json
import asyncio
from typing import Dict, Any, List
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# For LLM integration
from openai import AsyncOpenAI

# For MCP client
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class FeedbackAgent:
    def __init__(self):
        self.name = "Feedback Assistant"
        self.llm = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.mcp_session = None
        self.server_params = StdioServerParameters(
            command="python",
            args=["feedback_server.py"]
        )
    
    async def connect_to_server(self):
        """Connect to our MCP server"""
        print(f"🔌 Connecting to feedback server...")
        
        async with stdio_client(self.server_params) as (read, write):
            async with ClientSession(read, write) as session:
                self.mcp_session = session
                
                # Initialize connection
                await session.initialize()
                
                # Get available tools and resources
                tools = await session.list_tools()
                resources = await session.list_resources()
                
                print(f"✅ Connected! Found {len(tools)} tools and {len(resources)} resources")
                
                # Keep the session active
                await self.run_agent_loop()
    
    async def think(self, task: str) -> str:
        """Use LLM to understand and plan actions"""
        response = await self.llm.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are {self.name}, an AI assistant for a café.
                    You help collect and analyze customer feedback.
                    Be friendly, professional, and insightful."""
                },
                {
                    "role": "user",
                    "content": task
                }
            ],
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    async def collect_customer_feedback(self, conversation: str) -> Dict[str, Any]:
        """Intelligently extract feedback from conversation"""
        
        # Use LLM to extract information
        extraction_prompt = f"""
        Extract the following from this customer conversation:
        1. Customer name (if mentioned)
        2. The main feedback points
        3. Overall rating (1-5)
        4. Key topics mentioned
        
        Conversation:
        {conversation}
        
        Return as JSON format.
        """
        
        response = await self.llm.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Extract information and return valid JSON only."},
                {"role": "user", "content": extraction_prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        extracted = json.loads(response.choices[0].message.content)
        
        # Use MCP tool to collect feedback
        result = await self.mcp_session.call_tool(
            "collect_feedback",
            arguments={
                "customer_name": extracted.get("customer_name", "Anonymous"),
                "feedback": extracted.get("feedback", conversation),
                "rating": extracted.get("rating", 3)
            }
        )
        
        return {
            "status": "collected",
            "details": extracted,
            "server_response": result
        }
    
    async def analyze_feedback_trends(self) -> str:
        """Analyze all feedback and generate insights"""
        
        # Get recent feedback from MCP server
        recent_feedback = await self.mcp_session.read_resource("feedback://recent")
        summary_data = await self.mcp_session.read_resource("feedback://summary")
        
        # Use LLM to generate insights
        analysis_prompt = f"""
        Analyze this customer feedback data and provide:
        1. Key themes and patterns
        2. Areas needing immediate attention
        3. Positive aspects to maintain
        4. Specific recommendations for improvement
        
        Recent Feedback:
        {recent_feedback}
        
        Summary Statistics:
        {summary_data}
        """
        
        response = await self.llm.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a business analyst. Provide actionable insights."
                },
                {"role": "user", "content": analysis_prompt}
            ],
            temperature=0.5
        )
        
        return response.choices[0].message.content
    
    async def handle_customer_interaction(self, message: str) -> str:
        """Main interaction handler"""
        
        # Determine intent
        intent_prompt = f"""
        Classify this message intent:
        - 'give_feedback': Customer wants to share feedback
        - 'check_status': Customer asking about their previous feedback
        - 'general_question': Other questions
        
        Message: {message}
        
        Return only the intent classification.
        """
        
        intent_response = await self.llm.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Classify intent. Return only the classification."},
                {"role": "user", "content": intent_prompt}
            ],
            temperature=0.1
        )
        
        intent = intent_response.choices[0].message.content.strip().lower()
        
        if "give_feedback" in intent:
            # Collect feedback
            feedback_result = await self.collect_customer_feedback(message)
            
            # Generate friendly response
            response = await self.think(
                f"Customer gave feedback. Details: {feedback_result}. "
                "Thank them and mention any immediate actions we'll take."
            )
            
            return response
        
        elif "check_status" in intent:
            # Get feedback summary
            summary = await self.mcp_session.read_resource("feedback://summary")
            
            response = await self.think(
                f"Customer asking about feedback status. Our summary: {summary}. "
                "Provide a helpful update."
            )
            
            return response
        
        else:
            # General response
            return await self.think(f"Respond helpfully to: {message}")
    
    async def run_agent_loop(self):
        """Main agent loop for demo purposes"""
        print("\n🤖 Feedback Agent is ready!")
        print("Commands: 'analyze' for trends, 'quit' to exit, or chat naturally\n")
        
        while True:
            try:
                user_input = input("You: ").strip()
                
                if user_input.lower() == 'quit':
                    break
                
                elif user_input.lower() == 'analyze':
                    print("\n📊 Analyzing feedback trends...")
                    analysis = await self.analyze_feedback_trends()
                    print(f"\nAnalysis:\n{analysis}")
                
                else:
                    # Handle as customer interaction
                    response = await self.handle_customer_interaction(user_input)
                    print(f"\nAgent: {response}")
                
                print("\n" + "-"*50 + "\n")
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"❌ Error: {e}")

# Main entry point
async def main():
    agent = FeedbackAgent()
    await agent.connect_to_server()

if __name__ == "__main__":
    print("🚀 Starting Feedback Agent...")
    asyncio.run(main())
```

## Step 3: Creating Intelligent Workflows

Now let's add automated workflows. Create `workflow_engine.py`:

```python
#!/usr/bin/env python3
"""
Workflow Engine for Automated Feedback Processing
"""

import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any

class FeedbackWorkflow:
    def __init__(self, agent):
        self.agent = agent
        self.workflows = {
            "daily_analysis": self.daily_analysis_workflow,
            "negative_feedback_alert": self.negative_feedback_workflow,
            "weekly_report": self.weekly_report_workflow
        }
    
    async def daily_analysis_workflow(self):
        """Run daily analysis of feedback"""
        print(f"\n📅 Running daily analysis - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        
        # Get and analyze feedback
        analysis = await self.agent.analyze_feedback_trends()
        
        # Check for critical issues
        if "immediate attention" in analysis.lower():
            print("🚨 Critical issues detected!")
            # In production: send alerts, create tickets, etc.
        
        print(f"✅ Daily analysis complete")
        return analysis
    
    async def negative_feedback_workflow(self, feedback_data: Dict[str, Any]):
        """Handle negative feedback immediately"""
        print(f"\n⚠️ Negative feedback detected from {feedback_data['customer_name']}")
        
        # Generate personalized response plan
        response_plan = await self.agent.think(
            f"Create action plan for this negative feedback: {feedback_data['feedback']}. "
            "Include: immediate response, follow-up actions, and prevention measures."
        )
        
        print(f"📋 Action Plan:\n{response_plan}")
        
        # In production: 
        # - Send alert to manager
        # - Create follow-up task
        # - Track resolution
        
        return response_plan
    
    async def weekly_report_workflow(self):
        """Generate comprehensive weekly report"""
        print(f"\n📊 Generating weekly report...")
        
        # Get all data
        summary = await self.agent.mcp_session.read_resource("feedback://summary")
        recent = await self.agent.mcp_session.read_resource("feedback://recent")
        
        # Generate executive summary
        report = await self.agent.think(
            f"Create executive summary for this week's feedback. "
            f"Data: {summary}\nRecent examples: {recent}\n"
            "Include: key metrics, trends, recommendations, and success stories."
        )
        
        print(f"📄 Weekly Report:\n{report}")
        return report
    
    async def run_workflow(self, workflow_name: str, *args, **kwargs):
        """Execute a specific workflow"""
        if workflow_name in self.workflows:
            return await self.workflows[workflow_name](*args, **kwargs)
        else:
            raise ValueError(f"Unknown workflow: {workflow_name}")

class WorkflowScheduler:
    def __init__(self, workflow_engine):
        self.engine = workflow_engine
        self.scheduled_tasks = []
    
    def schedule_daily(self, hour: int, minute: int, workflow: str):
        """Schedule daily workflow"""
        self.scheduled_tasks.append({
            "type": "daily",
            "time": {"hour": hour, "minute": minute},
            "workflow": workflow
        })
    
    def schedule_on_event(self, event_type: str, workflow: str):
        """Schedule event-triggered workflow"""
        self.scheduled_tasks.append({
            "type": "event",
            "trigger": event_type,
            "workflow": workflow
        })
    
    async def run(self):
        """Run the scheduler"""
        print("⏰ Workflow scheduler started")
        
        # For demo: simulate some workflows
        await asyncio.sleep(2)
        await self.engine.run_workflow("daily_analysis")
        
        # Simulate negative feedback
        await asyncio.sleep(3)
        await self.engine.run_workflow("negative_feedback_alert", {
            "customer_name": "Demo User",
            "feedback": "The coffee was cold and service was slow",
            "rating": 2
        })
```

## Step 4: Putting It All Together

Create `run_system.py` to run the complete system:

```python
#!/usr/bin/env python3
"""
Run the Complete AI Feedback System
"""

import asyncio
import subprocess
import time
from feedback_agent import FeedbackAgent
from workflow_engine import FeedbackWorkflow, WorkflowScheduler

async def run_complete_system():
    """Run server and agent together"""
    
    # Start the MCP server in background
    print("🚀 Starting MCP Feedback Server...")
    server_process = subprocess.Popen(
        ["python", "feedback_server.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Give server time to start
    time.sleep(2)
    
    try:
        # Create and connect agent
        print("🤖 Starting AI Agent...")
        agent = FeedbackAgent()
        
        # Create workflow engine
        workflow = FeedbackWorkflow(agent)
        scheduler = WorkflowScheduler(workflow)
        
        # Schedule some workflows
        scheduler.schedule_daily(9, 0, "daily_analysis")
        scheduler.schedule_on_event("negative_feedback", "negative_feedback_alert")
        scheduler.schedule_daily(17, 0, "weekly_report")
        
        # Run the agent
        await agent.connect_to_server()
        
    finally:
        # Clean up
        server_process.terminate()
        print("\n👋 System shutdown complete")

if __name__ == "__main__":
    print("🎯 Complete AI Feedback System Starting...\n")
    asyncio.run(run_complete_system())
```

## Step 5: Testing Your AI System

Let's test the complete system:

```bash
# Make sure your .env file has your OpenAI API key
python run_system.py
```

Try these interactions:

1. **Give feedback:**
   - "Hi, I'm Sarah. I loved the new latte recipe! 5 stars!"
   - "The service was terrible today. My order took 30 minutes."

2. **Check analytics:**
   - Type: `analyze`

3. **Ask questions:**
   - "What's the overall feedback trend?"
   - "How many people gave feedback today?"

## Key Concepts We've Implemented

### 1. **Agent-Server Communication**
The agent connects to the MCP server and can:
- Read resources (feedback data)
- Call tools (collect feedback, analyze sentiment)
- Process results intelligently

### 2. **LLM Integration**
We use GPT-3.5 to:
- Understand natural language
- Extract information from conversations
- Generate insights and recommendations
- Create personalized responses

### 3. **Automated Workflows**
Our system can:
- Run scheduled analyses
- Respond to events (negative feedback)
- Generate reports automatically

### 4. **Intelligent Decision Making**
The agent:
- Classifies user intent
- Chooses appropriate actions
- Provides contextual responses

## What's Next?

In our final part (Part 5), we'll:
- Add data persistence with a real database
- Implement advanced features (multi-language support, voice input)
- Deploy the system for production use
- Explore scaling strategies

You've now built a functional AI system! How would you extend this for your business needs? What other workflows would be helpful?

## Challenge: Extend Your System

Try adding these features:
1. Email notifications for negative feedback
2. Sentiment trend visualization
3. Customer response templates
4. Multi-location support

Share your extensions in the comments!