import { describe, expect, it, vi } from 'vitest'
import { createKommoLead, formatLeadNote, IntegrationError, validateLeadPayload } from '../server/kommo.js'
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

const env = {
  KOMMO_BASE_URL: 'https://devosoft.kommo.com',
  KOMMO_ACCESS_TOKEN: 'test-token',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('Kommo lead integration', () => {
  it('creates a linked contact and lead, then adds a localized survey note', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(jsonResponse([{ id: 12345, contact_id: 67890 }]))
      .mockResolvedValueOnce(jsonResponse({ _embedded: { notes: [{ id: 77 }] } }))

    await expect(createKommoLead(payload, env, fetchImpl)).resolves.toEqual({ leadId: 12345 })

    expect(fetchImpl).toHaveBeenCalledTimes(2)
    const [createUrl, createOptions] = fetchImpl.mock.calls[0]
    expect(createUrl).toBe('https://devosoft.kommo.com/api/v4/leads/complex')
    expect(createOptions.headers.Authorization).toBe(['Be', 'arer ', 'test-token'].join(''))

    const lead = JSON.parse(createOptions.body)[0]
    expect(lead.name).toBe('Website: Retail — Ali Valiyev')
    expect(lead._embedded.contacts[0].custom_fields_values[0]).toEqual({
      field_code: 'PHONE',
      values: [{ value: '+998901234567', enum_code: 'WORK' }],
    })

    const [noteUrl, noteOptions] = fetchImpl.mock.calls[1]
    expect(noteUrl).toBe('https://devosoft.kommo.com/api/v4/leads/notes')
    expect(JSON.parse(noteOptions.body)[0]).toMatchObject({
      entity_id: 12345,
      note_type: 'common',
      params: {
        text: expect.stringContaining('Biznes yo‘nalishi: Retail'),
      },
    })
  })

  it('rejects invalid data and invalid Kommo domains before making requests', async () => {
    const fetchImpl = vi.fn()
    await expect(createKommoLead({ ...payload, phone: '123' }, env, fetchImpl))
      .rejects.toMatchObject({ code: 'INVALID_LEAD', statusCode: 400 })
    await expect(createKommoLead({ ...payload, employees: '1-5' }, env, fetchImpl))
      .rejects.toMatchObject({ code: 'LEAD_DISQUALIFIED', statusCode: 422 })
    await expect(createKommoLead(payload, { ...env, KOMMO_BASE_URL: 'https://attacker.example' }, fetchImpl))
      .rejects.toMatchObject({ code: 'CRM_NOT_CONFIGURED' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('requires server-side Kommo credentials', async () => {
    await expect(createKommoLead(payload, {}, vi.fn()))
      .rejects.toBeInstanceOf(IntegrationError)
  })

  it('reports the partial success if Kommo creates a lead but rejects its answer note', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(jsonResponse([{ id: 12345 }]))
      .mockResolvedValueOnce(jsonResponse({ title: 'Forbidden' }, 403))

    await expect(createKommoLead(payload, env, fetchImpl))
      .rejects.toMatchObject({ code: 'CRM_NOTE_FAILED', statusCode: 502 })
  })

  it('validates the CRM payload and includes all survey answers in the note', () => {
    expect(validateLeadPayload(payload)).toBe(true)
    expect(formatLeadNote(payload)).toContain('UTM campaign: spring')
    expect(formatLeadNote({ ...payload, lang: 'en' })).toContain('Automation maturity: Partially automated')
    expect(formatLeadNote({ ...payload, lang: 'ru' })).toContain('Уровень автоматизации: Частичная автоматизация')
  })
})
