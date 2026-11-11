import { randomUUID } from 'node:crypto'

const FIELD_LABELS = {
  uz: {
    industry: 'Biznes yo‘nalishi',
    employees: 'Xodimlar soni',
    maturity: 'Avtomatlashtirish darajasi',
    pain: 'Asosiy muammo',
    timeline: 'Joriy qilish muddati',
    region: 'Hudud',
    lang: 'So‘rovnoma tili',
    source: 'UTM source',
    medium: 'UTM medium',
    campaign: 'UTM campaign',
    page: 'Sahifa',
    submitted: 'Yuborilgan vaqt',
  },
  en: {
    industry: 'Business industry',
    employees: 'Number of employees',
    maturity: 'Automation maturity',
    pain: 'Main challenge',
    timeline: 'Implementation timeline',
    region: 'Region',
    lang: 'Survey language',
    source: 'UTM source',
    medium: 'UTM medium',
    campaign: 'UTM campaign',
    page: 'Page',
    submitted: 'Submitted at',
  },
  ru: {
    industry: 'Сфера бизнеса',
    employees: 'Количество сотрудников',
    maturity: 'Уровень автоматизации',
    pain: 'Основная проблема',
    timeline: 'Срок внедрения',
    region: 'Регион',
    lang: 'Язык анкеты',
    source: 'UTM source',
    medium: 'UTM medium',
    campaign: 'UTM campaign',
    page: 'Страница',
    submitted: 'Дата отправки',
  },
}

const ANSWER_LABELS = {
  uz: {
    maturity: {
      none: "Tizim yo'q (Excel yoki qo'lda)",
      partial: 'Qisman avtomatlashtirilgan',
      disconnected: "Bir nechta dastur bor, lekin bog'lanmagan",
      erp: 'ERP bor, yaxshilash kerak',
    },
    pain: {
      warehouse: "Ombor va ta'minot nazorati",
      sales: 'Sotuv va mijozlar nazorati',
      finance: "Moliya va hisobotlarni ko'ra olmaslik",
      remote: 'Xodimlarni masofadan nazorat qila olmaslik',
    },
    timeline: {
      this_month: 'Shu oy',
      '1_3_months': '1–3 oy ichida',
      learning: "Hozircha o'rganyapman",
    },
    region: {
      'Toshkent shahri': 'Toshkent shahri',
      'Toshkent viloyati': 'Toshkent viloyati',
      Andijon: 'Andijon',
      Buxoro: 'Buxoro',
      "Farg'ona": "Farg'ona",
      Jizzax: 'Jizzax',
      Xorazm: 'Xorazm',
      Namangan: 'Namangan',
      Navoiy: 'Navoiy',
      Qashqadaryo: 'Qashqadaryo',
      "Qoraqalpog'iston Respublikasi": "Qoraqalpog'iston Respublikasi",
      Samarqand: 'Samarqand',
      Sirdaryo: 'Sirdaryo',
      Surxondaryo: 'Surxondaryo',
      other: 'Boshqa davlat',
    },
  },
  en: {
    maturity: {
      none: 'No system (Excel or manual processes)',
      partial: 'Partially automated',
      disconnected: 'Several tools, but they are not connected',
      erp: 'ERP exists, but needs improvement',
    },
    pain: {
      warehouse: 'Warehouse and supply management',
      sales: 'Sales and customer management',
      finance: 'Limited visibility into finances and reports',
      remote: 'Remote employee monitoring',
    },
    timeline: {
      this_month: 'This month',
      '1_3_months': 'Within 1–3 months',
      learning: 'Currently researching',
    },
    region: {
      'Toshkent shahri': 'Tashkent city',
      'Toshkent viloyati': 'Tashkent region',
      Andijon: 'Andijan',
      Buxoro: 'Bukhara',
      "Farg'ona": 'Fergana',
      Jizzax: 'Jizzakh',
      Xorazm: 'Khorezm',
      Namangan: 'Namangan',
      Navoiy: 'Navoi',
      Qashqadaryo: 'Kashkadarya',
      "Qoraqalpog'iston Respublikasi": 'Republic of Karakalpakstan',
      Samarqand: 'Samarkand',
      Sirdaryo: 'Syrdarya',
      Surxondaryo: 'Surkhandarya',
      other: 'Another country',
    },
  },
  ru: {
    maturity: {
      none: 'Системы нет (Excel или ручные процессы)',
      partial: 'Частичная автоматизация',
      disconnected: 'Несколько программ, но они не связаны',
      erp: 'ERP уже есть, но её нужно улучшить',
    },
    pain: {
      warehouse: 'Контроль склада и снабжения',
      sales: 'Контроль продаж и клиентов',
      finance: 'Недостаточная прозрачность финансов и отчётности',
      remote: 'Удалённый контроль сотрудников',
    },
    timeline: {
      this_month: 'В этом месяце',
      '1_3_months': 'В течение 1–3 месяцев',
      learning: 'Пока изучаю варианты',
    },
    region: {
      'Toshkent shahri': 'город Ташкент',
      'Toshkent viloyati': 'Ташкентская область',
      Andijon: 'Андижан',
      Buxoro: 'Бухара',
      "Farg'ona": 'Фергана',
      Jizzax: 'Джизак',
      Xorazm: 'Хорезм',
      Namangan: 'Наманган',
      Navoiy: 'Навои',
      Qashqadaryo: 'Кашкадарья',
      "Qoraqalpog'iston Respublikasi": 'Республика Каракалпакстан',
      Samarqand: 'Самарканд',
      Sirdaryo: 'Сырдарья',
      Surxondaryo: 'Сурхандарья',
      other: 'Другая страна',
    },
  },
}

