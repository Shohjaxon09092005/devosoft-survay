export type LeadPayload = {
  industry: string
  employees: string
  maturity: string
  pain: string
  timeline: string
  name: string
  phone: string
  region: string
  lang: string
  utm: {
    source: string
    medium: string
    campaign: string
  }
  page_url: string
  submitted_at: string
  priority?: 'hot' | 'warm' | 'cold'
}

export async function submitLead(payload: LeadPayload): Promise<void> {
  const url = import.meta.env.VITE_LEAD_API_URL
  if (!url) {
    throw new Error('Lead API endpoint is not configured')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Lead submit failed')
  }
}
