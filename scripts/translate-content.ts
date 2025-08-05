#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import { translateContent, estimateCost, validateApiKey, type TranslationOptions } from '../lib/services/translation/claude-translator';

// Configuration
const CONTENT_ROOT = join(process.cwd(), 'content');
const SUPPORTED_EXTENSIONS = ['.mdx', '.md'];

interface ContentFile {
  path: string;
  relativePath: string;
  content: string;
  type: 'blog' | 'learning-module' | 'other';
  estimatedCost: number;
}

interface TranslationTask {
  sourceFile: ContentFile;
  targetPath: string;
  options: TranslationOptions;
}

// Utility functions
async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(path: string): Promise<void> {
  await fs.mkdir(dirname(path), { recursive: true });
}

function determineContentType(filePath: string): TranslationOptions['contentType'] {
  if (filePath.includes('/blog/')) {
    return 'blog-post';
  } else if (filePath.includes('/learn/')) {
    return 'technical-doc';
  } else if (filePath.includes('/projects/')) {
    return 'project-description';
  }
  return 'technical-doc';
}

function getPortugueseTargetPath(englishPath: string): string {
  // Handle different blog structures
  if (englishPath.includes('/content/blog/published/')) {
    return englishPath.replace('/content/blog/published/', '/content/blog/published/pt-BR/');
  }
  if (englishPath.includes('/content/blog/en/published/')) {
    return englishPath.replace('/content/blog/en/published/', '/content/blog/pt-BR/published/');
  }
  
  // Handle learning paths
  if (englishPath.includes('/content/learn/paths/ai-engineering-fundamentals/en/')) {
    return englishPath.replace('/content/learn/paths/ai-engineering-fundamentals/en/', '/content/learn/paths/ai-engineering-fundamentals/pt-BR/');
  }
  if (englishPath.includes('/content/learn/paths/') && !englishPath.includes('/pt-BR/')) {
    // For paths without explicit /en/ directory
    const pathParts = englishPath.split('/');
    const pathIndex = pathParts.findIndex(part => part === 'paths');
    if (pathIndex !== -1 && pathIndex + 1 < pathParts.length) {
      const courseName = pathParts[pathIndex + 1];
      const restPath = pathParts.slice(pathIndex + 2).join('/');
      return join(dirname(englishPath).replace(`/paths/${courseName}`, `/paths/pt-BR/${courseName}`), basename(englishPath));
    }
  }
  
  // Handle projects
  if (englishPath.includes('/content/projects/published/') && !englishPath.includes('/pt-BR/')) {
    return englishPath.replace('/content/projects/published/', '/content/projects/published/pt-BR/');
  }
  
  return englishPath; // fallback
}

async function scanForMissingTranslations(): Promise<TranslationTask[]> {
  const tasks: TranslationTask[] = [];
  
  console.log(chalk.blue('🔍 Scanning for missing Portuguese translations...\n'));
  
  // Define the specific files we know need translation based on our audit
  const missingContent = [
    // Blog posts
    '/content/blog/published/ai-ethics-in-practice.mdx',
    '/content/blog/published/roi-driven-ai-measuring-maximizing-returns.mdx',
    
    // AI Engineering Fundamentals
    '/content/learn/paths/ai-engineering-fundamentals/en/ai-system-architecture-patterns.mdx',
    '/content/learn/paths/ai-engineering-fundamentals/en/building-production-rag-systems.mdx',
    '/content/learn/paths/ai-engineering-fundamentals/en/capstone-ai-powered-application.mdx',
    '/content/learn/paths/ai-engineering-fundamentals/en/evaluation-testing-ai-systems.mdx',
    '/content/learn/paths/ai-engineering-fundamentals/en/fine-tuning-model-adaptation.mdx',
    '/content/learn/paths/ai-engineering-fundamentals/en/prompt-engineering-mastery.mdx',
    
    // Production AI
    '/content/learn/paths/production-ai/modules/02-ai-system-monitoring.mdx',
    '/content/learn/paths/production-ai/modules/03-scaling-strategies.mdx',
    '/content/learn/paths/production-ai/modules/05-production-platform-project.mdx',
    
    // MCP Fundamentals
    '/content/learn/paths/mcp-fundamentals/modules/00-test-module-example.mdx',
    '/content/learn/paths/mcp-fundamentals/modules/00-test-module-introduction.mdx',
    '/content/learn/paths/mcp-fundamentals/modules/00-test-module.mdx',
    '/content/learn/paths/mcp-fundamentals/modules/01-introduction-to-mcp-simple.mdx',
  ];
  
  for (const relativePath of missingContent) {
    const fullPath = join(process.cwd(), relativePath);
    
    if (await fileExists(fullPath)) {
      const content = await fs.readFile(fullPath, 'utf-8');
      const targetPath = getPortugueseTargetPath(fullPath);
      
      // Check if Portuguese version already exists
      if (!(await fileExists(targetPath))) {
        const contentType = determineContentType(relativePath);
        const estimatedCost = estimateCost(content);
        
        const sourceFile: ContentFile = {
          path: fullPath,
          relativePath,
          content,
          type: relativePath.includes('/blog/') ? 'blog' : 'learning-module',
          estimatedCost
        };
        
        const options: TranslationOptions = {
          contentType,
          sourceLanguage: 'en',
          targetLanguage: 'pt-BR',
          culturalAdaptation: true,
          preserveFormatting: true,
          technicalTerminology: 'mixed'
        };
        
        tasks.push({
          sourceFile,
          targetPath,
          options
        });
        
        console.log(chalk.yellow(`📄 ${relativePath}`));
        console.log(chalk.gray(`   → ${targetPath.replace(process.cwd(), '')}`));
        console.log(chalk.gray(`   💰 Estimated cost: $${estimatedCost.toFixed(4)}\n`));
      }
    } else {
      console.log(chalk.red(`❌ Source file not found: ${relativePath}`));
    }
  }
  
  return tasks;
}

