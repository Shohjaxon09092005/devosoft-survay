import type { Lang, Question } from './questions.config'

const questionCopy: Record<Lang, Record<string, { title: string; options?: Record<string, string> }>> = {
  uz: {
    industry: { title: "Biznesingiz qaysi yo'nalishda?" },
    employees: {
      title: 'Kompaniyangizda nechta xodim ishlaydi?',
      options: {
        '1-5': '1–5',
        '6-10': '6–10',
        '11-20': '11–20',
        '21-50': '21–50',
        '51-100': '51–100',
        '100+': '100+',
      },
    },
    maturity: {
      title: 'Biznesingiz qanchalik tizimlashtirilgan?',
      options: {
        none: "Hech qanday tizim yo'q (Excel yoki qo'lda)",
        partial: 'Qisman avtomatlashtirilgan',
        disconnected: "Bir nechta dastur bor, lekin bog'lanmagan",
        erp: 'ERP bor, yaxshilash kerak',
      },
    },
    pain: { title: 'Hozirda sizdagi eng katta muammo qaysi?' },
    timeline: {
      title: 'Qachon tizim joriy qilmoqchisiz?',
      options: {
        this_month: 'Shu oy',
        '1_3_months': '1–3 oy ichida',
        learning: "Hozircha o'rganyapman",
      },
    },
    name: { title: 'Ismingiz?' },
    phone: { title: 'Telefon raqamingiz' },
    region: { title: 'Biznesingiz qayerda joylashgan?' },
  },
  en: {
    industry: { title: 'What industry is your business in?' },
    employees: {
      title: 'How many employees work at your company?',
      options: {
        '1-5': '1–5',
        '6-10': '6–10',
        '11-20': '11–20',
        '21-50': '21–50',
        '51-100': '51–100',
        '100+': '100+',
      },
    },
    maturity: {
      title: 'How well-structured are your business processes?',
      options: {
        none: 'No system (Excel or manual processes)',
        partial: 'Partially automated',
        disconnected: 'Several tools, but they are not connected',
        erp: 'We have an ERP, but it needs improvement',
      },
    },
    pain: { title: 'What is your biggest challenge right now?' },
    timeline: {
      title: 'When are you planning to implement a system?',
      options: {
        this_month: 'This month',
        '1_3_months': 'Within 1–3 months',
        learning: 'I am currently researching',
      },
    },
    name: { title: 'What is your name?' },
    phone: { title: 'What is your phone number?' },
    region: { title: 'Where is your business located?' },
  },
  ru: {
    industry: { title: 'В какой сфере работает ваш бизнес?' },
    employees: {
      title: 'Сколько сотрудников работает в вашей компании?',
      options: {
        '1-5': '1–5',
        '6-10': '6–10',
        '11-20': '11–20',
        '21-50': '21–50',
        '51-100': '51–100',
        '100+': '100+',
      },
    },
    maturity: {
      title: 'Насколько систематизирован ваш бизнес?',
      options: {
        none: 'Системы нет (Excel или ручные процессы)',
        partial: 'Частичная автоматизация',
        disconnected: 'Несколько программ, но они не связаны',
        erp: 'ERP уже есть, но её нужно улучшить',
      },
    },
    pain: { title: 'Какая у вас сейчас главная проблема?' },
    timeline: {
      title: 'Когда вы планируете внедрить систему?',
      options: {
        this_month: 'В этом месяце',
        '1_3_months': 'В течение 1–3 месяцев',
        learning: 'Пока изучаю варианты',
      },
    },
    name: { title: 'Как вас зовут?' },
    phone: { title: 'Ваш номер телефона' },
    region: { title: 'Где находится ваш бизнес?' },
  },
}

const regionNames: Record<Lang, Record<string, string>> = {
  uz: {},
  en: {
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
    'Boshqa davlat': 'Another country',
  },
  ru: {
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
    'Boshqa davlat': 'Другая страна',
  },
}

