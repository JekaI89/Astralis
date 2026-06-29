import { NumerologyProfileView } from '@/components/numerology/numerology-profile-view'
import { PersonalCycleChart } from '@/components/numerology/personal-cycle-chart'
import { NumberAnalyzerTool } from '@/components/numerology/number-analyzer-tool'

export default function NumerologyPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Нумерология</h1>
      <NumerologyProfileView />
      <PersonalCycleChart />
      <NumberAnalyzerTool />
    </div>
  )
}
