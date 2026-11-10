import { describe, expect, it } from 'vitest'
import { QUESTIONS } from './questions.config'
import { getOptionLabel, getQuestionTitle, getValidationError, messages } from './i18n'

describe('survey translations', () => {
  it('translates question titles for all supported languages', () => {
    const industry = QUESTIONS.find((question) => question.id === 'industry')
    expect(industry).toBeDefined()

    expect(getQuestionTitle(industry!, 'uz')).toBe("Biznesingiz qaysi yo'nalishda?")
    expect(getQuestionTitle(industry!, 'en')).toBe('What industry is your business in?')
    expect(getQuestionTitle(industry!, 'ru')).toBe('В какой сфере работает ваш бизнес?')
  })

  it('translates answer choices and regions without changing stored values', () => {
    const maturity = QUESTIONS.find((question) => question.id === 'maturity')
    const region = QUESTIONS.find((question) => question.id === 'region')
    expect(maturity).toBeDefined()
    expect(region).toBeDefined()

    expect(getOptionLabel(maturity!, 'none', "Hech qanday tizim yo'q (Excel yoki qo'lda)", 'en'))
      .toBe('No system (Excel or manual processes)')
    expect(getOptionLabel(region!, 'Toshkent shahri', 'Toshkent shahri', 'ru'))
      .toBe('город Ташкент')
  })

  it('localizes validation feedback', () => {
    const phone = QUESTIONS.find((question) => question.id === 'phone')
    expect(phone).toBeDefined()

    expect(getValidationError(phone!, '123', 'en', () => false))
      .toBe(messages.en.invalidPhone)
    expect(getValidationError(phone!, '123', 'ru', () => false))
      .toBe(messages.ru.invalidPhone)
  })
})
