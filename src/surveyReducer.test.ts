import { describe, expect, it } from 'vitest'
import { surveyReducer } from './surveyReducer'
import { normalizePhone, sanitizePhoneInput } from './lib/phone'

describe('survey reducer', () => {
  it('marks a disqualified flow for 1-5 employees', () => {
    const state = surveyReducer(
      {
        currentStep: 1,
        answers: { employees: '1-5' },
        status: 'active',
        submitting: false,
      },
      { type: 'DISQUALIFY' },
    )

    expect(state.status).toBe('disqualified')
  })

  it('goes to the next step', () => {
    const state = surveyReducer(
      {
        currentStep: 0,
        answers: { industry: 'Chakana savdo' },
        status: 'active',
        submitting: false,
      },
      { type: 'NEXT' },
    )

    expect(state.currentStep).toBe(1)
  })

  it('does not advance when an answer is selected', () => {
    const state = surveyReducer(
      {
        currentStep: 1,
        answers: {},
        status: 'active',
        submitting: false,
      },
      { type: 'SET_ANSWER', field: 'employees', value: '6-10' },
    )

    expect(state.currentStep).toBe(1)
    expect(state.answers.employees).toBe('6-10')
  })

  it('returns to the previous step without clearing its answer', () => {
    const state = surveyReducer(
      {
        currentStep: 2,
        answers: { employees: '6-10' },
        status: 'active',
        submitting: false,
      },
      { type: 'BACK' },
    )

    expect(state.currentStep).toBe(1)
    expect(state.answers.employees).toBe('6-10')
  })

  it('resets the completed survey when returning home', () => {
    const state = surveyReducer(
      {
        currentStep: 7,
        answers: { name: 'Ali', phone: '+998901234567' },
        status: 'success',
        submitting: false,
        submitError: 'An old error',
      },
      { type: 'RESET' },
    )

    expect(state).toEqual({
      currentStep: 0,
      answers: {},
      status: 'active',
      submitting: false,
    })
  })
})

describe('phone helpers', () => {
  it('formats a phone number without losing the +998 prefix', () => {
    expect(sanitizePhoneInput('998901234567')).toBe('+998 (90) 123-45-67')
  })

  it('normalizes to a valid lead phone payload', () => {
    expect(normalizePhone('+998 (90) 123-45-67')).toBe('+998901234567')
  })
})
