#!/usr/bin/env tsx

/**
 * Comprehensive Content Validation for Task 1.2.1
 * 
 * This script performs exhaustive validation of all learning content
 * and generates a detailed error catalog for systematic fixing.
 */

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning';
  category: string;
  file: string;
  message: string;
  fix: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface ValidationSummary {
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
  categorySummary: Record<string, number>;
  prioritySummary: Record<string, number>;
}

const CONTENT_ROOT = path.join(process.cwd(), 'content/learn');
const issues: ValidationIssue[] = [];

// Color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function addIssue(issue: Omit<ValidationIssue, 'id'>) {
  issues.push({
    ...issue,
    id: `${issue.category}-${issues.length + 1}`.toLowerCase().replace(/\s+/g, '-')
  });
}

/**
 * Check if all referenced MDX files exist
 */
async function validateMDXReferences() {
  console.log('🔍 Validating MDX file references...');
  
  const moduleFiles = await glob('paths/*/modules/*.json', { cwd: CONTENT_ROOT });
  
  for (const moduleFile of moduleFiles) {
    const fullPath = path.join(CONTENT_ROOT, moduleFile);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const module = JSON.parse(content);
      
      if (module.sections && Array.isArray(module.sections)) {
        for (const section of module.sections) {
          if (section.content?.source) {
            const mdxRef = section.content.source.split('#')[0];
            const mdxPath = path.join(path.dirname(fullPath), mdxRef);
            
            if (!fsSync.existsSync(mdxPath)) {
              addIssue({
                severity: 'error',
                category: 'Missing Files',
                file: moduleFile,
                message: `Referenced MDX file does not exist: ${mdxRef}`,
                fix: `Create the missing MDX file at ${mdxRef} with proper frontmatter and content`,
                priority: 'critical'
              });
            }
          }
        }
      }
    } catch (error) {
      addIssue({
        severity: 'error',
        category: 'JSON Parsing',
        file: moduleFile,
        message: `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fix: 'Fix JSON syntax errors',
        priority: 'critical'
      });
    }
  }
}

/**
 * Validate MDX file frontmatter
 */
async function validateMDXFrontmatter() {
  console.log('📝 Validating MDX frontmatter...');
  
  const mdxFiles = await glob('**/*.mdx', { cwd: CONTENT_ROOT });
  
  for (const mdxFile of mdxFiles) {
    const fullPath = path.join(CONTENT_ROOT, mdxFile);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      
      if (!content.startsWith('---')) {
        addIssue({
          severity: 'error',
          category: 'MDX Structure',
          file: mdxFile,
          message: 'MDX file missing frontmatter (no --- header)',
          fix: 'Add frontmatter with required fields: title, description, duration, difficulty, lastUpdated',
          priority: 'critical'
        });
        continue;
      }
      
      const frontmatterMatch = content.match(/^---\\n([\\s\\S]*?)\\n---/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const requiredFields = ['title', 'description'];
        const recommendedFields = ['duration', 'difficulty', 'lastUpdated'];
        
        for (const field of requiredFields) {
          if (!frontmatter.includes(`${field}:`)) {
            addIssue({
              severity: 'error',
              category: 'MDX Frontmatter',
              file: mdxFile,
              message: `Missing required frontmatter field: ${field}`,
              fix: `Add ${field}: "appropriate value" to frontmatter`,
              priority: 'high'
            });
          }
        }
        
        for (const field of recommendedFields) {
          if (!frontmatter.includes(`${field}:`)) {
            addIssue({
              severity: 'warning',
              category: 'MDX Frontmatter',
              file: mdxFile,
              message: `Missing recommended frontmatter field: ${field}`,
              fix: `Add ${field}: "appropriate value" to frontmatter`,
              priority: 'medium'
            });
          }
        }
      }
    } catch (error) {
      addIssue({
        severity: 'error',
        category: 'File Access',
        file: mdxFile,
        message: `Cannot read MDX file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fix: 'Ensure file exists and is readable',
        priority: 'critical'
      });
    }
  }
}

/**
 * Validate learning path metadata
 */
