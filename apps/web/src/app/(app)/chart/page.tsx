import { NatalChartView } from '@/components/chart/natal-chart-view'
import { TransitsPanel } from '@/components/chart/transits-panel'
import { ChartChaptersNav } from '@/components/chart/chart-chapters-nav'

export default function ChartPage() {
  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      <div className="text-center mt-2">
        <div className="text-[11px] font-medium uppercase tracking-[2.5px]"
          style={{ color: 'rgba(226,183,85,.85)' }}>
          Космический паспорт
        </div>
        <h1 className="text-[26px] text-white mt-1" style={{ fontFamily: 'var(--font-serif)' }}>
          Натальная карта
        </h1>
      </div>
      <NatalChartView />
      <ChartChaptersNav />
      <TransitsPanel />
    </div>
  )
}
