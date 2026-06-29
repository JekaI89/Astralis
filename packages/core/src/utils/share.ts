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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = typeof globalThis !== 'undefined' ? (globalThis as any).navigator : undefined
  if (nav && 'share' in nav) {
    try {
      await nav.share({ title: payload.title, text: payload.text, url: payload.url })
      return true
    } catch {
      return false
    }
  }
  return false
}
