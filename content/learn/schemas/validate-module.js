#!/usr/bin/env node

/**
 * Module Validation Utility
 * 
 * Validates learning modules against the standardized schema.
 * Usage: node validate-module.js <path-to-module.json>
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Initialize AJV with format support
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// Load the schema
function loadSchema() {
  try {
    const schemaPath = path.join(__dirname, 'module-schema.json');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    return JSON.parse(schemaContent);
  } catch (error) {
    console.error('❌ Error loading schema:', error.message);
    process.exit(1);
  }
}

// Load and parse a module file
function loadModule(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error loading module file: ${error.message}`);
    process.exit(1);
  }
}

// Format validation errors for better readability
function formatErrors(errors) {
  return errors.map(error => {
    const path = error.instancePath || 'root';
    const message = error.message;
    const allowedValues = error.params?.allowedValues;
    const missingProperty = error.params?.missingProperty;
    
    let details = `Path: ${path}`;
    if (missingProperty) {
      details += ` - Missing required property: "${missingProperty}"`;
    } else if (allowedValues) {
      details += ` - Allowed values: ${allowedValues.join(', ')}`;
    }
    
    return {
      path,
      message,
      details,
      value: error.data
    };
  });
}

// Check for common issues and provide helpful suggestions
function checkCommonIssues(module) {
  const issues = [];
  
  // Check metadata structure
  if (!module.metadata) {
    issues.push({
      type: 'warning',
      message: 'Module should have metadata object for MCP format compliance'
    });
  }
  
  // Check ID format
  if (module.metadata?.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(module.metadata.id)) {
    issues.push({
      type: 'warning',
      message: 'Module ID should use kebab-case format (lowercase with hyphens)'
    });
  }
  
  // Check section ordering
  if (module.sections) {
    const orders = module.sections.map(s => s.order).filter(o => typeof o === 'number');
    if (orders.length > 0) {
      const sortedOrders = [...orders].sort((a, b) => a - b);
      if (JSON.stringify(orders) !== JSON.stringify(sortedOrders)) {
        issues.push({
          type: 'warning',
          message: 'Sections should be ordered sequentially by their order property'
        });
      }
    }
  }
  
  // Check for missing required resources
  if (module.resources) {
    const requiredResources = module.resources.filter(r => r.required === true);
    if (requiredResources.length > 0) {
      issues.push({
        type: 'info',
        message: `Module has ${requiredResources.length} required resource(s)`
      });
    }
  }
  
  // Check duration format
  if (module.metadata?.duration && !/^\d+\s+(minutes?|hours?)$/.test(module.metadata.duration)) {
    issues.push({
      type: 'warning',
      message: 'Duration should be in format "X minutes" or "X hours"'
    });
  }
  
  return issues;
}

// Main validation function
function validateModule(filePath) {
  console.log(`🔍 Validating module: ${filePath}\n`);
  
  // Load schema and module
  const schema = loadSchema();
  const module = loadModule(filePath);
  
  // Compile schema
  const validate = ajv.compile(schema);
  
  // Validate module
  const isValid = validate(module);
  
  if (isValid) {
    console.log('✅ Module is valid according to the schema!\n');
    
    // Check for common issues and suggestions
    const issues = checkCommonIssues(module);
    
    if (issues.length > 0) {
      console.log('💬 Suggestions and observations:');
      issues.forEach((issue, index) => {
        const icon = issue.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${icon} ${issue.message}`);
      });
      console.log();
    }
    
    // Display module summary
    console.log('📋 Module Summary:');
    console.log(`   Title: ${module.metadata?.title || module.title || 'Unknown'}`);
    console.log(`   Path: ${module.metadata?.pathId || 'Unknown'}`);
    console.log(`   Difficulty: ${module.metadata?.difficulty || module.difficulty || 'Unknown'}`);
    console.log(`   Duration: ${module.metadata?.duration || module.duration || 'Unknown'}`);
    console.log(`   Sections: ${module.sections?.length || 0}`);
    console.log(`   Resources: ${module.resources?.length || 0}`);
    console.log(`   Exercises: ${module.exercises?.length || 0}`);
    
    process.exit(0);
  } else {
    console.log('❌ Module validation failed!\n');
    
    const formattedErrors = formatErrors(validate.errors);
    
    console.log('🔍 Validation Errors:');
    formattedErrors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.message}`);
      console.log(`   ${error.details}`);
      if (error.value !== undefined) {
        console.log(`   Current value: ${JSON.stringify(error.value)}`);
      }
    });
    
    console.log('\n💡 Tips:');
    console.log('   - Ensure all required fields are present');
    console.log('   - Check that field values match allowed types and formats');
    console.log('   - Refer to the schema documentation for detailed requirements');
    console.log('   - Use the reference-module.json as a template');
    
    process.exit(1);
  }
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node validate-module.js <path-to-module.json>');
    console.log('\nExamples:');
    console.log('  node validate-module.js ../paths/mcp-fundamentals/modules/01-introduction-to-mcp.json');
    console.log('  node validate-module.js reference-module.json');
    process.exit(1);
  }
  
  const modulePath = args[0];
  validateModule(modulePath);
}

// Handle unhandled errors
process.on('uncaughtException', (error) => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateModule, loadSchema, loadModule };