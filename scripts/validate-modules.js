#!/usr/bin/env node

/**
 * Module Validation Script
 * 
 * This script validates all learning modules against the standardized schema
 * to ensure consistent structure and compliance with the metadata wrapper format.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

/**
 * Load and parse the module schema
 */
function loadSchema() {
  try {
    const schemaPath = path.join(__dirname, '../content/learn/schemas/module-schema.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    return JSON.parse(schemaContent);
  } catch (error) {
    console.error(`${colors.red}Error loading schema:${colors.reset}`, error.message);
    process.exit(1);
  }
}

/**
 * Load and parse a module file
 */
function loadModule(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Validate module structure against schema requirements
 */
function validateModuleStructure(module, filePath) {
  const issues = [];
  
  // Check for required top-level properties
  if (!module.metadata) {
    issues.push({
      type: 'error',
      message: 'Missing required "metadata" wrapper object'
    });
    return issues; // Can't continue without metadata
  }
  
  if (!module.sections) {
    issues.push({
      type: 'error',
      message: 'Missing required "sections" array'
    });
  }
  
  // Validate metadata structure
  const metadata = module.metadata;
  const requiredMetadataFields = [
    'id', 'pathId', 'title', 'description', 'duration', 
    'difficulty', 'order', 'objectives', 'author', 'version', 'lastUpdated'
  ];
  
  requiredMetadataFields.forEach(field => {
    if (metadata[field] === undefined || metadata[field] === null) {
      issues.push({
        type: 'error',
        message: `Missing required metadata field: ${field}`
      });
    }
  });
  
  // Validate metadata field types and formats
  if (metadata.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(metadata.id)) {
    issues.push({
      type: 'error',
      message: 'metadata.id must be in kebab-case format'
    });
  }
  
  if (metadata.pathId && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(metadata.pathId)) {
    issues.push({
      type: 'error',
      message: 'metadata.pathId must be in kebab-case format'
    });
  }
  
  if (metadata.duration && !/^\d+\s+(minutes?|hours?)$/.test(metadata.duration)) {
    issues.push({
      type: 'warning',
      message: 'metadata.duration should be in format "X minutes" or "X hours"'
    });
  }
  
  if (metadata.difficulty && !['beginner', 'intermediate', 'advanced'].includes(metadata.difficulty)) {
    issues.push({
      type: 'error',
      message: 'metadata.difficulty must be one of: beginner, intermediate, advanced'
    });
  }
  
  if (metadata.version && !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
    issues.push({
      type: 'warning',
      message: 'metadata.version should follow semantic versioning (e.g., "1.0.0")'
    });
  }
  
  if (metadata.lastUpdated && !/^\d{4}-\d{2}-\d{2}$/.test(metadata.lastUpdated)) {
    issues.push({
      type: 'warning',
      message: 'metadata.lastUpdated should be in YYYY-MM-DD format'
    });
  }
  
  if (metadata.objectives && !Array.isArray(metadata.objectives)) {
    issues.push({
      type: 'error',
      message: 'metadata.objectives must be an array'
    });
  }
  
  // Validate sections structure
  if (module.sections && Array.isArray(module.sections)) {
    module.sections.forEach((section, index) => {
      if (!section.id) {
        issues.push({
          type: 'error',
          message: `Section ${index + 1} missing required "id" field`
        });
      }
      
      if (!section.title) {
        issues.push({
          type: 'error',
          message: `Section ${index + 1} missing required "title" field`
        });
      }
      
      if (!section.type) {
        issues.push({
          type: 'error',
          message: `Section ${index + 1} missing required "type" field`
        });
      }
      
      if (!section.order || typeof section.order !== 'number') {
        issues.push({
          type: 'error',
          message: `Section ${index + 1} missing or invalid "order" field (must be number)`
        });
      }
      
      if (!section.content && section.type !== 'quiz') {
        issues.push({
          type: 'warning',
          message: `Section ${index + 1} missing "content" field`
        });
      }
    });
  }
  
  // Check for deprecated fields at root level
  const deprecatedFields = [
    'id', 'title', 'description', 'order', 'duration', 'level', 'difficulty',
    'objectives', 'concepts', 'prerequisites', 'codeExamples', 'exercises',
    'quiz', 'tags', 'estimatedTime', 'learningObjectives'
  ];
  
  deprecatedFields.forEach(field => {
    if (module[field] !== undefined) {
      issues.push({
        type: 'warning',
        message: `Found "${field}" at root level - should be moved to metadata wrapper or appropriate section`
      });
    }
  });
  
  return issues;
}

/**
 * Validate all modules in the learning paths
 */
function validateAllModules() {
  console.log(`${colors.bold}${colors.blue}Learning Module Validation${colors.reset}\n`);
  
  const modulesPattern = path.join(__dirname, '../content/learn/paths/*/modules/*.json');
  const moduleFiles = glob.sync(modulesPattern);
  
  if (moduleFiles.length === 0) {
    console.log(`${colors.yellow}No module files found.${colors.reset}`);
    return;
  }
  
  console.log(`Found ${moduleFiles.length} module files to validate...\n`);
  
  let totalModules = 0;
  let validModules = 0;
  let modulesWithWarnings = 0;
  let modulesWithErrors = 0;
  
  const results = {};
  
  // Group modules by learning path
  moduleFiles.forEach(filePath => {
    const relativePath = path.relative(path.join(__dirname, '../content/learn'), filePath);
    const pathMatch = relativePath.match(/paths\/([^\/]+)\//);
    const learningPath = pathMatch ? pathMatch[1] : 'unknown';
    
    if (!results[learningPath]) {
      results[learningPath] = [];
    }
    
    const module = loadModule(filePath);
    if (module.error) {
      results[learningPath].push({
        file: path.basename(filePath),
        issues: [{ type: 'error', message: `JSON parse error: ${module.error}` }]
      });
      return;
    }
    
    const issues = validateModuleStructure(module, filePath);
    results[learningPath].push({
      file: path.basename(filePath),
      issues
    });
  });
  
  // Display results by learning path
  Object.keys(results).sort().forEach(learningPath => {
    console.log(`${colors.bold}${colors.cyan}${learningPath.toUpperCase()}${colors.reset}`);
    console.log('='.repeat(learningPath.length + 10));
    
    results[learningPath].forEach(result => {
      totalModules++;
      const errors = result.issues.filter(issue => issue.type === 'error');
      const warnings = result.issues.filter(issue => issue.type === 'warning');
      
      if (errors.length === 0 && warnings.length === 0) {
        console.log(`  ${colors.green}✓${colors.reset} ${result.file}`);
        validModules++;
      } else {
        if (errors.length > 0) {
          console.log(`  ${colors.red}✗${colors.reset} ${result.file}`);
          modulesWithErrors++;
        } else {
          console.log(`  ${colors.yellow}⚠${colors.reset} ${result.file}`);
          modulesWithWarnings++;
        }
        
        result.issues.forEach(issue => {
          const symbol = issue.type === 'error' ? '✗' : '⚠';
          const color = issue.type === 'error' ? colors.red : colors.yellow;
          console.log(`    ${color}${symbol}${colors.reset} ${issue.message}`);
        });
      }
    });
    
    console.log(); // Empty line between paths
  });
  
  // Summary
  console.log(`${colors.bold}VALIDATION SUMMARY${colors.reset}`);
  console.log('==================');
  console.log(`Total modules: ${totalModules}`);
  console.log(`${colors.green}Valid modules: ${validModules}${colors.reset}`);
  console.log(`${colors.yellow}Modules with warnings: ${modulesWithWarnings}${colors.reset}`);
  console.log(`${colors.red}Modules with errors: ${modulesWithErrors}${colors.reset}`);
  
  if (modulesWithErrors > 0) {
    console.log(`\n${colors.red}❌ Validation failed - ${modulesWithErrors} modules have errors${colors.reset}`);
    process.exit(1);
  } else if (modulesWithWarnings > 0) {
    console.log(`\n${colors.yellow}⚠️  Validation passed with warnings - ${modulesWithWarnings} modules have warnings${colors.reset}`);
  } else {
    console.log(`\n${colors.green}✅ All modules are valid!${colors.reset}`);
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bold}Module Validation Script${colors.reset}

Usage: node validate-modules.js [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Show verbose output

This script validates all learning modules against the standardized schema
to ensure consistent structure and compliance with the metadata wrapper format.
    `);
    return;
  }
  
  validateAllModules();
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  validateModuleStructure,
  loadModule,
  loadSchema
};