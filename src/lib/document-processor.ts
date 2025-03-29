import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import fs from 'fs/promises';
import path from 'path';

export class DocumentProcessor {
  private splitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 400,
      separators: ['。', '！', '？', '\n\n', '\n', ' ', '']
    });
  }

  /**
   * Recursively read all markdown files from a directory
   */
  async readMarkdownFiles(directory: string): Promise<string[]> {
    const files: string[] = [];
    
    async function walk(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    }

    await walk(directory);
    return files;
  }

  /**
   * Read and process a single markdown file
   */
  async processFile(filePath: string) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const chunks = await this.splitter.createDocuments([content]);
      
      return {
        path: filePath,
        chunks: chunks.map(chunk => ({
          text: chunk.pageContent,
          metadata: {
            ...chunk.metadata,
            source: filePath
          }
        }))
      };
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      throw error;
    }
  }
} 