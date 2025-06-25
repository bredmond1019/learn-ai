import { 
  translateContent, 
  translateBatch, 
  estimateTokenCount, 
  estimateCost, 
  validateApiKey,
  resetClient,
  type TranslationOptions,
  // type TranslationResult 
} from './claude-translator';

// Mock the Anthropic SDK
const mockCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate
    }
  }));
});

describe('claude-translator', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
    
    // Reset client and mocks
    resetClient();
    mockCreate.mockReset();
    
    // Disable rate limiting for tests
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: (...args: unknown[]) => void) => {
      fn();
      return {} as NodeJS.Timeout;
    });
  });
  
  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    jest.restoreAllMocks();
  });

  describe('translateContent', () => {
    const defaultOptions: TranslationOptions = {
      contentType: 'blog-post',
      sourceLanguage: 'en',
      targetLanguage: 'pt-BR',
      culturalAdaptation: true,
      preserveFormatting: true,
      technicalTerminology: 'mixed'
    };

    it('should successfully translate content', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            translatedText: 'Texto traduzido',
            confidence: 90,
            culturalNotes: ['Adaptado para o mercado brasileiro'],
            technicalTerms: [{
              original: 'API',
              translation: 'API',
              reasoning: 'Termo amplamente usado em português'
            }]
          })
        }],
        usage: {
          input_tokens: 100,
          output_tokens: 80
        }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await translateContent('Original text', defaultOptions);

      expect(result).toEqual({
        originalText: 'Original text',
        translatedText: 'Texto traduzido',
        confidence: 90,
        culturalNotes: ['Adaptado para o mercado brasileiro'],
        technicalTerms: [{
          original: 'API',
          translation: 'API',
          reasoning: 'Termo amplamente usado em português'
        }],
        metadata: {
          contentType: 'blog-post',
          options: defaultOptions,
          timestamp: expect.any(String),
          model: 'claude-3-haiku-20240307',
          tokensUsed: 180
        }
      });

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: expect.stringContaining('You are a professional translator')
        }],
        temperature: 0.3
      });
    });

    it('should handle different content types correctly', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            translatedText: 'Texto da UI',
            confidence: 95
          })
        }],
        usage: { input_tokens: 50, output_tokens: 40 }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const uiOptions: TranslationOptions = {
        ...defaultOptions,
        contentType: 'ui-text'
      };

      await translateContent('Button text', uiOptions);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('user interface text');
    });

    it('should handle cultural adaptation settings', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            translatedText: 'Texto sem adaptação cultural',
            confidence: 85
          })
        }],
        usage: { input_tokens: 60, output_tokens: 50 }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const noCulturalOptions: TranslationOptions = {
        ...defaultOptions,
        culturalAdaptation: false
      };

      await translateContent('Some text', noCulturalOptions);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].content).not.toContain('CULTURAL ADAPTATION');
    });

    it('should handle technical terminology settings', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            translatedText: 'Texto com termos técnicos preservados',
            confidence: 88
          })
        }],
        usage: { input_tokens: 70, output_tokens: 60 }
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const preserveTermsOptions: TranslationOptions = {
        ...defaultOptions,
        technicalTerminology: 'preserve'
      };

      await translateContent('Technical content', preserveTermsOptions);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('Keep all technical terms in English');
    });

    it('should throw error for empty text', async () => {
      await expect(translateContent('', defaultOptions)).rejects.toThrow(
        'Text to translate cannot be empty'
      );
    });

    it('should throw error when API key is missing', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      
      await expect(translateContent('Test', defaultOptions)).rejects.toThrow(
        'ANTHROPIC_API_KEY environment variable is required'
      );
    });

    it('should retry on API failures', async () => {
      mockCreate
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Rate limit'))
        .mockResolvedValueOnce({
          content: [{
            type: 'text',
            text: JSON.stringify({
              translatedText: 'Texto traduzido após retry',
              confidence: 85
            })
          }],
          usage: { input_tokens: 50, output_tokens: 40 }
        });

      const result = await translateContent('Test text', defaultOptions);

      expect(result.translatedText).toBe('Texto traduzido após retry');
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });

    it('should handle malformed JSON responses', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: 'Invalid JSON response'
        }],
        usage: { input_tokens: 50, output_tokens: 40 }
      });

      await expect(translateContent('Test', defaultOptions)).rejects.toThrow(
        'No JSON found in Claude response'
      );
    });

    it('should handle missing translatedText in response', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{
          type: 'text',
          text: JSON.stringify({
            confidence: 90
            // Missing translatedText
          })
        }],
        usage: { input_tokens: 50, output_tokens: 40 }
      });

      await expect(translateContent('Test', defaultOptions)).rejects.toThrow(
        'Claude response missing translatedText field'
      );
    });
  });

  describe('translateBatch', () => {
    it('should translate multiple texts successfully', async () => {
      const mockResponse1 = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            translatedText: 'Primeiro texto',
            confidence: 90
          })
        }],
        usage: { input_tokens: 50, output_tokens: 40 }
      };

      const mockResponse2 = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            translatedText: 'Segundo texto',
            confidence: 85
          })
        }],
        usage: { input_tokens: 60, output_tokens: 50 }
      };

      mockCreate
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const texts = [
        { id: '1', text: 'First text', options: { contentType: 'blog-post' as const, sourceLanguage: 'en' as const, targetLanguage: 'pt-BR' as const } },
        { id: '2', text: 'Second text', options: { contentType: 'ui-text' as const, sourceLanguage: 'en' as const, targetLanguage: 'pt-BR' as const } }
      ];

      const results = await translateBatch(texts);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('1');
      expect(results[0].result.translatedText).toBe('Primeiro texto');
      expect(results[1].id).toBe('2');
      expect(results[1].result.translatedText).toBe('Segundo texto');
    });

    it('should handle errors in batch translation', async () => {
      mockCreate
        .mockResolvedValueOnce({
          content: [{
            type: 'text',
            text: JSON.stringify({
              translatedText: 'Texto traduzido',
              confidence: 90
            })
          }],
          usage: { input_tokens: 50, output_tokens: 40 }
        })
        .mockRejectedValueOnce(new Error('API error'));

      const texts = [
        { id: '1', text: 'First text', options: { contentType: 'blog-post' as const, sourceLanguage: 'en' as const, targetLanguage: 'pt-BR' as const } },
        { id: '2', text: 'Second text', options: { contentType: 'ui-text' as const, sourceLanguage: 'en' as const, targetLanguage: 'pt-BR' as const } }
      ];

      const results = await translateBatch(texts);

      expect(results).toHaveLength(2);
      expect(results[0].error).toBeUndefined();
      expect(results[1].error).toBe('API error');
    });
  });

  describe('utility functions', () => {
    describe('estimateTokenCount', () => {
      it('should estimate token count correctly', () => {
        expect(estimateTokenCount('Hello world')).toBe(3); // 11 chars / 4 = 2.75 -> 3
        expect(estimateTokenCount('A')).toBe(1);
        expect(estimateTokenCount('')).toBe(0);
      });
    });

    describe('estimateCost', () => {
      it('should estimate cost correctly', () => {
        const cost = estimateCost('Hello world'.repeat(100)); // ~1100 characters
        expect(cost).toBeGreaterThan(0);
        expect(cost).toBeLessThan(0.01); // Should be a small amount
      });
    });

    describe('validateApiKey', () => {
      it('should return true when API key is present', () => {
        process.env.ANTHROPIC_API_KEY = 'test-key';
        expect(validateApiKey()).toBe(true);
      });

      it('should return false when API key is missing', () => {
        delete process.env.ANTHROPIC_API_KEY;
        expect(validateApiKey()).toBe(false);
      });
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limiting between requests', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            translatedText: 'Texto traduzido',
            confidence: 90
          })
        }],
        usage: { input_tokens: 50, output_tokens: 40 }
      };

      // Restore setTimeout for this test
      jest.restoreAllMocks();
      
      let callCount = 0;
      const originalSetTimeout = global.setTimeout;
      jest.spyOn(global, 'setTimeout').mockImplementation((fn: (...args: unknown[]) => void, _delay: number) => {
        callCount++;
        return originalSetTimeout(() => fn(), 0); // Execute immediately but count calls
      });

      mockCreate.mockResolvedValue(mockResponse);

      const options: TranslationOptions = {
        contentType: 'blog-post',
        sourceLanguage: 'en',
        targetLanguage: 'pt-BR'
      };
      
      // Make two sequential requests
      await translateContent('First text', options);
      await translateContent('Second text', options);

      // Should have called setTimeout for rate limiting
      expect(callCount).toBeGreaterThan(0);
    });
  });
});