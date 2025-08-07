/**
 * Notion Hub API
 * Helper functions for managing the Learn Agentic AI hub in Notion
 */

import { createNotionClient } from './index'
import type { NotionClient } from './notion-client'
import type { 
  CreatePageRequest, 
  UpdatePageRequest,
  CreateBlockData,
  RichText,
  NotionColor,
  Block
} from './notion-types'
import { 
  getOrganizedContent, 
  getLearningTracks, 
  getContentRelationships,
  storeNotionPageId,
  getNotionPageId,
  savePageMappings,
  loadPageMappings,
  type NotionContent,
  type LearningTrack
} from '../../../scripts/notion-content-mapper'
import fs from 'fs/promises'
import path from 'path'

// Hub configuration
export const HUB_CONFIG = {
  rootPageId: '24647f4e622b80bba146e4b181ed10ff',
  contentLibraryId: '', // Will be set when created
  learningTracksId: '', // Will be set when created
  technicalGuidesId: '', // Will be set when created
  quickStartId: '' // Will be set when created
}

// Initialize Notion client
let notionClient: NotionClient | null = null

function getNotionClient(): NotionClient {
  if (!notionClient) {
    notionClient = createNotionClient()
  }
  return notionClient
}

// Rich text formatting helpers
export function createRichText(text: string, options?: {
  bold?: boolean
  italic?: boolean
  color?: NotionColor
  link?: string
}): RichText[] {
  return [{
    type: 'text',
    text: {
      content: text,
      link: options?.link ? { url: options.link } : null
    },
    annotations: {
      bold: options?.bold ?? false,
      italic: options?.italic ?? false,
      strikethrough: false,
      underline: false,
      code: false,
      color: options?.color ?? 'default'
    },
    plain_text: text,
    href: options?.link ?? null
  }]
}

// Create formatted text with multiple segments
export function createFormattedText(segments: Array<{
  content: string
  bold?: boolean
  italic?: boolean
  color?: NotionColor
  link?: string
}>): RichText[] {
  return segments.map(segment => ({
    type: 'text',
    text: {
      content: segment.content,
      link: segment.link ? { url: segment.link } : null
    },
    annotations: {
      bold: segment.bold ?? false,
      italic: segment.italic ?? false,
      strikethrough: false,
      underline: false,
      code: false,
      color: segment.color ?? 'default'
    },
    plain_text: segment.content,
    href: segment.link ?? null
  }))
}

// Create a content page (video or blog)
export async function createContentPage(
  content: NotionContent,
  parentId: string,
  fullContent?: string
): Promise<string> {
  const notion = getNotionClient()
  
  // Check if page already exists
  const existingId = getNotionPageId(content.slug)
  if (existingId) {
    console.log(`   ⚠️  Page already exists for ${content.slug}`)
    return existingId
  }
  
  const icon = content.type === 'video' ? '📺' : '📝'
  const blocks: CreateBlockData[] = []
  
  // Add metadata block
  if (content.metadata.date || content.metadata.author || content.metadata.duration) {
    const metadataSegments = []
    if (content.metadata.date) metadataSegments.push(`📅 ${content.metadata.date}`)
    if (content.metadata.author) metadataSegments.push(`✍️ ${content.metadata.author}`)
    if (content.metadata.duration) metadataSegments.push(`⏱️ ${content.metadata.duration}`)
    
    blocks.push({
      type: 'callout',
      callout: {
        rich_text: createRichText(metadataSegments.join(' • ')),
        icon: { type: 'emoji', emoji: '📊' },
        color: 'gray_background'
      }
    })
  }
  
  // Add excerpt or summary
  if (content.metadata.excerpt || fullContent) {
    blocks.push({
      type: 'callout',
      callout: {
        rich_text: createRichText(
          content.metadata.excerpt || 
          fullContent?.substring(0, 200) + '...' || 
          'Content summary'
        ),
        icon: { type: 'emoji', emoji: '💡' },
        color: 'blue_background'
      }
    })
  }
  
  // Add tags
  if (content.tags.length > 0) {
    blocks.push({
      type: 'paragraph',
      paragraph: {
        rich_text: createFormattedText([
          { content: '🏷️ Tags: ', bold: true },
          { content: content.tags.join(', '), italic: true }
        ])
      }
    })
  }
  
  // Add full content if provided
  if (fullContent) {
    blocks.push({
      type: 'divider',
      divider: {}
    })
    
    // Parse and add content blocks (simplified for now)
    const contentBlocks = parseContentToBlocks(fullContent, content.type)
    blocks.push(...contentBlocks)
  } else {
    // Add link to full content
    blocks.push({
      type: 'divider',
      divider: {}
    })
    
    if (content.type === 'blog') {
      blocks.push({
        type: 'paragraph',
        paragraph: {
          rich_text: createRichText(
            `📖 Read full article at: learn-agentic-ai.com/blog/${content.slug}`
          )
        }
      })
    }
  }
  
  try {
    const page = await notion.createPage({
      parent: { page_id: parentId },
      icon: { type: 'emoji', emoji: icon },
      properties: {
        title: {
          title: createRichText(content.title)
        }
      },
      children: blocks
    })
    
    // Store the page ID
    storeNotionPageId(content.slug, page.id)
    await savePageMappings()
    
    return page.id
  } catch (error) {
    console.error(`Failed to create page for ${content.slug}:`, error)
    throw error
  }
}

