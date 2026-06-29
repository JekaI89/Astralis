export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface AstroQuestion {
  userId: string
  question: string
  context?: {
    includeNatalChart?: boolean
    includeTransits?: boolean
    includeNumerology?: boolean
    referenceDate?: string
  }
}

export interface AstroAnswer {
  answer: string
  sources: string[]         // какие данные использовал ИИ
  suggestedQuestions: string[]
  tokenCount: number
}

export interface ChatSession {
  id: string
  userId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}
