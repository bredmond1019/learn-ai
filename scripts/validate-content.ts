#!/usr/bin/env node

/**
 * Content Validation Script
 * 
 * Validates all learning content against the defined schemas and conventions.
 * Checks for:
 * - Valid JSON structure
 * - Required fields
 * - File naming conventions
 * - Cross-references between files
 * - Content completeness
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import type { Module, LearningPath } from '../types/module';
import { ModuleValidator, ValidationError, ValidationWarning } from '../lib/module-validation';

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Content root directory
const CONTENT_ROOT = path.join(process.cwd(), 'content/learn');

// Validation results
interface ValidationResult {
  file: string;
  errors: ValidationError[];
  warnings: ValidationError[];
}

const results: ValidationResult[] = [];

/**
 * Log colored message to console
 */
function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Validate file naming convention
 */
function validateFileName(filePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const fileName = path.basename(filePath);
  const dir = path.dirname(filePath);

  // Check for spaces
  if (fileName.includes(' ')) {
    errors.push({
      path: filePath,
      message: 'File name contains spaces. Use kebab-case instead.',
      details: 'Use kebab-case naming convention instead of spaces'
    });
  }

  // Check for uppercase letters
  if (fileName !== fileName.toLowerCase()) {
    errors.push({
      path: filePath,
      message: 'File name contains uppercase letters. Use lowercase only.',
      details: 'File naming validation error'
    });
  }

  // Check module file naming pattern
  if (dir.includes('/modules/') && fileName.endsWith('.json')) {
    const modulePattern = /^\d{2}-[a-z0-9-]+\.json$/;
    if (!modulePattern.test(fileName)) {
      errors.push({
        path: filePath,
        message: 'Module file should follow pattern: {order}-{module-id}.json',
        details: 'File naming validation error'
      });
    }
  }

  // Check exercise file naming pattern
  if (dir.includes('/exercises/') && fileName.endsWith('.json')) {
    const exercisePattern = /^[a-z0-9-]+-[a-z0-9-]+\.json$/;
    if (!exercisePattern.test(fileName)) {
      errors.push({
        path: filePath,
        message: 'Exercise file should follow pattern: {module-id}-{exercise-name}.json',
        details: 'File naming validation error'
      });
    }
  }

  // Check quiz file naming pattern
  if (dir.includes('/quizzes/') && fileName.endsWith('.json')) {
    const quizPattern = /^[a-z0-9-]+-quiz-[a-z0-9-]+\.json$/;
    if (!quizPattern.test(fileName)) {
      errors.push({
        path: filePath,
        message: 'Quiz file should follow pattern: {module-id}-quiz-{topic}.json',
        details: 'File naming validation error'
      });
    }
  }

  return errors;
}

/**
 * Validate JSON file structure
 */
function validateJSONFile(filePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    
    // Validate based on file type
    if (filePath.includes('/modules/') && filePath.endsWith('.json')) {
      errors.push(...validateModule(json, filePath));
    } else if (filePath.includes('/metadata.json')) {
      errors.push(...validatePathMetadata(json, filePath));
    }
  } catch (error) {
    errors.push({
      path: filePath,
      message: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: 'File naming validation error'
    });
  }
  
  return errors;
}

/**
 * Validate module structure
 */
function validateModule(module: any, filePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check required fields
  if (!module.metadata) {
    errors.push({
      path: filePath,
      message: 'Missing required field: metadata',
      details: 'File naming validation error'
    });
    return errors; // Can't continue without metadata
  }

  const metadata = module.metadata;
  const requiredFields = ['id', 'pathId', 'title', 'description', 'duration', 'type', 'difficulty', 'order', 'objectives', 'tags', 'version', 'lastUpdated'];
  
  for (const field of requiredFields) {
    if (!metadata[field]) {
      errors.push({
        path: `${filePath}#metadata.${field}`,
        message: `Missing required field: metadata.${field}`,
        details: 'File naming validation error'
      });
    }
  }

  // Validate sections
  if (!module.sections || !Array.isArray(module.sections)) {
    errors.push({
      path: `${filePath}#sections`,
      message: 'Missing or invalid sections array',
      details: 'File naming validation error'
    });
  } else {
    module.sections.forEach((section: any, index: number) => {
      if (!section.id) {
        errors.push({
          path: `${filePath}#sections[${index}].id`,
          message: `Section ${index} missing required field: id`,
          details: 'File naming validation error'
        });
      }
      if (!section.type) {
        errors.push({
          path: `${filePath}#sections[${index}].type`,
          message: `Section ${index} missing required field: type`,
          details: 'File naming validation error'
        });
      }
      if (typeof section.order !== 'number') {
        errors.push({
          path: `${filePath}#sections[${index}].order`,
          message: `Section ${index} missing or invalid field: order`,
          details: 'File naming validation error'
        });
      }
    });
  }

  // Check MDX file references
  if (module.sections) {
    module.sections.forEach((section: any, index: number) => {
      if (section.content?.type === 'mdx' && section.content.source) {
        const mdxPath = section.content.source.split('#')[0];
        const expectedMdxFile = path.join(path.dirname(filePath), mdxPath);
        
        if (!mdxPath.endsWith('.mdx')) {
          errors.push({
            path: `${filePath}#sections[${index}].content.source`,
            message: `MDX source should have .mdx extension: ${mdxPath}`,
            details: 'Content validation warning'
          });
        }
      }
    });
  }

  return errors;
}

