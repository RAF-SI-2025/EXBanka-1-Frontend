import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { createPayment } from '@/lib/api/payments'
import { createTransfer } from '@/lib/api/transfers'
import type { CreatePaymentRequest, CreateInternalTransferRequest } from '@/types/payment'

export type PaymentFlowType = 'payment' | 'internal'

export interface PaymentFlowState {
  step: 'form' | 'confirmation' | 'verification' | 'success'
  flowType: PaymentFlowType
  formData: CreatePaymentRequest | CreateInternalTransferRequest | null
  submitting: boolean
  error: string | null
  result: { id: number } | null
  transactionId: number | null
  challengeId: number | null
  codeRequested: boolean
  verificationError: string | null
}

const initialState: PaymentFlowState = {
  step: 'form',
  flowType: 'payment',
  formData: null,
  submitting: false,
  error: null,
  result: null,
  transactionId: null,
  challengeId: null,
  codeRequested: false,
  verificationError: null,
}

export const submitPayment = createAsyncThunk(
  'payment/submit',
  async (
    payload: { type: PaymentFlowType; data: CreatePaymentRequest | CreateInternalTransferRequest },
    { rejectWithValue }
  ) => {
    try {
      if (payload.type === 'internal') {
        const data = payload.data as CreateInternalTransferRequest
        return await createTransfer({
          from_account_number: data.from_account_number,
          to_account_number: data.to_account_number,
          amount: data.amount,
        })
      }
      return await createPayment(payload.data as CreatePaymentRequest)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } }
      return rejectWithValue(error.response?.data?.error?.message ?? 'Payment failed')
    }
  }
)

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentStep(state, action: PayloadAction<PaymentFlowState['step']>) {
      state.step = action.payload
    },
    setPaymentFlowType(state, action: PayloadAction<PaymentFlowType>) {
      state.flowType = action.payload
    },
    setPaymentFormData(
      state,
      action: PayloadAction<CreatePaymentRequest | CreateInternalTransferRequest>
    ) {
      state.formData = action.payload
    },
    setTransactionId(state, action: PayloadAction<number | null>) {
      state.transactionId = action.payload
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
    resetPaymentFlow() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPayment.pending, (state, action) => {
        state.submitting = true
        state.error = null
        state.flowType = action.meta.arg.type
      })
      .addCase(submitPayment.fulfilled, (state, action) => {
        state.submitting = false
        state.result = action.payload
        state.transactionId = action.payload.id
        state.step = 'verification'
        state.codeRequested = true
      })
      .addCase(submitPayment.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
  },
})

export const {
  setPaymentStep,
  setPaymentFlowType,
  setPaymentFormData,
  setTransactionId,
  setChallengeId,
  setCodeRequested,
  setVerificationError,
  resetPaymentFlow,
} = paymentSlice.actions
export default paymentSlice.reducer
