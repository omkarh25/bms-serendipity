import os
import json
import asyncio
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path

from openai import AsyncOpenAI
from supabase import create_client, Client

load_dotenv()

# Initialize OpenAI and Supabase clients
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

@dataclass
class ProcessedChunk:
    """Class to hold processed markdown chunk data."""
    url: str
    chunk_number: int
    title: str
    summary: str
    content: str
    metadata: Dict[str, Any]
    embedding: List[float]

def chunk_text(text: str, chunk_size: int = 5000) -> List[str]:
    """
    Split text into chunks, respecting code blocks and paragraphs.
    
    Args:
        text: The text to split into chunks
        chunk_size: Maximum size of each chunk
        
    Returns:
        List of text chunks
    """
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        # Calculate end position
        end = start + chunk_size

        # If we're at the end of the text, just take what's left
        if end >= text_length:
            chunks.append(text[start:].strip())
            break

        # Try to find a code block boundary first (```)
        chunk = text[start:end]
        code_block = chunk.rfind('```')
        if code_block != -1 and code_block > chunk_size * 0.3:
            end = start + code_block

        # If no code block, try to break at a paragraph
        elif '\n\n' in chunk:
            # Find the last paragraph break
            last_break = chunk.rfind('\n\n')
            if last_break > chunk_size * 0.3:  # Only break if we're past 30% of chunk_size
                end = start + last_break

        # If no paragraph break, try to break at a sentence
        elif '. ' in chunk:
            # Find the last sentence break
            last_period = chunk.rfind('. ')
            if last_period > chunk_size * 0.3:  # Only break if we're past 30% of chunk_size
                end = start + last_period + 1

        # Extract chunk and clean it up
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        # Move start position for next chunk
        start = max(start + 1, end)

    return chunks

async def get_title_and_summary(chunk: str, url: str) -> Dict[str, str]:
    """
    Extract title and summary using GPT-4.
    
    Args:
        chunk: Text chunk to analyze
        url: Source URL/path of the document
        
    Returns:
        Dictionary containing title and summary
    """
    system_prompt = """You are an AI that extracts titles and summaries from documentation chunks.
    Return a JSON object with 'title' and 'summary' keys.
    For the title: If this seems like the start of a document, extract its title. If it's a middle chunk, derive a descriptive title.
    For the summary: Create a concise summary of the main points in this chunk.
    Keep both title and summary concise but informative."""
    
    try:
        response = await openai_client.chat.completions.create(
            model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"URL: {url}\n\nContent:\n{chunk[:1000]}..."}  # Send first 1000 chars for context
            ],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error getting title and summary: {e}")
        return {"title": "Error processing title", "summary": "Error processing summary"}

async def get_embedding(text: str) -> List[float]:
    """
    Get embedding vector from OpenAI.
    
    Args:
        text: Text to get embedding for
        
    Returns:
        List of embedding values
    """
    try:
        response = await openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return [0] * 1536  # Return zero vector on error

async def process_chunk(chunk: str, chunk_number: int, url: str, category: str) -> ProcessedChunk:
    """
    Process a single chunk of text.
    
    Args:
        chunk: Text chunk to process
        chunk_number: Index of the chunk
        url: Source path of the document
        category: Document category (e.g., Serendipity, TradeManV1)
        
    Returns:
        ProcessedChunk object containing all processed data
    """
    # Get title and summary
    extracted = await get_title_and_summary(chunk, url)
    
    # Get embedding
    embedding = await get_embedding(chunk)
    
    # Create metadata
    metadata = {
        "source": "local_docs",
        "category": category,
        "chunk_size": len(chunk),
        "processed_at": datetime.now(timezone.utc).isoformat()
    }
    
    return ProcessedChunk(
        url=url,
        chunk_number=chunk_number,
        title=extracted['title'],
        summary=extracted['summary'],
        content=chunk,
        metadata=metadata,
        embedding=embedding
    )

async def insert_chunk(chunk: ProcessedChunk):
    """
    Insert a processed chunk into Supabase.
    
    Args:
        chunk: ProcessedChunk object to insert
    """
    try:
        data = {
            "url": chunk.url,
            "chunk_number": chunk.chunk_number,
            "title": chunk.title,
            "summary": chunk.summary,
            "content": chunk.content,
            "metadata": chunk.metadata,
            "embedding": chunk.embedding
        }
        
        result = supabase.table("md_files").insert(data).execute()
        print(f"Inserted chunk {chunk.chunk_number} for {chunk.url}")
        return result
    except Exception as e:
        print(f"Error inserting chunk: {e}")
        return None

async def process_and_store_document(file_path: str, category: str):
    """
    Process a markdown document and store its chunks.
    
    Args:
        file_path: Path to the markdown file
        category: Document category
    """
    try:
        # Read markdown content
        with open(file_path, 'r', encoding='utf-8') as f:
            markdown = f.read()
        
        # Split into chunks
        chunks = chunk_text(markdown)
        
        # Process chunks in parallel
        tasks = [
            process_chunk(chunk, i, file_path, category) 
            for i, chunk in enumerate(chunks)
        ]
        processed_chunks = await asyncio.gather(*tasks)
        
        # Store chunks in parallel
        insert_tasks = [
            insert_chunk(chunk) 
            for chunk in processed_chunks
        ]
        await asyncio.gather(*insert_tasks)
        
        print(f"Successfully processed: {file_path}")
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

async def process_docs_directory(docs_dir: str = "Docs"):
    """
    Process all markdown files in the Docs directory and its subdirectories.
    
    Args:
        docs_dir: Path to the docs directory
    """
    base_path = Path(docs_dir)
    
    if not base_path.exists():
        print(f"Directory not found: {docs_dir}")
        return
    
    # Process all .md files
    for md_file in base_path.rglob("*.md"):
        # Get category from parent directory name
        category = md_file.parent.name
        # Process the file
        await process_and_store_document(str(md_file), category)

async def main():
    """Main function to process all markdown files."""
    print("Starting document processing...")
    await process_docs_directory()
    print("Document processing completed")

if __name__ == "__main__":
    asyncio.run(main())
