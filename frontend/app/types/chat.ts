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

/**
 * Accountant chat request structure
 */
export interface AccountantChatRequest {
  message: string
  user_id: string
  is_sql_query: boolean
}

/**
 * Accountant chat response structure
 */
export interface AccountantChatResponse {
  message: string
  sql_query?: string
  results?: Record<string, number | string>[]
  error?: string
}
