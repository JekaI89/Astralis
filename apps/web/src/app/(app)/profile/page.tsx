import { ProfileForm } from '@/components/profile/profile-form'
import { NotificationSettings } from '@/components/profile/notification-settings'
import { PremiumBanner } from '@/components/profile/premium-banner'

export default function ProfilePage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Профиль</h1>
      <PremiumBanner />
      <ProfileForm />
      <NotificationSettings />
    </div>
  )
}
