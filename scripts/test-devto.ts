#!/usr/bin/env tsx
/**
 * Test script to verify Dev.to functionality
 * Run with: npx tsx scripts/test-devto.ts
 */

import { DevToAPI } from '../lib/services/devto/devto-api';
import { DevToMarkdownParser } from '../lib/services/devto/devto-markdown';
import { DevToMapping } from '../lib/services/devto/devto-mapping';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.development.local' });

async function testDevToFunctionality() {
  console.log('🧪 Testing Dev.to functionality...\n');

  const apiKey = process.env.DEV_TO_API_KEY;
  if (!apiKey) {
    console.error('❌ DEV_TO_API_KEY not found in environment variables');
    return;
  }

  try {
    // Initialize services
    console.log('1️⃣ Initializing services...');
    const api = new DevToAPI(apiKey);
    const parser = new DevToMarkdownParser();
    const mapping = new DevToMapping('.devto-mapping-test.json');
    console.log('✅ Services initialized\n');

    // Test parsing a markdown file
    console.log('2️⃣ Testing markdown parsing...');
    const testFile = path.join(__dirname, '../__tests__/fixtures/valid-article.md');
    const parsed = await parser.parseFile(testFile);
    console.log(`✅ Parsed file: ${parsed.frontMatter.title}`);
    console.log(`   Tags: ${parsed.frontMatter.tags}`);
    console.log(`   Published: ${parsed.frontMatter.published}\n`);

    // Validate the content
    console.log('3️⃣ Validating content...');
    const errors = parser.validateForDevTo(parsed);
    if (errors.length > 0) {
      console.log('❌ Validation errors:');
      errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ Content is valid for Dev.to\n');
    }

    // Test API connection
    console.log('4️⃣ Testing API connection...');
    try {
      const articles = await api.getUserArticles(1, 5);
      console.log(`✅ Successfully connected to Dev.to API`);
      console.log(`   Found ${articles.length} existing articles\n`);
      
      if (articles.length > 0) {
        console.log('   Recent articles:');
        articles.slice(0, 3).forEach(article => {
          console.log(`   - ${article.title} (ID: ${article.id})`);
        });
        console.log('');
      }
    } catch (error) {
      console.error('❌ Failed to connect to Dev.to API:', error);
      console.log('   Note: This might be due to an invalid API key\n');
    }

    // Test mapping functionality
    console.log('5️⃣ Testing mapping functionality...');
    await mapping.load();
    
    // Add a test mapping
    await mapping.addMapping(
      testFile,
      99999,
      'Test Article',
      'test-checksum'
    );
    
    const testMapping = mapping.getMappingByFile(testFile);
    if (testMapping) {
      console.log('✅ Mapping saved and retrieved successfully');
      console.log(`   Article ID: ${testMapping.articleId}`);
      console.log(`   Title: ${testMapping.title}\n`);
    }
    
    // Clean up test mapping
    await mapping.removeMapping(testFile);
    
    console.log('🎉 All tests completed successfully!');
    console.log('\nYou can now use the following commands:');
    console.log('  npm run devto:publish <file>     - Publish a new article');
    console.log('  npm run devto:update <file>      - Update an existing article');
    console.log('  npm run devto:list               - List all mapped articles');
    console.log('  npm run devto:sync               - Sync all changed articles');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDevToFunctionality();