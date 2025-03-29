#!/usr/bin/env node
import { Command } from "commander";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Vectorizer } from "./lib/vectorizer.js";
import path from "path";
import { DocumentProcessor } from "./lib/document-processor.js";

const program = new Command();

program
  .name("note-relation")
  .description(
    "A tool to discover connections between notes using RAG technology"
  )
  .version("1.0.0");

// Index command
program
  .command("index")
  .description("Build index from a directory of notes")
  .argument("<directory>", "Directory containing notes")
  .action(async (directory: string) => {
    try {
      console.log(`Indexing notes from directory: ${directory}`);
      // TODO: Implement indexing logic
    } catch (error) {
      console.error("Error during indexing:", error);
      process.exit(1);
    }
  });

// Search command
program
  .command("search")
  .description("Search for related notes")
  .argument("<file>", "Note file to find relations for")
  .option("-l, --limit <number>", "Number of results to return", "5")
  .option("--db-path <path>", "Path to the vector database", "./.lancedb")
  .action(async (file: string, options: { limit: string; dbPath: string }) => {
    try {
      const dbPath = path.resolve(options.dbPath);
      const vectorizer = new Vectorizer(dbPath);
      const limit = parseInt(options.limit, 10);

      // Read the content of the input file
      const processor = new DocumentProcessor();
      const { chunks } = await processor.processFile(file);

      if (chunks.length === 0) {
        console.error("Error: Could not process the input file");
        process.exit(1);
      }

      // Use the first chunk as query
      const query = chunks[0].text;
      console.log(`🔍 Finding notes related to: ${file}`);
      console.log(`📊 Limit: ${limit} results`);

      const results = await vectorizer.search(query, limit);

      if (results.length === 0) {
        console.log("\n❌ No related notes found.");
        return;
      }

      // Filter out the input file from results
      const filteredResults = results.filter(
        (result) => !result.metadata.includes(file)
      );

      if (filteredResults.length === 0) {
        console.log("\n❌ No other related notes found.");
        return;
      }

      console.log("\n📝 Related Notes:\n");
      filteredResults.forEach((result, index) => {
        const similarity = ((1 - result._distance) * 100).toFixed(2);
        console.log(`${index + 1}. Similarity: ${similarity}%`);
        console.log(`   ${result.metadata}`);
      });
    } catch (error) {
      console.error("Error during search:", error);
      process.exit(1);
    }
  });

program
  .command("init")
  .description("Initialize the vector database")
  .option("--db-path <path>", "Path to the vector database", "./.lancedb")
  .option("-o, --overwrite", "Overwrite existing database", false)
  .action(async (options) => {
    try {
      const dbPath = path.resolve(options.dbPath);
      const vectorizer = new Vectorizer(dbPath);
      await vectorizer.createTable(options.overwrite);
      console.log("Vector database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize vector database:", error);
      process.exit(1);
    }
  });

program.parse();
