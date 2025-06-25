/**
 * Module Validation Library
 * 
 * TypeScript utilities for validating learning modules against the standardized schema.
 * Provides both runtime validation and type checking capabilities.
 */

import fs from 'fs';
import path from 'path';
import type { Module } from '../types/module';

// Import the JSON schema for runtime validation
import moduleSchema from '../content/learn/schemas/module-schema.json';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: ModuleSummary;
}

export interface ValidationError {
  path: string;
  message: string;
  details: string;
  value?: any;
}

export interface ValidationWarning {
  type: 'warning' | 'info';
  message: string;
  suggestion?: string;
}

export interface ModuleSummary {
  id: string;
  title: string;
  pathId: string;
  difficulty: string;
  duration: string;
  sectionsCount: number;
  resourcesCount: number;
  exercisesCount: number;
  hasQuiz: boolean;
  estimatedTime: number;
}

/**
 * Schema-based validation using JSON Schema
 */
export class ModuleValidator {
  private schema: any;

  constructor() {
    this.schema = moduleSchema;
  }

  /**
   * Validate a module object against the schema
   */
  async validateModule(module: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic structure validation
    this.validateBasicStructure(module, errors);
    
    // Metadata validation
    this.validateMetadata(module.metadata, errors, warnings);
    
    // Sections validation
    this.validateSections(module.sections, errors, warnings);
    
    // Resources validation
    if (module.resources) {
      this.validateResources(module.resources, errors, warnings);
    }
    
    // Assessment criteria validation
    if (module.assessmentCriteria) {
      this.validateAssessmentCriteria(module.assessmentCriteria, errors, warnings);
    }

    // Generate summary
    const summary = this.generateSummary(module);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary
    };
  }

  /**
   * Validate basic module structure
   */
  private validateBasicStructure(module: any, errors: ValidationError[]): void {
    if (!module.metadata) {
      errors.push({
        path: 'root',
        message: 'Missing required property: metadata',
        details: 'Module must have a metadata object following MCP format'
      });
    }

    if (!module.sections || !Array.isArray(module.sections)) {
      errors.push({
        path: 'root',
        message: 'Missing or invalid sections array',
        details: 'Module must have an array of sections'
      });
    }
  }

  /**
   * Validate metadata object
   */
  private validateMetadata(metadata: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!metadata) return;

    const required = ['id', 'pathId', 'title', 'description', 'duration', 'difficulty', 'order', 'objectives', 'author', 'version', 'lastUpdated'];
    
    for (const field of required) {
      if (!metadata[field]) {
        errors.push({
          path: `metadata.${field}`,
          message: `Missing required field: ${field}`,
          details: `Metadata must include ${field}`,
          value: metadata[field]
        });
      }
    }

    // Validate ID format
    if (metadata.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(metadata.id)) {
      warnings.push({
        type: 'warning',
        message: 'Module ID should use kebab-case format',
        suggestion: 'Use lowercase letters, numbers, and hyphens only'
      });
    }

    // Validate difficulty level
    if (metadata.difficulty && !['beginner', 'intermediate', 'advanced'].includes(metadata.difficulty)) {
      errors.push({
        path: 'metadata.difficulty',
        message: 'Invalid difficulty level',
        details: 'Must be one of: beginner, intermediate, advanced',
        value: metadata.difficulty
      });
    }

    // Validate duration format
    if (metadata.duration && !/^\d+\s+(minutes?|hours?)$/.test(metadata.duration)) {
      warnings.push({
        type: 'warning',
        message: 'Duration format should be "X minutes" or "X hours"',
        suggestion: 'Use format like "30 minutes" or "2 hours"'
      });
    }

    // Validate version format
    if (metadata.version && !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
      warnings.push({
        type: 'warning',
        message: 'Version should follow semantic versioning (X.Y.Z)',
        suggestion: 'Use format like "1.0.0" or "2.1.3"'
      });
    }

    // Validate objectives
    if (metadata.objectives && (!Array.isArray(metadata.objectives) || metadata.objectives.length === 0)) {
      errors.push({
        path: 'metadata.objectives',
        message: 'Objectives must be a non-empty array',
        details: 'Provide at least one learning objective',
        value: metadata.objectives
      });
    }
  }

  /**
   * Validate sections array
   */
  private validateSections(sections: any[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!sections || !Array.isArray(sections)) return;

    if (sections.length === 0) {
      errors.push({
        path: 'sections',
        message: 'Module must have at least one section',
        details: 'Add content sections to the module'
      });
      return;
    }

    // Validate each section
    sections.forEach((section, index) => {
      this.validateSection(section, index, errors, warnings);
    });

    // Check section ordering
    const orders = sections
      .map(s => s.order)
      .filter(o => typeof o === 'number');
    
    if (orders.length > 0) {
      const sorted = [...orders].sort((a, b) => a - b);
      if (JSON.stringify(orders) !== JSON.stringify(sorted)) {
        warnings.push({
          type: 'warning',
          message: 'Sections should be ordered sequentially',
          suggestion: 'Ensure section order values are sequential (1, 2, 3, etc.)'
        });
      }
    }
  }

  /**
   * Validate individual section
   */
  private validateSection(section: any, index: number, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const path = `sections[${index}]`;
    
    const required = ['id', 'title', 'type', 'order', 'content'];
    for (const field of required) {
      if (!section[field]) {
        errors.push({
          path: `${path}.${field}`,
          message: `Missing required field: ${field}`,
          details: `Section must include ${field}`,
          value: section[field]
        });
      }
    }

    // Validate section type
    if (section.type && !['content', 'quiz', 'exercise', 'project', 'assessment'].includes(section.type)) {
      errors.push({
        path: `${path}.type`,
        message: 'Invalid section type',
        details: 'Must be one of: content, quiz, exercise, project, assessment',
        value: section.type
      });
    }

    // Validate content structure based on type
    if (section.content) {
      this.validateSectionContent(section.content, section.type, `${path}.content`, errors, warnings);
    }
  }

  /**
   * Validate section content based on type
   */
  private validateSectionContent(content: any, sectionType: string, path: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    switch (sectionType) {
      case 'content':
        if (!content.type || content.type !== 'mdx') {
          errors.push({
            path: `${path}.type`,
            message: 'Content sections must have type "mdx"',
            details: 'Set content.type to "mdx"',
            value: content.type
          });
        }
        if (!content.source) {
          errors.push({
            path: `${path}.source`,
            message: 'Content sections must specify MDX source file',
            details: 'Provide source file reference with optional anchor',
            value: content.source
          });
        }
        break;

      case 'quiz':
        if (!content.questions || !Array.isArray(content.questions) || content.questions.length === 0) {
          errors.push({
            path: `${path}.questions`,
            message: 'Quiz sections must have at least one question',
            details: 'Add questions array to quiz content',
            value: content.questions
          });
        }
        break;

      case 'exercise':
        if (!content.instructions || !Array.isArray(content.instructions) || content.instructions.length === 0) {
          errors.push({
            path: `${path}.instructions`,
            message: 'Exercise sections must have instructions',
            details: 'Add instructions array to exercise content',
            value: content.instructions
          });
        }
        break;
    }
  }

  /**
   * Validate resources array
   */
  private validateResources(resources: any[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    resources.forEach((resource, index) => {
      const path = `resources[${index}]`;
      
      if (!resource.id || !resource.title || !resource.type) {
        errors.push({
          path,
          message: 'Resource missing required fields',
          details: 'Resources must have id, title, and type',
          value: resource
        });
      }

      if (resource.type && !['reference', 'documentation', 'paper', 'tool', 'video', 'guide', 'tutorial'].includes(resource.type)) {
        warnings.push({
          type: 'warning',
          message: `Unusual resource type: ${resource.type}`,
          suggestion: 'Consider using standard resource types'
        });
      }
    });
  }

  /**
   * Validate assessment criteria
   */
  private validateAssessmentCriteria(criteria: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (criteria.minimumScore && (typeof criteria.minimumScore !== 'number' || criteria.minimumScore < 0 || criteria.minimumScore > 100)) {
      errors.push({
        path: 'assessmentCriteria.minimumScore',
        message: 'Minimum score must be a number between 0 and 100',
        details: 'Specify percentage score required to pass',
        value: criteria.minimumScore
      });
    }
  }

  /**
   * Generate module summary
   */
  private generateSummary(module: any): ModuleSummary {
    const metadata = module.metadata || {};
    
    return {
      id: metadata.id || module.id || 'unknown',
      title: metadata.title || module.title || 'Unknown',
      pathId: metadata.pathId || 'unknown',
      difficulty: metadata.difficulty || module.difficulty || 'unknown',
      duration: metadata.duration || module.duration || 'unknown',
      sectionsCount: module.sections?.length || 0,
      resourcesCount: module.resources?.length || 0,
      exercisesCount: module.exercises?.length || 0,
      hasQuiz: module.sections?.some((s: any) => s.type === 'quiz') || !!module.quiz,
      estimatedTime: metadata.estimatedCompletionTime || this.parseTimeEstimate(metadata.duration || module.duration || '0 minutes')
    };
  }

  /**
   * Parse time estimate from duration string
   */
  private parseTimeEstimate(duration: string): number {
    const match = duration.match(/(\d+)\s+(minutes?|hours?)/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    return unit.startsWith('hour') ? value * 60 : value;
  }
}

/**
 * Convenience function to validate a module
 */
export async function validateModule(module: any): Promise<ValidationResult> {
  const validator = new ModuleValidator();
  return validator.validateModule(module);
}

/**
 * Load and validate a module from file
 */
export async function validateModuleFile(filePath: string): Promise<ValidationResult> {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const module = JSON.parse(content);
    return validateModule(module);
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        path: 'file',
        message: `Error loading module file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: `Check that ${filePath} exists and contains valid JSON`
      }],
      warnings: [],
      summary: {
        id: 'error',
        title: 'Error',
        pathId: 'error',
        difficulty: 'unknown',
        duration: 'unknown',
        sectionsCount: 0,
        resourcesCount: 0,
        exercisesCount: 0,
        hasQuiz: false,
        estimatedTime: 0
      }
    };
  }
}

/**
 * Type guard to check if an object conforms to the Module interface
 */
export function isValidModuleStructure(obj: any): obj is Module {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.order === 'number' &&
    Array.isArray(obj.sections) &&
    obj.metadata &&
    typeof obj.metadata === 'object'
  );
}