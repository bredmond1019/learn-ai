---
title: Deploying and Scaling Your AI System (Part 5/5)
published: true
tags: deployment, scaling, production, ai
series: Building AI Systems
---

Congratulations on making it this far! You've built a complete AI system with an MCP server, intelligent agents, and automated workflows. Now let's make it production-ready and explore how to scale it for real-world use.

## What We'll Cover

1. Adding persistent storage
2. Implementing security best practices
3. Deploying to the cloud
4. Scaling strategies
5. Advanced features and next steps

## Step 1: Adding Persistent Storage

Let's upgrade from in-memory storage to a real database. We'll use SQLite for simplicity:

```python
# database.py
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any

class FeedbackDatabase:
    def __init__(self, db_path: str = "feedback.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Create tables if they don't exist"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    customer_name TEXT NOT NULL,
                    feedback TEXT NOT NULL,
                    rating INTEGER NOT NULL,
                    sentiment TEXT NOT NULL,
                    metadata TEXT
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS analysis_reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    report_type TEXT NOT NULL,
                    content TEXT NOT NULL
                )
            """)
            
            conn.commit()
    
    def add_feedback(self, feedback_data: Dict[str, Any]) -> int:
        """Store feedback in database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT INTO feedback 
                (timestamp, customer_name, feedback, rating, sentiment, metadata)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                feedback_data['timestamp'],
                feedback_data['customer_name'],
                feedback_data['feedback'],
                feedback_data['rating'],
                feedback_data['sentiment'],
                json.dumps(feedback_data.get('metadata', {}))
            ))
            
            return cursor.lastrowid
    
    def get_recent_feedback(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieve recent feedback"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                SELECT * FROM feedback 
                ORDER BY timestamp DESC 
                LIMIT ?
            """, (limit,))
            
            return [dict(row) for row in cursor.fetchall()]
    
    def get_feedback_summary(self) -> Dict[str, Any]:
        """Get statistical summary"""
        with sqlite3.connect(self.db_path) as conn:
            # Total count
            total = conn.execute("SELECT COUNT(*) FROM feedback").fetchone()[0]
            
            # Sentiment breakdown
            sentiment_data = conn.execute("""
                SELECT sentiment, COUNT(*) as count 
                FROM feedback 
                GROUP BY sentiment
            """).fetchall()
            
            # Average rating
            avg_rating = conn.execute("""
                SELECT AVG(rating) FROM feedback
            """).fetchone()[0] or 0
            
            return {
                "total": total,
                "average_rating": round(avg_rating, 2),
                "sentiments": {row[0]: row[1] for row in sentiment_data}
            }
```

Update your `feedback_server.py` to use the database:

```python
# In FeedbackServer.__init__
self.db = FeedbackDatabase()

# Update collect_feedback tool
feedback_id = self.db.add_feedback(feedback_entry)

# Update resource handlers to use database
recent = self.db.get_recent_feedback()
summary = self.db.get_feedback_summary()
```

## Step 2: Security Best Practices

### Environment Variables and Secrets

```python
# config.py
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///feedback.db")
    
    # Security
    API_TOKEN: str = os.getenv("API_TOKEN", "")
    ALLOWED_ORIGINS: List[str] = os.getenv("ALLOWED_ORIGINS", "").split(",")
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "60"))
    RATE_LIMIT_PERIOD: int = int(os.getenv("RATE_LIMIT_PERIOD", "60"))
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required")
        
        if not cls.API_TOKEN:
            print("Warning: API_TOKEN not set. Using default (not secure!)")

# Rate limiting implementation
from collections import defaultdict
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, max_requests: int, period_seconds: int):
        self.max_requests = max_requests
        self.period = timedelta(seconds=period_seconds)
        self.requests = defaultdict(list)
    
    def is_allowed(self, identifier: str) -> bool:
        now = datetime.now()
        
        # Clean old requests
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if now - req_time < self.period
        ]
        
        # Check limit
        if len(self.requests[identifier]) < self.max_requests:
            self.requests[identifier].append(now)
            return True
        
        return False
```

### Input Validation and Sanitization

```python
# validation.py
from typing import Any, Dict
import re

class FeedbackValidator:
    @staticmethod
    def validate_feedback(data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and sanitize feedback data"""
        errors = []
        
        # Customer name
        name = data.get("customer_name", "").strip()
        if not name:
            errors.append("Customer name is required")
        elif len(name) > 100:
            errors.append("Customer name too long (max 100 chars)")
        else:
            # Basic sanitization
            name = re.sub(r'[<>\"\'&]', '', name)
        
        # Feedback text
        feedback = data.get("feedback", "").strip()
        if not feedback:
            errors.append("Feedback is required")
        elif len(feedback) > 1000:
            errors.append("Feedback too long (max 1000 chars)")
        
        # Rating
        rating = data.get("rating")
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                errors.append("Rating must be between 1 and 5")
        except (TypeError, ValueError):
            errors.append("Invalid rating")
        
        if errors:
            raise ValueError("; ".join(errors))
        
        return {
            "customer_name": name,
            "feedback": feedback,
            "rating": rating
        }
```

## Step 3: Deploying to Production

### Docker Configuration

Create `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -r feedbackuser && \
    chown -R feedbackuser:feedbackuser /app

USER feedbackuser

# Run the server
CMD ["python", "feedback_server.py"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mcp-server:
    build: .
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/feedback
      - API_TOKEN=${API_TOKEN}
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    restart: unless-stopped
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=feedback
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
  
  ai-agent:
    build: 
      context: .
      dockerfile: Dockerfile.agent
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MCP_SERVER_URL=http://mcp-server:8080
    depends_on:
      - mcp-server
    restart: unless-stopped

volumes:
  postgres_data:
```

