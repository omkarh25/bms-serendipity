/**
 * ChatInterface component for handling chat interactions with agents
 */
'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import { ChatMessage } from '../types/chat'
import { useUser } from '@clerk/nextjs'
import { TweetResponse } from '../types/tweet'
import CollapsibleInfo from './CollapsibleInfo'
import UsageStats from './UsageStats'

interface ChatInterfaceProps {
  agentId: string
}

interface MessageResponse {
  message: string
  usage?: {
    requestTokens: number
    responseTokens: number
    totalTokens: number
  }
  thinking?: string[]
  context?: string
}

/**
 * ChatInterface component for real-time chat interactions
 */
export default function ChatInterface({ agentId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<(ChatMessage & { details?: MessageResponse })[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [project, setProject] = useState('')
  const [emotion, setEmotion] = useState('')
  const [topic, setTopic] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * Handle tweet generation request
   */
  const handleTweetGeneration = async (e: FormEvent) => {
    e.preventDefault()
    if (!project || !emotion || !topic || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/generate-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project,
          emotion,
          topic
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate tweet')
      }

      const data: TweetResponse = await response.json()
      
      // Clean and format the response
      const tweet = data.tweet.replace(/^"|"$/g, '') // Remove surrounding quotes
      const chainOfThought = data.chain_of_thought
      const references = Array.isArray(data.references) 
        ? data.references 
        : data.references.split('\n').filter(Boolean)
      
      // Add tweet generation result to chat
      const assistantMessage: ChatMessage & { details?: MessageResponse } = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Generated Tweet:\n${tweet}`,
        timestamp: new Date(),
        details: {
          message: tweet,
          context: `Chain of Thought: ${chainOfThought}\n\nReferences: ${references.join('\n')}`
        }
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error generating tweet:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error generating tweets. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle sending a new message
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          agentId,
          userId: user?.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data: MessageResponse = await response.json()
      
      const assistantMessage: ChatMessage & { details?: MessageResponse } = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        details: data
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[700px] bg-white shadow-xl rounded-xl">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(message => (
          <div key={message.id} className="space-y-2">
            <div
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white ml-12'
                    : 'bg-gray-100 text-gray-800 mr-12'
                } p-4 rounded-2xl shadow-sm max-w-[85%]`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {message.details && (
                  <div className="mt-4 space-y-2">
                    {message.details.usage && (
                      <CollapsibleInfo title="Usage Statistics">
                        <UsageStats
                          requestTokens={message.details.usage.requestTokens}
                          responseTokens={message.details.usage.responseTokens}
                          totalTokens={message.details.usage.totalTokens}
                        />
                      </CollapsibleInfo>
                    )}
                    
                    {message.details.thinking && (
                      <CollapsibleInfo title="Thinking Steps">
                        <div className="space-y-2">
                          {message.details.thinking.map((step, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-blue-600 font-medium">{index + 1}.</span>
                              <p className="text-gray-700">{step}</p>
                            </div>
                          ))}
                        </div>
                      </CollapsibleInfo>
                    )}
                    
                    {message.details.context && (
                      <CollapsibleInfo title="Context">
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                            {message.details.context}
                          </pre>
                        </div>
                      </CollapsibleInfo>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl shadow-sm mr-12">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Tweet Generation Form - Only show for marketing agent */}
      {agentId === 'marketing' && (
        <form onSubmit={handleTweetGeneration} className="p-6 border-t bg-gray-50">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="Project"
            className="p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={isLoading}
          />
          <input
            type="text"
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            placeholder="Emotion"
            className="p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={isLoading}
          />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic"
            className="p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className={`w-full mb-4 px-6 py-4 rounded-xl text-white font-medium transition-all ${
            isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
          }`}
          disabled={isLoading}
        >
          Generate Tweets
        </button>
        </form>
      )}

      {/* Chat Input Form */}
      <form onSubmit={handleSubmit} className="p-6 border-t bg-gray-50">
        <div className="flex gap-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-6 py-4 rounded-xl text-white font-medium transition-all ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
            }`}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
