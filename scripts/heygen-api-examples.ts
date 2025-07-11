// HeyGen API Integration Examples
// Comprehensive examples for common video generation tasks

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || '';
const API_BASE_URL = 'https://api.heygen.com';

// Example 1: List Available Avatars
export async function listAvatars() {
  try {
    const response = await axios.get(`${API_BASE_URL}/v2/avatars`, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
      },
    });
    
    console.log('Available Avatars:');
    response.data.data.avatars.forEach((avatar: any) => {
      console.log(`- ${avatar.avatar_id}: ${avatar.avatar_name} (${avatar.gender})`);
    });
    
    return response.data.data.avatars;
  } catch (error) {
    console.error('Error listing avatars:', error);
    throw error;
  }
}

// Example 2: List Available Voices
export async function listVoices(language = 'en-US') {
  try {
    const response = await axios.get(`${API_BASE_URL}/v2/voices`, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
      },
      params: { language_code: language }
    });
    
    console.log(`Voices for ${language}:`);
    response.data.data.voices.forEach((voice: any) => {
      console.log(`- ${voice.voice_id}: ${voice.display_name} (${voice.gender})`);
    });
    
    return response.data.data.voices;
  } catch (error) {
    console.error('Error listing voices:', error);
    throw error;
  }
}

// Example 3: Create Simple Video
export async function createSimpleVideo(text: string) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/v2/video/generate`,
      {
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: 'alex_business_sitting',
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: text,
            voice_id: 'en-US-JennyNeural',
            speed: 1.0
          }
        }],
        dimension: {
          width: 1280,
          height: 720
        },
        aspect_ratio: '16:9'
      },
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Video created:', response.data.data.video_id);
    return response.data.data.video_id;
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
}

// Example 4: Create Video with Custom Background
export async function createVideoWithBackground(
  text: string,
  backgroundImageUrl: string
) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/v2/video/generate`,
      {
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: 'monica_casual_standing',
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: text,
            voice_id: 'en-US-AriaNeural',
            speed: 0.95
          },
          background: {
            type: 'image',
            url: backgroundImageUrl
          }
        }],
        dimension: {
          width: 1920,
          height: 1080
        },
        caption: true
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
    console.error('Error creating video with background:', error);
    throw error;
  }
}

// Example 5: Create Portuguese Video
export async function createPortugueseVideo(text: string) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/v2/video/generate`,
      {
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: 'alex_business_sitting',
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: text,
            voice_id: 'pt-BR-FranciscaNeural',
            speed: 0.95
          }
        }],
        dimension: {
          width: 1280,
          height: 720
        },
        caption: true
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
    console.error('Error creating Portuguese video:', error);
    throw error;
  }
}

// Example 6: Check Video Status
export async function checkVideoStatus(videoId: string) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/v1/video_status.get`,
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
        },
        params: { video_id: videoId }
      }
    );
    
    const status = response.data.data;
    console.log(`Video ${videoId} status:`, status.status);
    
    if (status.status === 'completed') {
      console.log('Video URL:', status.video_url);
      console.log('Thumbnail:', status.thumbnail_url);
    }
    
    return status;
  } catch (error) {
    console.error('Error checking video status:', error);
    throw error;
  }
}

// Example 7: Create Video with Multiple Scenes
export async function createMultiSceneVideo(scenes: Array<{text: string, duration?: number}>) {
  try {
    const videoInputs = scenes.map((scene, index) => ({
      character: {
        type: 'avatar',
        avatar_id: 'alex_business_sitting',
        avatar_style: 'normal'
      },
      voice: {
        type: 'text',
        input_text: scene.text,
        voice_id: 'en-US-JennyNeural',
        speed: 1.0
      },
      background: {
        type: 'color',
        value: index % 2 === 0 ? '#1e293b' : '#0f172a'
      }
    }));
    
    const response = await axios.post(
      `${API_BASE_URL}/v2/video/generate`,
      {
        video_inputs: videoInputs,
        dimension: {
          width: 1920,
          height: 1080
        },
        caption: true
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
    console.error('Error creating multi-scene video:', error);
    throw error;
  }
}

// Example 8: Webhook Integration
export async function createVideoWithWebhook(
  text: string,
  webhookUrl: string
) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/v2/video/generate`,
      {
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: 'alex_business_sitting',
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: text,
            voice_id: 'en-US-JennyNeural'
          }
        }],
        callback_id: `module_${Date.now()}`,
        webhook_url: webhookUrl
      },
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Video queued with webhook:', response.data.data.video_id);
    return response.data.data.video_id;
  } catch (error) {
    console.error('Error creating video with webhook:', error);
    throw error;
  }
}

// Example 9: Retry with Exponential Backoff
export async function createVideoWithRetry(
  text: string,
  maxRetries = 3
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await createSimpleVideo(text);
    } catch (error: any) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Example 10: Poll for Video Completion
export async function waitForVideoCompletion(
  videoId: string,
  maxWaitTime = 300000 // 5 minutes
): Promise<any> {
  const startTime = Date.now();
  const pollInterval = 10000; // 10 seconds
  
  while (Date.now() - startTime < maxWaitTime) {
    const status = await checkVideoStatus(videoId);
    
    if (status.status === 'completed') {
      return status;
    }
    
    if (status.status === 'failed') {
      throw new Error(`Video generation failed: ${status.error}`);
    }
    
    console.log(`Video still processing... (${status.status})`);
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  throw new Error('Video generation timed out');
}

// Example usage script
if (require.main === module) {
  async function demo() {
    try {
      // List available resources
      await listAvatars();
      await listVoices('en-US');
      await listVoices('pt-BR');
      
      // Create a simple video
      const videoId = await createSimpleVideo(
        'Welcome to our AI learning platform. Let\'s explore the future of technology together!'
      );
      
      // Wait for completion
      const result = await waitForVideoCompletion(videoId);
      console.log('Video ready:', result.video_url);
      
    } catch (error) {
      console.error('Demo failed:', error);
    }
  }
  
  demo();
}