async function translateFile(task: TranslationTask): Promise<boolean> {
  try {
    console.log(chalk.blue(`🌐 Translating: ${task.sourceFile.relativePath}`));
    
    const result = await translateContent(task.sourceFile.content, task.options);
    
    // Ensure target directory exists
    await ensureDir(task.targetPath);
    
    // Write translated content
    await fs.writeFile(task.targetPath, result.translatedText, 'utf-8');
    
    console.log(chalk.green(`✅ Translated: ${task.targetPath.replace(process.cwd(), '')}`));
    console.log(chalk.gray(`   Confidence: ${result.confidence}%`));
    
    if (result.culturalNotes && result.culturalNotes.length > 0) {
      console.log(chalk.cyan(`   Cultural notes: ${result.culturalNotes.join(', ')}`));
    }
    
    console.log('');
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to translate: ${task.sourceFile.relativePath}`));
    console.log(chalk.red(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    console.log('');
    return false;
  }
}

// Commands
const program = new Command();

program
  .name('translate-content')
  .description('Translate content to Portuguese using Claude AI')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan for missing Portuguese translations')
  .action(async () => {
    if (!validateApiKey()) {
      console.log(chalk.red('❌ ANTHROPIC_API_KEY environment variable is required'));
      process.exit(1);
    }
    
    const tasks = await scanForMissingTranslations();
    const totalCost = tasks.reduce((sum, task) => sum + task.sourceFile.estimatedCost, 0);
    
    console.log(chalk.blue('📊 Summary:'));
    console.log(chalk.white(`   Files to translate: ${tasks.length}`));
    console.log(chalk.white(`   Estimated total cost: $${totalCost.toFixed(4)}`));
    
    // Group by type
    const blogTasks = tasks.filter(t => t.sourceFile.type === 'blog');
    const learningTasks = tasks.filter(t => t.sourceFile.type === 'learning-module');
    
    console.log(chalk.white(`   Blog posts: ${blogTasks.length}`));
    console.log(chalk.white(`   Learning modules: ${learningTasks.length}`));
  });

program
  .command('translate')
  .description('Translate missing content to Portuguese')
  .option('--dry-run', 'Show what would be translated without actually doing it')
  .option('--type <type>', 'Only translate specific content type (blog|learning-module)')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (options) => {
    if (!validateApiKey()) {
      console.log(chalk.red('❌ ANTHROPIC_API_KEY environment variable is required'));
      process.exit(1);
    }
    
    const tasks = await scanForMissingTranslations();
    
    // Filter by type if specified
    const filteredTasks = options.type 
      ? tasks.filter(task => task.sourceFile.type === options.type)
      : tasks;
    
    if (filteredTasks.length === 0) {
      console.log(chalk.green('✅ All content is already translated!'));
      return;
    }
    
    const totalCost = filteredTasks.reduce((sum, task) => sum + task.sourceFile.estimatedCost, 0);
    
    console.log(chalk.blue(`🚀 Ready to translate ${filteredTasks.length} files`));
    console.log(chalk.white(`💰 Estimated cost: $${totalCost.toFixed(4)}`));
    
    if (options.dryRun) {
      console.log(chalk.yellow('🔍 DRY RUN - No files will be modified'));
      return;
    }
    
    if (!options.confirm) {
      // In a real implementation, you'd add interactive confirmation here
      console.log(chalk.yellow('⚠️  Add --confirm flag to proceed with translation'));
      return;
    }
    
    // Translate files
    let successful = 0;
    let failed = 0;
    
    for (const task of filteredTasks) {
      const success = await translateFile(task);
      if (success) {
        successful++;
      } else {
        failed++;
      }
    }
    
    console.log(chalk.blue('📈 Translation Complete!'));
    console.log(chalk.green(`✅ Successful: ${successful}`));
    if (failed > 0) {
      console.log(chalk.red(`❌ Failed: ${failed}`));
    }
  });

program
  .command('priority')
  .description('Translate only high-priority content (ai-engineering-fundamentals + blog posts)')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (options) => {
    if (!validateApiKey()) {
      console.log(chalk.red('❌ ANTHROPIC_API_KEY environment variable is required'));
      process.exit(1);
    }
    
    const allTasks = await scanForMissingTranslations();
    
    // Filter to high-priority content
    const priorityTasks = allTasks.filter(task => 
      task.sourceFile.relativePath.includes('/blog/') ||
      task.sourceFile.relativePath.includes('ai-engineering-fundamentals')
    );
    
    if (priorityTasks.length === 0) {
      console.log(chalk.green('✅ All priority content is already translated!'));
      return;
    }
    
    const totalCost = priorityTasks.reduce((sum, task) => sum + task.sourceFile.estimatedCost, 0);
    
    console.log(chalk.blue(`🎯 High-Priority Translation: ${priorityTasks.length} files`));
    console.log(chalk.white(`💰 Estimated cost: $${totalCost.toFixed(4)}`));
    
    if (!options.confirm) {
      console.log(chalk.yellow('⚠️  Add --confirm flag to proceed with translation'));
      return;
    }
    
    // Translate priority files
    let successful = 0;
    let failed = 0;
    
    for (const task of priorityTasks) {
      const success = await translateFile(task);
      if (success) {
        successful++;
      } else {
        failed++;
      }
    }
    
    console.log(chalk.blue('🎯 Priority Translation Complete!'));
    console.log(chalk.green(`✅ Successful: ${successful}`));
    if (failed > 0) {
      console.log(chalk.red(`❌ Failed: ${failed}`));
    }
  });

// Run the program
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export { scanForMissingTranslations, translateFile };