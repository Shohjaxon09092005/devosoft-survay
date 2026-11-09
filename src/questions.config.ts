export type QuestionType = 'text' | 'single' | 'phone' | 'select'

export type Question = {
  id: string
  type: QuestionType
  title: string
  description?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  minLength?: number
  maxLength?: number
  disqualify?: boolean
}

export const REGION_OPTIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Andijon',
  'Buxoro',
  "Farg'ona",
  'Jizzax',
  'Xorazm',
  'Namangan',
  'Navoiy',
  'Qashqadaryo',
  "Qoraqalpog'iston Respublikasi",
  'Samarqand',
  'Sirdaryo',
  'Surxondaryo',
  'Boshqa davlat',
] as const

export const QUESTIONS: Question[] = [
  {
    id: 'industry',
    type: 'text',
    title: "Biznesingiz qaysi yo'nalishda?",
    required: true,
    minLength: 2,
    maxLength: 120,
  },
  {
    id: 'employees',
    type: 'single',
    title: 'Kompaniyangizda nechta xodim ishlaydi?',
    options: [
      { value: '1-5', label: '1–5' },
      { value: '6-10', label: '6–10' },
      { value: '11-20', label: '11–20' },
      { value: '21-50', label: '21–50' },
      { value: '51-100', label: '51–100' },
      { value: '100+', label: '100+' },
    ],
    required: true,
    disqualify: true,
  },
  {
    id: 'maturity',
    type: 'single',
    title: 'Biznesingiz qanchalik tizimlashtirilgan?',
    options: [
      { value: 'none', label: "A) Hech qanday tizim yo'q (Excel yoki qo'lda)" },
      { value: 'partial', label: 'B) Qisman avtomatlashtirilgan' },
      { value: 'disconnected', label: "C) Bir nechta dastur bor, lekin bog'lanmagan" },
      { value: 'erp', label: 'D) ERP bor, yaxshilash kerak' },
    ],
    required: true,
  },
  {
    id: 'pain',
    type: 'single',
    title: 'Hozirda sizdagi eng katta muammo qaysi?',
    options: [
      { value: 'warehouse', label: "a) Ombor va ta'minot nazorati" },
      { value: 'sales', label: 'b) Sotuv va mijozlar nazorati' },
      { value: 'finance', label: "c) Moliya va hisobotlarni ko'ra olmaslik" },
      { value: 'remote', label: 'd) Xodimlarni masofadan nazorat qila olmaslik' },
    ],
    required: true,
  },
  {
    id: 'timeline',
    type: 'single',
    title: 'Qachon tizim joriy qilmoqchisiz?',
    options: [
      { value: 'this_month', label: 'a) Shu oy' },
      { value: '1_3_months', label: 'b) 1–3 oy ichida' },
      { value: 'learning', label: "c) Hozircha o'rganyapman" },
    ],
    required: true,
  },
  {
    id: 'name',
    type: 'text',
    title: 'Ismingiz?',
    required: true,
    minLength: 2,
    maxLength: 60,
  },
  {
    id: 'phone',
    type: 'phone',
    title: 'Telefon raqamingiz',
    required: true,
  },
  {
    id: 'region',
    type: 'select',
    title: 'Biznesingiz qayerda joylashgan?',
    options: REGION_OPTIONS.map((region) => ({
      value: region === 'Boshqa davlat' ? 'other' : region,
      label: region,
    })),
    required: true,
  },
]

export const DISQUALIFY_MESSAGE =
  "Rahmat! Hozircha Odoo ERP yechimlarimiz 6 va undan ko'p xodimli kompaniyalar uchun eng samarali. Biznesingiz o'sganda albatta bog'laning."

export const LANGS = ['uz', 'en', 'ru'] as const
export type Lang = (typeof LANGS)[number]

export type SurveyAnswers = Record<string, string>

export type SurveyState = {
  currentStep: number
  answers: SurveyAnswers
  status: 'active' | 'disqualified' | 'success' | 'error'
  submitting: boolean
  formError?: string
  submitError?: string
}

export const SURVEY_STORAGE_KEY = 'devosoft-survey-state-v1'
