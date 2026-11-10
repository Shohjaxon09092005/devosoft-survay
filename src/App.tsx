import { useEffect, useMemo, useReducer, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LeadApiError, submitLead, type LeadPayload } from './api'
import {
  LANGS,
  QUESTIONS,
  type Lang,
  type SurveyState,
  SURVEY_STORAGE_KEY,
} from './questions.config'
import { surveyReducer, getSurveyReducerInitialState } from './surveyReducer'
import { isValidPhone, normalizePhone, sanitizePhoneInput } from './lib/phone'
import { getOptionLabel, getQuestionTitle, getValidationError, messages } from './i18n'

const TOTAL_STEPS = QUESTIONS.length

function getUTMFromSearch(): Record<string, string> {
  const params = new URLSearchParams(window.location.search)
  return {
    source: params.get('utm_source') ?? '',
    medium: params.get('utm_medium') ?? '',
    campaign: params.get('utm_campaign') ?? '',
  }
}

function getStoredSurveyState(): SurveyState {
  try {
    const saved = sessionStorage.getItem(SURVEY_STORAGE_KEY)
    if (!saved) {
      return getSurveyReducerInitialState()
    }

    const parsed = JSON.parse(saved) as {
      currentStep?: number
      answers?: Record<string, string>
      status?: 'active' | 'disqualified' | 'success' | 'error'
    }
    const currentStep = Number.isFinite(parsed.currentStep) ? Number(parsed.currentStep) : 0
    const status =
      parsed.status === 'success' || parsed.status === 'disqualified' || parsed.status === 'error'
        ? parsed.status
        : 'active'

    return {
      ...getSurveyReducerInitialState(),
      currentStep,
      answers: parsed.answers ?? {},
      status,
    }
  } catch {
    return getSurveyReducerInitialState()
  }
}

function getPriority(timeline: string): 'hot' | 'warm' | 'cold' {
  if (timeline === 'this_month') return 'hot'
  if (timeline === '1_3_months') return 'warm'
  return 'cold'
}

type SurveyHeaderProps = {
  lang: Lang
  onLanguageChange: (lang: Lang) => void
}

function SurveyHeader({ lang, onLanguageChange }: SurveyHeaderProps) {
  const text = messages[lang]

  return (
    <header className="survey-header">
      <div className="brand-wrap">
        <img src="/favicon.ico" alt="" className="brand-icon" />
        <div className="brand">Devosoft</div>
      </div>
      <div className="nav-actions">
        <label className="language-control">
          <span className="sr-only">{text.language}</span>
          <select
            className="ghost-chip language-select"
            aria-label={text.language}
            value={lang}
            onChange={(event) => onLanguageChange(event.target.value as Lang)}
          >
            <option value="uz">UZ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
        </label>
        <a className="ghost-chip contact-link" href="https://devosoft.uz/">
          {text.contact}
        </a>
      </div>
    </header>
  )
}

function SurveyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [localRegion, setLocalRegion] = useState('')
  const initialState = useMemo(() => getStoredSurveyState(), [])
  const [state, dispatch] = useReducer(surveyReducer, initialState)
  const lang = LANGS.find((supportedLang) => supportedLang === searchParams.get('lang')) ?? 'uz'
  const text = messages[lang]

  useEffect(() => {
    if (searchParams.get('lang') !== lang) {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous)
        next.set('lang', lang)
        return next
      }, { replace: true })
    }
    document.documentElement.lang = lang
  }, [lang, searchParams, setSearchParams])

  useEffect(() => {
    sessionStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(state))
    if (state.status === 'success' || state.status === 'disqualified') {
      sessionStorage.removeItem(SURVEY_STORAGE_KEY)
    }
  }, [state])

  useEffect(() => {
    const storedUTM = getUTMFromSearch()
    sessionStorage.setItem('devosoft-utm', JSON.stringify(storedUTM))
  }, [])

  const currentQuestion = QUESTIONS[state.currentStep] ?? QUESTIONS[0]
  const selectedAnswer = state.answers[currentQuestion.id] ?? ''

  const changeLanguage = (nextLang: Lang) => {
    dispatch({ type: 'CLEAR_ERROR' })
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      next.set('lang', nextLang)
      return next
    })
  }

  const handleAnswer = (field: string, value: string) => {
    dispatch({ type: 'SET_ANSWER', field, value })
  }

  const handleOptionSelection = (value: string) => {
    handleAnswer(currentQuestion.id, value)

    if (currentQuestion.disqualify && value === '1-5') {
      dispatch({ type: 'DISQUALIFY' })
      return
    }

    if (state.currentStep < TOTAL_STEPS - 1) {
      dispatch({ type: 'NEXT' })
    }
  }

  const handleNext = () => {
    if (!currentQuestion) return
    const error = getValidationError(currentQuestion, selectedAnswer, lang, isValidPhone)
    if (error) {
      dispatch({ type: 'SUBMIT_ERROR', error })
      return
    }

    if (currentQuestion.disqualify && selectedAnswer === '1-5') {
      dispatch({ type: 'DISQUALIFY' })
      return
    }

    dispatch({ type: 'NEXT' })
  }

  const handleRegionSelection = (value: string) => {
    const nextValue = value === 'other' ? 'other' : value
    handleAnswer('region', nextValue)
    setLocalRegion(nextValue === 'other' ? localRegion : nextValue)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const websiteField = new FormData(event.currentTarget).get('website')
    if (websiteField) return
    if (state.submitting) return

    const hasMissing = QUESTIONS.some((question) => {
      const value = state.answers[question.id] ?? ''
      if (question.id === 'region' && value === 'other') {
        return !localRegion.trim()
      }
      return getValidationError(question, value, lang, isValidPhone) !== null
    })

    if (hasMissing) {
      dispatch({ type: 'SUBMIT_ERROR', error: text.missingFields })
      return
    }

    dispatch({ type: 'SUBMIT_START' })

    const payload: LeadPayload = {
      industry: state.answers.industry ?? '',
      employees: state.answers.employees ?? '',
      maturity: state.answers.maturity ?? '',
      pain: state.answers.pain ?? '',
      timeline: state.answers.timeline ?? '',
      name: state.answers.name ?? '',
      phone: normalizePhone(state.answers.phone ?? ''),
      region: state.answers.region === 'other' ? localRegion.trim() : state.answers.region ?? '',
      lang,
      utm: { ...JSON.parse(sessionStorage.getItem('devosoft-utm') ?? '{"source":"","medium":"","campaign":""}') },
      page_url: window.location.origin + '/survey',
      submitted_at: new Date().toISOString(),
      priority: getPriority(state.answers.timeline ?? ''),
      website: typeof websiteField === 'string' ? websiteField : '',
    }

    try {
      await submitLead(payload)
      dispatch({ type: 'SUBMIT_SUCCESS' })
      sessionStorage.removeItem(SURVEY_STORAGE_KEY)
    } catch (error) {
      const errorMessages: Record<string, string> = {
        CRM_NOT_CONFIGURED: text.apiNotConfigured,
        CRM_NOTE_FAILED: text.crmNoteFailed,
        CRM_RATE_LIMITED: text.crmRequestFailed,
        CRM_UNAVAILABLE: text.crmRequestFailed,
        CRM_REQUEST_FAILED: text.crmRequestFailed,
        LEAD_DISQUALIFIED: text.disqualifiedMessage,
        RATE_LIMITED: text.rateLimited,
      }
      dispatch({
        type: 'SUBMIT_ERROR',
        error: error instanceof LeadApiError
          ? errorMessages[error.code] ?? text.submitFailed
          : text.submitFailed,
      })
    }
  }

  if (state.status === 'disqualified') {
    return (
      <div className="survey-shell">
        <SurveyHeader lang={lang} onLanguageChange={changeLanguage} />
        <div className="survey-card terminal-card">
          <h1>{text.disqualifiedTitle}</h1>
          <p>{text.disqualifiedMessage}</p>
          <Link to="/" className="primary-button">{text.home}</Link>
        </div>
      </div>
    )
  }

  if (state.status === 'success') {
    return (
      <div className="survey-shell">
        <SurveyHeader lang={lang} onLanguageChange={changeLanguage} />
        <div className="survey-card terminal-card">
          <div className="success-badge">✓</div>
          <h1>{text.successTitle(state.answers.name ?? text.genericName)}</h1>
          <p>{text.successMessage(state.answers.phone ? normalizePhone(state.answers.phone) : '')}</p>
          <Link to="/" className="primary-button">{text.home}</Link>
        </div>
      </div>
    )
  }

  const answerValue = state.answers[currentQuestion.id] ?? ''
  const currentError = getValidationError(currentQuestion, answerValue, lang, isValidPhone)

  return (
    <div className="survey-shell">
      <SurveyHeader lang={lang} onLanguageChange={changeLanguage} />

      <main className="survey-card">
        <div className="progress-meta">{text.questionProgress(state.currentStep + 1, TOTAL_STEPS)}</div>
        <div className="progress-track" aria-label={text.progressLabel(Math.round(((state.currentStep + 1) / TOTAL_STEPS) * 100))}>
          <span style={{ width: `${((state.currentStep + 1) / TOTAL_STEPS) * 100}%` }} />
        </div>
        <div className="question-header">
          <h1>{getQuestionTitle(currentQuestion, lang)}</h1>
        </div>

        <form className="survey-form" onSubmit={handleSubmit}>
          <input type="text" name="website" className="honeypot" tabIndex={-1} autoComplete="off" />

          {(currentQuestion.type === 'text' || currentQuestion.type === 'phone') && (
            <div className="text-field-wrap">
              <input
                autoFocus
                type={currentQuestion.type === 'phone' ? 'tel' : 'text'}
                inputMode={currentQuestion.type === 'phone' ? 'tel' : undefined}
                autoComplete={currentQuestion.type === 'phone' ? 'tel' : 'off'}
                value={
                  currentQuestion.type === 'phone'
                    ? answerValue ? sanitizePhoneInput(answerValue) : '+998'
                    : answerValue
                }
                maxLength={currentQuestion.type === 'text' ? currentQuestion.maxLength ?? 120 : undefined}
                onChange={(event) => {
                  const value = event.target.value
                  handleAnswer(
                    currentQuestion.id,
                    currentQuestion.type === 'phone' ? normalizePhone(value) || value : value,
                  )
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    if (currentError === null) handleNext()
                  }
                }}
                placeholder={
                  currentQuestion.type === 'phone'
                    ? '+998 (XX) XXX-XX-XX'
                    : currentQuestion.id === 'industry' ? text.industryPlaceholder : text.textPlaceholder
                }
              />
            </div>
          )}

          {currentQuestion.type === 'single' && (
            <div className="options-grid" role="group" aria-label={getQuestionTitle(currentQuestion, lang)}>
              {currentQuestion.options?.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`option-button ${answerValue === option.value ? 'selected' : ''}`}
                  aria-pressed={answerValue === option.value}
                  onClick={() => handleOptionSelection(option.value)}
                >
                  {getOptionLabel(currentQuestion, option.value, option.label, lang)}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'select' && (
            <div className="region-panel">
              <div className="chip-grid">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`chip ${answerValue === option.value ? 'selected' : ''}`}
                    aria-pressed={answerValue === option.value}
                    onClick={() => handleRegionSelection(option.value)}
                  >
                    {getOptionLabel(currentQuestion, option.value, option.label, lang)}
                  </button>
                ))}
              </div>
              {answerValue === 'other' && (
                <div className="other-field">
                  <label htmlFor="custom-region">{text.otherCountry}</label>
                  <input
                    id="custom-region"
                    type="text"
                    value={localRegion}
                    onChange={(event) => setLocalRegion(event.target.value)}
                    placeholder={text.countryName}
                  />
                </div>
              )}
            </div>
          )}

          {state.submitError && <div className="error-banner" role="alert">{state.submitError}</div>}

          <div className="form-actions">
            {state.currentStep > 0 && (
              <button type="button" className="back-button" onClick={() => dispatch({ type: 'BACK' })}>
                {text.back}
              </button>
            )}
            {state.currentStep === TOTAL_STEPS - 1 ? (
              <button
                type="submit"
                className="primary-button"
                disabled={!answerValue || (answerValue === 'other' && !localRegion.trim()) || state.submitting}
              >
                {state.submitting ? text.submitting : text.submit}
              </button>
            ) : currentQuestion.type === 'text' || currentQuestion.type === 'phone' ? (
              <button
                type="button"
                className="primary-button"
                disabled={currentError !== null}
                onClick={handleNext}
              >
                {text.next}
              </button>
            ) : null}
          </div>
        </form>
      </main>
    </div>
  )
}

function App() {
  return <SurveyPage />
}

export default App
