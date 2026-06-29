'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { href: '/',              label: 'Гороскоп',     icon: '☼' },
  { href: '/chart',         label: 'Карта',        icon: '✶' },
  { href: '/compatibility', label: 'Союзы',        icon: '♥' },
  { href: '/numerology',   label: 'Нумеро',       icon: '⬡' },
  { href: '/ai',           label: 'Астролог',     icon: '✦' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 px-3 safe-bottom"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      <div
        className="flex items-center justify-around rounded-[26px] px-2 py-2.5"
        style={{
          background: 'rgba(20,15,38,.78)',
          border: '1px solid rgba(255,255,255,.1)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          boxShadow: '0 12px 34px -10px rgba(0,0,0,.6)',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all',
                isActive ? 'bg-[rgba(226,183,85,.12)]' : '',
              )}
            >
              <span
                className="text-[19px] leading-none transition-all"
                style={
                  isActive
                    ? { color: '#E2B755', filter: 'drop-shadow(0 0 6px rgba(226,183,85,.6))' }
                    : { color: 'rgba(255,255,255,.5)' }
                }
              >
                {item.icon}
              </span>
              <span
                className="text-[10px] tracking-wide"
                style={{ color: isActive ? '#E2B755' : 'rgba(255,255,255,.45)' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
