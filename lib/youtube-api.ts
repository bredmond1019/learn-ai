// Removed youtube-transcript import - now using youtubei.js in youtube-api-v2.ts

export interface VideoMetadata {
  id: string;
  title: string;
  author: string;
  channelId: string;
  publishedAt: string;
  duration: string;
  description: string;
  thumbnailUrl: string;
  url: string;
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface TranscriptData {
  videoId: string;
  language: string;
  segments: TranscriptSegment[];
  fullText: string;
  metadata?: VideoMetadata;
}

export class YouTubeAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'YouTubeAPIError';
  }
}

export class YouTubeAPI {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.YOUTUBE_API_KEY;
  }

  /**
   * Extract video ID from various YouTube URL formats
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Fetch video metadata using YouTube Data API v3
   */
  async getVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
    if (!this.apiKey) {
      console.warn('YouTube API key not provided, metadata will be limited');
      return null;
    }

    try {
      const url = new URL('https://www.googleapis.com/youtube/v3/videos');
      url.searchParams.append('id', videoId);
      url.searchParams.append('part', 'snippet,contentDetails,status');
      url.searchParams.append('key', this.apiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new YouTubeAPIError(
          `Failed to fetch video metadata: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new YouTubeAPIError('Video not found', 404);
      }

      const video = data.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;

      return {
        id: videoId,
        title: snippet.title,
        author: snippet.channelTitle,
        channelId: snippet.channelId,
        publishedAt: snippet.publishedAt,
        duration: contentDetails.duration,
        description: snippet.description,
        thumbnailUrl: snippet.thumbnails.maxres?.url || 
                      snippet.thumbnails.high?.url || 
                      snippet.thumbnails.medium?.url ||
                      snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/watch?v=${videoId}`
      };
    } catch (error) {
      if (error instanceof YouTubeAPIError) {
        throw error;
      }
      throw new YouTubeAPIError(
        'Failed to fetch video metadata',
        undefined,
        error
      );
    }
  }

  /**
   * Fetch transcript - deprecated, use YouTubeAPIv2 instead
   */
  async fetchTranscript(
    videoId: string, 
    options?: { language?: string }
  ): Promise<TranscriptData> {
    throw new YouTubeAPIError(
      'This method is deprecated. Please use YouTubeAPIv2 for transcript fetching.',
      501
    );
  }

  /**
   * Get available transcript languages - deprecated, use YouTubeAPIv2 instead
   */
  async getAvailableLanguages(videoId: string): Promise<string[]> {
    throw new YouTubeAPIError(
      'This method is deprecated. Please use YouTubeAPIv2 for language detection.',
      501
    );
  }

  /**
   * Format duration from ISO 8601 to human readable
   */
  formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return isoDuration;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  }
}