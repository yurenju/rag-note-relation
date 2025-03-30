import { connect } from "@lancedb/lancedb";
import { pipeline, Pipeline } from "@huggingface/transformers";
import {
  Schema,
  Field,
  Utf8,
  Float32,
  FixedSizeList,
  Int32,
} from "apache-arrow";
import { Table, Index } from "@lancedb/lancedb";
import { DocumentProcessor } from "./document-processor.js";
import { existsSync } from "fs";

interface ChunkMetadata {
  loc: {
    lines: {
      from: number;
      to: number;
    };
  };
  source: string;
}

export interface VectorData extends Record<string, unknown> {
  id: string;
  text: string;
  embeddings: number[];
  source: string;
  from?: number;
  to?: number;
}

export interface SearchResult {
  id: string;
  text: string;
  metadata: string;
  _distance: number;
}

type FeatureExtractionPipeline = Pipeline & {
  (
    text: string | string[],
    options: { pooling: string; normalize: boolean }
  ): Promise<{
    data: Float32Array;
  }>;
};

export class Vectorizer {
  private dbPath: string;
  private modelName = "Xenova/jina-embeddings-v2-base-zh";
  private tableName = "documents";
  private vectorDimension = 768;
  private pipe: FeatureExtractionPipeline | null = null;
  private processor: DocumentProcessor;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.processor = new DocumentProcessor();
  }

  private async ensurePipeline() {
    if (!this.pipe) {
      this.pipe = (await pipeline(
        "feature-extraction",
        this.modelName
      )) as unknown as FeatureExtractionPipeline;
    }
    return this.pipe;
  }

  private async waitForIndex(table: Table, indexName: string): Promise<void> {
    const POLL_INTERVAL = 10000; // 10 seconds
    while (true) {
      const indices = await table.listIndices();
      if (indices.some((index) => index.name === indexName)) {
        break;
      }
      console.log(`⏳ Waiting for ${indexName} to be ready...`);
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
    console.log(`✅ ${indexName} is ready!`);
  }

  async vectorize(text: string): Promise<number[]> {
    const pipe = await this.ensurePipeline();
    if (!pipe || !pipe.model) {
      throw new Error("Failed to initialize pipeline");
    }
    const result = await pipe(text, { pooling: "mean", normalize: true });
    return Array.from(result.data);
  }

  async createTable(overwrite: boolean = false) {
    // Check if database already exists
    if (existsSync(this.dbPath) && !overwrite) {
      console.log(
        `Database already exists at ${this.dbPath}, skipping initialization`
      );
      const db = await connect(this.dbPath);
      return await db.openTable(this.tableName);
    }

    const db = await connect(this.dbPath);

    // Process all markdown files in notes directory
    console.log("Processing markdown files...");
    const allFiles = await this.processor.readMarkdownFiles("./notes");

    console.log("Vectorizing chunks...");
    const data: VectorData[] = [];
    for (const file of allFiles) {
      console.log(`Processing ${file}...`);
      const processedData = await this.processor.processFile(file);
      for (let i = 0; i < processedData.chunks.length; i++) {
        const chunk = processedData.chunks[i];
        const embeddings = await this.vectorize(chunk.text);
        const metadata = chunk.metadata as ChunkMetadata;
        data.push({
          id: `${processedData.path}-${i}`,
          text: chunk.text,
          embeddings,
          source: metadata.source,
          from: metadata.loc.lines.from,
          to: metadata.loc.lines.to,
        });
      }
    }

    if (data.length === 0) {
      throw new Error("No markdown files found in notes directory");
    }

    console.log(`Total chunks processed: ${data.length}`);

    console.log("Creating schema...");
    const schema = new Schema([
      new Field("id", new Utf8(), false),
      new Field("text", new Utf8(), false),
      new Field(
        "embeddings",
        new FixedSizeList(
          this.vectorDimension,
          new Field("item", new Float32(), true)
        ),
        false
      ),
      new Field("source", new Utf8(), false),
      new Field("from", new Int32(), true),
      new Field("to", new Int32(), true),
    ]);

    console.log("Creating table with test data...");
    // First create an empty table with schema
    const table = await db.createTable(this.tableName, data, {
      schema,
      mode: "overwrite",
    });

    // Create vector index
    console.log("Creating vector index...");
    await table.createIndex("embeddings", {
      config: Index.ivfPq({
        distanceType: "cosine",
      }),
    });

    // Wait for the index to be ready
    const indexName = "embeddings_idx";
    await this.waitForIndex(table, indexName);
    console.log(await table.indexStats(indexName));

    return table;
  }

  async addDocuments(documents: VectorData[]) {
    const db = await connect(this.dbPath);
    const table = await db.openTable(this.tableName);
    const records = documents.map((doc) => ({
      ...doc,
      metadata: JSON.stringify(doc.metadata),
    }));
    await table.add(records);
  }

  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    const queryVector = await this.vectorize(query);
    const db = await connect(this.dbPath);
    const table = await db.openTable(this.tableName);

    const results = await table
      .search(queryVector)
      .select(["id", "text", "source", "from", "to"])
      .limit(limit)
      .toArray();

    return results.map((result: any) => ({
      id: result.id,
      text: result.text,
      metadata: `📄 ${result.source} (Lines ${result.from}-${result.to})`,
      _distance: result._distance,
    }));
  }
}
