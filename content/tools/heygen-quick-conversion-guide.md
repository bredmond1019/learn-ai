# HeyGen Quick Conversion Guide: MDX Learning Modules to Video

## Overview

This guide provides the fastest path to convert your existing MDX-based learning modules into professional video tutorials using HeyGen's AI avatar technology. Transform 20+ modules into engaging video content in less than a week.

## Quick Start (2-3 Hours)

### 1. HeyGen Setup
1. Create account at [heygen.com](https://heygen.com)
2. Select your avatar (recommended: professional avatars like "Alex" or "Monica")
3. Choose voice: 
   - English: Natural US accent
   - Portuguese: Native Brazilian Portuguese (pt-BR supported)
4. Get API key from Settings → API

### 2. Environment Setup
```bash
# Install dependencies
npm install axios dotenv gray-matter
npm install -D @types/node typescript tsx

# Create .env file
echo "HEYGEN_API_KEY=your_api_key_here" > .env
```

## MDX to Video Pipeline

### Core Workflow
```
MDX Files → Content Extractor → Script Generator → HeyGen API → Video URLs
    ↓              ↓                   ↓                ↓            ↓
 Modules      Section Text       Video Scripts     API Calls    Module Videos
```

### Time Per Module
- Extraction: 1 minute (automated)
- Script generation: 5 minutes (automated)
- Video creation: 10-15 minutes (HeyGen processing)
- Total: ~20 minutes per module

## Content Extraction Script

Save as `scripts/mdx-to-heygen.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';

interface ModuleSection {
  id: string;
  title: string;
  content: string;
  duration: string;
}

interface VideoScript {
  title: string;
  sections: {
    text: string;
    pauseAfter?: number;
  }[];
  duration: number;
}

// Extract content from MDX file
async function extractMDXContent(mdxPath: string): Promise<ModuleSection[]> {
  const content = fs.readFileSync(mdxPath, 'utf-8');
  const { data, content: body } = matter(content);
  
  // Split content by section headers
  const sections = body.split(/^##\s+(.+)\s*{#(.+)}/gm);
  const extractedSections: ModuleSection[] = [];
  
  for (let i = 1; i < sections.length; i += 3) {
    const title = sections[i];
    const id = sections[i + 1];
    const content = sections[i + 2]?.trim() || '';
    
    // Clean content for speech
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, '[See code example on screen]')
      .replace(/<CodeExample[\s\S]*?\/>/g, '[Code demonstration]')
      .replace(/<Callout[\s\S]*?<\/Callout>/g, (match) => {
        const text = match.match(/>([^<]+)</)?.[1] || '';
        return `Important: ${text}`;
      })
      .replace(/<Quiz[\s\S]*?<\/Quiz>/g, '[Interactive quiz - pause video]')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
      .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Remove bold/italic
      .trim();
    
    extractedSections.push({
      id,
      title,
      content: cleanContent,
      duration: estimateDuration(cleanContent)
    });
  }
  
  return extractedSections;
}

// Estimate speaking duration (150 words per minute)
function estimateDuration(text: string): string {
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 150);
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

// Generate HeyGen-optimized script
function generateVideoScript(
  moduleName: string,
  sections: ModuleSection[]
): VideoScript {
  const script: VideoScript = {
    title: moduleName,
    sections: [],
    duration: 0
  };
  
  // Add introduction
  script.sections.push({
    text: `Welcome to ${moduleName}. In this video, we'll explore the key concepts and practical applications. Let's get started!`,
    pauseAfter: 2
  });
  
  // Process each section
  sections.forEach((section, index) => {
    // Section introduction
    script.sections.push({
      text: `${index > 0 ? 'Next, ' : ''}let's look at ${section.title}.`,
      pauseAfter: 1
    });
    
    // Split long content into smaller chunks
    const chunks = splitIntoChunks(section.content, 300); // ~2 minutes per chunk
    chunks.forEach(chunk => {
      script.sections.push({
        text: chunk,
        pauseAfter: 2
      });
    });
  });
  
  // Add conclusion
  script.sections.push({
    text: `That concludes our overview of ${moduleName}. Practice these concepts with the exercises in the learning platform. See you in the next module!`,
    pauseAfter: 3
  });
  
  // Calculate total duration
  script.duration = script.sections.reduce((total, section) => {
    const words = section.text.split(/\s+/).length;
    return total + (words / 150) + (section.pauseAfter || 0) / 60;
  }, 0);
  
  return script;
}

