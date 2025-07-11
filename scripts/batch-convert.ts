import { processLearningPath } from './mdx-to-heygen';
import path from 'path';
import fs from 'fs';
import { MODULE_TEMPLATES, selectTemplate } from './heygen-templates';

const PRIORITY_PATHS = [
  'ai-systems-intro',        // 10 modules - Beginner friendly
  'mcp-fundamentals',        // 5 modules - Visual demos valuable  
  'claude-code-mastery',     // 5 modules - Tool demonstrations
  'ai-engineering-fundamentals' // 6 modules - Core concepts
];

interface ConversionStats {
  totalModules: number;
  successfulConversions: number;
  failedConversions: number;
  totalDuration: number;
  estimatedCost: number;
}

async function batchConvert() {
  const contentDir = path.join(process.cwd(), 'content/learn/paths');
  const stats: ConversionStats = {
    totalModules: 0,
    successfulConversions: 0,
    failedConversions: 0,
    totalDuration: 0,
    estimatedCost: 0
  };
  
  console.log('🚀 Starting HeyGen Batch Conversion');
  console.log('='.repeat(50));
  console.log(`Processing ${PRIORITY_PATHS.length} learning paths`);
  console.log('');
  
  // Create results directory
  const resultsDir = path.join(process.cwd(), 'heygen-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Process each learning path
  for (const pathName of PRIORITY_PATHS) {
    const pathDir = path.join(contentDir, pathName);
    
    console.log(`\n📁 Processing ${pathName}...`);
    console.log('-'.repeat(40));
    
    try {
      // Check if path exists
      if (!fs.existsSync(pathDir)) {
        console.error(`❌ Path not found: ${pathDir}`);
        continue;
      }
      
      // Count modules
      const modulesDir = path.join(pathDir, 'modules');
      if (fs.existsSync(modulesDir)) {
        const mdxFiles = fs.readdirSync(modulesDir).filter(f => f.endsWith('.mdx'));
        stats.totalModules += mdxFiles.length;
        console.log(`   Found ${mdxFiles.length} modules`);
      }
      
      // Process the path
      await processLearningPath(pathDir);
      
      // Read results
      const videoMappingPath = path.join(pathDir, 'video-mapping.json');
      if (fs.existsSync(videoMappingPath)) {
        const results = JSON.parse(fs.readFileSync(videoMappingPath, 'utf-8'));
        stats.successfulConversions += results.length;
        
        // Calculate total duration
        results.forEach((result: any) => {
          if (result.script && result.script.duration) {
            stats.totalDuration += result.script.duration;
          }
        });
        
        // Copy results to central location
        fs.copyFileSync(
          videoMappingPath,
          path.join(resultsDir, `${pathName}-videos.json`)
        );
      }
      
      console.log(`✅ ${pathName} completed successfully`);
      
    } catch (error) {
      console.error(`❌ ${pathName} failed:`, error);
      stats.failedConversions++;
    }
    
    // Wait between paths to avoid rate limits
    console.log('   Waiting 10 seconds before next path...');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  // Calculate estimated cost (5 credits per 5-minute video)
  stats.estimatedCost = Math.ceil(stats.totalDuration / 5) * 5;
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Batch Conversion Complete!');
  console.log('='.repeat(50));
  console.log('\n📊 Conversion Statistics:');
  console.log(`   Total Modules: ${stats.totalModules}`);
  console.log(`   Successful: ${stats.successfulConversions}`);
  console.log(`   Failed: ${stats.failedConversions}`);
  console.log(`   Total Video Duration: ${Math.ceil(stats.totalDuration)} minutes`);
  console.log(`   Estimated Credits Needed: ${stats.estimatedCost}`);
  console.log(`   Estimated Cost: $${(stats.estimatedCost * 1.2).toFixed(2)} (at ~$1.20/credit)`);
  
  // Generate summary report
  const summaryReport = {
    timestamp: new Date().toISOString(),
    stats,
    paths: PRIORITY_PATHS,
    resultsDirectory: resultsDir
  };
  
  fs.writeFileSync(
    path.join(resultsDir, 'conversion-summary.json'),
    JSON.stringify(summaryReport, null, 2)
  );
  
  console.log(`\n📁 Results saved to: ${resultsDir}`);
  console.log('\n🎯 Next Steps:');
  console.log('   1. Review generated video scripts in heygen-results/');
  console.log('   2. Upload to HeyGen and generate videos');
  console.log('   3. Add video URLs to module JSON files');
  console.log('   4. Test videos in the learning platform');
}

// Dry run to preview what will be converted
async function dryRun() {
  const contentDir = path.join(process.cwd(), 'content/learn/paths');
  let totalModules = 0;
  let estimatedDuration = 0;
  
  console.log('🔍 Dry Run - Analyzing modules for conversion');
  console.log('='.repeat(50));
  
  for (const pathName of PRIORITY_PATHS) {
    const pathDir = path.join(contentDir, pathName);
    const modulesDir = path.join(pathDir, 'modules');
    
    if (!fs.existsSync(modulesDir)) {
      console.log(`❌ ${pathName}: Path not found`);
      continue;
    }
    
    const mdxFiles = fs.readdirSync(modulesDir).filter(f => f.endsWith('.mdx'));
    const jsonFiles = fs.readdirSync(modulesDir).filter(f => f.endsWith('.json'));
    
    console.log(`\n📁 ${pathName}:`);
    console.log(`   MDX files: ${mdxFiles.length}`);
    console.log(`   JSON files: ${jsonFiles.length}`);
    
    // Estimate duration based on module count (5 minutes average)
    const pathDuration = mdxFiles.length * 5;
    estimatedDuration += pathDuration;
    totalModules += mdxFiles.length;
    
    console.log(`   Estimated duration: ${pathDuration} minutes`);
    
    // List first 3 modules
    console.log('   Sample modules:');
    mdxFiles.slice(0, 3).forEach(file => {
      console.log(`     - ${file}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Dry Run Summary:');
  console.log(`   Total modules to convert: ${totalModules}`);
  console.log(`   Estimated total duration: ${estimatedDuration} minutes`);
  console.log(`   Estimated credits needed: ${estimatedDuration}`);
  console.log(`   Estimated cost: $${(estimatedDuration * 1.2).toFixed(2)}`);
  console.log('\nRun with --convert flag to start conversion');
}

// CLI handling
const args = process.argv.slice(2);
const shouldConvert = args.includes('--convert');
const isDryRun = args.includes('--dry-run') || !shouldConvert;

if (isDryRun) {
  dryRun().catch(console.error);
} else {
  batchConvert().catch(console.error);
}