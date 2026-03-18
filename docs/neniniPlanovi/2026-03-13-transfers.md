# Transfers Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the cross-currency transfer subsystem: transfers between own accounts in different currencies, with a 2-step flow (create → confirm with exchange rate preview), and a transfer history page.

**Architecture:** Two client-only pages: CreateTransferPage (2-step: select accounts + amount → confirm with rate/commission) and TransferHistoryPage (chronological list). Multi-step transfer flow via Redux Toolkit slice (`transferSlice`). Exchange rate and commission displayed on confirmation step. Server data via TanStack Query.

**Tech Stack:** React 19, TypeScript, Shadcn UI, TanStack Query, Redux Toolkit, React Hook Form + Zod, Jest + RTL

**Depends on:** Plan 1 (Foundation — types, API stubs, Transfer/ExchangeConversion types), Plan 3 (useExchange hooks for rate preview)

---

## Assumptions

1. `createTransfer` API returns the created Transfer object with server-generated `id`, `order_number`, exchange rate, and commission.
2. The exchange rate preview comes from `getExchangeRate(from_currency, to_currency)` (Plan 1 API).
3. Commission for cross-currency is 0–1% (calculated server-side). The confirmation step shows the preview.
4. Same-currency transfers between own accounts are handled in Plan 4 (Payments → Prenos). This plan covers **different currencies only**.
5. Transfer history endpoint supports filtering by date range.

---

## File Structure

```
src/
  pages/
    CreateTransferPage.tsx              # /transfers/new — 2-step flow
    CreateTransferPage.test.tsx
    TransferHistoryPage.tsx             # /transfers/history
    TransferHistoryPage.test.tsx
  components/
    transfers/
      CreateTransferForm.tsx            # Select from/to account + amount
      CreateTransferForm.test.tsx
      TransferPreview.tsx               # Confirmation: rate, commission, final amount
      TransferPreview.test.tsx
      TransferHistoryTable.tsx          # Transfer list table
      TransferHistoryTable.test.tsx
  hooks/
    useTransfers.ts                     # useCreateTransfer, useTransfers, useTransferPreview
    useTransfers.test.ts
  store/
    slices/
      transferSlice.ts                  # Multi-step transfer flow state
      transferSlice.test.ts
  lib/
    utils/
      validation.ts                     # MODIFY: add createTransferSchema
  __tests__/
    fixtures/
      transfer-fixtures.ts             # createMockTransfer factory
  App.tsx                               # MODIFY: add /transfers/* routes
```

---

## Chunk 1: Redux Slice, Hooks & Validation

### Task 1.1: Transfer Redux slice

**Files:**
- Create: `src/store/slices/transferSlice.ts`
- Create: `src/store/slices/transferSlice.test.ts`
- Modify: `src/store/index.ts` (add transfer reducer)

- [ ] **Step 1: Write failing tests for transferSlice**

```typescript
// src/store/slices/transferSlice.test.ts
import transferReducer, {
  setTransferStep,
  setTransferFormData,
  setTransferPreview,
  resetTransferFlow,
  submitTransfer,
  type TransferFlowState,
} from '@/store/slices/transferSlice'

describe('transferSlice', () => {
  const initialState: TransferFlowState = {
    step: 'form',
    formData: null,
    preview: null,
    submitting: false,
    error: null,
    result: null,
  }

  it('returns initial state', () => {
    expect(transferReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('sets step', () => {
    const state = transferReducer(initialState, setTransferStep('confirmation'))
    expect(state.step).toBe('confirmation')
  })

  it('sets form data', () => {
    const formData = { from_account: '111000100000000011', to_account: '111000100000000022', amount: 100 }
    const state = transferReducer(initialState, setTransferFormData(formData))
    expect(state.formData).toEqual(formData)
  })

  it('sets preview data', () => {
    const preview = { rate: 117.5, commission: 0.7, final_amount: 0.85 }
    const state = transferReducer(initialState, setTransferPreview(preview))
    expect(state.preview).toEqual(preview)
  })

  it('resets flow', () => {
    const modified = { ...initialState, step: 'confirmation' as const, formData: { from_account: '1', to_account: '2', amount: 10 } }
    const state = transferReducer(modified, resetTransferFlow())
    expect(state).toEqual(initialState)
  })

  it('handles submitTransfer.pending', () => {
    const state = transferReducer(initialState, submitTransfer.pending('', {} as any))
    expect(state.submitting).toBe(true)
    expect(state.error).toBeNull()
  })

  it('handles submitTransfer.fulfilled', () => {
    const transfer = { id: 1, order_number: '456' }
    const state = transferReducer(
      { ...initialState, submitting: true },
      submitTransfer.fulfilled(transfer as any, '', {} as any)
    )
    expect(state.submitting).toBe(false)
    expect(state.result).toEqual(transfer)
    expect(state.step).toBe('success')
  })

  it('handles submitTransfer.rejected', () => {
    const state = transferReducer(
      { ...initialState, submitting: true },
      submitTransfer.rejected(null, '', {} as any, 'Transfer failed')
    )
    expect(state.submitting).toBe(false)
    expect(state.error).toBe('Transfer failed')
  })
})
```

