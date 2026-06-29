import { NatalChartView } from '@/components/chart/natal-chart-view'
import { TransitsPanel } from '@/components/chart/transits-panel'
import { ChartChaptersNav } from '@/components/chart/chart-chapters-nav'

export default function ChartPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Космический паспорт</h1>
      <NatalChartView />
      <ChartChaptersNav />
      <TransitsPanel />
    </div>
  )
}