// Create a learning track page
export async function createTrackPage(
  track: LearningTrack,
  parentId: string
): Promise<string> {
  const notion = getNotionClient()
  
  const blocks: CreateBlockData[] = [
    // Track description
    {
      type: 'paragraph',
      paragraph: {
        rich_text: createRichText(track.description, { italic: true })
      }
    },
    
    // Statistics
    {
      type: 'callout',
      callout: {
        rich_text: createFormattedText([
          { content: '📊 Track Statistics', bold: true },
          { content: `\n• ${track.videoCount} Video Summaries` },
          { content: `\n• ${track.blogCount} Blog Articles` },
          { content: `\n• ${track.difficultyRange}` }
        ]),
        icon: { type: 'emoji', emoji: '📈' },
        color: 'purple_background'
      }
    },
    
    {
      type: 'divider',
      divider: {}
    },
    
    // Sections headers will be added when content is organized
    {
      type: 'heading_2',
      heading_2: {
        rich_text: createRichText('📺 Video Content')
      }
    },
    
    {
      type: 'paragraph',
      paragraph: {
        rich_text: createRichText('Video summaries will be added here as child pages.', { italic: true })
      }
    },
    
    {
      type: 'divider',
      divider: {}
    },
    
    {
      type: 'heading_2',
      heading_2: {
        rich_text: createRichText('📖 Articles')
      }
    },
    
    {
      type: 'paragraph',
      paragraph: {
        rich_text: createRichText('Blog articles will be added here as child pages.', { italic: true })
      }
    }
  ]
  
  try {
    const page = await notion.createPage({
      parent: { page_id: parentId },
      icon: { type: 'emoji', emoji: track.icon },
      properties: {
        title: {
          title: createRichText(track.title)
        }
      },
      children: blocks
    })
    
    // Store the track page ID
    storeNotionPageId(track.slug, page.id)
    track.id = page.id
    
    return page.id
  } catch (error) {
    console.error(`Failed to create track page for ${track.slug}:`, error)
    throw error
  }
}

// Parse content to Notion blocks
function parseContentToBlocks(content: string, contentType: 'video' | 'blog'): CreateBlockData[] {
  const blocks: CreateBlockData[] = []
  const lines = content.split('\n')
  
  let inCodeBlock = false
  let codeContent: string[] = []
  let codeLanguage = 'plain text'
  
  for (const line of lines) {
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push({
          type: 'code',
          code: {
            rich_text: createRichText(codeContent.join('\n')),
            language: codeLanguage as any
          }
        })
        codeContent = []
        inCodeBlock = false
      } else {
        // Start code block
        inCodeBlock = true
        codeLanguage = line.slice(3).trim() || 'plain text'
        // Map common languages to Notion's supported languages
        const languageMap: Record<string, string> = {
          'js': 'javascript',
          'ts': 'typescript',
          'py': 'python',
          'sh': 'shell',
          'bash': 'shell',
          'yml': 'yaml',
          'json': 'json',
          'text': 'plain text'
        }
        codeLanguage = languageMap[codeLanguage] || 'plain text'
      }
      continue
    }
    
    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }
    
    // Skip empty lines
    if (!line.trim()) continue
    
    // Handle headers
    if (line.startsWith('## ')) {
      blocks.push({
        type: 'heading_2',
        heading_2: {
          rich_text: createRichText(line.slice(3))
        }
      })
    } else if (line.startsWith('### ')) {
      blocks.push({
        type: 'heading_3',
        heading_3: {
          rich_text: createRichText(line.slice(4))
        }
      })
    } else if (line.startsWith('- ')) {
      // Bullet points
      blocks.push({
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: createRichText(line.slice(2))
        }
      })
    } else if (line.startsWith('**') && line.endsWith('**')) {
      // Bold text as callout
      blocks.push({
        type: 'callout',
        callout: {
          rich_text: createRichText(line.slice(2, -2)),
          icon: { type: 'emoji', emoji: '💡' },
          color: 'gray_background'
        }
      })
    } else {
      // Regular paragraph
      blocks.push({
        type: 'paragraph',
        paragraph: {
          rich_text: createRichText(line)
        }
      })
    }
  }
  
  // Limit blocks to prevent API errors
  return blocks.slice(0, 50)
}