// Split text into speakable chunks
function splitIntoChunks(text: string, maxWords: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';
  let wordCount = 0;
  
  sentences.forEach(sentence => {
    const sentenceWords = sentence.trim().split(/\s+/).length;
    
    if (wordCount + sentenceWords > maxWords && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
      wordCount = sentenceWords;
    } else {
      currentChunk += ' ' + sentence;
      wordCount += sentenceWords;
    }
  });
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Create video using HeyGen API
async function createHeyGenVideo(
  script: VideoScript,
  avatarId: string = 'alex_business_sitting'
): Promise<string> {
  const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
  const HEYGEN_API_URL = 'https://api.heygen.com/v2/video/generate';
  
  try {
    // Combine all sections into single script
    const fullScript = script.sections
      .map(s => s.text)
      .join('\n\n');
    
    const response = await axios.post(
      HEYGEN_API_URL,
      {
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: avatarId,
            avatar_style: 'business'
          },
          voice: {
            type: 'text',
            input_text: fullScript,
            voice_id: 'en-US-JennyNeural', // Professional US voice
            speed: 1.0
          },
          background: {
            type: 'color',
            value: '#1e293b' // Dark professional background
          }
        }],
        test: false,
        caption: true, // Enable captions for accessibility
        dimension: {
          width: 1920,
          height: 1080
        },
        aspect_ratio: '16:9',
        render_mode: 'performance'
      },
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.data.video_id;
  } catch (error) {
    console.error('HeyGen API Error:', error);
    throw error;
  }
}

// Main conversion function
export async function convertModuleToVideo(
  modulePath: string,
  moduleJsonPath: string
): Promise<{ videoId: string; script: VideoScript }> {
  console.log(`Converting ${modulePath} to video...`);
  
  // Load module metadata
  const moduleData = JSON.parse(
    fs.readFileSync(moduleJsonPath, 'utf-8')
  );
  
  // Extract MDX content
  const sections = await extractMDXContent(modulePath);
  
  // Generate video script
  const script = generateVideoScript(
    moduleData.metadata.title,
    sections
  );
  
  // Create video
  const videoId = await createHeyGenVideo(script);
  
  console.log(`Video created: ${videoId}`);
  console.log(`Estimated duration: ${Math.ceil(script.duration)} minutes`);
  
  return { videoId, script };
}

// Batch process all modules in a learning path
export async function processLearningPath(pathDir: string) {
  const modulesDir = path.join(pathDir, 'modules');
  const files = fs.readdirSync(modulesDir);
  
  const mdxFiles = files.filter(f => f.endsWith('.mdx'));
  const results = [];
  
  for (const mdxFile of mdxFiles) {
    const baseName = mdxFile.replace('.mdx', '');
    const jsonFile = `${baseName}.json`;
    
    if (files.includes(jsonFile)) {
      try {
        const result = await convertModuleToVideo(
          path.join(modulesDir, mdxFile),
          path.join(modulesDir, jsonFile)
        );
        
        results.push({
          module: baseName,
          ...result
        });
        
        // Wait to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Failed to process ${mdxFile}:`, error);
      }
    }
  }
  
  // Save results
  fs.writeFileSync(
    path.join(pathDir, 'video-mapping.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`Processed ${results.length} modules`);
}

// CLI usage
if (require.main === module) {
  const pathDir = process.argv[2];
  
  if (!pathDir) {
    console.log('Usage: tsx mdx-to-heygen.ts <learning-path-directory>');
    process.exit(1);
  }
  
  processLearningPath(pathDir).catch(console.error);
}
```

## Script Templates by Module Type

### Theory Module Template
```javascript
{
  "avatar_style": "professional_sitting",
  "voice_speed": 0.95,
  "background": "modern_office",
  "intro": "Welcome to {module_name}. Today we'll explore {main_concept}.",
  "transitions": [
    "Let's start by understanding...",
    "Now, let's look at...",
    "Moving on to...",
    "Finally, we'll examine..."
  ],
  "outro": "Great job! You've learned {key_takeaways}. Practice these concepts in the exercises."
}
```

### Practice Module Template
```javascript
{
  "avatar_style": "casual_standing",
  "voice_speed": 1.0,
  "background": "developer_workspace",
  "code_narration": "Let me walk you through this code step by step...",
  "screen_share": true,
  "highlight_code": true
}
```

### Project Module Template
```javascript
{
  "avatar_style": "professional_presenting",
  "voice_speed": 1.0,
  "background": "tech_conference",
  "structure": [
    "Project overview and goals",
    "Setting up the environment",
    "Building the core features",
    "Testing and deployment",
    "Next steps and improvements"
  ]
}
```

## Batch Processing Script

Save as `scripts/batch-convert.ts`:

```typescript
import { processLearningPath } from './mdx-to-heygen';
import path from 'path';

const PRIORITY_PATHS = [
  'ai-systems-intro',        // 10 modules - Beginner friendly
  'mcp-fundamentals',        // 5 modules - Visual demos valuable  
  'claude-code-mastery',     // 5 modules - Tool demonstrations
  'ai-engineering-fundamentals' // 6 modules - Core concepts
];

async function batchConvert() {
  const contentDir = path.join(process.cwd(), 'content/learn/paths');
  
  for (const pathName of PRIORITY_PATHS) {
    const pathDir = path.join(contentDir, pathName);
    
    console.log(`\nProcessing ${pathName}...`);
    console.log('='.repeat(50));
    
    try {
      await processLearningPath(pathDir);
      console.log(`✅ ${pathName} completed`);
    } catch (error) {
      console.error(`❌ ${pathName} failed:`, error);
    }
    
    // Wait between paths
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  console.log('\n🎉 Batch conversion complete!');
}

// Run batch conversion
batchConvert().catch(console.error);
```

## Quick Portuguese (pt-BR) Support

HeyGen automatically supports Portuguese. For dual-language videos:

```typescript
// Add to script generation
const portugueseScript = {
  voice_id: 'pt-BR-FranciscaNeural',
  speed: 0.95,
  // Auto-translate or use existing pt-BR content
  input_text: translateToPortuguese(englishScript)
};
```

## Integration with Learning Platform

### 1. Add Video URLs to Module JSON
```json
{
  "metadata": {
    "videoUrl": "https://app.heygen.com/share/{video_id}",
    "videoDuration": "5:30",
    "videoLanguages": ["en", "pt-BR"]
  }
}
```

### 2. Update Module Component
```typescript
// In ModuleRenderer.tsx
{moduleData.metadata.videoUrl && (
  <div className="mb-6">
    <h3>Video Lesson</h3>
    <iframe 
      src={moduleData.metadata.videoUrl}
      className="w-full h-96 rounded-lg"
    />
  </div>
)}
```

## Cost Optimization

### Pricing Breakdown
- Creator Plan: $29/month (best for getting started)
- 15 credits = ~15 minutes of video
- Average module: 5 minutes = 5 credits
- 20 modules = 100 credits ≈ $120-150

### Cost-Saving Tips
1. Keep videos 3-7 minutes (optimal for learning retention)
2. Reuse intro/outro segments
3. Batch create during free trial
4. Use same avatar/voice for consistency

## Timeline for 20 Modules

### Week 1 (Setup & First Batch)
- Day 1: HeyGen setup, avatar selection (2 hours)
- Day 2-3: Run scripts on ai-systems-intro (10 modules)
- Day 4-5: Review and iterate on first videos

### Week 2 (Remaining Modules)
- Day 6-7: Process mcp-fundamentals (5 modules)
- Day 8-9: Process claude-code-mastery (5 modules)
- Day 10: Integration and testing

### Total Time Investment
- Setup: 2-3 hours
- Script running: 30 minutes
- Video generation: 5-6 hours (mostly waiting)
- Integration: 2 hours
- **Total active work: ~8 hours**

## Troubleshooting

### Common Issues
1. **Rate Limits**: Add 5-second delays between API calls
2. **Long Scripts**: Split into Part 1, Part 2 videos
3. **Code Examples**: Use screen recording overlay
4. **Complex Diagrams**: Reference "see diagram in course materials"

### Quick Fixes
```typescript
// Retry logic for API calls
async function retryApiCall(fn: Function, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 5000 * (i + 1)));
    }
  }
}
```

## Next Steps

1. **Run the converter**: `npx tsx scripts/batch-convert.ts`
2. **Review generated videos**: Check pacing and clarity
3. **Add to platform**: Update module JSON files
4. **Announce to users**: "New video lessons available!"

## Support

- HeyGen Documentation: [docs.heygen.com](https://docs.heygen.com)
- API Status: [status.heygen.com](https://status.heygen.com)
- Community: [community.heygen.com](https://community.heygen.com)

---

With this guide, you can transform your entire learning platform into a video-enabled educational experience in less than a week of part-time work. The automated scripts handle the heavy lifting, letting you focus on quality and learner experience.