async function validatePathMetadata() {
  console.log('📚 Validating learning path metadata...');
  
  const metadataFiles = await glob('paths/*/metadata.json', { cwd: CONTENT_ROOT });
  
  for (const metadataFile of metadataFiles) {
    const fullPath = path.join(CONTENT_ROOT, metadataFile);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const metadata = JSON.parse(content);
      
      const requiredFields = ['id', 'title', 'description', 'difficulty', 'totalDuration', 'version', 'lastUpdated', 'modules'];
      const recommendedFields = ['level', 'duration', 'outcomes', 'prerequisites', 'topics'];
      
      for (const field of requiredFields) {
        if (!metadata[field]) {
          addIssue({
            severity: 'error',
            category: 'Path Metadata',
            file: metadataFile,
            message: `Missing required field: ${field}`,
            fix: `Add ${field} field with appropriate value`,
            priority: 'high'
          });
        }
      }
      
      for (const field of recommendedFields) {
        if (!metadata[field]) {
          addIssue({
            severity: 'warning',
            category: 'Path Metadata',
            file: metadataFile,
            message: `Missing recommended field: ${field}`,
            fix: `Add ${field} field with appropriate value`,
            priority: 'medium'
          });
        }
      }
      
      // Validate module references
      if (metadata.modules && Array.isArray(metadata.modules)) {
        for (const moduleId of metadata.modules) {
          const moduleFile = path.join(path.dirname(fullPath), 'modules', `${moduleId}.json`);
          if (!fsSync.existsSync(moduleFile)) {
            addIssue({
              severity: 'error',
              category: 'Module References',
              file: metadataFile,
              message: `Referenced module file does not exist: ${moduleId}.json`,
              fix: `Create the missing module file or remove from modules array`,
              priority: 'high'
            });
          }
        }
      }
      
    } catch (error) {
      addIssue({
        severity: 'error',
        category: 'JSON Parsing',
        file: metadataFile,
        message: `Failed to parse metadata JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fix: 'Fix JSON syntax errors',
        priority: 'critical'
      });
    }
  }
}

/**
 * Validate module structure (metadata wrapper compliance)
 */
async function validateModuleStructure() {
  console.log('🏗️  Validating module structure...');
  
  const moduleFiles = await glob('paths/*/modules/*.json', { cwd: CONTENT_ROOT });
  
  for (const moduleFile of moduleFiles) {
    const fullPath = path.join(CONTENT_ROOT, moduleFile);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const module = JSON.parse(content);
      
      // Check for metadata wrapper
      if (!module.metadata) {
        addIssue({
          severity: 'error',
          category: 'Module Structure',
          file: moduleFile,
          message: 'Missing metadata wrapper object',
          fix: 'Wrap module metadata in "metadata" object according to standard schema',
          priority: 'critical'
        });
        continue;
      }
      
      const metadata = module.metadata;
      const requiredMetadataFields = ['id', 'pathId', 'title', 'description', 'duration', 'difficulty', 'order', 'objectives', 'version', 'lastUpdated'];
      
      for (const field of requiredMetadataFields) {
        if (metadata[field] === undefined || metadata[field] === null) {
          addIssue({
            severity: 'error',
            category: 'Module Metadata',
            file: moduleFile,
            message: `Missing required metadata field: ${field}`,
            fix: `Add metadata.${field} with appropriate value`,
            priority: 'high'
          });
        }
      }
      
      // Check sections array
      if (!module.sections || !Array.isArray(module.sections)) {
        addIssue({
          severity: 'error',
          category: 'Module Structure',
          file: moduleFile,
          message: 'Missing or invalid sections array',
          fix: 'Add sections array with proper section objects',
          priority: 'high'
        });
      } else {
        module.sections.forEach((section: any, index: number) => {
          const requiredSectionFields = ['id', 'title', 'type', 'order'];
          for (const field of requiredSectionFields) {
            if (!section[field]) {
              addIssue({
                severity: 'error',
                category: 'Section Structure',
                file: moduleFile,
                message: `Section ${index + 1} missing required field: ${field}`,
                fix: `Add ${field} field to section ${index + 1}`,
                priority: 'high'
              });
            }
          }
        });
      }
      
    } catch (error) {
      addIssue({
        severity: 'error',
        category: 'JSON Parsing',
        file: moduleFile,
        message: `Failed to parse module JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fix: 'Fix JSON syntax errors',
        priority: 'critical'
      });
    }
  }
}

/**
 * Check for validation system compatibility
 */
