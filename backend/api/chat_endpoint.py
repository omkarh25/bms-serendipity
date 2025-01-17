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

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from Agents.BusinessRagAgent.business_expert import (
    pydantic_ai_expert,
    PydanticAIDeps,
    init_agent
)
from Agents.MarketingAgent.tweetGenerator import TweetGenerator


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
    allow_origins=["http://localhost:3000"],  # Frontend development server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

class TweetRequest(BaseModel):
    """
    Pydantic model for tweet generation requests
    """
    project: str
    emotion: Optional[str] = "Upbeat"
    topic: Optional[str] = "General"

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
        message_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        logger.info("=== Saving Chat Message ===")
        logger.info("Message ID: %s", message_id)
        logger.info("Role: %s", role)
        logger.info("Timestamp: %s", timestamp)
        logger.info("Content length: %d characters", len(content))
        logger.info("Metadata: %s", metadata)
        
        data = {
            'id': message_id,
            'timestamp': timestamp,
            'role': role,
            'content': content,
            'metadata': metadata,
            'saved_to_memory': False
        }
        
        logger.info("Executing Supabase insert operation")
        result = supabase_client.table('user_chat').insert(data).execute()
        logger.info("Supabase insert successful")
        logger.info("Response status: %s", result.status_code if hasattr(result, 'status_code') else 'N/A')
        
    except Exception as e:
        logger.error("=== Error Saving Chat Message ===")
        logger.error("Error type: %s", type(e).__name__)
        logger.error("Error message: %s", str(e))
        logger.error("Error details:", exc_info=True)
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
        # Log request details
        logger.info("=== Processing Chat Request ===")
        logger.info("Message: %s", message.message)
        logger.info("Agent ID: %s", message.agent_id)
        logger.info("User ID: %s", message.user_id)
        
        # Log dependencies status
        logger.info("=== Checking Dependencies ===")
        logger.info("Supabase client initialized: %s", bool(deps.supabase))
        logger.info("AI client initialized: %s", bool(deps.ai_client))
        
        logger.info("=== Saving User Message ===")
        # Save user message
        await save_chat_message('user', message.message, {
            'agent_id': message.agent_id,
            'user_id': message.user_id
        })
        
        logger.info("=== Getting AI Response ===")
        # Initialize agent with dependencies
        logger.info("Initializing AI agent with dependencies")
        init_agent(deps)
        
        # Get AI response using the pydantic agent
        logger.info("Running AI agent with message")
        result = await pydantic_ai_expert.run(message.message)
        
        logger.info("=== Processing AI Response ===")
        logger.info("Raw result type: %s", type(result))
        # Extract components from the RunResult
        raw_response = str(result)
        logger.info("Raw response length: %d characters", len(raw_response))
        
        # Extract thinking steps
        thinking_steps = []
        if "<thinking>" in raw_response:
            thinking_parts = raw_response.split("<thinking>")
            for part in thinking_parts[1:]:  # Skip first part before thinking
                if "</thinking>" in part:
                    step = part.split("</thinking>")[0].strip()
                    if step:
                        thinking_steps.append(step)
        
        # Extract main message content
        message_content = raw_response
        
        # Clean up the message content
        cleanup_markers = [
            "RunResult(_all_messages=[ModelRequest(parts=",
            "SystemPromptPart(content=",
            "UserPromptPart(content=",
            "ModelResponse(parts=[TextPart(content=",
            "<thinking>",
            "</thinking>",
            "Hello! I'm an AI assistant"
        ]
        
        for marker in cleanup_markers:
            if marker in message_content:
                message_content = message_content.split(marker)[-1]
        
        # Remove any trailing metadata or system text
        if "), UserPromptPart" in message_content:
            message_content = message_content.split("), UserPromptPart")[0]
        if "), timestamp=" in message_content:
            message_content = message_content.split("), timestamp=")[0]
            
        message_content = message_content.strip().strip("'").strip('"')
        
        # Extract usage information from the result metadata
        usage = None
        if hasattr(result, '_usage'):
            usage = {
                'requestTokens': getattr(result._usage, 'request_tokens', 0),
                'responseTokens': getattr(result._usage, 'response_tokens', 0),
                'totalTokens': getattr(result._usage, 'total_tokens', 0)
            }
        
        # Create the structured response
        structured_response = {
            'message': message_content,
            'thinking': thinking_steps if thinking_steps else None,
            'usage': usage,
            'context': raw_response if thinking_steps else None  # Include raw response as context if thinking steps exist
        }
        
        logger.info("=== Saving AI Response ===")
        # Save AI response with metadata
        await save_chat_message('assistant', message_content, {
            'agent_id': message.agent_id,
            'user_id': message.user_id,
            'agent': 'business_expert',
            'thinking_steps': thinking_steps,
            'usage': usage
        })
        
        logger.info("=== Request Complete ===")
        return structured_response
        
    except Exception as e:
        logger.error("=== Error Processing Request ===")
        logger.error("Error type: %s", type(e).__name__)
        logger.error("Error message: %s", str(e))
        logger.error("Error details:", exc_info=True)  # This includes the full stack trace
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-tweet")
async def generate_tweet(request: TweetRequest) -> Dict[str, Any]:
    """
    Generate a tweet based on project context and preferences
    
    Args:
        request (TweetRequest): Tweet generation parameters
        
    Returns:
        Dict[str, Any]: Generated tweet data
        
    Raises:
        HTTPException: If there's an error generating the tweet
    """
    try:
        logger.info("=== Processing Tweet Generation Request ===")
        logger.info("Project: %s", request.project)
        logger.info("Emotion: %s", request.emotion)
        logger.info("Topic: %s", request.topic)
        
        # Initialize tweet generator
        tweet_generator = TweetGenerator(request.project)
        
        # Generate tweet
        logger.info("Generating tweet...")
        result = tweet_generator.generate(
            emotion=request.emotion,
            topic=request.topic
        )
        
        if not result:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate tweet"
            )
            
        # Structure the response
        response = {
            "tweet": result.tweets,
            "chain_of_thought": result.cot,
            "references": result.references,
            "metadata": {
                "project": request.project,
                "emotion": request.emotion,
                "topic": request.topic,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # Save the tweet
        logger.info("Saving generated tweet...")
        tweet_generator.save_tweet(result, 0)  # Save first tweet
        
        logger.info("=== Tweet Generation Complete ===")
        return response
        
    except Exception as e:
        logger.error("=== Error Generating Tweet ===")
        logger.error("Error type: %s", type(e).__name__)
        logger.error("Error message: %s", str(e))
        logger.error("Error details:", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
