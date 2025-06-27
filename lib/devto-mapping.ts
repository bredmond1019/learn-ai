/**
 * Dev.to Article Mapping
 * Manages the relationship between local files and Dev.to articles
 */

import fs from 'fs/promises';
import path from 'path';

export interface ArticleMapping {
  filePath: string;
  articleId: number;
  title: string;
  lastSynced: string;
  checksum?: string;
}

export interface MappingData {
  version: string;
  mappings: ArticleMapping[];
}

export class DevToMapping {
  private mappingPath: string;
  private data: MappingData;

  constructor(mappingPath = '.devto-mapping.json') {
    this.mappingPath = mappingPath;
    this.data = {
      version: '1.0.0',
      mappings: [],
    };
  }

  /**
   * Load mappings from file
   */
  async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.mappingPath, 'utf-8');
      this.data = JSON.parse(content);
    } catch (error) {
      // File doesn't exist, use default empty data
      if ((error as any).code !== 'ENOENT') {
        throw new Error(`Failed to load mapping file: ${error}`);
      }
    }
  }

  /**
   * Save mappings to file
   */
  async save(): Promise<void> {
    try {
      const content = JSON.stringify(this.data, null, 2);
      await fs.writeFile(this.mappingPath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save mapping file: ${error}`);
    }
  }

  /**
   * Add or update a mapping
   */
  async addMapping(
    filePath: string,
    articleId: number,
    title: string,
    checksum?: string
  ): Promise<void> {
    // Normalize file path
    const normalizedPath = path.resolve(filePath);

    // Check if mapping already exists
    const existingIndex = this.data.mappings.findIndex(
      m => m.filePath === normalizedPath
    );

    const mapping: ArticleMapping = {
      filePath: normalizedPath,
      articleId,
      title,
      lastSynced: new Date().toISOString(),
      checksum,
    };

    if (existingIndex >= 0) {
      // Update existing
      this.data.mappings[existingIndex] = mapping;
    } else {
      // Add new
      this.data.mappings.push(mapping);
    }

    await this.save();
  }

  /**
   * Get mapping by file path
   */
  getMappingByFile(filePath: string): ArticleMapping | null {
    const normalizedPath = path.resolve(filePath);
    return (
      this.data.mappings.find(m => m.filePath === normalizedPath) || null
    );
  }

  /**
   * Get mapping by article ID
   */
  getMappingByArticleId(articleId: number): ArticleMapping | null {
    return (
      this.data.mappings.find(m => m.articleId === articleId) || null
    );
  }

  /**
   * Remove a mapping
   */
  async removeMapping(filePath: string): Promise<boolean> {
    const normalizedPath = path.resolve(filePath);
    const initialLength = this.data.mappings.length;
    
    this.data.mappings = this.data.mappings.filter(
      m => m.filePath !== normalizedPath
    );

    if (this.data.mappings.length < initialLength) {
      await this.save();
      return true;
    }

    return false;
  }

  /**
   * Get all mappings
   */
  getAllMappings(): ArticleMapping[] {
    return [...this.data.mappings];
  }

  /**
   * Clear all mappings
   */
  async clearMappings(): Promise<void> {
    this.data.mappings = [];
    await this.save();
  }

  /**
   * Calculate checksum for a file
   */
  static async calculateChecksum(content: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Check if file has changed since last sync
   */
  async hasFileChanged(filePath: string): Promise<boolean> {
    const mapping = this.getMappingByFile(filePath);
    if (!mapping || !mapping.checksum) return true;

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const currentChecksum = await DevToMapping.calculateChecksum(content);
      return currentChecksum !== mapping.checksum;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get mappings that need sync (files changed since last sync)
   */
  async getMappingsNeedingSync(): Promise<ArticleMapping[]> {
    const needsSync: ArticleMapping[] = [];

    for (const mapping of this.data.mappings) {
      if (await this.hasFileChanged(mapping.filePath)) {
        needsSync.push(mapping);
      }
    }

    return needsSync;
  }

  /**
   * Export mappings to CSV
   */
  async exportToCSV(outputPath: string): Promise<void> {
    const headers = ['File Path', 'Article ID', 'Title', 'Last Synced'];
    const rows = this.data.mappings.map(m => [
      m.filePath,
      m.articleId.toString(),
      `"${m.title.replace(/"/g, '""')}"`,
      m.lastSynced,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    await fs.writeFile(outputPath, csv, 'utf-8');
  }
}