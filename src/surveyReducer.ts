import { QUESTIONS, type SurveyAnswers, type SurveyState } from './questions.config'

export type SurveyAction =
  | { type: 'INIT'; payload: Partial<SurveyState> }
  | { type: 'SET_ANSWER'; field: string; value: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'DISQUALIFY' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }

const initialState: SurveyState = {
  currentStep: 0,
  answers: {},
  status: 'active',
  submitting: false,
}

export function getSurveyReducerInitialState(): SurveyState {
  return { ...initialState }
}

export function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case 'INIT': {
      return {
        ...state,
        ...action.payload,
      }
    }
    case 'SET_ANSWER': {
      const nextAnswers: SurveyAnswers = {
        ...state.answers,
        [action.field]: action.value,
      }

      return {
        ...state,
        answers: nextAnswers,
        formError: undefined,
        submitError: undefined,
      }
    }
    case 'NEXT': {
      if (state.status === 'disqualified') {
        return state
      }
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, QUESTIONS.length - 1),
      }
    }
    case 'BACK': {
      if (state.status === 'success') {
        return state
      }
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      }
    }
    case 'DISQUALIFY': {
      return {
        ...state,
        status: 'disqualified',
        currentStep: 0,
      }
    }
    case 'SUBMIT_START': {
      return {
        ...state,
        status: 'active',
        submitting: true,
        submitError: undefined,
      }
    }
    case 'SUBMIT_SUCCESS': {
      return {
        ...state,
        status: 'success',
        submitting: false,
      }
    }
    case 'SUBMIT_ERROR': {
      return {
        ...state,
        status: 'error',
        submitting: false,
        submitError: action.error,
      }
    }
    case 'CLEAR_ERROR': {
      return {
        ...state,
        submitError: undefined,
      }
    }
    default:
      return state
  }
}
