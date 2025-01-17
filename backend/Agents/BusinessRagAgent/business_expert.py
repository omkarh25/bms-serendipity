from __future__ import annotations as _annotations

from dataclasses import dataclass
from dotenv import load_dotenv
import logfire
import asyncio
import httpx
import os

from pydantic_ai import Agent, ModelRetry, RunContext
from anthropic import AsyncAnthropic
from supabase import Client
from typing import List, Union
import numpy as np

load_dotenv()

# Initialize Claude model
model = 'anthropic:claude-3-opus-20240229'

logfire.configure(send_to_logfire='if-token-present')

@dataclass
class PydanticAIDeps:
    supabase: Client
    ai_client: AsyncAnthropic

system_prompt = """
You are an expert at understanding and explaining local documentation. You have access to various markdown files
containing documentation about different topics and projects.

Your job is to help users find and understand information from these documents. You can search through the content,
retrieve relevant sections, and provide clear explanations.

When answering questions:
1. Use RAG to find the most relevant documentation chunks first
2. Check the list of available documentation pages for additional context
3. Retrieve specific page content if needed for more detailed information
4. Provide clear, concise answers based on the documentation

Always be honest when you can't find relevant information in the documentation.
"""

# Create the agent instance
pydantic_ai_expert = Agent(
    model,
    system_prompt=system_prompt,
    deps_type=PydanticAIDeps,
    retries=2
)

# Global dependencies that will be used by tools
_deps: PydanticAIDeps = PydanticAIDeps(supabase=None, ai_client=None)

# Initialize the agent with dependencies
def init_agent(deps: PydanticAIDeps):
    """
    Initialize the agent with the given dependencies.
    
    Args:
        deps: Dependencies including Supabase and AI clients
    """
    global _deps
    _deps = deps

async def get_embedding(text: str, ai_client: AsyncAnthropic) -> List[float]:
    """
    Get embedding vector using Claude's API.
    
    Args:
        text (str): The text to generate embeddings for
        ai_client (AsyncAnthropic): The Claude client instance
        
    Returns:
        List[float]: The embedding vector. Returns a zero vector on error.
        
    Note:
        Claude uses a different embedding dimension than OpenAI.
        We're using Claude's text embedding capability through the messages API.
    """
    try:
        # Use Claude to generate embeddings through its messages API
        response = await ai_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1024,
            system="You are an embedding generator. Return a numerical vector representation of the input text.",
            messages=[{"role": "user", "content": f"Generate embedding for: {text}"}]
        )
        
        # Process Claude's response to extract embedding vector
        # Note: This is a simplified approach. You might want to implement
        # a more sophisticated parsing of Claude's response
        embedding_text = response.content[0].text
        # Convert text representation to numerical vector
        vector = np.fromstring(embedding_text.strip('[]'), sep=',')
        return vector.tolist()
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return [0] * 1024  # Return zero vector with Claude's embedding dimension

@pydantic_ai_expert.tool
async def retrieve_relevant_documentation(ctx: RunContext[PydanticAIDeps], user_query: str) -> str:
    """
    Retrieve relevant documentation chunks based on the query using RAG with Claude embeddings.
    
    Args:
        ctx: The context including the Supabase client and Claude client
        user_query: The user's question or query
        
    Returns:
        str: A formatted string containing the top 5 most relevant documentation chunks
    """
    try:
        # Get the embedding for the query
        query_embedding = await get_embedding(user_query, _deps.ai_client)
        
        # Query Supabase for relevant documents
        result = _deps.supabase.rpc(
            'match_md_files',
            {
                'query_embedding': query_embedding,
                'match_count': 5,
                'filter': {'source': 'local_docs'}
            }
        ).execute()
        
        if not result.data:
            return "No relevant documentation found."
            
        # Format the results
        formatted_chunks = []
        for doc in result.data:
            chunk_text = f"""
# {doc['title']}

{doc['content']}
"""
            formatted_chunks.append(chunk_text)
            
        # Join all chunks with a separator
        return "\n\n---\n\n".join(formatted_chunks)
        
    except Exception as e:
        print(f"Error retrieving documentation: {e}")
        return f"Error retrieving documentation: {str(e)}"

@pydantic_ai_expert.tool
async def list_documentation_pages(ctx: RunContext[PydanticAIDeps]) -> List[str]:
    """
    Retrieve a list of all available Pydantic AI documentation pages.
    
    Returns:
        List[str]: List of unique URLs for all documentation pages
    """
    try:
        # Query Supabase for unique URLs where source is local_docs
        result = _deps.supabase.from_('md_files') \
            .select('url') \
            .eq('metadata->>source', 'local_docs') \
            .execute()
        
        if not result.data:
            return []
            
        # Extract unique URLs
        urls = sorted(set(doc['url'] for doc in result.data))
        return urls
        
    except Exception as e:
        print(f"Error retrieving documentation pages: {e}")
        return []

@pydantic_ai_expert.tool
async def get_page_content(ctx: RunContext[PydanticAIDeps], url: str) -> str:
    """
    Retrieve the full content of a specific documentation page by combining all its chunks.
    
    Args:
        ctx: The context including the Supabase client
        url: The URL of the page to retrieve
        
    Returns:
        str: The complete page content with all chunks combined in order
    """
    try:
        # Query Supabase for all chunks of this URL, ordered by chunk_number
        result = _deps.supabase.from_('md_files') \
            .select('title, content, chunk_number') \
            .eq('url', url) \
            .eq('metadata->>source', 'local_docs') \
            .order('chunk_number') \
            .execute()
        
        if not result.data:
            return f"No content found for URL: {url}"
            
        # Format the page with its title and all chunks
        page_title = result.data[0]['title'].split(' - ')[0]  # Get the main title
        formatted_content = [f"# {page_title}\n"]
        
        # Add each chunk's content
        for chunk in result.data:
            formatted_content.append(chunk['content'])
            
        # Join everything together
        return "\n\n".join(formatted_content)
        
    except Exception as e:
        print(f"Error retrieving page content: {e}")
        return f"Error retrieving page content: {str(e)}"
