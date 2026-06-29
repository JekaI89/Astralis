import { DailyHoroscopeCard } from '@/components/horoscope/daily-horoscope-card'
import { MoodTrackerWidget } from '@/components/mood/mood-tracker-widget'
import { LunarDayWidget } from '@/components/lunar/lunar-day-widget'
import { CardOfDayWidget } from '@/components/tarot/card-of-day-widget'
import { NumerologyDayBadge } from '@/components/numerology/numerology-day-badge'

export default function HomePage() {
  return (
    <div className="px-4 py-6 space-y-4">
      <DailyHoroscopeCard />
      <div className="grid grid-cols-2 gap-3">
        <LunarDayWidget />
        <NumerologyDayBadge />
      </div>
      <CardOfDayWidget />
      <MoodTrackerWidget />
    </div>
  )
}
