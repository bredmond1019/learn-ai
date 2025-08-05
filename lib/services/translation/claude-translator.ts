import Anthropic from '@anthropic-ai/sdk';

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Claude API client configuration
let anthropic: Anthropic | null = null;

function getClaudeClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    anthropic = new Anthropic({
      apiKey,
    });
  }
  return anthropic;
}

// Reset client for testing
export function resetClient(): void {
  anthropic = null;
}

// Content types for different translation approaches
export type ContentType = 'blog-post' | 'project-description' | 'ui-text' | 'marketing-copy' | 'technical-doc';

// Translation options
export interface TranslationOptions {
  contentType: ContentType;
  sourceLanguage: 'en';
  targetLanguage: 'pt-BR';
  culturalAdaptation?: boolean;
  preserveFormatting?: boolean;
  technicalTerminology?: 'preserve' | 'localize' | 'mixed';
}

// Translation result
export interface TranslationResult {
  originalText: string;
  translatedText: string;
  confidence: number;
  culturalNotes?: string[];
  technicalTerms?: Array<{
    original: string;
    translation: string;
    reasoning: string;
  }>;
  metadata: {
    contentType: ContentType;
    options: TranslationOptions;
    timestamp: string;
    model: string;
    tokensUsed?: number;
  };
}

// Rate limiting state
let lastRequestTime = 0;

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
}

// Build prompt based on content type and options
function buildTranslationPrompt(text: string, options: TranslationOptions): string {
  const { contentType, culturalAdaptation = true, technicalTerminology = 'mixed' } = options;
  
  let basePrompt = `You are a professional translator specializing in translating English content to Brazilian Portuguese (pt-BR).`;
  
  // Add content-specific instructions
  switch (contentType) {
    case 'blog-post':
      basePrompt += ` You are translating a technical blog post. Maintain the educational tone while making it accessible to Brazilian developers.`;
      break;
    case 'project-description':
      basePrompt += ` You are translating a project description for a professional portfolio. Keep it concise and impactful.`;
      break;
    case 'ui-text':
      basePrompt += ` You are translating user interface text. Keep translations short, clear, and consistent with common UI conventions in Brazil.`;
      break;
    case 'marketing-copy':
      basePrompt += ` You are translating marketing content. Make it engaging and persuasive for the Brazilian market.`;
      break;
    case 'technical-doc':
      basePrompt += ` You are translating technical documentation. Precision and clarity are paramount.`;
      break;
  }
  
  // Add cultural adaptation instructions
  if (culturalAdaptation) {
    basePrompt += `

CULTURAL ADAPTATION FOR BRAZIL:
- Use Brazilian business examples when relevant (Nubank, iFood, Mercado Libre, etc.)
- Adapt cost references to Brazilian context (mention Real currency when appropriate)
- Use Brazilian Portuguese conventions and expressions
- Consider the Brazilian tech market perspective
- Make the tone professional but approachable, matching Brazilian communication style`;
  }
  
  // Add technical terminology instructions
  switch (technicalTerminology) {
    case 'preserve':
      basePrompt += `\n\nTECHNICAL TERMS: Keep all technical terms in English (API, framework, cloud, etc.)`;
      break;
    case 'localize':
      basePrompt += `\n\nTECHNICAL TERMS: Translate technical terms to Portuguese when good translations exist`;
      break;
    case 'mixed':
      basePrompt += `\n\nTECHNICAL TERMS: Use a mix - keep widely-used English terms (API, cloud, framework) but translate when clear Portuguese equivalents exist`;
      break;
  }
  
  basePrompt += `

FORMATTING:
${options.preserveFormatting ? '- Preserve all markdown formatting, HTML tags, and structure exactly' : '- Maintain basic formatting but adapt for readability'}
- Keep code blocks, URLs, and technical identifiers unchanged
- Preserve any special characters or symbols

QUALITY REQUIREMENTS:
- Natural, fluent Brazilian Portuguese
- Consistent terminology throughout
- Appropriate register for the target audience
- Error-free grammar and spelling

Please translate the following text and provide your response in this JSON format:
{
  "translatedText": "your translation here",
  "confidence": 85,
  "culturalNotes": ["any cultural adaptation notes"],
  "technicalTerms": [
    {
      "original": "term",
      "translation": "termo",
      "reasoning": "explanation"
    }
  ]
}

TEXT TO TRANSLATE:
${text}`;

  return basePrompt;
}

// Main translation function
export async function translateContent(
  text: string,
  options: TranslationOptions
): Promise<TranslationResult> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text to translate cannot be empty');
  }
  
  // Enforce rate limiting
  await enforceRateLimit();
  
  const client = getClaudeClient();
  const prompt = buildTranslationPrompt(text, options);
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-3-haiku-20240307', // Using Haiku for cost efficiency
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3, // Lower temperature for more consistent translations
      });
      
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }
      
      // Parse the JSON response
      let parsedResponse;
      try {
        // Extract JSON from the response (in case Claude adds extra text)
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in Claude response');
        }
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        throw new Error(`Failed to parse Claude response as JSON: ${parseError}`);
      }
      
      // Validate required fields
      if (!parsedResponse.translatedText) {
        throw new Error('Claude response missing translatedText field');
      }
      
      const result: TranslationResult = {
        originalText: text,
        translatedText: parsedResponse.translatedText,
        confidence: parsedResponse.confidence || 80,
        culturalNotes: parsedResponse.culturalNotes || [],
        technicalTerms: parsedResponse.technicalTerms || [],
        metadata: {
          contentType: options.contentType,
          options,
          timestamp: new Date().toISOString(),
          model: 'claude-3-haiku-20240307',
          tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens,
        },
      };
      
      return result;
      
    } catch (error) {
      lastError = error as Error;
      if (process.env.NODE_ENV !== 'test') {
        console.error(`Translation attempt ${attempt} failed:`, error);
      }
      
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }
  
  throw new Error(`Translation failed after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
}

// Batch translation function for efficiency
export async function translateBatch(
  texts: Array<{ id: string; text: string; options: TranslationOptions }>
): Promise<Array<{ id: string; result: TranslationResult | null; error?: string }>> {
  const results: Array<{ id: string; result: TranslationResult | null; error?: string }> = [];
  
  for (const item of texts) {
    try {
      const result = await translateContent(item.text, item.options);
      results.push({ id: item.id, result });
    } catch (error) {
      results.push({ 
        id: item.id, 
        result: null, // Will be handled by error field
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

// Utility function to estimate token count (rough approximation)
export function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

// Utility function to estimate translation cost
export function estimateCost(text: string): number {
  // Claude 3 Haiku pricing (as of 2024): $0.25 per 1M input tokens, $1.25 per 1M output tokens
  const inputTokens = estimateTokenCount(text);
  const estimatedOutputTokens = inputTokens * 1.2; // Assume 20% more for translation
  
  const inputCost = (inputTokens / 1_000_000) * 0.25;
  const outputCost = (estimatedOutputTokens / 1_000_000) * 1.25;
  
  return inputCost + outputCost;
}

// Validation function for API key
export function validateApiKey(): boolean {
  try {
    getClaudeClient();
    return true;
  } catch {
    return false;
  }
}