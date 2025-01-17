from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from anthropic import AsyncAnthropic
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid
import logging

from backend.Agents.BusinessRagAgent.business_expert import (
    pydantic_ai_expert,
    PydanticAIDeps
)

# Configure logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from root directory
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
logger.info("Looking for .env file at: %s", env_path)
load_dotenv(dotenv_path=env_path)

# Debug environment variables
logger.info("Environment variables loaded. SUPABASE_URL present: %s", bool(os.getenv("SUPABASE_URL")))
logger.info("SUPABASE_SERVICE_KEY present: %s", bool(os.getenv("SUPABASE_SERVICE_KEY")))

app = FastAPI(title="Tech Support Chat API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")  # Updated to match .env file

if not supabase_url or not supabase_key:
    raise ValueError("Supabase credentials not found in environment variables")

logger.info("Initializing Supabase client with URL: %s", supabase_url)
supabase_client = create_client(supabase_url, supabase_key)

# Initialize Anthropic client
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
if not anthropic_api_key:
    raise ValueError("Anthropic API key not found in environment variables")

ai_client = AsyncAnthropic(api_key=anthropic_api_key)

class ChatMessage(BaseModel):
    """
    Pydantic model for chat message requests
    """
    message: str
    agent_id: str
    user_id: str

async def get_deps() -> PydanticAIDeps:
    """
    Dependency injection for PydanticAIDeps
    
    Returns:
        PydanticAIDeps: Dependencies for the pydantic agent
    """
    return PydanticAIDeps(
        supabase=supabase_client,
        ai_client=ai_client
    )

async def save_chat_message(role: str, content: str, metadata: Dict[str, Any]) -> None:
    """
    Save a chat message to Supabase
    
    Args:
        role (str): Role of the message sender ('user' or 'assistant')
        content (str): Content of the message
        metadata (Dict[str, Any]): Additional metadata for the message
        
    Raises:
        HTTPException: If there's an error saving to Supabase
    """
    try:
        data = {
            'id': str(uuid.uuid4()),
            'timestamp': datetime.utcnow().isoformat(),
            'role': role,
            'content': content,
            'metadata': metadata,
            'saved_to_memory': False
        }
        
        result = supabase_client.table('user_chat').insert(data).execute()
        logger.info("Chat message saved successfully")
        
    except Exception as e:
        logger.error("Error saving chat message: %s", str(e))
        raise HTTPException(status_code=500, detail="Error saving chat message")

@app.post("/chat")
async def chat_endpoint(
    message: ChatMessage,
    deps: PydanticAIDeps = Depends(get_deps)
) -> Dict[str, Any]:
    """
    Handle chat messages and return AI responses
    
    Args:
        message (ChatMessage): The user's chat message
        deps (PydanticAIDeps): Dependencies for the pydantic agent
        
    Returns:
        Dict[str, Any]: The AI's response and metadata
        
    Raises:
        HTTPException: If there's an error processing the message
    """
    try:
        logger.info("Received chat message: %s", message.message)
        
        # Save user message
        await save_chat_message('user', message.message, {
            'agent_id': message.agent_id,
            'user_id': message.user_id
        })
        
        # Get AI response using the pydantic agent
        response = await pydantic_ai_expert.run(
            deps,
            user_input=message.message
        )
        
        # Save AI response
        await save_chat_message('assistant', response, {
            'agent_id': message.agent_id,
            'user_id': message.user_id,
            'agent': 'business_expert'
        })
        
        return {
            'message': response
        }
        
    except Exception as e:
        logger.error("Error processing chat message: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
