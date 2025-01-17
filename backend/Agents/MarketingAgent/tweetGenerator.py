"""
Tweet generation module using DSPy.
Implements tweet generation with RAG support and emotion/topic customization.
"""

import dspy
import json
import os
from datetime import datetime
from typing import List, Dict, Optional
# from .rag import RAG # TODO: Implement existing Supabase RAG similar to business_expert.py

lm = dspy.LM('ollama_chat/llama3.2', api_base='http://localhost:11434', api_key='')
dspy.configure(lm=lm)

class TweetSignature(dspy.Signature):
    """
    An Impactful Master Tweet Generator who relates the given topic to the context and generates explosive tweets.
    """
    
    context = dspy.InputField()
    emotion = dspy.InputField()
    topic = dspy.InputField()
    
    tweets = dspy.OutputField(prefix="Generate impactful tweet taking into account the context, add emotion inducing NLP words, and relate the given topic to the context.")
    cot = dspy.OutputField(prefix="Explain your thought process for generating this tweet.")
    references = dspy.OutputField(prefix="List the key references from the context that influenced this tweet.")

class TweetGenerator(dspy.Module):
    """
    Module for generating customized tweets using RAG and LLM.
    
    Attributes:
        rag: RAG module instance for context retrieval
        project: Current project context
        save_path: Path to save generated tweets
    """
    
    def __init__(self, project: str):
        """
        Initialize tweet generator with project context.
        
        Args:
            project: Name of the project for context retrieval
        """
        super().__init__()
        
        self.project = project
        # TODO: Initialize RAG when implemented
        # self.rag = RAG(project)
        
        # Create predictor for tweet generation
        self.predictor = dspy.ChainOfThought(TweetSignature)
        
        # Ensure tweets directory exists in project root
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        self.save_path = os.path.join(base_path, 'Database', 'Tweets')
        os.makedirs(self.save_path, exist_ok=True)
        print(f"[INFO] Tweet save directory: {self.save_path}")
        
        print(f"[INFO] Tweet generator initialized for project: {project}")

    def loadContext(self, project):
        """
        Load context from project documentation.
        
        Args:
            project: Name of the project folder in Docs directory
            
        Returns:
            List of strings containing document contents
        """
        try:
            # Get the path to the Docs directory (two levels up from current file)
            base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            docs_path = os.path.join(base_path, 'Docs', project)
            
            print(f"[INFO] Loading context from: {docs_path}")
            
            context = []
            if not os.path.exists(docs_path):
                print(f"[WARNING] Project docs path not found: {docs_path}")
                return context
                
            for file in os.listdir(docs_path):
                if file.endswith('.md'):
                    file_path = os.path.join(docs_path, file)
                    print(f"[INFO] Reading file: {file_path}")
                    with open(file_path, 'r') as f:
                        context.append(f.read())
                        
            print(f"[INFO] Loaded {len(context)} document(s)")
            return context
            
        except Exception as e:
            print(f"[ERROR] Failed to load context: {str(e)}")
            return []
    
    def generate(self, emotion: str = "Upbeat", topic: str = "General") -> Dict:
        """
        Generate tweets based on project context and preferences.
        
        Args:
            emotion: Desired emotional tone
            topic: Main topic or focus
            
        Returns:
            Dictionary containing generated tweets, reasoning, and references
        """
        try:
            # TODO: Use RAG for context retrieval when implemented
            # context = self.rag.retrieve_context(f"{self.project} {topic}")
            
            # For now, provide full contents of the project folder as context

            context = self.loadContext(self.project)

            context = [{"text": f"ProjectContext: {context}, Topic: {topic}"}]
            print('context:', context)

            if not context:
                print("[WARNING] No context retrieved, using minimal context")
                context = [{"text": f"Project: {self.project}, Topic: {topic}"}]
            
            # Extract text from context dictionaries and join
            context_texts = [ctx['text'] for ctx in context if isinstance(ctx, dict) and 'text' in ctx]
            if not context_texts:
                print("[WARNING] No valid text found in context")
                context_texts = [f"Project: {self.project}, Topic: {topic}"]
            
            # Generate tweets
            result = self.predictor(
                context="\n".join(context_texts),
                emotion=emotion,
                topic=topic
            )

            print('result:', result)
            
            # Return the Prediction object directly
            return result
            
        except Exception as e:
            print(f"[ERROR] Tweet generation failed: {str(e)}")
            return {}
    
    def save_tweet(self, tweet_data: Dict, tweet_index: int) -> bool:
        """
        Save selected tweet with metadata to JSON file.
        
        Args:
            tweet_data: Generated tweet data
            tweet_index: Index of selected tweet
            
        Returns:
            Boolean indicating success
        """
        try:
            # Prepare data for saving
            save_data = {
                "tweet": tweet_data.tweets,
                "project": self.project,
                "timestamp": datetime.now().isoformat(),
                "emotion": tweet_data.emotion,
                "topic": tweet_data.topic,
                "chain_of_thought": tweet_data.cot,
                "references": tweet_data.references
            }
            
            # Load existing tweets
            file_path = os.path.join(self.save_path, f"{self.project}_tweets.json")
            existing_tweets = []
            
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    existing_tweets = json.load(f)
            
            # Append new tweet
            existing_tweets.append(save_data)
            
            # Save updated tweets
            with open(file_path, 'w') as f:
                json.dump(existing_tweets, f, indent=2)
            
            print(f"[INFO] Tweet saved successfully to {file_path}")
            return True
            
        except Exception as e:
            print(f"[ERROR] Failed to save tweet: {str(e)}")
            return False
    
    def load_tweets(self) -> List[Dict]:
        """
        Load all saved tweets for the current project.
        
        Returns:
            List of saved tweets with metadata
        """
        try:
            file_path = os.path.join(self.save_path, f"{self.project}_tweets.json")
            
            if not os.path.exists(file_path):
                print(f"[INFO] No saved tweets found for project: {self.project}")
                return []
            
            with open(file_path, 'r') as f:
                tweets = json.load(f)
            
            print(f"[INFO] Loaded {len(tweets)} saved tweets")
            return tweets
            
        except Exception as e:
            print(f"[ERROR] Failed to load tweets: {str(e)}")
            return []
