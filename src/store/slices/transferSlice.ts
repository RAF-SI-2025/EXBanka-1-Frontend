import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { createTransfer } from '@/lib/api/transfers'
import type { Transfer, CreateTransferRequest } from '@/types/transfer'

export interface TransferFormData {
  from_account_number: string
  to_account_number: string
  amount: number
}

export interface TransferPreviewData {
  rate: number
  commission: number
  final_amount: number
}

export interface TransferFlowState {
  step: 'form' | 'confirmation' | 'verification' | 'success'
  formData: TransferFormData | null
  preview: TransferPreviewData | null
  submitting: boolean
  error: string | null
  result: Transfer | null
  transactionId: number | null
  challengeId: number | null
  codeRequested: boolean
  verificationError: string | null
}

const initialState: TransferFlowState = {
  step: 'form',
  formData: null,
  preview: null,
  submitting: false,
  error: null,
  result: null,
  transactionId: null,
  challengeId: null,
  codeRequested: false,
  verificationError: null,
}

export const submitTransfer = createAsyncThunk(
  'transfer/submit',
  async (payload: CreateTransferRequest, { rejectWithValue }) => {
    try {
      return await createTransfer(payload)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } }
      return rejectWithValue(error.response?.data?.error?.message ?? 'Transfer failed')
    }
  }
)

const transferSlice = createSlice({
  name: 'transfer',
  initialState,
  reducers: {
    setTransferStep(state, action: PayloadAction<TransferFlowState['step']>) {
      state.step = action.payload
    },
    setTransferFormData(state, action: PayloadAction<TransferFormData>) {
      state.formData = action.payload
    },
    setTransferPreview(state, action: PayloadAction<TransferPreviewData>) {
      state.preview = action.payload
    },
    resetTransferFlow() {
      return initialState
    },
    setChallengeId(state, action: PayloadAction<number | null>) {
      state.challengeId = action.payload
    },
    setCodeRequested(state, action: PayloadAction<boolean>) {
      state.codeRequested = action.payload
    },
    setVerificationError(state, action: PayloadAction<string | null>) {
      state.verificationError = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitTransfer.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(submitTransfer.fulfilled, (state, action) => {
        state.submitting = false
        state.result = action.payload
        state.transactionId = action.payload.id
        state.step = 'verification'
        state.codeRequested = true
      })
      .addCase(submitTransfer.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
  },
})

export const {
  setTransferStep,
  setTransferFormData,
  setTransferPreview,
  resetTransferFlow,
  setChallengeId,
  setCodeRequested,
  setVerificationError,
} = transferSlice.actions
export default transferSlice.reducer
