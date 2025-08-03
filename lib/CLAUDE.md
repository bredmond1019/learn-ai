# Library Services Documentation

This directory contains essential service APIs and utilities for the portfolio site.

## Services Overview

1. **YouTube Transcript API** - Fetch and manage YouTube video transcripts
2. **Dev.to Publishing API** - Publish and manage articles on Dev.to platform
3. **Content Management** - MDX processing, caching, and content utilities
4. **Translation Services** - AI-powered content translation with Claude

---

# Dev.to Publishing API

## Quick Start

The Dev.to API integration enables publishing blog posts directly from markdown files to Dev.to.

### Basic Commands

```bash
# Publish a single article
npm run devto:publish <file-path>

# Publish with options
npm run devto:publish <file> -- --draft    # Publish as draft
npm run devto:publish <file> -- --force    # Force republish

# Publish entire directory (e.g., series)
npm run devto:publish-dir <directory-path>

# Update existing article
npm run devto:update <file-path>

# List all published articles
npm run devto:list

# Sync changed articles
npm run devto:sync
```

### Multi-Part Series Publishing

For publishing article series (like the Claude Code series):

```bash
# Publish series in order
npm run devto:publish content/socials/dev-to/series/part-1.md
npm run devto:publish content/socials/dev-to/series/part-2.md
npm run devto:publish content/socials/dev-to/series/part-3.md

# Or publish entire directory
npm run devto:publish-dir content/socials/dev-to/series/
```

## Architecture

### Core Components

1. **DevToAPI** (`devto-api.ts`): API client with rate limiting
   - Handles all Dev.to API interactions
   - Built-in rate limiting (30 requests/30 seconds)
   - Error handling and retry logic

2. **DevToMarkdown** (`devto-markdown.ts`): Content processor
   - Parses markdown frontmatter
   - Validates YAML structure
   - Handles special characters and formatting

3. **DevToMapping** (`devto-mapping.ts`): Article tracking
   - Maps local files to Dev.to article IDs
   - Tracks publication status
   - Detects content changes for syncing

### Programmatic Usage

```typescript
import { DevToAPI } from '@/lib/devto-api';
import { DevToMarkdown } from '@/lib/devto-markdown';
import { DevToMapping } from '@/lib/devto-mapping';

// Initialize services
const api = new DevToAPI(process.env.DEV_TO_API_KEY);
const markdown = new DevToMarkdown();
const mapping = new DevToMapping();

// Publish article
const content = await markdown.parseFile('article.md');
const article = await api.createArticle({
  title: content.title,
  body_markdown: content.content,
  published: true,
  tags: content.tags,
  series: content.series
});

// Track publication
await mapping.set('article.md', article.id);
```

## Markdown Format Requirements

```markdown
---
title: "Article Title"           # Required, quote if contains colons
published: true                   # true/false for publication status
tags: ai, programming, claude     # Max 4 tags, comma-separated
series: "Series Name"             # Optional, for multi-part articles
description: "Brief summary"      # Optional, article excerpt
canonical_url: "https://..."      # Optional, original source URL
cover_image: "https://..."        # Optional, article header image
---

Article content in markdown...
```

## Common Issues & Solutions

### YAML Parsing Errors
- **Problem**: Title contains colon without quotes
- **Solution**: Wrap title in quotes: `title: "Part 1: Introduction"`

### Rate Limiting
- **Problem**: "Rate limit reached" error
- **Solution**: Wait 30 seconds between bulk operations

### Duplicate Publication
- **Problem**: Article already published error
- **Solution**: Use `--force` flag or `npm run devto:update`

### Missing Mapping File
- **Problem**: Lost track of published articles
- **Solution**: `.devto-mapping.json` stores mappings (gitignored)

## Website URL References

When linking back to the main site in Dev.to articles:
- Main site: `https://learn-agentic-ai.com`
- Blog posts: `https://learn-agentic-ai.com/blog/[slug]`
- Learning paths: `https://learn-agentic-ai.com/en/learn/paths/[path-id]`

---

# YouTube Transcript API Service Documentation

The YouTube transcript fetching and management system for the portfolio site.

## Architecture Overview

The YouTube transcript service is built with a modular architecture consisting of:

1. **YouTubeAPI** (`youtube-api.ts`): Legacy API wrapper (deprecated)
   - Basic video metadata fetching using YouTube Data API v3
   - Deprecated transcript methods redirect to v2

2. **YouTubeAPIv2** (`youtube-api-v2.ts`): Modern transcript fetcher
   - Uses `youtubei.js` (Innertube) for transcript extraction
   - No API key required for transcript fetching
   - Handles video metadata and transcript segments

3. **TranscriptFormatter** (`youtube-transcript.ts`): Content formatting engine
   - Multiple export formats: TXT, MD, SRT, VTT, JSON
   - Timestamp formatting options
   - Smart paragraph detection based on timing gaps
   - Searchable chunk creation for large transcripts

