import { ContactsList } from '@/components/compatibility/contacts-list'
import { AddContactButton } from '@/components/compatibility/add-contact-button'

export default function CompatibilityPage() {
  return (
    <div className="px-4 pt-4 pb-8 space-y-4">
      <div className="flex items-start justify-between mt-2">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[2.5px]"
            style={{ color: 'rgba(226,183,85,.85)' }}>
            Синастрия
          </div>
          <h1 className="text-[26px] text-white mt-1" style={{ fontFamily: 'var(--font-serif)' }}>
            Совместимость
          </h1>
        </div>
        <div className="mt-1">
          <AddContactButton />
        </div>
      </div>
      <ContactsList />
    </div>
  )
}