export const messages: Record<Lang, {
  language: string
  contact: string
  questionProgress: (current: number, total: number) => string
  progressLabel: (percent: number) => string
  selectRegion: string
  otherCountry: string
  countryName: string
  industryPlaceholder: string
  textPlaceholder: string
  back: string
  next: string
  submit: string
  submitting: string
  missingFields: string
  invalidPhone: string
  invalidRegion: string
  selectOption: string
  textTooShort: (minimum: number) => string
  textTooLong: (maximum: number) => string
  disqualifiedTitle: string
  disqualifiedMessage: string
  successTitle: (name: string) => string
  successMessage: (phone: string) => string
  home: string
  genericName: string
  apiNotConfigured: string
  crmNoteFailed: string
  crmRequestFailed: string
  rateLimited: string
  submitFailed: string
}> = {
  uz: {
    language: 'Tilni tanlang',
    contact: "Bog'lanish",
    questionProgress: (current, total) => `SAVOL ${current} / ${total}`,
    progressLabel: (percent) => `Jarayon ${percent}%`,
    selectRegion: 'Hududni tanlang',
    otherCountry: 'Qaysi davlat?',
    countryName: 'Davlat nomi',
    industryPlaceholder: 'Masalan: Chakana savdo',
    textPlaceholder: 'Yozing',
    back: 'Orqaga',
    next: 'Davom etish',
    submit: 'Yuborish',
    submitting: 'Yuborilmoqda...',
    missingFields: "Barcha maydonlarni to'ldiring",
    invalidPhone: "Telefon raqam noto'g'ri kiritildi",
    invalidRegion: 'Hududni tanlang',
    selectOption: 'Variantni tanlang',
    textTooShort: (minimum) => `Iltimos, kamida ${minimum} ta belgi kiriting`,
    textTooLong: (maximum) => `Maksimal ${maximum} ta belgi kiriting`,
    disqualifiedTitle: 'Rahmat!',
    disqualifiedMessage: "Hozircha Odoo ERP yechimlarimiz 6 va undan ko'p xodimli kompaniyalar uchun eng samarali. Biznesingiz o'sganda albatta bog'laning.",
    successTitle: (name) => `Rahmat, ${name}!`,
    successMessage: (phone) => `Mutaxassisimiz tez orada ${phone} raqami orqali bog'lanadi.`,
    home: 'Bosh sahifaga',
    genericName: 'Mijoz',
    apiNotConfigured: "So'rovnomani yuborish uchun CRM API manzili hali sozlanmagan.",
    crmNoteFailed: 'Lead Kommo’da yaratildi, lekin javoblar izohini saqlashda xatolik bo‘ldi. Takror yubormang; administrator bilan bog‘laning.',
    crmRequestFailed: 'Kommo bilan bog‘lanishda xatolik yuz berdi. Birozdan so‘ng qayta urinib ko‘ring.',
    rateLimited: 'Juda ko‘p urinish bo‘ldi. Birozdan so‘ng qayta urinib ko‘ring.',
    submitFailed: 'Yuborishda xatolik yuz berdi',
  },
  en: {
    language: 'Choose language',
    contact: 'Contact',
    questionProgress: (current, total) => `QUESTION ${current} / ${total}`,
    progressLabel: (percent) => `${percent}% complete`,
    selectRegion: 'Select a region',
    otherCountry: 'Which country?',
    countryName: 'Country name',
    industryPlaceholder: 'For example: Retail',
    textPlaceholder: 'Enter your answer',
    back: 'Back',
    next: 'Continue',
    submit: 'Submit',
    submitting: 'Submitting...',
    missingFields: 'Please complete all fields',
    invalidPhone: 'Please enter a valid phone number',
    invalidRegion: 'Please select a region',
    selectOption: 'Please select an option',
    textTooShort: (minimum) => `Please enter at least ${minimum} characters`,
    textTooLong: (maximum) => `Please enter no more than ${maximum} characters`,
    disqualifiedTitle: 'Thank you!',
    disqualifiedMessage: 'Our Odoo ERP solutions are currently most effective for companies with 6 or more employees. Please get in touch as your business grows.',
    successTitle: (name) => `Thank you, ${name}!`,
    successMessage: (phone) => `Our specialist will contact you soon at ${phone}.`,
    home: 'Back to survey',
    genericName: 'Customer',
    apiNotConfigured: 'The CRM API endpoint has not been configured yet.',
    crmNoteFailed: 'The lead was created in Kommo, but saving the survey details failed. Do not resubmit; please contact the site administrator.',
    crmRequestFailed: 'Could not connect to Kommo. Please try again shortly.',
    rateLimited: 'Too many attempts. Please wait a moment and try again.',
    submitFailed: 'Something went wrong while submitting your request',
  },
  ru: {
    language: 'Выберите язык',
    contact: 'Связаться',
    questionProgress: (current, total) => `ВОПРОС ${current} / ${total}`,
    progressLabel: (percent) => `Заполнено ${percent}%`,
    selectRegion: 'Выберите регион',
    otherCountry: 'Какая страна?',
    countryName: 'Название страны',
    industryPlaceholder: 'Например: розничная торговля',
    textPlaceholder: 'Введите ответ',
    back: 'Назад',
    next: 'Продолжить',
    submit: 'Отправить',
    submitting: 'Отправка...',
    missingFields: 'Пожалуйста, заполните все поля',
    invalidPhone: 'Введите корректный номер телефона',
    invalidRegion: 'Выберите регион',
    selectOption: 'Выберите вариант',
    textTooShort: (minimum) => `Введите не менее ${minimum} символов`,
    textTooLong: (maximum) => `Введите не более ${maximum} символов`,
    disqualifiedTitle: 'Спасибо!',
    disqualifiedMessage: 'Решения Odoo ERP наиболее эффективны для компаний с 6 и более сотрудниками. Будем рады связаться, когда ваш бизнес вырастет.',
    successTitle: (name) => `Спасибо, ${name}!`,
    successMessage: (phone) => `Наш специалист скоро свяжется с вами по номеру ${phone}.`,
    home: 'Вернуться к анкете',
    genericName: 'Клиент',
    apiNotConfigured: 'Адрес CRM API пока не настроен.',
    crmNoteFailed: 'Лид создан в Kommo, но ответы анкеты сохранить не удалось. Не отправляйте заявку повторно; свяжитесь с администратором.',
    crmRequestFailed: 'Не удалось связаться с Kommo. Попробуйте ещё раз позже.',
    rateLimited: 'Слишком много попыток. Подождите немного и попробуйте снова.',
    submitFailed: 'Не удалось отправить заявку',
  },
}

export function getQuestionTitle(question: Question, lang: Lang): string {
  return questionCopy[lang][question.id]?.title ?? question.title
}

export function getOptionLabel(question: Question, value: string, label: string, lang: Lang): string {
  return questionCopy[lang][question.id]?.options?.[value] ?? regionNames[lang][label] ?? label
}

export function getValidationError(
  question: Question,
  answer: string,
  lang: Lang,
  isValidPhone: (value: string) => boolean,
): string | null {
  const value = answer.trim()
  const text = messages[lang]

  if (!question.required && !value) return null
  if (question.type === 'text') {
    if (value.length < (question.minLength ?? 0)) {
      return text.textTooShort(question.minLength ?? 0)
    }
    if (value.length > (question.maxLength ?? 999)) {
      return text.textTooLong(question.maxLength ?? 999)
    }
    return null
  }
  if (question.type === 'phone' && !isValidPhone(value)) return text.invalidPhone
  if (question.type === 'select' && !value) return text.invalidRegion
  if (!value) return text.selectOption
  return null
}
