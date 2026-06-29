import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import webpush from 'web-push'

export interface PushSubscription {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

@Injectable()
export class PushService implements OnModuleInit {
  constructor(private config: ConfigService) {}

  onModuleInit() {
    const email = this.config.get<string>('VAPID_EMAIL')
    const pubKey = this.config.get<string>('VAPID_PUBLIC_KEY')
    const privKey = this.config.get<string>('VAPID_PRIVATE_KEY')
    if (email && pubKey && privKey) {
      webpush.setVapidDetails(email, pubKey, privKey)
    }
  }

  async sendPush(subscription: PushSubscription, payload: { title: string; body: string; data?: object }) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload))
    } catch (err) {
      console.error('Push notification failed:', err)
    }
  }

  async sendTelegram(telegramId: number, text: string, botToken: string) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramId, text, parse_mode: 'HTML' }),
    })
  }
}
