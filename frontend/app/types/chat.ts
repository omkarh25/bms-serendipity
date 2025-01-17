/**
 * Available agent types in the system
 */
export type AgentType = 'accountant' | 'marketing' | 'tech'

/**
 * Message structure for chat interactions
 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

/**
 * Agent information structure
 */
export interface Agent {
  id: AgentType
  name: string
  description: string
  icon: string
  backgroundColor: string
}