const FIELD_LIMITS = {
  industry: 120,
  employees: 20,
  maturity: 60,
  pain: 500,
  timeline: 30,
  name: 60,
  phone: 20,
  region: 120,
  page_url: 2048,
}

const EMPLOYEE_OPTIONS = new Set(['1-5', '6-10', '11-20', '21-50', '51-100', '100+'])
const MATURITY_OPTIONS = new Set(['none', 'partial', 'disconnected', 'erp'])
const TIMELINE_OPTIONS = new Set(['this_month', '1_3_months', 'learning'])

export class IntegrationError extends Error {
  constructor(code, statusCode = 502) {
    super(code)
    this.name = 'IntegrationError'
    this.code = code
    this.statusCode = statusCode
  }
}

export function validateLeadPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false
  if (!['uz', 'en', 'ru'].includes(payload.lang)) return false

  for (const [field, maxLength] of Object.entries(FIELD_LIMITS)) {
    if (typeof payload[field] !== 'string' || payload[field].length > maxLength) return false
  }

  if (payload.name.trim().length < 2 || payload.industry.trim().length < 2) return false
  if (!/^\+998\d{9}$/.test(payload.phone)) return false
  if (!payload.employees || !payload.maturity || !payload.pain || !payload.timeline || !payload.region) return false
  if (!EMPLOYEE_OPTIONS.has(payload.employees)) return false
  if (!MATURITY_OPTIONS.has(payload.maturity)) return false
  if (!TIMELINE_OPTIONS.has(payload.timeline)) return false

  try {
    const pageUrl = new URL(payload.page_url)
    if (pageUrl.protocol !== 'https:' && pageUrl.protocol !== 'http:') return false
  } catch {
    return false
  }

  if (!payload.utm || typeof payload.utm !== 'object' || Array.isArray(payload.utm)) return false
  return ['source', 'medium', 'campaign'].every(
    (key) => typeof payload.utm[key] === 'string' && payload.utm[key].length <= 200,
  )
}

function getKommoBaseUrl(env) {
  const rawUrl = env.KOMMO_BASE_URL
  if (!rawUrl) throw new IntegrationError('CRM_NOT_CONFIGURED', 503)

  let url
  try {
    url = new URL(rawUrl)
  } catch {
    throw new IntegrationError('CRM_NOT_CONFIGURED', 503)
  }

  if (
    url.protocol !== 'https:' ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.(?:kommo\.com|amocrm\.ru)$/i.test(url.hostname) ||
    url.port ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new IntegrationError('CRM_NOT_CONFIGURED', 503)
  }

  return url.origin
}