4. **YouTubeMapping** (`youtube-mapping.ts`): Storage and indexing system
   - File-based transcript storage in `/content/youtube-transcripts/`
   - Mapping file (`.youtube-mapping.json`) tracks all transcripts
   - Metadata preservation and search capabilities
   - Update detection and versioning

## Usage Patterns

### CLI Usage (Primary Interface)

```bash
# Fetch a new transcript
npx tsx scripts/youtube-transcript.ts fetch <url> [options]
  -l, --language <lang>    Transcript language (default: en)
  -f, --format <format>    Export format (txt, md, srt, vtt, json)
  --no-timestamps          Exclude timestamps from output
  --no-metadata           Skip fetching video metadata

# Update existing transcript
npx tsx scripts/youtube-transcript.ts update <url> [options]

# List all transcripts
npx tsx scripts/youtube-transcript.ts list
  -s, --sort <field>      Sort by: date, title, author, duration
  -r, --reverse           Reverse sort order

# Export transcript in different format
npx tsx scripts/youtube-transcript.ts export <video-id> [options]
  -f, --format <format>   Export format
  -o, --output <path>     Output file path

# Search transcripts
npx tsx scripts/youtube-transcript.ts search <keyword>

# Remove transcript
npx tsx scripts/youtube-transcript.ts remove <video-id>
  -f, --force            Force removal without confirmation
```

### Programmatic Usage

```typescript
import { YouTubeAPIv2 } from '@/lib/youtube-api-v2';
import { TranscriptFormatter } from '@/lib/youtube-transcript';
import { YouTubeMapping } from '@/lib/youtube-mapping';

// Initialize services
const api = new YouTubeAPIv2();
const formatter = new TranscriptFormatter();
const mapping = new YouTubeMapping();

// Fetch transcript
const videoId = api.extractVideoId(url);
const transcript = await api.fetchTranscript(videoId);
const metadata = await api.getVideoMetadata(videoId);

// Store transcript
await mapping.initialize();
await mapping.add(videoId, transcript, metadata);

// Format and export
const formatted = formatter.formatMarkdown(transcript, {
  includeTimestamps: true,
  timestampFormat: 'hms',
  paragraphBreaks: true
}, metadata);

// Save to file
await mapping.saveTranscript(videoId, formatted, 'md');
```

## Data Flow

1. **URL Input** → Extract video ID
2. **Fetch Phase**:
   - Metadata via Innertube (no API key needed)
   - Transcript segments via Innertube
3. **Processing**:
   - Parse transcript segments with timing
   - Calculate statistics (word count, duration)
   - Format according to export options
4. **Storage**:
   - Save formatted transcript to file system
   - Update mapping index with metadata
   - Store raw JSON for re-formatting

## File Structure

```
content/youtube-transcripts/
├── .youtube-mapping.json          # Index of all transcripts (gitignored)
├── video-title-1.txt             # Formatted transcript
├── video-title-1.json            # Raw transcript data
├── video-title-2.md              # Markdown formatted
└── ...
```

## Key Features

### Smart Formatting
- **Paragraph Detection**: Automatically inserts paragraph breaks when gaps > 2 seconds
- **Timestamp Options**: Multiple formats (seconds, HH:MM:SS, [HH:MM:SS])
- **Cultural Adaptation**: Handles multiple languages with proper encoding

### Search & Discovery
- Full-text search across all transcripts
- Metadata search (title, author)
- Statistics tracking (word count, duration, languages)

### Update Management
- Detects when transcripts need updating (> 30 days old)
- Metadata change detection
- Preserves original download timestamps

### Export Flexibility
- **TXT**: Plain text with optional timestamps
- **MD**: Markdown with metadata header and formatting
- **SRT/VTT**: Standard subtitle formats for video players
- **JSON**: Raw data for programmatic use

## Error Handling

The service includes comprehensive error handling:

```typescript
try {
  const transcript = await api.fetchTranscript(videoId);
} catch (error) {
  if (error instanceof YouTubeAPIError) {
    if (error.statusCode === 404) {
      // Video not found or no captions available
    }
  }
}
```

## Performance Considerations

- **Innertube Connection**: Reused across requests for efficiency
- **File I/O**: Async operations prevent blocking
- **Memory Usage**: Streaming not required due to typical transcript sizes
- **Cache Strategy**: Raw JSON stored for quick re-formatting

## Security Notes

- No API keys stored in code
- YouTube Data API key optional (only for enhanced metadata)
- File names sanitized to prevent path traversal
- Content stored locally, no external dependencies

## Integration Points

### With Blog System
- YouTube transcripts can be referenced in blog posts
- Potential for automatic blog post generation from transcripts
- Search integration for finding relevant video content

### With Learning Modules
- Video transcripts as supplementary learning material
- Timestamp-based navigation for specific topics
- Quiz generation from transcript content

## Common Issues & Solutions

### No Transcript Available
- Some videos don't have captions
- Try different language options
- Check if video is private or age-restricted

### Innertube Connection Errors
- Usually temporary, retry after a moment
- Check network connectivity
- May indicate YouTube API changes

### Large Transcript Handling
- Use chunk creation for search indexing
- Consider pagination for display
- JSON format preserves all segment data