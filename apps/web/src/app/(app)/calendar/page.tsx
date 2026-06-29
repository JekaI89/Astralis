import { LunarCalendarGrid } from '@/components/lunar/lunar-calendar-grid'

export default function CalendarPage() {
  return (
    <div className="px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Лунный календарь</h1>
      <LunarCalendarGrid />
    </div>
  )
}
