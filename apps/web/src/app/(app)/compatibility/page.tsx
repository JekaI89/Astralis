import { ContactsList } from '@/components/compatibility/contacts-list'
import { AddContactButton } from '@/components/compatibility/add-contact-button'

export default function CompatibilityPage() {
  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Совместимость</h1>
        <AddContactButton />
      </div>
      <ContactsList />
    </div>
  )
}