async function validateSystemCompatibility() {
  console.log('⚙️  Checking validation system compatibility...');
  
  // Check if validation functions work with current content structure
  try {
    const validationLib = await import('../lib/content/content-validation');
    
    // Test with a sample module
    const testModulePath = path.join(CONTENT_ROOT, 'paths/mcp-fundamentals/modules/00-test-module.json');
    if (fsSync.existsSync(testModulePath)) {
      const content = await fs.readFile(testModulePath, 'utf-8');
      const module = JSON.parse(content);
      
      const result = validationLib.validateModule(module);
      
      if (!result.valid && result.errors.some(e => e.includes('Module ID is required'))) {
        addIssue({
          severity: 'warning',
          category: 'Validation System',
          file: 'lib/content-validation.ts',
          message: 'Validation functions expect old flat structure, not metadata wrapper',
          fix: 'Update validation functions to work with metadata wrapper structure',
          priority: 'high'
        });
      }
    }
  } catch (error) {
    addIssue({
      severity: 'warning',
      category: 'Validation System',
      file: 'lib/content-validation.ts',
      message: `Validation system compatibility check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fix: 'Review and update validation system',
      priority: 'medium'
    });
  }
}

/**
 * Generate summary report
 */
function generateSummary(): ValidationSummary {
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  
  const categorySummary: Record<string, number> = {};
  const prioritySummary: Record<string, number> = {};
  
  issues.forEach(issue => {
    categorySummary[issue.category] = (categorySummary[issue.category] || 0) + 1;
    prioritySummary[issue.priority] = (prioritySummary[issue.priority] || 0) + 1;
  });
  
  return {
    totalIssues: issues.length,
    errorCount,
    warningCount,
    issues,
    categorySummary,
    prioritySummary
  };
}

/**
 * Display results
 */
function displayResults(summary: ValidationSummary) {
  console.log(`\\n${colors.bold}${colors.blue}=== COMPREHENSIVE VALIDATION RESULTS ===${colors.reset}\\n`);
  
  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Total Issues: ${summary.totalIssues}`);
  console.log(`  ${colors.red}Errors: ${summary.errorCount}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings: ${summary.warningCount}${colors.reset}\\n`);
  
  // Priority breakdown
  console.log(`${colors.bold}Priority Breakdown:${colors.reset}`);
  Object.entries(summary.prioritySummary).forEach(([priority, count]) => {
    const color = priority === 'critical' ? colors.red : priority === 'high' ? colors.magenta : priority === 'medium' ? colors.yellow : colors.cyan;
    console.log(`  ${color}${priority.charAt(0).toUpperCase() + priority.slice(1)}: ${count}${colors.reset}`);
  });
  console.log();
  
  // Category breakdown
  console.log(`${colors.bold}Category Breakdown:${colors.reset}`);
  Object.entries(summary.categorySummary).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });
  console.log();
  
  // Detailed issues
  console.log(`${colors.bold}Detailed Issues:${colors.reset}\\n`);
  
  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.category]) acc[issue.category] = [];
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, ValidationIssue[]>);
  
  Object.entries(groupedIssues).forEach(([category, categoryIssues]) => {
    console.log(`${colors.bold}${colors.cyan}${category}${colors.reset}`);
    console.log('='.repeat(category.length + 5));
    
    categoryIssues.forEach(issue => {
      const severityColor = issue.severity === 'error' ? colors.red : colors.yellow;
      const priorityColor = issue.priority === 'critical' ? colors.red : issue.priority === 'high' ? colors.magenta : colors.yellow;
      
      console.log(`  ${severityColor}${issue.severity.toUpperCase()}${colors.reset} [${priorityColor}${issue.priority}${colors.reset}] ${issue.file}`);
      console.log(`    Problem: ${issue.message}`);
      console.log(`    Fix: ${issue.fix}\\n`);
    });
  });
}

/**
 * Save detailed report to file
 */
async function saveDetailedReport(summary: ValidationSummary) {
  const reportContent = `# Detailed Content Validation Report
Generated: ${new Date().toISOString()}

## Summary
- Total Issues: ${summary.totalIssues}
- Errors: ${summary.errorCount}  
- Warnings: ${summary.warningCount}

## Priority Breakdown
${Object.entries(summary.prioritySummary).map(([priority, count]) => `- ${priority}: ${count}`).join('\\n')}

## Category Breakdown
${Object.entries(summary.categorySummary).map(([category, count]) => `- ${category}: ${count}`).join('\\n')}

## Detailed Issues

${summary.issues.map(issue => `### ${issue.id}
**File:** \`${issue.file}\`  
**Severity:** ${issue.severity.toUpperCase()}  
**Priority:** ${issue.priority}  
**Category:** ${issue.category}  

**Problem:** ${issue.message}  
**Fix:** ${issue.fix}  
`).join('\\n')}

## Next Steps

1. **Critical Priority:** Fix ${summary.prioritySummary.critical || 0} critical issues first
2. **High Priority:** Address ${summary.prioritySummary.high || 0} high priority issues  
3. **Medium Priority:** Resolve ${summary.prioritySummary.medium || 0} medium priority issues
4. **Low Priority:** Handle ${summary.prioritySummary.low || 0} low priority issues

## Files Requiring Immediate Attention

${summary.issues
  .filter(i => i.priority === 'critical')
  .map(issue => `- \`${issue.file}\`: ${issue.message}`)
  .join('\\n') || 'None'}
`;

  await fs.writeFile('DETAILED_VALIDATION_REPORT.md', reportContent);
  console.log(`${colors.green}✅ Detailed report saved to DETAILED_VALIDATION_REPORT.md${colors.reset}`);
}

/**
 * Main validation function
 */
async function runComprehensiveValidation() {
  console.log(`${colors.bold}${colors.blue}🔍 Starting Comprehensive Content Validation${colors.reset}\\n`);
  console.log(`Content root: ${CONTENT_ROOT}\\n`);
  
  try {
    // Run all validation checks
    await validateMDXReferences();
    await validateMDXFrontmatter();
    await validatePathMetadata();
    await validateModuleStructure();
    await validateSystemCompatibility();
    
    // Generate and display results
    const summary = generateSummary();
    displayResults(summary);
    
    // Save detailed report
    await saveDetailedReport(summary);
    
    // Exit with appropriate code
    if (summary.errorCount > 0) {
      console.log(`${colors.red}❌ Validation failed with ${summary.errorCount} errors${colors.reset}`);
      process.exit(1);
    } else if (summary.warningCount > 0) {
      console.log(`${colors.yellow}⚠️  Validation completed with ${summary.warningCount} warnings${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ All content validation checks passed!${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}💥 Validation failed with error: ${error instanceof Error ? error.message : 'Unknown error'}${colors.reset}`);
    process.exit(1);
  }
}

// Run the validation
runComprehensiveValidation();