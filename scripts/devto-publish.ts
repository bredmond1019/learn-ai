#!/usr/bin/env node

/**
 * Dev.to Publishing CLI
 * Command-line tool for publishing markdown files to Dev.to
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import { config } from 'dotenv';

import { DevToAPI, DevToAPIError } from '../lib/devto-api';
import { DevToMarkdownParser } from '../lib/devto-markdown';
import { DevToMapping } from '../lib/devto-mapping';

// Load environment variables
config({ path: '.env.development.local' });
config({ path: '.env.local' });
config({ path: '.env' });

const API_KEY = process.env.DEV_TO_API_KEY;

if (!API_KEY) {
  console.error(chalk.red('Error: DEV_TO_API_KEY not found in environment variables'));
  process.exit(1);
}

// Initialize services
const api = new DevToAPI(API_KEY);
const parser = new DevToMarkdownParser();
const mapping = new DevToMapping();

// Load mappings on startup
mapping.load().catch(() => {
  console.log(chalk.yellow('No existing mapping file found. Will create new one.'));
});

/**
 * Publish a single markdown file
 */
async function publishFile(filePath: string, options: any) {
  const spinner = ora(`Publishing ${path.basename(filePath)}...`).start();

  try {
    // Parse markdown file
    const parsed = await parser.parseFile(filePath);
    
    // Validate content
    const errors = parser.validateForDevTo(parsed);
    if (errors.length > 0) {
      spinner.fail('Validation failed');
      errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
      return;
    }

    // Check if already published
    const existingMapping = mapping.getMappingByFile(filePath);
    
    if (existingMapping && !options.force) {
      spinner.fail('Article already published');
      console.log(chalk.yellow(`  Article ID: ${existingMapping.articleId}`));
      console.log(chalk.yellow(`  Use --force to republish or use the update command`));
      return;
    }

    // Convert to Dev.to format
    const article = parser.toDevToArticle(parsed);
    
    // Override published status if draft option is set
    if (options.draft) {
      article.published = false;
    }

    // Create article
    const response = await api.createArticle(article);
    
    // Calculate checksum
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const checksum = await DevToMapping.calculateChecksum(fileContent);
    
    // Save mapping
    await mapping.addMapping(
      filePath,
      response.id,
      response.title,
      checksum
    );

    spinner.succeed('Article published successfully!');
    console.log(chalk.green(`  Title: ${response.title}`));
    console.log(chalk.green(`  URL: ${response.url}`));
    console.log(chalk.green(`  ID: ${response.id}`));
    
  } catch (error) {
    spinner.fail('Failed to publish article');
    if (error instanceof DevToAPIError) {
      console.error(chalk.red(`  API Error: ${error.message}`));
      if (error.response) {
        console.error(chalk.red(`  Details: ${JSON.stringify(error.response, null, 2)}`));
      }
    } else {
      console.error(chalk.red(`  Error: ${error}`));
    }
  }
}

/**
 * Update an existing article
 */
async function updateFile(filePath: string, options: any) {
  const spinner = ora(`Updating ${path.basename(filePath)}...`).start();

  try {
    // Check mapping
    const existingMapping = mapping.getMappingByFile(filePath);
    
    if (!existingMapping) {
      spinner.fail('Article not found in mappings');
      console.log(chalk.yellow('  Use the publish command to create a new article'));
      return;
    }

    // Check if file has changed
    if (!options.force && !(await mapping.hasFileChanged(filePath))) {
      spinner.info('No changes detected');
      return;
    }

    // Parse markdown file
    const parsed = await parser.parseFile(filePath);
    
    // Validate content
    const errors = parser.validateForDevTo(parsed);
    if (errors.length > 0) {
      spinner.fail('Validation failed');
      errors.forEach(error => console.error(chalk.red(`  - ${error}`)));
      return;
    }

    // Convert to Dev.to format
    const article = parser.toDevToArticle(parsed);
    
    // Update article
    const response = await api.updateArticle(existingMapping.articleId, article);
    
    // Update mapping with new checksum
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const checksum = await DevToMapping.calculateChecksum(fileContent);
    
    await mapping.addMapping(
      filePath,
      response.id,
      response.title,
      checksum
    );

    spinner.succeed('Article updated successfully!');
    console.log(chalk.green(`  Title: ${response.title}`));
    console.log(chalk.green(`  URL: ${response.url}`));
    
  } catch (error) {
    spinner.fail('Failed to update article');
    if (error instanceof DevToAPIError) {
      console.error(chalk.red(`  API Error: ${error.message}`));
    } else {
      console.error(chalk.red(`  Error: ${error}`));
    }
  }
}

