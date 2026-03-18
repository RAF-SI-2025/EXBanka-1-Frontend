import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { createPayment, createInternalTransfer } from '@/lib/api/payments'
import type { Payment, CreatePaymentRequest, CreateInternalTransferRequest } from '@/types/payment'

export type PaymentFlowType = 'payment' | 'internal'

export interface PaymentFlowState {
  step: 'form' | 'confirmation' | 'success'
  flowType: PaymentFlowType
  formData: CreatePaymentRequest | CreateInternalTransferRequest | null
  submitting: boolean
  error: string | null
  result: Payment | null
}

const initialState: PaymentFlowState = {
  step: 'form',
  flowType: 'payment',
  formData: null,
  submitting: false,
  error: null,
  result: null,
}

export const submitPayment = createAsyncThunk(
  'payment/submit',
  async (
    payload: { type: PaymentFlowType; data: CreatePaymentRequest | CreateInternalTransferRequest },
    { rejectWithValue }
  ) => {
    try {
      if (payload.type === 'internal') {
        return await createInternalTransfer(payload.data as CreateInternalTransferRequest)
      }
      return await createPayment(payload.data as CreatePaymentRequest)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message ?? 'Payment failed')
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
    resetPaymentFlow() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPayment.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(submitPayment.fulfilled, (state, action) => {
        state.submitting = false
        state.result = action.payload
        state.step = 'success'
      })
      .addCase(submitPayment.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
  },
})

export const { setPaymentStep, setPaymentFlowType, setPaymentFormData, resetPaymentFlow } =
  paymentSlice.actions
export default paymentSlice.reducer
