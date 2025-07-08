import { promises as fs } from 'fs';
import path from 'path';
import { VideoMetadata, TranscriptData } from './youtube-api';

export interface TranscriptMapping {
  videoId: string;
  url: string;
  title: string;
  author: string;
  downloadedAt: string;
  lastUpdated: string;
  filePath: string;
  language: string;
  metadata?: VideoMetadata;
  transcriptStats?: {
    wordCount: number;
    duration: number;
    segmentCount: number;
  };
}

export interface MappingData {
  version: string;
  transcripts: { [videoId: string]: TranscriptMapping };
}

export class YouTubeMappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YouTubeMappingError';
  }
}

export class YouTubeMapping {
  private mappingPath: string;
  private transcriptsDir: string;
  private mappingData: MappingData | null = null;

  constructor(storageDir?: string) {
    const baseDir = storageDir || process.env.YOUTUBE_TRANSCRIPT_DIR || 'content/youtube-transcripts';
    this.mappingPath = path.join(baseDir, '.youtube-mapping.json');
    this.transcriptsDir = baseDir;
  }

  /**
   * Initialize mapping file and directory structure
   */
  async initialize(): Promise<void> {
    // Create directories if they don't exist
    await fs.mkdir(this.transcriptsDir, { recursive: true });

    // Load or create mapping file
    try {
      const data = await fs.readFile(this.mappingPath, 'utf-8');
      this.mappingData = JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Create new mapping file
        this.mappingData = {
          version: '1.0',
          transcripts: {}
        };
        await this.save();
      } else {
        throw new YouTubeMappingError(`Failed to load mapping file: ${error.message}`);
      }
    }
  }

  /**
   * Save mapping data to file
   */
  private async save(): Promise<void> {
    if (!this.mappingData) {
      throw new YouTubeMappingError('Mapping data not initialized');
    }

    const data = JSON.stringify(this.mappingData, null, 2);
    await fs.writeFile(this.mappingPath, data, 'utf-8');
  }

  /**
   * Check if a video transcript exists
   */
  async exists(videoId: string): Promise<boolean> {
    if (!this.mappingData) await this.initialize();
    return videoId in this.mappingData!.transcripts;
  }

  /**
   * Get transcript mapping for a video
   */
  async get(videoId: string): Promise<TranscriptMapping | null> {
    if (!this.mappingData) await this.initialize();
    return this.mappingData!.transcripts[videoId] || null;
  }

  /**
   * Get all transcript mappings
   */
  async getAll(): Promise<TranscriptMapping[]> {
    if (!this.mappingData) await this.initialize();
    return Object.values(this.mappingData!.transcripts);
  }

  /**
   * Add or update a transcript mapping
   */
  async add(
    videoId: string,
    transcript: TranscriptData,
    metadata?: VideoMetadata
  ): Promise<TranscriptMapping> {
    if (!this.mappingData) await this.initialize();

    const fileName = this.sanitizeFileName(metadata?.title || videoId);
    const filePath = path.join(this.transcriptsDir, `${fileName}.txt`);

    // Calculate transcript statistics
    const wordCount = transcript.fullText.split(/\s+/).length;
    const duration = transcript.segments.length > 0
      ? transcript.segments[transcript.segments.length - 1].start + 
        transcript.segments[transcript.segments.length - 1].duration
      : 0;

    const mapping: TranscriptMapping = {
      videoId,
      url: metadata?.url || `https://www.youtube.com/watch?v=${videoId}`,
      title: metadata?.title || videoId,
      author: metadata?.author || 'Unknown',
      downloadedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      filePath,
      language: transcript.language,
      metadata,
      transcriptStats: {
        wordCount,
        duration,
        segmentCount: transcript.segments.length
      }
    };

    this.mappingData!.transcripts[videoId] = mapping;
    await this.save();

    return mapping;
  }

  /**
   * Update last updated timestamp
   */
  async updateTimestamp(videoId: string): Promise<void> {
    if (!this.mappingData) await this.initialize();
    
    if (this.mappingData!.transcripts[videoId]) {
      this.mappingData!.transcripts[videoId].lastUpdated = new Date().toISOString();
      await this.save();
    }
  }

  /**
   * Remove a transcript mapping
   */
  async remove(videoId: string): Promise<void> {
    if (!this.mappingData) await this.initialize();
    
    const mapping = this.mappingData!.transcripts[videoId];
    if (mapping) {
      // Delete the transcript file
      try {
        await fs.unlink(mapping.filePath);
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          console.warn(`Failed to delete transcript file: ${error.message}`);
        }
      }

      // Remove from mapping
      delete this.mappingData!.transcripts[videoId];
      await this.save();
    }
  }

  /**
   * Get transcript file path
   */
  getTranscriptPath(videoId: string, format = 'txt'): string {
    const mapping = this.mappingData?.transcripts[videoId];
    if (!mapping) {
      throw new YouTubeMappingError(`No mapping found for video: ${videoId}`);
    }

    const basePath = mapping.filePath.replace(/\.[^.]+$/, '');
    return `${basePath}.${format}`;
  }

  /**
   * Save transcript to file
   */
  async saveTranscript(
    videoId: string,
    content: string,
    format = 'txt'
  ): Promise<string> {
    const mapping = await this.get(videoId);
    if (!mapping) {
      throw new YouTubeMappingError(`No mapping found for video: ${videoId}`);
    }

    const filePath = this.getTranscriptPath(videoId, format);
    await fs.writeFile(filePath, content, 'utf-8');
    
    return filePath;
  }

  /**
   * Load transcript from file
   */
  async loadTranscript(videoId: string, format = 'txt'): Promise<string> {
    const filePath = this.getTranscriptPath(videoId, format);
    return await fs.readFile(filePath, 'utf-8');
  }

  /**
   * Check if transcript needs update
   */
  async needsUpdate(videoId: string, metadata?: VideoMetadata): Promise<boolean> {
    const mapping = await this.get(videoId);
    if (!mapping) return true;

    // Check if metadata has changed (title, author)
    if (metadata) {
      if (mapping.title !== metadata.title || mapping.author !== metadata.author) {
        return true;
      }
    }

    // Check if file still exists
    try {
      await fs.access(mapping.filePath);
    } catch {
      return true;
    }

    // Could add more checks here (e.g., age of transcript)
    const daysSinceUpdate = (Date.now() - new Date(mapping.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 30; // Update if older than 30 days
  }

  /**
   * Sanitize filename for safe filesystem storage
   */
  private sanitizeFileName(name: string): string {
    return name
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .toLowerCase()
      .substring(0, 200); // Limit length
  }

  /**
   * Search transcripts by keyword
   */
  async search(keyword: string): Promise<TranscriptMapping[]> {
    if (!this.mappingData) await this.initialize();
    
    const results: TranscriptMapping[] = [];
    const searchTerm = keyword.toLowerCase();

    for (const mapping of Object.values(this.mappingData!.transcripts)) {
      // Search in title and author
      if (
        mapping.title.toLowerCase().includes(searchTerm) ||
        mapping.author.toLowerCase().includes(searchTerm)
      ) {
        results.push(mapping);
        continue;
      }

      // Search in transcript content
      try {
        const content = await this.loadTranscript(mapping.videoId);
        if (content.toLowerCase().includes(searchTerm)) {
          results.push(mapping);
        }
      } catch {
        // Skip if transcript can't be loaded
      }
    }

    return results;
  }

  /**
   * Get statistics about all transcripts
   */
  async getStats(): Promise<{
    totalTranscripts: number;
    totalWords: number;
    totalDuration: number;
    languages: { [lang: string]: number };
    authors: { [author: string]: number };
  }> {
    if (!this.mappingData) await this.initialize();

    const stats = {
      totalTranscripts: 0,
      totalWords: 0,
      totalDuration: 0,
      languages: {} as { [lang: string]: number },
      authors: {} as { [author: string]: number }
    };

    for (const mapping of Object.values(this.mappingData!.transcripts)) {
      stats.totalTranscripts++;
      
      if (mapping.transcriptStats) {
        stats.totalWords += mapping.transcriptStats.wordCount;
        stats.totalDuration += mapping.transcriptStats.duration;
      }

      // Count languages
      stats.languages[mapping.language] = (stats.languages[mapping.language] || 0) + 1;

      // Count authors
      stats.authors[mapping.author] = (stats.authors[mapping.author] || 0) + 1;
    }

    return stats;
  }
}