- [ ] **Step 2: Run test — verify fails**

Run: `npm test -- --testPathPattern="transferSlice.test" --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement transferSlice**

```typescript
// src/store/slices/transferSlice.ts
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

export const { setTransferStep, setTransferFormData, setTransferPreview, resetTransferFlow } = transferSlice.actions
export default transferSlice.reducer
```

- [ ] **Step 4: Register reducer in store**

```typescript
// Add to src/store/index.ts
import transferReducer from './slices/transferSlice'

// In configureStore:
transfer: transferReducer,
```

- [ ] **Step 5: Run tests — verify pass**

Run: `npm test -- --testPathPattern="transferSlice.test" --no-coverage`
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add src/store/slices/transferSlice.ts src/store/slices/transferSlice.test.ts src/store/index.ts
git commit -m "feat: add transfer Redux slice for cross-currency transfer flow"
```

---

### Task 1.2: Transfer hooks

**Files:**
- Create: `src/hooks/useTransfers.ts`
- Create: `src/hooks/useTransfers.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/hooks/useTransfers.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useTransfers, useTransferPreview } from '@/hooks/useTransfers'
import * as transfersApi from '@/lib/api/transfers'
import * as exchangeApi from '@/lib/api/exchange'

jest.mock('@/lib/api/transfers')
jest.mock('@/lib/api/exchange')

const mockGetTransfers = jest.mocked(transfersApi.getTransfers)
const mockGetExchangeRate = jest.mocked(exchangeApi.getExchangeRate)

describe('useTransfers', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches transfers', async () => {
    mockGetTransfers.mockResolvedValue({ transfers: [], total_count: 0 })

    const { result } = renderHook(() => useTransfers({}), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetTransfers).toHaveBeenCalled()
  })
})

describe('useTransferPreview', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches exchange rate for preview', async () => {
    mockGetExchangeRate.mockResolvedValue({
      from_currency: 'RSD',
      to_currency: 'EUR',
      rate: 117.5,
    } as any)

    const { result } = renderHook(
      () => useTransferPreview('RSD', 'EUR', 1000),
      { wrapper: createQueryWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetExchangeRate).toHaveBeenCalledWith('RSD', 'EUR')
  })

  it('is disabled when currencies are the same', () => {
    const { result } = renderHook(
      () => useTransferPreview('RSD', 'RSD', 1000),
      { wrapper: createQueryWrapper() }
    )

    expect(result.current.isFetching).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — verify fails**

- [ ] **Step 3: Implement hooks**

```typescript
// src/hooks/useTransfers.ts
import { useQuery } from '@tanstack/react-query'
import { getTransfers } from '@/lib/api/transfers'
import { getExchangeRate } from '@/lib/api/exchange'
import type { TransferFilters } from '@/types/transfer'

export function useTransfers(filters: TransferFilters) {
  return useQuery({
    queryKey: ['transfers', filters],
    queryFn: () => getTransfers(filters),
  })
}

export function useTransferPreview(fromCurrency: string, toCurrency: string, amount: number) {
  return useQuery({
    queryKey: ['exchange-rate', fromCurrency, toCurrency, amount],
    queryFn: () => getExchangeRate(fromCurrency, toCurrency),
    enabled: !!fromCurrency && !!toCurrency && fromCurrency !== toCurrency && amount > 0,
  })
}
```

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTransfers.ts src/hooks/useTransfers.test.ts
git commit -m "feat: add transfer query hooks with exchange rate preview"
```

---

### Task 1.3: Transfer validation schema

**Files:**
- Modify: `src/lib/utils/validation.ts`

- [ ] **Step 1: Write failing test**

