import type { Lang } from './questions.config'

export type LeadApiErrorCode =
  | 'CRM_NOT_CONFIGURED'
  | 'CRM_NOTE_FAILED'
  | 'CRM_RATE_LIMITED'
  | 'CRM_UNAVAILABLE'
  | 'CRM_REQUEST_FAILED'
  | 'CRM_INVALID_RESPONSE'
  | 'LEAD_DISQUALIFIED'
  | 'INVALID_LEAD'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN'

export class LeadApiError extends Error {
  readonly code: LeadApiErrorCode

  constructor(code: LeadApiErrorCode) {
    super(code)
    this.name = 'LeadApiError'
    this.code = code
  }
}

export type LeadPayload = {
  industry: string
  employees: string
  maturity: string
  pain: string
  timeline: string
  name: string
  phone: string
  region: string
  lang: Lang
  utm: {
    source: string
    medium: string
    campaign: string
  }
  page_url: string
  submitted_at: string
  priority?: 'hot' | 'warm' | 'cold'
  website?: string
}

const API_ERROR_CODES: LeadApiErrorCode[] = [
  'CRM_NOT_CONFIGURED',
  'CRM_NOTE_FAILED',
  'CRM_RATE_LIMITED',
  'CRM_UNAVAILABLE',
  'CRM_REQUEST_FAILED',
  'CRM_INVALID_RESPONSE',
  'LEAD_DISQUALIFIED',
  'INVALID_LEAD',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
]

function isLeadApiErrorCode(code: string | undefined): code is LeadApiErrorCode {
  return code !== undefined && API_ERROR_CODES.includes(code as LeadApiErrorCode)
}

export async function submitLead(payload: LeadPayload): Promise<void> {
  const response = await fetch(import.meta.env.VITE_LEAD_API_URL || '/api/lead', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (response.ok) return

  let code: LeadApiErrorCode = 'UNKNOWN'
  try {
    const body = await response.json() as { code?: string }
    if (isLeadApiErrorCode(body.code)) code = body.code
  } catch {
    code = 'UNKNOWN'
  }
  throw new LeadApiError(code)
}
