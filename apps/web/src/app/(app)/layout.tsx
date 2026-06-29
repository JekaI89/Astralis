import { BottomNav } from '@/components/navigation/bottom-nav'
import { TelegramInit } from '@/components/telegram/telegram-init'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <TelegramInit />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