```typescript
// Add to validation test file
import { createTransferSchema } from '@/lib/utils/validation'

describe('createTransferSchema', () => {
  it('validates correct cross-currency transfer', () => {
    const result = createTransferSchema.safeParse({
      from_account: '111000100000000011',
      to_account: '111000100000000022',
      amount: 100,
    })
    expect(result.success).toBe(true)
  })

  it('rejects same from/to account', () => {
    const result = createTransferSchema.safeParse({
      from_account: '111000100000000011',
      to_account: '111000100000000011',
      amount: 100,
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero amount', () => {
    const result = createTransferSchema.safeParse({
      from_account: '111000100000000011',
      to_account: '111000100000000022',
      amount: 0,
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Add schema**

```typescript
// Add to src/lib/utils/validation.ts
export const createTransferSchema = z.object({
  from_account: z.string().regex(/^\d{18}$/, 'Account number must be 18 digits'),
  to_account: z.string().regex(/^\d{18}$/, 'Account number must be 18 digits'),
  amount: z.number().positive('Amount must be greater than 0'),
}).refine(
  (data) => data.from_account !== data.to_account,
  { message: 'Source and destination must be different', path: ['to_account'] }
)
```

- [ ] **Step 3: Run tests — verify pass**

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils/validation.ts
git commit -m "feat: add cross-currency transfer validation schema"
```

---

### Task 1.4: Transfer fixtures

**Files:**
- Create: `src/__tests__/fixtures/transfer-fixtures.ts`

- [ ] **Step 1: Create fixture factory**

```typescript
// src/__tests__/fixtures/transfer-fixtures.ts
import type { Transfer } from '@/types/transfer'

export function createMockTransfer(overrides: Partial<Transfer> = {}): Transfer {
  return {
    id: 1,
    order_number: '1234568902873',
    from_account: '111000100000000011',
    to_account: '111000100000000022',
    initial_amount: 1300,
    initial_currency: 'RSD',
    final_amount: 11,
    final_currency: 'EUR',
    exchange_rate: 117.69,
    commission: 0.7,
    timestamp: '2026-03-13T10:00:00Z',
    status: 'REALIZED',
    ...overrides,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/__tests__/fixtures/transfer-fixtures.ts
git commit -m "feat: add transfer mock fixtures"
```

---

## Chunk 2: Transfer UI Pages

### Task 2.1: CreateTransferForm component

**Files:**
- Create: `src/components/transfers/CreateTransferForm.tsx`
- Create: `src/components/transfers/CreateTransferForm.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/transfers/CreateTransferForm.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateTransferForm } from '@/components/transfers/CreateTransferForm'

const mockAccounts = [
  { id: 1, account_number: '111000100000000011', name: 'Tekući RSD', currency: 'RSD', available_balance: 50000 },
  { id: 2, account_number: '111000100000000022', name: 'Devizni EUR', currency: 'EUR', available_balance: 500 },
  { id: 3, account_number: '111000100000000033', name: 'Devizni USD', currency: 'USD', available_balance: 300 },
]

describe('CreateTransferForm', () => {
  const onSubmit = jest.fn()

  it('renders from/to account selectors and amount field', () => {
    renderWithProviders(<CreateTransferForm accounts={mockAccounts as any} onSubmit={onSubmit} />)

    expect(screen.getByLabelText(/izvorni račun/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/odredišni račun/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/iznos/i)).toBeInTheDocument()
  })

  it('filters out same-currency accounts from destination', () => {
    // When from_account is RSD, to_account should only show non-RSD accounts
    renderWithProviders(<CreateTransferForm accounts={mockAccounts as any} onSubmit={onSubmit} />)
    expect(screen.getByText(/uradi transfer/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify fails**

- [ ] **Step 3: Implement CreateTransferForm**

```typescript
// src/components/transfers/CreateTransferForm.tsx
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTransferSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Account } from '@/types/account'
import { useState } from 'react'
import type { z } from 'zod'

type FormValues = z.infer<typeof createTransferSchema>

interface CreateTransferFormProps {
  accounts: Account[]
  onSubmit: (data: FormValues) => void
}

