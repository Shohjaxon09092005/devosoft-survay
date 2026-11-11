import { describe, expect, it, vi } from 'vitest'
import {
  formatTelegramMessage,
  sendTelegramLead,
} from '../server/telegram.js'
import type { LeadPayload } from './api'

const payload: LeadPayload = {
  industry: 'Retail',
  employees: '6-10',
  maturity: 'partial',
  pain: 'warehouse',
  timeline: 'this_month',
  name: 'Ali Valiyev',
  phone: '+998901234567',
  region: 'Toshkent shahri',
  lang: 'uz',
  utm: { source: 'google', medium: 'cpc', campaign: 'spring' },
  page_url: 'https://devosoft-landing.devosoft.uz/',
  submitted_at: '2026-11-09T15:00:00.000Z',
}

describe('Telegram lead notification', () => {
  it('formats contact details, lead ID, and localized survey answers safely', () => {
    const message = formatTelegramMessage({
      ...payload,
      industry: 'Retail\nInjected field',
      priority: 'hot',
    }, 12345)

    expect(message).toContain('Kommo ID: 12345')
    expect(message).toContain('Kommo bo‘limi: Неразобранное')
    expect(message).toContain('Ism: Ali Valiyev')
    expect(message).toContain('Telefon: +998901234567')
    expect(message).toContain('Ustuvorlik: Yuqori')
    expect(message).toContain('Biznes yo‘nalishi: Retail Injected field')
    expect(message).not.toContain('\nInjected field')
  })

  it('sends a plain-text message with the configured bot and chat', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ ok: true, result: { message_id: 7 } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ))

    await expect(sendTelegramLead(payload, 12345, {
      TELEGRAM_BOT_TOKEN: '123456:secret_token',
      TELEGRAM_CHAT_ID: '-1001234567890',
    }, fetchImpl, 'incoming-uid-123')).resolves.toEqual({ status: 'sent' })

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, options] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.telegram.org/bot123456:secret_token/sendMessage')
    expect(JSON.parse(options.body)).toMatchObject({
      chat_id: '-1001234567890',
      text: expect.stringContaining('Kommo bo‘limi: Неразобранное'),
      disable_web_page_preview: true,
    })
    expect(JSON.parse(options.body).text).toContain('Неразобранное UID: incoming-uid-123')
  })

  it('disables notifications when both credentials are absent', async () => {
    const fetchImpl = vi.fn()
    await expect(sendTelegramLead(payload, 12345, {}, fetchImpl))
      .resolves.toEqual({ status: 'disabled' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('rejects partial or malformed configuration without making a request', async () => {
    const fetchImpl = vi.fn()
    await expect(sendTelegramLead(payload, 12345, {
      TELEGRAM_BOT_TOKEN: 'invalid',
      TELEGRAM_CHAT_ID: '12345',
    }, fetchImpl)).rejects.toMatchObject({
      code: 'TELEGRAM_NOT_CONFIGURED',
    })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('reports Telegram API failures without exposing the upstream response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ ok: false, description: 'private upstream detail' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    ))

    await expect(sendTelegramLead(payload, 12345, {
      TELEGRAM_BOT_TOKEN: '123456:secret_token',
      TELEGRAM_CHAT_ID: '12345',
    }, fetchImpl)).rejects.toMatchObject({
      code: 'TELEGRAM_RATE_LIMITED',
      name: 'TelegramIntegrationError',
    })
  })

  it('limits long Telegram messages to the Bot API length limit', () => {
    const message = formatTelegramMessage({
      ...payload,
      pain: 'p'.repeat(5000),
      page_url: `https://example.com/${'a'.repeat(1900)}`,
      utm: {
        source: 's'.repeat(200),
        medium: 'm'.repeat(200),
        campaign: 'c'.repeat(200),
      },
    }, 12345)

    expect(Array.from(message).length).toBeLessThanOrEqual(4000)
    expect(message.endsWith('…')).toBe(true)
  })
})
