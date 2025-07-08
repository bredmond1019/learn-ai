import { Innertube } from 'youtubei.js';
import { VideoMetadata, TranscriptData, TranscriptSegment, YouTubeAPIError } from './youtube-api';

export class YouTubeAPIv2 {
  private innertubePromise: Promise<Innertube> | null = null;

  private async getInnertube(): Promise<Innertube> {
    if (!this.innertubePromise) {
      this.innertubePromise = Innertube.create();
    }
    return this.innertubePromise;
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
   * Fetch video metadata using Innertube
   */
  async getVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
    try {
      const youtube = await this.getInnertube();
      const info = await youtube.getInfo(videoId);
      
      const basicInfo = info.basic_info;
      
      return {
        id: videoId,
        title: basicInfo.title || 'Unknown Title',
        author: basicInfo.author || 'Unknown Author',
        channelId: basicInfo.channel_id || '',
        publishedAt: '', // Not directly available in basic_info
        duration: `PT${basicInfo.duration}S`, // Convert seconds to ISO duration
        description: basicInfo.short_description || '',
        thumbnailUrl: basicInfo.thumbnail?.[0]?.url || '',
        url: `https://www.youtube.com/watch?v=${videoId}`
      };
    } catch (error: any) {
      console.error('Failed to fetch video metadata:', error);
      return null;
    }
  }

  /**
   * Fetch transcript using Innertube
   */
  async fetchTranscript(
    videoId: string,
    options?: { language?: string }
  ): Promise<TranscriptData> {
    try {
      const youtube = await this.getInnertube();
      const info = await youtube.getInfo(videoId);
      
      const transcriptData = await info.getTranscript();
      
      if (!transcriptData || !transcriptData.transcript) {
        throw new YouTubeAPIError(
          'No transcript available for this video',
          404
        );
      }

      const transcript = transcriptData.transcript;
      const segments: TranscriptSegment[] = [];
      let fullText = '';

      // Process transcript content
      if (transcript.content && transcript.content.body) {
        const cues = transcript.content.body.initial_segments || [];
        
        for (const cue of cues) {
          if (cue.start_ms && cue.end_ms && cue.snippet) {
            const text = cue.snippet.text || '';
            const start = cue.start_ms / 1000; // Convert to seconds
            const duration = (cue.end_ms - cue.start_ms) / 1000;
            
            segments.push({
              text,
              start,
              duration
            });
            
            fullText += text + ' ';
          }
        }
      }

      fullText = fullText.trim().replace(/\s+/g, ' ');

      if (segments.length === 0) {
        throw new YouTubeAPIError(
          'No transcript segments found for this video',
          404
        );
      }

      return {
        videoId,
        language: options?.language || 'en',
        segments,
        fullText
      };
    } catch (error: any) {
      if (error instanceof YouTubeAPIError) {
        throw error;
      }
      
      console.error('Transcript fetch error:', error);
      throw new YouTubeAPIError(
        `Failed to fetch transcript: ${error.message}`,
        undefined,
        error
      );
    }
  }

  /**
   * Format duration from seconds to human readable
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}