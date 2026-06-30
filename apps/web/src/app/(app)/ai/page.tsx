import { AstrologerChat } from '@/components/ai/astrologer-chat'

export default function AiChatPage() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 80px)',
      background: 'linear-gradient(160deg, #0A0915 0%, #120C24 50%, #160F29 100%)',
    }}>
      <div style={{ padding: '24px 16px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#E2B755', margin: '0 0 4px' }}>
          ИИ
        </p>
        <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>
          Астролог
        </h1>
      </div>
      <AstrologerChat />
    </div>
  )
}
