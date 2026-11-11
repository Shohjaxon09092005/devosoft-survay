import { formatLeadNote } from './kommo.js'

const TELEGRAM_API_URL = 'https://api.telegram.org'
const MESSAGE_LIMIT = 4000

export class TelegramIntegrationError extends Error {
  constructor(code) {
    super(code)
    this.name = 'TelegramIntegrationError'
    this.code = code
  }
}

function cleanText(value) {
  return Array.from(value, (character) => {
    const codePoint = character.codePointAt(0)
    return codePoint !== undefined && (codePoint <= 0x1F || codePoint === 0x7F)
      ? ' '
      : character
  }).join('').trim()
}

function cleanPayload(payload) {
  return {
    ...payload,
    industry: cleanText(payload.industry),
    employees: cleanText(payload.employees),
    maturity: cleanText(payload.maturity),
    pain: cleanText(payload.pain),
    timeline: cleanText(payload.timeline),
    name: cleanText(payload.name),
    phone: cleanText(payload.phone),
    region: cleanText(payload.region),
    page_url: cleanText(payload.page_url),
    submitted_at: cleanText(payload.submitted_at),
    utm: {
      source: cleanText(payload.utm.source),
      medium: cleanText(payload.utm.medium),
      campaign: cleanText(payload.utm.campaign),
    },
  }
}

export function formatTelegramMessage(payload, leadId, unsortedUid) {
  const safePayload = cleanPayload(payload)
  const priorityLabels = { hot: 'Yuqori', warm: 'O‘rta', cold: 'Past' }
  const leadDetails = [
    `Kommo ID: ${leadId}`,
    'Kommo bo‘limi: Неразобранное',
    ...(unsortedUid ? [`Неразобранное UID: ${unsortedUid}`] : []),
    `Ism: ${safePayload.name}`,
    `Telefon: ${safePayload.phone}`,
  ]
  if (safePayload.priority && priorityLabels[safePayload.priority]) {
    leadDetails.push(`Ustuvorlik: ${priorityLabels[safePayload.priority]}`)
  }
  const message = [
    'YANGI LID — DEVOSOFT',
    ...leadDetails,
    '',
    formatLeadNote(safePayload),
  ].join('\n')
  const characters = Array.from(message)

  return characters.length > MESSAGE_LIMIT
    ? `${characters.slice(0, MESSAGE_LIMIT - 1).join('')}…`
    : message
}

export async function sendTelegramLead(
  payload,
  leadId,
  env = process.env,
  fetchImpl = fetch,
  unsortedUid,
) {
  const token = env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = env.TELEGRAM_CHAT_ID?.trim()
  if (!token && !chatId) return { status: 'disabled' }
  if (!token || !chatId || !/^\d+:[A-Za-z0-9_-]+$/.test(token)) {
    throw new TelegramIntegrationError('TELEGRAM_NOT_CONFIGURED')
  }

  let response
  try {
    response = await fetchImpl(`${TELEGRAM_API_URL}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatTelegramMessage(payload, leadId, unsortedUid),
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new TelegramIntegrationError('TELEGRAM_UNAVAILABLE')
  }

  if (response.status === 429) throw new TelegramIntegrationError('TELEGRAM_RATE_LIMITED')
  if (!response.ok) throw new TelegramIntegrationError('TELEGRAM_REQUEST_FAILED')

  let result
  try {
    result = await response.json()
  } catch {
    throw new TelegramIntegrationError('TELEGRAM_INVALID_RESPONSE')
  }

  if (result?.ok !== true) {
    throw new TelegramIntegrationError('TELEGRAM_REQUEST_FAILED')
  }

  return { status: 'sent' }
}
