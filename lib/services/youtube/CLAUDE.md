# YouTube Transcript Service Documentation

This service provides comprehensive YouTube video transcript fetching and management capabilities.

## Overview

The YouTube transcript service offers:
- Transcript extraction without API keys (using youtubei.js)
- Multiple export formats (TXT, MD, SRT, VTT, JSON)
- Video metadata fetching
- Local storage and search capabilities
- Smart formatting with paragraph detection

## Core Components

### `youtube-api-v2.ts`
Modern transcript fetcher using Innertube (youtubei.js).

**Key Features:**
- No API key required for transcripts
- Handles multiple caption tracks
- Extracts video metadata
- Efficient connection reuse

**Key Methods:**
```typescript
extractVideoId(url: string): string
fetchTranscript(videoId: string, language?: string): Promise<TranscriptData>
getVideoMetadata(videoId: string): Promise<VideoMetadata>
getAvailableLanguages(videoId: string): Promise<string[]>
```

### `youtube-api.ts`
Legacy API wrapper (deprecated, redirects to v2).

**Note:** This file exists for backward compatibility but all methods now use youtube-api-v2.ts internally.

### `youtube-transcript.ts`
Content formatting and export engine.

**Export Formats:**
- **TXT**: Plain text with optional timestamps
- **MD**: Markdown with metadata header
- **SRT**: SubRip subtitle format
- **VTT**: WebVTT for HTML5 video
- **JSON**: Raw data structure

**Smart Features:**
- Paragraph detection (2+ second gaps)
- Multiple timestamp formats
- Metadata preservation
- Chunk creation for search

### `youtube-mapping.ts`
Storage and indexing system.

**Key Features:**
- File-based storage in `/content/youtube-transcripts/`
- Metadata tracking and search
- Update detection
- Statistics generation

**Storage Structure:**
```typescript
interface StoredTranscript {
  videoId: string
  title: string
  author: string
  channelId: string
  publishedAt: string
  duration: string
  transcript: TranscriptData
  fetchedAt: string
  lastUpdated: string
  language: string
  wordCount: number
}
```

## CLI Usage

### Fetching Transcripts

```bash
# Basic fetch
npx tsx scripts/youtube-transcript.ts fetch <url>

# With options
npx tsx scripts/youtube-transcript.ts fetch <url> \
  -l es                    # Spanish language
  -f md                    # Markdown format
  --no-timestamps          # Exclude timestamps
  --no-metadata           # Skip metadata
```

### Managing Transcripts

```bash
# Update existing
npx tsx scripts/youtube-transcript.ts update <url>

# List all
npx tsx scripts/youtube-transcript.ts list \
  -s date                  # Sort by date
  -r                       # Reverse order

# Search
npx tsx scripts/youtube-transcript.ts search "keyword"

# Export format
npx tsx scripts/youtube-transcript.ts export <video-id> \
  -f srt                   # Export as SRT
  -o output.srt           # Custom output path

# Remove
npx tsx scripts/youtube-transcript.ts remove <video-id>
```

## Export Format Examples

### Markdown Format
```markdown
# Video Title

**Author:** Channel Name  
**Published:** 2024-01-01  
**Duration:** 10:23  
**URL:** https://youtube.com/watch?v=...

## Transcript

[00:00:00] First paragraph text...

[00:00:30] Second paragraph text...
```

### SRT Format
```srt
1
00:00:00,000 --> 00:00:05,000
First subtitle line

2
00:00:05,000 --> 00:00:10,000
Second subtitle line
```

## Programmatic Usage

### Basic Transcript Fetching

```typescript
import { YouTubeAPIv2 } from '@/lib/services/youtube/youtube-api-v2'
import { TranscriptFormatter } from '@/lib/services/youtube/youtube-transcript'

const api = new YouTubeAPIv2()
const formatter = new TranscriptFormatter()

// Fetch transcript
const videoId = api.extractVideoId(url)
const transcript = await api.fetchTranscript(videoId)
const metadata = await api.getVideoMetadata(videoId)

// Format for display
const formatted = formatter.formatMarkdown(transcript, {
  includeTimestamps: true,
  timestampFormat: 'hms',
  paragraphBreaks: true
}, metadata)
```

### Storage and Search

```typescript
import { YouTubeMapping } from '@/lib/services/youtube/youtube-mapping'

const mapping = new YouTubeMapping()
await mapping.initialize()

// Store transcript
await mapping.add(videoId, transcript, metadata)

// Search transcripts
const results = await mapping.search('machine learning')

// Get statistics
const stats = await mapping.getStatistics()
console.log(`Total videos: ${stats.totalVideos}`)
console.log(`Total words: ${stats.totalWords}`)
```

## Smart Formatting

### Paragraph Detection

The formatter automatically detects paragraph breaks:
- Gaps > 2 seconds create paragraph breaks
- Maintains readability for long transcripts
- Preserves speaker intent

### Timestamp Options

```typescript
timestampFormat: 'seconds'  // 125.5
timestampFormat: 'hms'      // 02:05.5
timestampFormat: 'brackets' // [02:05]
```

## File Storage

Transcripts are stored in:
```
content/youtube-transcripts/
├── .youtube-mapping.json    # Index (gitignored)
├── video-title.txt         # Formatted transcript
├── video-title.json        # Raw data
└── ...
```

## Error Handling

### Common Issues

1. **No Captions Available**
   ```typescript
   Error: No captions found for video
   Solution: Check if video has captions enabled
   ```

2. **Private/Deleted Video**
   ```typescript
   Error: Video not found (404)
   Solution: Ensure video is publicly accessible
   ```

3. **Language Not Available**
   ```typescript
   Error: Language 'xx' not found
   Solution: Check available languages first
   ```

### Error Recovery

```typescript
try {
  const transcript = await api.fetchTranscript(videoId)
} catch (error) {
  if (error instanceof YouTubeAPIError) {
    if (error.statusCode === 404) {
      // Handle missing video
    }
  }
}
```

## Performance Optimization

1. **Connection Reuse**: Innertube session persists across requests
2. **Async Operations**: All I/O operations are non-blocking
3. **Efficient Storage**: JSON format enables quick re-formatting
4. **Search Indexing**: Full-text search without external dependencies

## Integration Points

### Blog System Integration
- Reference transcripts in blog posts
- Generate blog posts from transcripts
- Link to specific timestamps

### Learning Module Integration
- Use transcripts as supplementary material
- Create quizzes from video content
- Navigate by topic timestamps

## Best Practices

1. **Update Frequency**: Refresh transcripts > 30 days old
2. **Language Selection**: Always specify language for non-English
3. **Format Choice**: Use JSON for programmatic access, MD for reading
4. **Storage Management**: Periodically clean up unused transcripts
5. **Error Handling**: Always wrap API calls in try-catch blocks