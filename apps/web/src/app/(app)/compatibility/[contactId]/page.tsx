import { CompatibilityReport } from '@/components/compatibility/compatibility-report'
import { ShareCompatibilityButton } from '@/components/compatibility/share-compatibility-button'

interface Props {
  params: { contactId: string }
}

export default function CompatibilityDetailPage({ params }: Props) {
  return (
    <div className="px-4 py-6 space-y-4">
      <CompatibilityReport contactId={params.contactId} />
      <ShareCompatibilityButton contactId={params.contactId} />
    </div>
  )
}
