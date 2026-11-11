import type { LeadPayload } from '../src/api'

export class TelegramIntegrationError extends Error {
  readonly code: string
}

export function formatTelegramMessage(
  payload: LeadPayload,
  leadId: number,
  unsortedUid?: string,
): string
export function sendTelegramLead(
  payload: LeadPayload,
  leadId: number,
  env?: Record<string, string | undefined>,
  fetchImpl?: typeof fetch,
  unsortedUid?: string,
): Promise<{ status: 'disabled' | 'sent' }>