export function CreateTransferForm({ accounts, onSubmit }: CreateTransferFormProps) {
  const [fromCurrency, setFromCurrency] = useState<string>('')

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(createTransferSchema),
  })

  // For cross-currency: destination must be different currency
  const toAccounts = accounts.filter((acc) => fromCurrency ? acc.currency !== fromCurrency : true)

  return (
    <Card>
      <CardHeader><CardTitle>Kreiraj transfer</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="from_account">Izvorni račun</Label>
            <Controller
              name="from_account"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => {
                    field.onChange(val)
                    const acc = accounts.find((a) => a.account_number === val)
                    setFromCurrency(acc?.currency ?? '')
                  }}
                  value={field.value}
                >
                  <SelectTrigger aria-label="Izvorni račun"><SelectValue placeholder="Izaberite račun" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.account_number} value={acc.account_number}>
                        {acc.name} — {acc.available_balance} {acc.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.from_account && <p className="text-sm text-destructive">{errors.from_account.message}</p>}
          </div>

          <div>
            <Label htmlFor="to_account">Odredišni račun</Label>
            <Controller
              name="to_account"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger aria-label="Odredišni račun"><SelectValue placeholder="Izaberite račun" /></SelectTrigger>
                  <SelectContent>
                    {toAccounts.map((acc) => (
                      <SelectItem key={acc.account_number} value={acc.account_number}>
                        {acc.name} — {acc.available_balance} {acc.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.to_account && <p className="text-sm text-destructive">{errors.to_account.message}</p>}
          </div>

          <div>
            <Label htmlFor="amount">Iznos</Label>
            <Input id="amount" type="number" {...register('amount', { valueAsNumber: true })} aria-label="Iznos" />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <Button type="submit" className="w-full">Uradi transfer</Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/transfers/CreateTransferForm.tsx src/components/transfers/CreateTransferForm.test.tsx
git commit -m "feat: add CreateTransferForm with cross-currency account filtering"
```

---

### Task 2.2: TransferPreview component

**Files:**
- Create: `src/components/transfers/TransferPreview.tsx`
- Create: `src/components/transfers/TransferPreview.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/transfers/TransferPreview.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TransferPreview } from '@/components/transfers/TransferPreview'

describe('TransferPreview', () => {
  const defaultProps = {
    clientName: 'Petar Petrović',
    fromAccount: '111000100000000011',
    toAccount: '111000100000000022',
    amount: 1300,
    fromCurrency: 'RSD',
    toCurrency: 'EUR',
    rate: 117.5,
    commission: 0.7,
    finalAmount: 10.37,
    onConfirm: jest.fn(),
    onBack: jest.fn(),
    submitting: false,
  }

  it('displays transfer details', () => {
    renderWithProviders(<TransferPreview {...defaultProps} />)

    expect(screen.getByText('Petar Petrović')).toBeInTheDocument()
    expect(screen.getByText(/117.5/)).toBeInTheDocument()
    expect(screen.getByText(/0.7/)).toBeInTheDocument()
    expect(screen.getByText(/10.37/)).toBeInTheDocument()
  })

  it('calls onConfirm', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TransferPreview {...defaultProps} />)

    await user.click(screen.getByText(/potvrdi/i))
    expect(defaultProps.onConfirm).toHaveBeenCalled()
  })

  it('calls onBack', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TransferPreview {...defaultProps} />)

    await user.click(screen.getByText(/nazad/i))
    expect(defaultProps.onBack).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Implement TransferPreview**

```typescript
// src/components/transfers/TransferPreview.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAccountNumber, formatCurrency } from '@/lib/utils/format'

interface TransferPreviewProps {
  clientName: string
  fromAccount: string
  toAccount: string
  amount: number
  fromCurrency: string
  toCurrency: string
  rate: number
  commission: number
  finalAmount: number
  onConfirm: () => void
  onBack: () => void
  submitting: boolean
}

export function TransferPreview({
  clientName, fromAccount, toAccount, amount,
  fromCurrency, toCurrency, rate, commission, finalAmount,
  onConfirm, onBack, submitting,
}: TransferPreviewProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Potvrdi transfer</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <DetailRow label="Klijent" value={clientName} />
        <DetailRow label="Sa računa" value={formatAccountNumber(fromAccount)} />
        <DetailRow label="Na račun" value={formatAccountNumber(toAccount)} />
        <DetailRow label="Iznos" value={formatCurrency(amount, fromCurrency)} />
        <DetailRow label="Kurs" value={String(rate)} />
        <DetailRow label="Provizija" value={formatCurrency(commission, toCurrency)} />
        <DetailRow label="Krajnji iznos" value={formatCurrency(finalAmount, toCurrency)} />

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1">Nazad</Button>
          <Button onClick={onConfirm} disabled={submitting} className="flex-1">
            {submitting ? 'Obrađuje se...' : 'Potvrdi'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
```

- [ ] **Step 3: Run tests — verify pass**

- [ ] **Step 4: Commit**

```bash
git add src/components/transfers/TransferPreview.tsx src/components/transfers/TransferPreview.test.tsx
git commit -m "feat: add TransferPreview with rate and commission display"
```

---

### Task 2.3: CreateTransferPage (orchestrates form → preview → success)

**Files:**
- Create: `src/pages/CreateTransferPage.tsx`
- Create: `src/pages/CreateTransferPage.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/pages/CreateTransferPage.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateTransferPage } from '@/pages/CreateTransferPage'
import * as useAccountsHook from '@/hooks/useAccounts'

jest.mock('@/hooks/useAccounts')
jest.mock('@/hooks/useTransfers')

describe('CreateTransferPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: [
        { id: 1, account_number: '111000100000000011', name: 'RSD', currency: 'RSD', available_balance: 50000 },
        { id: 2, account_number: '111000100000000022', name: 'EUR', currency: 'EUR', available_balance: 500 },
      ],
      isLoading: false,
    } as any)
  })

  it('renders transfer form initially', () => {
    renderWithProviders(<CreateTransferPage />)
    expect(screen.getByText(/kreiraj transfer/i)).toBeInTheDocument()
  })

  it('shows loading when accounts load', () => {
    jest.mocked(useAccountsHook.useClientAccounts).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any)
    renderWithProviders(<CreateTransferPage />)
    expect(screen.getByText(/učitavanje/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement CreateTransferPage**

```typescript
// src/pages/CreateTransferPage.tsx
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch'
import { useClientAccounts } from '@/hooks/useAccounts'
import { useTransferPreview } from '@/hooks/useTransfers'
import {
  setTransferStep,
  setTransferFormData,
  setTransferPreview,
  resetTransferFlow,
  submitTransfer,
} from '@/store/slices/transferSlice'
import { CreateTransferForm } from '@/components/transfers/CreateTransferForm'
import { TransferPreview } from '@/components/transfers/TransferPreview'
import { Button } from '@/components/ui/button'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { useNavigate } from 'react-router-dom'

export function CreateTransferPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectCurrentUser)
  const { step, formData, submitting, result } = useAppSelector((s) => s.transfer)
  const { data: accounts, isLoading } = useClientAccounts()

  // Get currencies for preview
  const fromAcc = accounts?.find((a) => a.account_number === formData?.from_account)
  const toAcc = accounts?.find((a) => a.account_number === formData?.to_account)

  const { data: rateData } = useTransferPreview(
    fromAcc?.currency ?? '',
    toAcc?.currency ?? '',
    formData?.amount ?? 0
  )

  useEffect(() => {
    return () => { dispatch(resetTransferFlow()) }
  }, [dispatch])

  if (isLoading) return <p>Učitavanje...</p>

  const handleFormSubmit = (data: { from_account: string; to_account: string; amount: number }) => {
    dispatch(setTransferFormData(data))
    dispatch(setTransferStep('confirmation'))
  }

  const handleConfirm = () => {
    if (!formData) return
    dispatch(submitTransfer({
      from_account: formData.from_account,
      to_account: formData.to_account,
      amount: formData.amount,
    }))
  }

  if (step === 'success' && result) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Transfer uspešan!</h2>
        <p>Broj naloga: {result.order_number}</p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate('/transfers/history')}>Istorija</Button>
          <Button variant="outline" onClick={() => dispatch(resetTransferFlow())}>Novi transfer</Button>
        </div>
      </div>
    )
  }

  if (step === 'confirmation' && formData) {
    return (
      <TransferPreview
        clientName={user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : ''}
        fromAccount={formData.from_account}
        toAccount={formData.to_account}
        amount={formData.amount}
        fromCurrency={fromAcc?.currency ?? ''}
        toCurrency={toAcc?.currency ?? ''}
        rate={rateData?.rate ?? 0}
        commission={rateData?.commission ?? 0}
        finalAmount={rateData?.to_amount ?? 0}
        onConfirm={handleConfirm}
        onBack={() => dispatch(setTransferStep('form'))}
        submitting={submitting}
      />
    )
  }

  return <CreateTransferForm accounts={accounts ?? []} onSubmit={handleFormSubmit} />
}
```

- [ ] **Step 3: Run tests — verify pass**

- [ ] **Step 4: Commit**

```bash
git add src/pages/CreateTransferPage.tsx src/pages/CreateTransferPage.test.tsx
git commit -m "feat: add CreateTransferPage with 2-step cross-currency transfer flow"
```

---

### Task 2.4: TransferHistoryTable + TransferHistoryPage

**Files:**
- Create: `src/components/transfers/TransferHistoryTable.tsx`
- Create: `src/components/transfers/TransferHistoryTable.test.tsx`
- Create: `src/pages/TransferHistoryPage.tsx`
- Create: `src/pages/TransferHistoryPage.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/transfers/TransferHistoryTable.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { TransferHistoryTable } from '@/components/transfers/TransferHistoryTable'
import { createMockTransfer } from '@/__tests__/fixtures/transfer-fixtures'

