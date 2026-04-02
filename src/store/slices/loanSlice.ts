import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { createLoanRequest } from '@/lib/api/loans'
import type { LoanRequest, CreateLoanRequest } from '@/types/loan'

export interface LoanApplicationState {
  step: 'form' | 'confirmation' | 'success'
  formData: CreateLoanRequest | null
  submitting: boolean
  error: string | null
  result: LoanRequest | null
}

const initialState: LoanApplicationState = {
  step: 'form',
  formData: null,
  submitting: false,
  error: null,
  result: null,
}

export const submitLoanRequest = createAsyncThunk(
  'loan/submitRequest',
  async (payload: CreateLoanRequest, { rejectWithValue }) => {
    try {
      return await createLoanRequest(payload)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } }
      return rejectWithValue(error.response?.data?.error?.message ?? 'Loan request failed')
    }
  }
)

const loanSlice = createSlice({
  name: 'loan',
  initialState,
  reducers: {
    setLoanStep(state, action: PayloadAction<LoanApplicationState['step']>) {
      state.step = action.payload
    },
    setLoanFormData(state, action: PayloadAction<CreateLoanRequest>) {
      state.formData = action.payload
    },
    resetLoanFlow() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitLoanRequest.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(submitLoanRequest.fulfilled, (state, action) => {
        state.submitting = false
        state.result = action.payload
        state.step = 'success'
      })
      .addCase(submitLoanRequest.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
  },
})

export const { setLoanStep, setLoanFormData, resetLoanFlow } = loanSlice.actions
export default loanSlice.reducer