export function formatLeadNote(payload) {
  const labels = FIELD_LABELS[payload.lang] ?? FIELD_LABELS.uz
  const answerLabels = ANSWER_LABELS[payload.lang] ?? ANSWER_LABELS.uz
  const localize = (field, value) => answerLabels[field]?.[value] ?? value
  const entries = [
    [labels.industry, payload.industry],
    [labels.employees, payload.employees],
    [labels.maturity, localize('maturity', payload.maturity)],
    [labels.pain, localize('pain', payload.pain)],
    [labels.timeline, localize('timeline', payload.timeline)],
    [labels.region, localize('region', payload.region)],
    [labels.lang, payload.lang.toUpperCase()],
    [labels.source, payload.utm.source],
    [labels.medium, payload.utm.medium],
    [labels.campaign, payload.utm.campaign],
    [labels.page, payload.page_url],
    [labels.submitted, payload.submitted_at],
  ]

  return entries
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n')
}

async function readJson(response) {
  try {
    return await response.json()
  } catch {
    throw new IntegrationError('CRM_INVALID_RESPONSE')
  }
}

async function kommoRequest(url, token, body, fetchImpl) {
  let response
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: ['Be', 'arer ', token].join(''),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12_000),
    })
  } catch {
    throw new IntegrationError('CRM_UNAVAILABLE', 502)
  }

  if (response.status === 429) throw new IntegrationError('CRM_RATE_LIMITED', 502)
  if (!response.ok) throw new IntegrationError('CRM_REQUEST_FAILED', 502)
  return readJson(response)
}

export async function createKommoLead(payload, env = process.env, fetchImpl = fetch) {
  if (!validateLeadPayload(payload)) throw new IntegrationError('INVALID_LEAD', 400)
  if (payload.employees === '1-5') throw new IntegrationError('LEAD_DISQUALIFIED', 422)
  if (!env.KOMMO_ACCESS_TOKEN) throw new IntegrationError('CRM_NOT_CONFIGURED', 503)

  const baseUrl = getKommoBaseUrl(env)
  const leadName = `Website: ${payload.industry} — ${payload.name}`
  const timestamp = Math.floor(Date.now() / 1000)
  const unsortedResponse = await kommoRequest(
    `${baseUrl}/api/v4/leads/unsorted/forms`,
    env.KOMMO_ACCESS_TOKEN,
    [{
      source_uid: randomUUID(),
      source_name: 'Devosoft website survey',
      created_at: timestamp,
      metadata: {
        form_id: 'devosoft-website-survey',
        form_name: 'Devosoft website survey',
        form_page: payload.page_url,
        form_sent_at: timestamp,
      },
      _embedded: {
        contacts: [{
          name: payload.name,
          custom_fields_values: [{
            field_code: 'PHONE',
            values: [{ value: payload.phone, enum_code: 'WORK' }],
          }],
          tags_to_add: [{ name: 'Website' }],
        }],
        leads: [{
          name: leadName,
          tags_to_add: [{ name: 'Website' }],
        }],
      },
    }],
    fetchImpl,
  )

  const unsortedLead = unsortedResponse?._embedded?.unsorted?.[0]
  const createdLead = unsortedLead?._embedded?.leads?.[0]
  if (
    typeof unsortedLead?.uid !== 'string' ||
    !Number.isInteger(createdLead?.id)
  ) {
    throw new IntegrationError('CRM_INVALID_RESPONSE')
  }

  try {
    await kommoRequest(
      `${baseUrl}/api/v4/leads/notes`,
      env.KOMMO_ACCESS_TOKEN,
      [{
        entity_id: createdLead.id,
        note_type: 'common',
        params: { text: formatLeadNote(payload) },
      }],
      fetchImpl,
    )
  } catch {
    throw new IntegrationError('CRM_NOTE_FAILED', 502)
  }

  return { leadId: createdLead.id, unsortedUid: unsortedLead.uid }
}
