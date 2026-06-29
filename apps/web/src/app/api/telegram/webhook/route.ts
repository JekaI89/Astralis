import { NextRequest, NextResponse } from 'next/server'

// Telegram присылает апдейты сюда (webhook mode)
// Бот обрабатывает их через Telegraf в apps/bot
// В этом роуте можно добавить middleware-логику или прокси к боту

export async function POST(req: NextRequest) {
  const secret = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
  const expectedSecret = process.env['TELEGRAM_WEBHOOK_SECRET']

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // Проксируем в API (бот может работать как часть NestJS)
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'
  await fetch(`${apiUrl}/telegram/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Secret': expectedSecret ?? '' },
    body: JSON.stringify(body),
  })

  return NextResponse.json({ ok: true })
}
