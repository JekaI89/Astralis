import { AstrologerChat } from '@/components/ai/astrologer-chat'

export default function AiChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="px-4 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold">ИИ-Астролог</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Задайте любой вопрос о вашей карте</p>
      </div>
      <AstrologerChat />
    </div>
  )
}
