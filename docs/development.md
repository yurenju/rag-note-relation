# Development Documentation

## System Overview

Note Relation Generator is a command-line tool designed to help users discover connections between their notes. Built with TypeScript, the system consists of two core functionalities: index building and relation querying.

## System Architecture

### 1. Index Building Process

1. **Document Processing**
   - Reads all Markdown files from the specified directory
   - Uses RecursiveCharacterTextSplitter from @langchain/textsplitters for document splitting
   - Sets chunk size to 800 characters with 400 characters overlap
   - Uses appropriate separators for Chinese content (e.g., 。！？)

2. **Vector Processing**
   - Converts each text chunk into vectors using the Embedding model
   - Uses jinaai/jina-embeddings-v2-base-zh model
   - Model is automatically downloaded from Hugging Face

3. **Data Storage**
   - Uses LanceDB as the vector database
   - Stores document metadata (filename, path, etc.)
   - Stores vector data for each chunk

### 2. Query Process

1. **Query Processing**
   - Receives query document from user
   - Applies the same text splitting logic to the query document
   - Converts query document into vectors

2. **Similarity Search**
   - Performs vector similarity search in LanceDB
   - Uses Cosine Similarity for calculations
   - Returns the top 10 most similar results

## Command Line Interface

### Basic Usage

```bash
# Show help
note-relation --help

# Build index
note-relation index <directory>

# Query related notes
note-relation search <file>
```

### Subcommands

1. **index**: Build index
   ```bash
   # Build index for specified directory
   note-relation index ./notes
   ```

2. **search**: Query related notes
   ```bash
   # Search for notes related to a specific file
   note-relation search ./notes/my-note.md
   
   # Limit number of results
   note-relation search ./notes/my-note.md --limit 5
   ```

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development version:
   ```bash
   # Build index
   npm run dev -- index ./notes

   # Search related notes
   npm run dev -- search ./notes/my-note.md
   ```

3. Build project:
   ```bash
   npm run build
   ```

## Important Notes

1. Index must be built before first use
2. Index building process may take time depending on the number and size of documents
3. System runs locally without requiring any external API keys 