// Update hub navigation
export async function updateHubNavigation(hubId: string = HUB_CONFIG.rootPageId) {
  const notion = getNotionClient()
  
  // Get hub statistics
  const content = await getOrganizedContent()
  const tracks = await getLearningTracks()
  
  const blocks: CreateBlockData[] = [
    {
      type: 'heading_1',
      heading_1: {
        rich_text: createRichText('🎓 Learn Agentic AI')
      }
    },
    {
      type: 'paragraph',
      paragraph: {
        rich_text: createRichText(
          'Master AI engineering through structured learning paths featuring expert insights, practical tutorials, and production-ready patterns.'
        )
      }
    },
    {
      type: 'callout',
      callout: {
        rich_text: createFormattedText([
          { content: '📊 Learning Resources', bold: true },
          { content: `\n• ${content.videos.length} Video Summaries` },
          { content: `\n• ${content.blogs.length} Blog Posts` },
          { content: `\n• ${tracks.length} Learning Paths` },
          { content: '\n• 100+ Actionable Insights' }
        ]),
        icon: { type: 'emoji', emoji: '🚀' },
        color: 'purple_background'
      }
    }
  ]
  
  try {
    // Clear existing content first (except child pages)
    const existingBlocks = await notion.getAllPageContent(hubId)
    for (const block of existingBlocks) {
      if (block.type !== 'child_page') {
        try {
          await notion.deleteBlock(block.id)
        } catch (err) {
          // Ignore deletion errors
        }
      }
    }
    
    // Add new blocks
    await notion.appendBlocks(hubId, { children: blocks })
    
    console.log('✅ Hub navigation updated')
  } catch (error) {
    console.error('Failed to update hub navigation:', error)
    throw error
  }
}

// Link related content
export async function linkRelatedContent(videoId: string, blogId: string) {
  const notion = getNotionClient()
  
  try {
    // Add reference to blog page from video
    await notion.appendBlocks(videoId, {
      children: [{
        type: 'callout',
        callout: {
          rich_text: createFormattedText([
            { content: '📝 Related Blog Post: ', bold: true },
            { content: 'Click to read the written version', link: blogId }
          ]),
          icon: { type: 'emoji', emoji: '🔗' },
          color: 'blue_background'
        }
      }]
    })
    
    // Add reference to video page from blog
    await notion.appendBlocks(blogId, {
      children: [{
        type: 'callout',
        callout: {
          rich_text: createFormattedText([
            { content: '📺 Related Video: ', bold: true },
            { content: 'Watch the video summary', link: videoId }
          ]),
          icon: { type: 'emoji', emoji: '🔗' },
          color: 'purple_background'
        }
      }]
    })
    
    console.log('✅ Linked related content')
  } catch (error) {
    console.error('Failed to link related content:', error)
  }
}

// Add new content to existing hub
export async function addNewContent(content: {
  title: string
  type: 'video' | 'blog'
  slug: string
  learningPath: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  fullContent?: string
}) {
  // Load existing mappings
  await loadPageMappings()
  
  // Find the appropriate track
  const trackId = getNotionPageId(content.learningPath)
  if (!trackId) {
    throw new Error(`Learning track not found: ${content.learningPath}`)
  }
  
  // Create the content as NotionContent
  const notionContent: NotionContent = {
    title: content.title,
    type: content.type,
    slug: content.slug,
    learningPath: content.learningPath,
    difficulty: content.difficulty,
    tags: [content.learningPath, content.difficulty],
    metadata: {}
  }
  
  // Create the page
  const pageId = await createContentPage(notionContent, trackId, content.fullContent)
  
  console.log(`✅ Added new ${content.type}: ${content.title}`)
  return pageId
}

// Create main hub sections
export async function createHubSections(parentId: string = HUB_CONFIG.rootPageId) {
  const notion = getNotionClient()
  
  const sections = [
    {
      title: '📚 Content Library',
      description: 'Browse all video summaries and blog posts',
      slug: 'content-library'
    },
    {
      title: '🎯 Learning Tracks',
      description: 'Structured learning paths for different goals',
      slug: 'learning-tracks'
    },
    {
      title: '🛠️ Technical Guides',
      description: 'Implementation guides and technical documentation',
      slug: 'technical-guides'
    },
    {
      title: '🚀 Quick Start',
      description: 'Get started with AI engineering',
      slug: 'quick-start'
    }
  ]
  
  const sectionIds: Record<string, string> = {}
  
  for (const section of sections) {
    try {
      const page = await notion.createPage({
        parent: { page_id: parentId },
        icon: { type: 'emoji', emoji: section.title.split(' ')[0] },
        properties: {
          title: {
            title: createRichText(section.title)
          }
        },
        children: [{
          type: 'paragraph',
          paragraph: {
            rich_text: createRichText(section.description, { italic: true })
          }
        }]
      })
      
      sectionIds[section.slug] = page.id
      storeNotionPageId(section.slug, page.id)
    } catch (error) {
      console.error(`Failed to create section ${section.title}:`, error)
    }
  }
  
  // Update config
  HUB_CONFIG.contentLibraryId = sectionIds['content-library'] || ''
  HUB_CONFIG.learningTracksId = sectionIds['learning-tracks'] || ''
  HUB_CONFIG.technicalGuidesId = sectionIds['technical-guides'] || ''
  HUB_CONFIG.quickStartId = sectionIds['quick-start'] || ''
  
  await savePageMappings()
  
  return sectionIds
}