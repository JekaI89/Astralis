'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { href: '/',              label: 'Главная',      icon: '🌟' },
  { href: '/chart',         label: 'Карта',        icon: '✨' },
  { href: '/compatibility', label: 'Союзы',        icon: '💫' },
  { href: '/numerology',   label: 'Нумеро',       icon: '🔢' },
  { href: '/ai',           label: 'Астролог',     icon: '🤖' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] safe-area-bottom z-50">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 gap-1 text-[10px] transition-colors',
                isActive
                  ? 'text-[var(--color-primary-light)]'
                  : 'text-[var(--color-text-muted)]',
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
