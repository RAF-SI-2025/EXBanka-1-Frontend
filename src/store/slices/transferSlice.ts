import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { createTransfer } from '@/lib/api/transfers'
import type { Transfer, CreateTransferRequest } from '@/types/transfer'

export interface TransferFormData {
  from_account: string
  to_account: string
  amount: number
}

export interface TransferPreviewData {
  rate: number
  commission: number
  final_amount: number
}

export interface TransferFlowState {
  step: 'form' | 'confirmation' | 'success'
  formData: TransferFormData | null
  preview: TransferPreviewData | null
  submitting: boolean
  error: string | null
  result: Transfer | null
}

const initialState: TransferFlowState = {
  step: 'form',
  formData: null,
  preview: null,
  submitting: false,
  error: null,
  result: null,
}

export const submitTransfer = createAsyncThunk(
  'transfer/submit',
  async (payload: CreateTransferRequest, { rejectWithValue }) => {
    try {
      return await createTransfer(payload)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      return rejectWithValue(error.response?.data?.message ?? 'Transfer failed')
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
        state.step = 'success'
      })
      .addCase(submitTransfer.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
  },
})

export const { setTransferStep, setTransferFormData, setTransferPreview, resetTransferFlow } =
  transferSlice.actions
export default transferSlice.reducer