/**
 * Unpublish an article
 */
async function unpublishFile(filePath: string) {
  const spinner = ora(`Unpublishing ${path.basename(filePath)}...`).start();

  try {
    // Check mapping
    const existingMapping = mapping.getMappingByFile(filePath);
    
    if (!existingMapping) {
      spinner.fail('Article not found in mappings');
      return;
    }

    // Note: The unpublish endpoint requires admin/moderator role
    // For regular users, we'll update the article to draft status instead
    const parsed = await parser.parseFile(filePath);
    const article = parser.toDevToArticle(parsed);
    article.published = false;
    
    await api.updateArticle(existingMapping.articleId, article);
    
    spinner.succeed('Article unpublished (set to draft)');
    console.log(chalk.green(`  Article ID: ${existingMapping.articleId}`));
    
  } catch (error) {
    spinner.fail('Failed to unpublish article');
    console.error(chalk.red(`  Error: ${error}`));
  }
}

/**
 * Publish all files in a directory
 */
async function publishDirectory(dirPath: string, options: any) {
  console.log(chalk.blue(`Publishing all markdown files in ${dirPath}...`));

  try {
    const files = await fs.readdir(dirPath);
    const markdownFiles = files
      .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
      .map(file => path.join(dirPath, file));

    if (markdownFiles.length === 0) {
      console.log(chalk.yellow('No markdown files found in directory'));
      return;
    }

    console.log(chalk.blue(`Found ${markdownFiles.length} markdown files\n`));

    for (const file of markdownFiles) {
      await publishFile(file, options);
      console.log(''); // Empty line between files
    }

  } catch (error) {
    console.error(chalk.red(`Failed to read directory: ${error}`));
  }
}

/**
 * Sync all changed files
 */
async function syncAll() {
  const spinner = ora('Checking for changed files...').start();

  try {
    const needsSync = await mapping.getMappingsNeedingSync();
    
    if (needsSync.length === 0) {
      spinner.succeed('All files are up to date');
      return;
    }

    spinner.succeed(`Found ${needsSync.length} files that need syncing`);
    console.log('');

    for (const fileMapping of needsSync) {
      await updateFile(fileMapping.filePath, { force: false });
      console.log('');
    }

  } catch (error) {
    spinner.fail('Sync failed');
    console.error(chalk.red(`  Error: ${error}`));
  }
}

/**
 * List all mapped articles
 */
async function listMappings() {
  await mapping.load();
  const mappings = mapping.getAllMappings();
  
  if (mappings.length === 0) {
    console.log(chalk.yellow('No articles mapped yet'));
    return;
  }

  console.log(chalk.blue(`\nMapped Articles (${mappings.length}):\n`));
  
  for (const m of mappings) {
    console.log(chalk.green(`📄 ${path.basename(m.filePath)}`));
    console.log(`   Article ID: ${m.articleId}`);
    console.log(`   Title: ${m.title}`);
    console.log(`   Last Synced: ${new Date(m.lastSynced).toLocaleString()}`);
    console.log(`   Path: ${m.filePath}`);
    console.log('');
  }
}

// Create CLI program
const program = new Command();

program
  .name('devto-publish')
  .description('CLI tool for publishing markdown files to Dev.to')
  .version('1.0.0');

// Publish command
program
  .command('publish <file>')
  .description('Publish a markdown file to Dev.to')
  .option('-d, --draft', 'Publish as draft')
  .option('-f, --force', 'Force republish even if already published')
  .action(publishFile);

// Update command
program
  .command('update <file>')
  .description('Update an existing Dev.to article')
  .option('-f, --force', 'Force update even if no changes detected')
  .action(updateFile);

// Unpublish command
program
  .command('unpublish <file>')
  .description('Unpublish an article (set to draft)')
  .action(unpublishFile);

// Publish directory command
program
  .command('publish-dir <directory>')
  .description('Publish all markdown files in a directory')
  .option('-d, --draft', 'Publish as drafts')
  .option('-f, --force', 'Force republish existing articles')
  .action(publishDirectory);

// Sync command
program
  .command('sync')
  .description('Sync all changed files')
  .action(syncAll);

// List command
program
  .command('list')
  .description('List all mapped articles')
  .action(listMappings);

// Parse command line arguments
program.parse(process.argv);