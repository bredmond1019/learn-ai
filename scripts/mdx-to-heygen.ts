import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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
  
  if (!HEYGEN_API_KEY) {
    throw new Error('HEYGEN_API_KEY not found in environment variables');
  }
  
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