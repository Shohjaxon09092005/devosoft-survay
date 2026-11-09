export const DEFAULT_PHONE_PREFIX = '+998'

export function sanitizePhoneInput(raw: string): string {
  const digits = (raw ?? '').replace(/\D/g, '')
  const trimmedDigits = digits.replace(/^998/, '').slice(0, 9)

  if (!trimmedDigits) {
    return DEFAULT_PHONE_PREFIX
  }

  const formatted = trimmedDigits.padEnd(9, ' ')
  const first = formatted.slice(0, 2)
  const second = formatted.slice(2, 5)
  const third = formatted.slice(5, 7)
  const fourth = formatted.slice(7, 9)

  return `${DEFAULT_PHONE_PREFIX} (${first}) ${second}-${third}-${fourth}`
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizePhone(raw: string): string {
  const digits = (raw ?? '').replace(/\D/g, '')
  const normalizedDigits = digits.startsWith('998') ? digits.slice(3) : digits
  const finalDigits = normalizedDigits.slice(0, 9)

  if (finalDigits.length !== 9) {
    return ''
  }

  return `+998${finalDigits}`
}

export function isValidPhone(raw: string): boolean {
  const normalized = normalizePhone(raw)
  return normalized.length === 13 && /^\+998\d{9}$/.test(normalized)
}

export function getPhoneMaskValue(raw: string): string {
  const sanitized = sanitizePhoneInput(raw)
  return sanitized.length > 4 ? sanitized : DEFAULT_PHONE_PREFIX
}
