export interface SharePayload {
  title: string
  text: string
  url: string
  imageUrl?: string
}

export function buildCompatibilityShareText(
  userName: string,
  partnerName: string,
  score: number,
): string {
  return `✨ ${userName} и ${partnerName} совместимы на ${score}%!\nПроверьте свою совместимость в Astralis`
}

export function buildReferralUrl(baseUrl: string, referralCode: string): string {
  return `${baseUrl}/join?ref=${referralCode}`
}

export async function shareNative(payload: SharePayload): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await navigator.share({ title: payload.title, text: payload.text, url: payload.url })
      return true
    } catch {
      return false
    }
  }
  return false
}
