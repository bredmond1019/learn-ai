#!/usr/bin/env tsx
/**
 * Test script for Notion API integration
 * Tests accessing and editing a specific Notion page
 */

import 'dotenv/config'
import { config } from 'dotenv'
import { createNotionClient, createParagraph, createHeading, getPageTitle } from '../lib/services/notion'
import { isNotionError, extractErrorDetails } from '../lib/services/notion/notion-errors'

// Load environment variables
config({ path: '.env.development.local' })

async function testNotionAPI() {
  console.log('🚀 Testing Notion API Service...\n')

  try {
    // Initialize client
    const notion = createNotionClient()
    console.log('✅ Notion client initialized')

    // Extract page ID from URL
    // URL: https://www.notion.so/Learn-Agentic-AI-24647f4e622b80bba146e4b181ed10ff
    const pageId = '24647f4e622b80bba146e4b181ed10ff'
    console.log(`📄 Page ID: ${pageId}`)

    // Test 1: Retrieve the page
    console.log('\n📖 Retrieving page...')
    const page = await notion.getPage(pageId)
    console.log(`✅ Page retrieved successfully!`)
    console.log(`   Title: ${getPageTitle(page)}`)
    console.log(`   Created: ${new Date(page.created_time).toLocaleDateString()}`)
    console.log(`   URL: ${page.url}`)

    // Test 2: Get page content
    console.log('\n📋 Fetching page content...')
    const content = await notion.getAllPageContent(pageId)
    console.log(`✅ Found ${content.length} blocks in the page`)
    
    // Show first few blocks
    console.log('\n📝 First few blocks:')
    content.slice(0, 3).forEach((block, index) => {
      console.log(`   ${index + 1}. Type: ${block.type}`)
    })

    // Test 3: Make a small edit - add a timestamp note
    console.log('\n✏️ Making a small edit...')
    const timestamp = new Date().toLocaleString()
    const newContent = await notion.appendBlocks(pageId, {
      children: [
        createHeading('API Test Section', 3),
        createParagraph(`✅ Successfully accessed via Notion API on ${timestamp}`),
        createParagraph('This section was added programmatically using the new Notion API service.')
      ]
    })
    console.log('✅ Content added successfully!')

    // Test 4: Update page icon (optional - uncomment if you want to test)
    // console.log('\n🎨 Updating page icon...')
    // const updatedPage = await notion.updatePage(pageId, {
    //   icon: { type: 'emoji', emoji: '🤖' }
    // })
    // console.log('✅ Page icon updated!')

    console.log('\n🎉 All tests passed! The Notion API service is working correctly.')
    console.log('\n💡 Check your Notion page to see the changes:')
    console.log(`   ${page.url}`)

  } catch (error) {
    console.error('\n❌ Error occurred:')
    
    if (isNotionError(error)) {
      const details = extractErrorDetails(error)
      console.error(`   Type: ${details.code || 'Unknown'}`)
      console.error(`   Message: ${details.message}`)
      if (details.status) {
        console.error(`   Status: ${details.status}`)
      }
      
      // Provide helpful guidance based on error type
      if (details.status === 401) {
        console.error('\n💡 Make sure your NOTION_KEY environment variable is set correctly.')
      } else if (details.status === 403) {
        console.error('\n💡 Make sure the integration has access to this page:')
        console.error('   1. Open the page in Notion')
        console.error('   2. Click the "..." menu in the top right')
        console.error('   3. Select "Add connections"')
        console.error('   4. Add your integration')
      } else if (details.status === 404) {
        console.error('\n💡 The page was not found. Check that the page ID is correct.')
      }
    } else {
      console.error(error)
    }
    
    process.exit(1)
  }
}

// Run the test
testNotionAPI()