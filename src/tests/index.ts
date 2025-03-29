import { DocumentProcessor } from "../lib/document-processor.js";
import path from "path";

async function runTests() {
  console.log("Running tests...");

  const processor = new DocumentProcessor();

  // Test file reading
  try {
    const testDir = path.join(process.cwd(), "tests", "data");
    const files = await processor.readMarkdownFiles(testDir);
    console.log("Found markdown files:", files);

    // Test file processing
    if (files.length > 0) {
      const result = await processor.processFile(files[0]);
      console.log("Processed file chunks:", result.chunks.length);
      console.log("Sample chunk:", JSON.stringify(result.chunks[0], null, 2));
    }

    console.log("All tests passed!");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

runTests();