### Cloud Deployment Options

#### Option 1: Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy
railway up
```

#### Option 2: Deploy to Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Initialize
fly launch

# Deploy
fly deploy
```

#### Option 3: Deploy to AWS
```bash
# Using AWS Copilot
copilot app init feedback-system
copilot env init --name production
copilot svc init --name mcp-server
copilot svc deploy --name mcp-server --env production
```

## Step 4: Scaling Strategies

### Horizontal Scaling with Load Balancing

```python
# load_balancer.py
import aiohttp
import asyncio
from typing import List
import random

class MCPLoadBalancer:
    def __init__(self, server_urls: List[str]):
        self.servers = server_urls
        self.health_status = {url: True for url in server_urls}
        
    async def health_check(self):
        """Check health of all servers"""
        while True:
            for server in self.servers:
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(f"{server}/health", timeout=5) as resp:
                            self.health_status[server] = resp.status == 200
                except:
                    self.health_status[server] = False
            
            await asyncio.sleep(30)  # Check every 30 seconds
    
    def get_server(self) -> str:
        """Get a healthy server using round-robin"""
        healthy_servers = [s for s, healthy in self.health_status.items() if healthy]
        
        if not healthy_servers:
            raise Exception("No healthy servers available")
        
        return random.choice(healthy_servers)
```

### Caching Layer

```python
# cache.py
import redis
import json
from typing import Optional, Any

class FeedbackCache:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url)
        self.ttl = 300  # 5 minutes
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        value = self.redis.get(key)
        if value:
            return json.loads(value)
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache"""
        self.redis.setex(
            key,
            ttl or self.ttl,
            json.dumps(value)
        )
    
    def invalidate_pattern(self, pattern: str):
        """Invalidate all keys matching pattern"""
        for key in self.redis.scan_iter(match=pattern):
            self.redis.delete(key)
```

## Step 5: Advanced Features

### Multi-Language Support

```python
# translations.py
class TranslationService:
    def __init__(self):
        self.translations = {
            "en": {
                "thank_you": "Thank you for your feedback!",
                "we_appreciate": "We appreciate your input.",
            },
            "es": {
                "thank_you": "¡Gracias por sus comentarios!",
                "we_appreciate": "Apreciamos su opinión.",
            },
            "fr": {
                "thank_you": "Merci pour vos commentaires!",
                "we_appreciate": "Nous apprécions votre avis.",
            }
        }
    
    def detect_language(self, text: str) -> str:
        """Detect language using simple heuristics or API"""
        # In production, use a service like Google Translate API
        if any(word in text.lower() for word in ["gracias", "hola", "por favor"]):
            return "es"
        elif any(word in text.lower() for word in ["merci", "bonjour", "s'il vous plaît"]):
            return "fr"
        return "en"
    
    def translate(self, key: str, language: str) -> str:
        """Get translated text"""
        return self.translations.get(language, {}).get(key, 
               self.translations["en"].get(key, key))
```

### Real-time Analytics Dashboard

```python
# analytics.py
from typing import Dict, List
import asyncio
from datetime import datetime, timedelta

class RealtimeAnalytics:
    def __init__(self, db: FeedbackDatabase):
        self.db = db
        self.subscribers = []
    
    async def calculate_metrics(self) -> Dict[str, Any]:
        """Calculate real-time metrics"""
        now = datetime.now()
        
        # Get feedback from last hour
        recent_feedback = self.db.get_feedback_since(
            now - timedelta(hours=1)
        )
        
        # Calculate metrics
        metrics = {
            "timestamp": now.isoformat(),
            "hourly_count": len(recent_feedback),
            "average_rating": sum(f["rating"] for f in recent_feedback) / len(recent_feedback) if recent_feedback else 0,
            "sentiment_breakdown": self._calculate_sentiment_breakdown(recent_feedback),
            "trending_topics": self._extract_trending_topics(recent_feedback)
        }
        
        return metrics
    
    async def broadcast_updates(self):
        """Send updates to all subscribers"""
        while True:
            metrics = await self.calculate_metrics()
            
            # Send to all websocket connections
            for subscriber in self.subscribers:
                await subscriber.send_json(metrics)
            
            await asyncio.sleep(60)  # Update every minute
```

## Putting It All Together

Your production AI system now has:
- ✅ Persistent storage
- ✅ Security measures
- ✅ Scalable architecture
- ✅ Cloud deployment
- ✅ Advanced features

## Next Steps and Resources

### 1. **Enhance Your System**
- Add voice input using speech-to-text APIs
- Implement visual analytics dashboards
- Create mobile apps for feedback collection
- Add webhook integrations

### 2. **Learn More**
- Explore advanced MCP features
- Study distributed systems patterns
- Learn about AI agent frameworks
- Dive into MLOps practices

### 3. **Join the Community**
- MCP Discord: [discord.gg/mcp](https://discord.gg/mcp)
- Share your projects and get feedback
- Contribute to open-source MCP tools

## Conclusion

You've journey from understanding AI systems to building and deploying a production-ready application. You've learned:
- How AI systems work and why they matter
- Building MCP servers for AI integration
- Creating intelligent agents with LLMs
- Implementing automated workflows
- Deploying and scaling for production

The AI revolution isn't just for big tech companies. With tools like MCP and the knowledge you've gained, you can build powerful AI systems that solve real problems.

What will you build next? Share your projects and ideas in the comments!

---

**Complete Tutorial Available**: For more examples, exercises, and advanced topics, visit [brandonredmond.com/learn/paths/ai-systems-intro](https://brandonredmond.com/learn/paths/ai-systems-intro)

Thank you for following along with this series. Happy building! 🚀