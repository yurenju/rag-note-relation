#!/usr/bin/env node
import { Command } from 'commander';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const program = new Command();

program
  .name('note-relation')
  .description('A tool to discover connections between notes using RAG technology')
  .version('1.0.0');

// Index command
program
  .command('index')
  .description('Build index from a directory of notes')
  .argument('<directory>', 'Directory containing notes')
  .action(async (directory: string) => {
    try {
      console.log(`Indexing notes from directory: ${directory}`);
      // TODO: Implement indexing logic
    } catch (error) {
      console.error('Error during indexing:', error);
      process.exit(1);
    }
  });

// Search command
program
  .command('search')
  .description('Search for related notes')
  .argument('<file>', 'Note file to find relations for')
  .option('-l, --limit <number>', 'Number of results to return', '10')
  .action(async (file: string, options: { limit: string }) => {
    try {
      console.log(`Searching for notes related to: ${file}`);
      console.log(`Limit: ${options.limit}`);
      // TODO: Implement search logic
    } catch (error) {
      console.error('Error during search:', error);
      process.exit(1);
    }
  });

program.parse(); 