/**
 * Validate path metadata
 */
function validatePathMetadata(metadata: any, filePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const requiredFields = ['id', 'title', 'description', 'level', 'duration', 'version', 'lastUpdated', 'topics', 'outcomes', 'modules'];
  
  for (const field of requiredFields) {
    if (!metadata[field]) {
      errors.push({
        path: `${filePath}#${field}`,
        message: `Missing required field: ${field}`,
        details: 'File naming validation error'
      });
    }
  }

  // Validate level
  if (metadata.level && !['Beginner', 'Intermediate', 'Advanced'].includes(metadata.level)) {
    errors.push({
      path: `${filePath}#level`,
      message: `Invalid level: ${metadata.level}. Must be Beginner, Intermediate, or Advanced.`,
      details: 'File naming validation error'
    });
  }

  // Check module references
  if (metadata.modules && Array.isArray(metadata.modules)) {
    metadata.modules.forEach((moduleId: string, index: number) => {
      const expectedFile = path.join(path.dirname(filePath), 'modules', `${moduleId}.json`);
      // Note: We're not checking file existence here as it might not be created yet
      
      if (!moduleId.match(/^\d{2}-[a-z0-9-]+$/)) {
        errors.push({
          path: `${filePath}#modules[${index}]`,
          message: `Invalid module ID format: ${moduleId}. Should match pattern: {order}-{module-id}`,
          details: 'Content validation warning'
        });
      }
    });
  }

  return errors;
}

/**
 * Validate MDX files
 */
function validateMDXFile(filePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for frontmatter
    if (!content.startsWith('---')) {
      errors.push({
        path: filePath,
        message: 'MDX file missing frontmatter',
        details: 'File naming validation error'
      });
    } else {
      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        // Basic frontmatter validation
        const frontmatter = frontmatterMatch[1];
        const requiredFields = ['title', 'description', 'duration', 'difficulty', 'lastUpdated'];
        
        for (const field of requiredFields) {
          if (!frontmatter.includes(`${field}:`)) {
            errors.push({
              path: `${filePath}#frontmatter`,
              message: `Missing required frontmatter field: ${field}`,
              details: 'Content validation warning'
            });
          }
        }
      }
    }
  } catch (error) {
    errors.push({
      path: filePath,
      message: `Error reading MDX file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: 'File naming validation error'
    });
  }
  
  return errors;
}

/**
 * Main validation function
 */
async function validateContent() {
  log('Starting content validation...', 'blue');
  log(`Content root: ${CONTENT_ROOT}\n`, 'blue');

  // Find all JSON files
  const jsonFiles = await glob('**/*.json', {
    cwd: CONTENT_ROOT,
    absolute: true
  });

  // Find all MDX files
  const mdxFiles = await glob('**/*.mdx', {
    cwd: CONTENT_ROOT,
    absolute: true
  });

  // Validate JSON files
  log(`Validating ${jsonFiles.length} JSON files...`, 'blue');
  for (const file of jsonFiles) {
    const fileErrors: ValidationError[] = [];
    
    // Validate file name
    fileErrors.push(...validateFileName(file));
    
    // Validate JSON structure
    fileErrors.push(...validateJSONFile(file));
    
    if (fileErrors.length > 0) {
      results.push({
        file: path.relative(CONTENT_ROOT, file),
        errors: fileErrors.filter(e => e.details.includes('error')),
        warnings: fileErrors.filter(e => e.details.includes('warning'))
      });
    }
  }

  // Validate MDX files
  log(`\nValidating ${mdxFiles.length} MDX files...`, 'blue');
  for (const file of mdxFiles) {
    const fileErrors: ValidationError[] = [];
    
    // Validate file name
    fileErrors.push(...validateFileName(file));
    
    // Validate MDX content
    fileErrors.push(...validateMDXFile(file));
    
    if (fileErrors.length > 0) {
      results.push({
        file: path.relative(CONTENT_ROOT, file),
        errors: fileErrors.filter(e => e.details.includes('error')),
        warnings: fileErrors.filter(e => e.details.includes('warning'))
      });
    }
  }

  // Display results
  displayResults();
}

/**
 * Display validation results
 */
function displayResults() {
  log('\n=== Validation Results ===\n', 'blue');

  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  if (results.length === 0) {
    log('✅ All content files are valid!', 'green');
    return;
  }

  // Display errors and warnings by file
  for (const result of results) {
    log(`\n📄 ${result.file}`, 'yellow');
    
    if (result.errors.length > 0) {
      log('  Errors:', 'red');
      for (const error of result.errors) {
        log(`    ❌ ${error.message}`, 'red');
      }
    }
    
    if (result.warnings.length > 0) {
      log('  Warnings:', 'yellow');
      for (const warning of result.warnings) {
        log(`    ⚠️  ${warning.message}`, 'yellow');
      }
    }
  }

  // Summary
  log('\n=== Summary ===', 'blue');
  log(`Total files with issues: ${results.length}`, 'yellow');
  log(`Total errors: ${totalErrors}`, totalErrors > 0 ? 'red' : 'green');
  log(`Total warnings: ${totalWarnings}`, totalWarnings > 0 ? 'yellow' : 'green');

  // Exit with error code if there are errors
  if (totalErrors > 0) {
    process.exit(1);
  }
}

// Run validation
validateContent().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});