# Note Relation Generator

A tool that uses RAG (Retrieval-Augmented Generation) technology to help you discover connections between your notes. It analyzes your Markdown notes and uses a vector database to find the most relevant content.

## Installation

```bash
npm install -g rag-note-relation
```

## Usage

### 1. Initialize Vector Database

Before using the tool, you need to initialize the vector database:

```bash
rag-note-relation init [--db-path <path>] [--overwrite]
```

Options:

- `--db-path <path>`: Specify the storage location for the vector database (default: ./.lancedb)
- `--overwrite`: Overwrite existing database

### 2. Search Related Notes

```bash
rag-note-relation search <file> [-l, --limit <number>] [--db-path <path>]
```

Options:

- `<file>`: The note file to find relations for
- `-l, --limit <number>`: Number of results to return (default: 5)
- `--db-path <path>`: Vector database location (default: ./.lancedb)

## Technical Details

- Uses [jina-embeddings-v2-base-zh](https://huggingface.co/Xenova/jina-embeddings-v2-base-zh) model for text vectorization
- Uses [LanceDB](https://github.com/lancedb/lancedb) as the vector database
- Supports Markdown format notes
- Automatically splits notes into smaller chunks for better search accuracy
- Uses cosine similarity to calculate relationships between notes

## Project Vision and Overview

For more information about the project's vision and overview, please refer to:

- [English Version](docs/project-vision.md)
- [Traditional Chinese Version](docs/project-vision.zh-TW.md)

## Development

1. Clone the repository:

```bash
git clone https://github.com/your-username/rag-note-relation.git
cd rag-note-relation
```

2. Install dependencies:

```bash
npm install
```

3. Development mode:

During development, you can use `npm run dev` to run the program. All commands can be used by adding `--` after `npm run dev`:

```bash
# Initialize database
npm run dev -- init [--db-path <path>] [--overwrite]

# Search related notes
npm run dev -- search <file> [-l, --limit <number>] [--db-path <path>]

# Examples:
npm run dev -- init --db-path ./my-db
npm run dev -- search ./notes/my-note.md -l 10
```

These commands will use your local development code, making it convenient for testing and debugging.

## License

MIT License