describe('TransferHistoryTable', () => {
  it('renders transfer rows sorted by date descending', () => {
    const transfers = [
      createMockTransfer({ id: 1, initial_amount: 1300, initial_currency: 'RSD' }),
      createMockTransfer({ id: 2, initial_amount: 500, initial_currency: 'EUR' }),
    ]

    renderWithProviders(<TransferHistoryTable transfers={transfers} />)

    expect(screen.getByText(/1.300/)).toBeInTheDocument()
    expect(screen.getByText(/500/)).toBeInTheDocument()
  })

  it('shows empty state', () => {
    renderWithProviders(<TransferHistoryTable transfers={[]} />)
    expect(screen.getByText(/nema transfera/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement TransferHistoryTable**

```typescript
// src/components/transfers/TransferHistoryTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatAccountNumber } from '@/lib/utils/format'
import type { Transfer } from '@/types/transfer'

const STATUS_LABELS: Record<string, string> = {
  REALIZED: 'Realizovano',
  REJECTED: 'Odbijeno',
  PROCESSING: 'U obradi',
}

interface TransferHistoryTableProps {
  transfers: Transfer[]
}

export function TransferHistoryTable({ transfers }: TransferHistoryTableProps) {
  if (transfers.length === 0) {
    return <p className="text-muted-foreground">Nema transfera.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Sa računa</TableHead>
          <TableHead>Na račun</TableHead>
          <TableHead>Iznos</TableHead>
          <TableHead>Krajnji iznos</TableHead>
          <TableHead>Kurs</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transfers.map((t) => (
          <TableRow key={t.id}>
            <TableCell>{new Date(t.timestamp).toLocaleDateString('sr-Latn-RS')}</TableCell>
            <TableCell>{formatAccountNumber(t.from_account)}</TableCell>
            <TableCell>{formatAccountNumber(t.to_account)}</TableCell>
            <TableCell>{formatCurrency(t.initial_amount, t.initial_currency)}</TableCell>
            <TableCell>{formatCurrency(t.final_amount, t.final_currency)}</TableCell>
            <TableCell>{t.exchange_rate}</TableCell>
            <TableCell>
              <Badge variant={t.status === 'REALIZED' ? 'default' : 'secondary'}>
                {STATUS_LABELS[t.status] ?? t.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 3: Implement TransferHistoryPage**

```typescript
// src/pages/TransferHistoryPage.tsx
import { useTransfers } from '@/hooks/useTransfers'
import { TransferHistoryTable } from '@/components/transfers/TransferHistoryTable'

export function TransferHistoryPage() {
  const { data, isLoading } = useTransfers({})

  if (isLoading) return <p>Učitavanje...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Istorija transfera</h1>
      <TransferHistoryTable transfers={data?.transfers ?? []} />
    </div>
  )
}
```

- [ ] **Step 4: Run all tests — verify pass**

- [ ] **Step 5: Commit**

```bash
git add src/components/transfers/TransferHistoryTable.tsx src/components/transfers/TransferHistoryTable.test.tsx \
  src/pages/TransferHistoryPage.tsx src/pages/TransferHistoryPage.test.tsx
git commit -m "feat: add transfer history page with chronological table"
```

---

### Task 2.5: Routes and navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Add routes**

```typescript
// Add to App.tsx inside Client routes
<Route path="/transfers/new" element={<ProtectedRoute requiredRole="Client"><CreateTransferPage /></ProtectedRoute>} />
<Route path="/transfers/history" element={<ProtectedRoute requiredRole="Client"><TransferHistoryPage /></ProtectedRoute>} />
```

- [ ] **Step 2: Add "Transferi" to ClientNav** in Sidebar with links to "Uradi transfer" and "Istorija transfera".

- [ ] **Step 3: Run all tests**

Run: `npm test --no-coverage`
Expected: All PASS

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/layout/Sidebar.tsx
git commit -m "feat: add transfer routes and sidebar navigation"
```
