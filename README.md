# Note Relation Generator

A tool that uses RAG (Retrieval-Augmented Generation) technology to help you discover connections between your notes. It analyzes your Markdown notes and uses a vector database to find the most relevant content.

This project is primarily created for learning RAG technology and is not intended for production use. Most of the code was written with the assistance of Cursor, an AI-powered IDE, as a learning exercise in implementing RAG concepts.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yurenju/rag-note-relation.git
cd rag-note-relation
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage

All commands should be run using `npm run dev`. This will use your local development code, making it convenient for testing and debugging.

### 1. Initialize Vector Database

Before using the tool, you need to initialize the vector database:

```bash
npm run dev -- init [--db-path <path>] [--overwrite]
```

Options:

- `--db-path <path>`: Specify the storage location for the vector database (default: ./.lancedb)
- `--overwrite`: Overwrite existing database

### 2. Search Related Notes

```bash
npm run dev -- search <file> [-l, --limit <number>] [--db-path <path>]
```

Options:

- `<file>`: The note file to find relations for
- `-l, --limit <number>`: Number of results to return (default: 5)
- `--db-path <path>`: Vector database location (default: ./.lancedb)

The search results will include:

- Similarity percentage with the input note
- File path of the related note
- An AI-generated explanation of why the notes are related

### Examples:

```bash
# Initialize database
npm run dev -- init --db-path ./my-db

# Search related notes
npm run dev -- search ./notes/my-note.md -l 10
```

## Technical Details

- Uses [jina-embeddings-v2-base-zh](https://huggingface.co/Xenova/jina-embeddings-v2-base-zh) model for text vectorization
- Uses [LanceDB](https://github.com/lancedb/lancedb) as the vector database
- Uses [OpenAI GPT-4o-mini](https://platform.openai.com/) for explaining note relationships
- Supports Markdown format notes
- Automatically splits notes into smaller chunks for better search accuracy
- Uses cosine similarity to calculate relationships between notes

## Project Documentation

For more detailed information about this project, please refer to the following documents:

1. **Project Vision** - Project goals, features, and expected benefits ([EN](docs/project-vision.md) | [中文](docs/project-vision.zh-TW.md))

2. **Development Guide** - System architecture, CLI usage, and development setup ([EN](docs/development.md) | [中文](docs/development.zh-TW.md))

3. **Implementation Details** - Detailed development phases and technical implementation ([EN](docs/implementation-plan.md) | [中文](docs/implementation-plan.zh-TW.md))

## License

MIT License
