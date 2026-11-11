import type { LeadPayload } from '../src/api'

export class IntegrationError extends Error {
  readonly code: string
  readonly statusCode: number
  constructor(code: string, statusCode?: number)
}

export function validateLeadPayload(payload: unknown): payload is LeadPayload
export function formatLeadNote(payload: LeadPayload): string
export function createKommoLead(
  payload: LeadPayload,
  env?: Record<string, string | undefined>,
  fetchImpl?: typeof fetch,
): Promise<{ leadId: number; unsortedUid: string }>
