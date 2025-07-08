import { TranscriptData, TranscriptSegment } from './youtube-api';

export interface TranscriptFormatOptions {
  includeTimestamps?: boolean;
  timestampFormat?: 'seconds' | 'hms' | 'brackets';
  paragraphBreaks?: boolean;
  speakerLabels?: boolean;
}

export interface TranscriptExportOptions extends TranscriptFormatOptions {
  format: 'txt' | 'md' | 'srt' | 'vtt' | 'json';
}

export class TranscriptFormatter {
  /**
   * Format transcript as plain text
   */
  formatText(
    transcript: TranscriptData, 
    options: TranscriptFormatOptions = {}
  ): string {
    const {
      includeTimestamps = false,
      timestampFormat = 'hms',
      paragraphBreaks = true
    } = options;

    let output = '';
    let lastEndTime = 0;

    transcript.segments.forEach((segment, index) => {
      if (includeTimestamps) {
        const timestamp = this.formatTimestamp(segment.start, timestampFormat);
        output += `[${timestamp}] `;
      }

      output += segment.text;

      // Add paragraph breaks based on timing gaps
      if (paragraphBreaks && index < transcript.segments.length - 1) {
        const nextSegment = transcript.segments[index + 1];
        const gap = nextSegment.start - (segment.start + segment.duration);
        
        if (gap > 2) {
          output += '\n\n';
        } else {
          output += ' ';
        }
      } else {
        output += ' ';
      }

      lastEndTime = segment.start + segment.duration;
    });

    return output.trim();
  }

  /**
   * Format transcript as Markdown
   */
  formatMarkdown(
    transcript: TranscriptData,
    options: TranscriptFormatOptions = {},
    metadata?: {
      title?: string;
      author?: string;
      date?: string;
      url?: string;
    }
  ): string {
    let output = '';

    // Add metadata header if provided
    if (metadata) {
      output += `# ${metadata.title || 'Transcript'}\n\n`;
      
      if (metadata.author) {
        output += `**Author:** ${metadata.author}\n`;
      }
      if (metadata.date) {
        output += `**Date:** ${metadata.date}\n`;
      }
      if (metadata.url) {
        output += `**Source:** [${metadata.url}](${metadata.url})\n`;
      }
      
      output += '\n---\n\n';
    }

    // Format transcript content
    const textContent = this.formatText(transcript, {
      ...options,
      includeTimestamps: true,
      timestampFormat: 'hms',
      paragraphBreaks: true
    });

    // Split into paragraphs and format
    const paragraphs = textContent.split('\n\n');
    paragraphs.forEach(paragraph => {
      output += paragraph + '\n\n';
    });

    return output.trim();
  }

  /**
   * Format transcript as SRT (SubRip subtitle format)
   */
  formatSRT(transcript: TranscriptData): string {
    let output = '';
    
    transcript.segments.forEach((segment, index) => {
      output += `${index + 1}\n`;
      output += `${this.formatSRTTimestamp(segment.start)} --> ${this.formatSRTTimestamp(segment.start + segment.duration)}\n`;
      output += `${segment.text}\n\n`;
    });

    return output.trim();
  }

  /**
   * Format transcript as WebVTT
   */
  formatVTT(transcript: TranscriptData): string {
    let output = 'WEBVTT\n\n';
    
    transcript.segments.forEach((segment, index) => {
      output += `${index + 1}\n`;
      output += `${this.formatVTTTimestamp(segment.start)} --> ${this.formatVTTTimestamp(segment.start + segment.duration)}\n`;
      output += `${segment.text}\n\n`;
    });

    return output.trim();
  }

  /**
   * Format transcript as JSON
   */
  formatJSON(transcript: TranscriptData, pretty = true): string {
    if (pretty) {
      return JSON.stringify(transcript, null, 2);
    }
    return JSON.stringify(transcript);
  }

  /**
   * Export transcript in specified format
   */
  export(
    transcript: TranscriptData,
    options: TranscriptExportOptions,
    metadata?: any
  ): string {
    switch (options.format) {
      case 'txt':
        return this.formatText(transcript, options);
      case 'md':
        return this.formatMarkdown(transcript, options, metadata);
      case 'srt':
        return this.formatSRT(transcript);
      case 'vtt':
        return this.formatVTT(transcript);
      case 'json':
        return this.formatJSON(transcript);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Format timestamp in various formats
   */
  private formatTimestamp(seconds: number, format: 'seconds' | 'hms' | 'brackets'): string {
    switch (format) {
      case 'seconds':
        return seconds.toFixed(1);
      case 'brackets':
        return `[${this.secondsToHMS(seconds)}]`;
      case 'hms':
      default:
        return this.secondsToHMS(seconds);
    }
  }

  /**
   * Convert seconds to HH:MM:SS format
   */
  private secondsToHMS(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format timestamp for SRT format (HH:MM:SS,mmm)
   */
  private formatSRTTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
  }

  /**
   * Format timestamp for VTT format (HH:MM:SS.mmm)
   */
  private formatVTTTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  }

  /**
   * Create searchable chunks from transcript
   */
  createChunks(
    transcript: TranscriptData,
    options: {
      chunkSize?: number;
      overlap?: number;
    } = {}
  ): Array<{
    text: string;
    startTime: number;
    endTime: number;
    segments: TranscriptSegment[];
  }> {
    const { chunkSize = 500, overlap = 50 } = options;
    const chunks: Array<{
      text: string;
      startTime: number;
      endTime: number;
      segments: TranscriptSegment[];
    }> = [];

    let currentChunk = '';
    let currentSegments: TranscriptSegment[] = [];
    let chunkStartTime = 0;

    transcript.segments.forEach((segment, index) => {
      const segmentText = segment.text + ' ';
      
      if (currentChunk.length + segmentText.length > chunkSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          text: currentChunk.trim(),
          startTime: chunkStartTime,
          endTime: currentSegments[currentSegments.length - 1].start + 
                   currentSegments[currentSegments.length - 1].duration,
          segments: [...currentSegments]
        });

        // Start new chunk with overlap
        const overlapSegments = currentSegments.slice(-Math.ceil(overlap / 50));
        currentChunk = overlapSegments.map(s => s.text).join(' ') + ' ';
        currentSegments = [...overlapSegments];
        chunkStartTime = currentSegments[0].start;
      }

      currentChunk += segmentText;
      currentSegments.push(segment);

      if (currentSegments.length === 1) {
        chunkStartTime = segment.start;
      }
    });

    // Add final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        startTime: chunkStartTime,
        endTime: currentSegments[currentSegments.length - 1].start + 
                 currentSegments[currentSegments.length - 1].duration,
        segments: currentSegments
      });
    }

    return chunks;
  }
}