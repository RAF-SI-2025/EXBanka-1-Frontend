# Client Dashboard & Account Views Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the client-facing dashboard (home page), accounts list, and account detail pages. Clients see their accounts, recent transactions, quick payment shortcuts, and an exchange rate calculator.

**Architecture:** Three client-only pages: HomePage (dashboard with overview widgets), AccountListPage (all accounts + transactions for selected account), AccountDetailsPage (full details + rename/limits). Server data via TanStack Query. No Redux needed — no multi-step flows here.

**Tech Stack:** React 19, TypeScript, Shadcn UI, TanStack Query, React Hook Form + Zod, Jest + RTL

**Depends on:** Plan 1 (Foundation), Plan 2 (useAccounts, useClients hooks)

---

## File Structure

```
src/
  pages/
    HomePage.tsx                      # Client dashboard
    HomePage.test.tsx
    AccountListPage.tsx               # /accounts — list + transactions
    AccountListPage.test.tsx
    AccountDetailsPage.tsx            # /accounts/:id — detail view
    AccountDetailsPage.test.tsx
  components/
    accounts/
      AccountCard.tsx                 # Single account card in list
      AccountCard.test.tsx
      RenameAccountDialog.tsx         # Rename dialog with validation
      RenameAccountDialog.test.tsx
      ChangeLimitsDialog.tsx          # Change daily/monthly limits (requires verification)
      ChangeLimitsDialog.test.tsx
      BusinessAccountInfo.tsx         # Company info for business accounts
      BusinessAccountInfo.test.tsx
      RecentTransactions.tsx          # Last N transactions table
      RecentTransactions.test.tsx
    home/
      QuickPayment.tsx                # Quick payment recipients section
      QuickPayment.test.tsx
      ExchangeCalculator.tsx          # Mini currency converter
      ExchangeCalculator.test.tsx
  hooks/
    usePayments.ts                    # usePayments query (needed for transactions)
    usePayments.test.ts
    useExchange.ts                    # useExchangeRates, useConvertCurrency
    useExchange.test.ts
  App.tsx                             # MODIFY: add /home, /accounts, /accounts/:id routes
```

---

## Chunk 1: Data Hooks

### Task 1.1: Payment hooks

**Files:**
- Create: `src/hooks/usePayments.ts`
- Create: `src/hooks/usePayments.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/hooks/usePayments.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { usePayments } from '@/hooks/usePayments'
import * as paymentsApi from '@/lib/api/payments'

jest.mock('@/lib/api/payments')

const mockGetPayments = jest.mocked(paymentsApi.getPayments)

describe('usePayments', () => {
  it('fetches payments with filters', async () => {
    mockGetPayments.mockResolvedValue({ payments: [], total_count: 0 })

    const { result } = renderHook(
      () => usePayments({ account_number: '111000100000000011', page_size: 5 }),
      { wrapper: createQueryWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetPayments).toHaveBeenCalledWith({ account_number: '111000100000000011', page_size: 5 })
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern="usePayments.test" --no-coverage
```

- [ ] **Step 3: Implement usePayments**

```typescript
// src/hooks/usePayments.ts
import { useQuery } from '@tanstack/react-query'
import { getPayments, getPayment } from '@/lib/api/payments'
import type { PaymentFilters } from '@/types/payment'

export function usePayments(filters: PaymentFilters = {}) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => getPayments(filters),
  })
}

export function usePayment(id: number) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => getPayment(id),
    enabled: id > 0,
  })
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- --testPathPattern="usePayments.test" --no-coverage
```

---

### Task 1.2: Exchange hooks

**Files:**
- Create: `src/hooks/useExchange.ts`
- Create: `src/hooks/useExchange.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/hooks/useExchange.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryWrapper } from '@/__tests__/utils/test-utils'
import { useExchangeRates, useConvertCurrency } from '@/hooks/useExchange'
import * as exchangeApi from '@/lib/api/exchange'

jest.mock('@/lib/api/exchange')

const mockGetExchangeRates = jest.mocked(exchangeApi.getExchangeRates)
const mockConvertCurrency = jest.mocked(exchangeApi.convertCurrency)

describe('useExchangeRates', () => {
  it('fetches exchange rates', async () => {
    mockGetExchangeRates.mockResolvedValue([])

    const { result } = renderHook(() => useExchangeRates(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetExchangeRates).toHaveBeenCalled()
  })
})

describe('useConvertCurrency', () => {
  it('fetches conversion when enabled', async () => {
    mockConvertCurrency.mockResolvedValue({
      from_currency: 'RSD', to_currency: 'EUR', from_amount: 11750, to_amount: 100, rate: 117.5, commission: 0,
    })

    const { result } = renderHook(
      () => useConvertCurrency('RSD', 'EUR', 11750),
      { wrapper: createQueryWrapper() }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockConvertCurrency).toHaveBeenCalledWith('RSD', 'EUR', 11750)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern="useExchange.test" --no-coverage
```

- [ ] **Step 3: Implement exchange hooks**

```typescript
// src/hooks/useExchange.ts
import { useQuery } from '@tanstack/react-query'
import { getCurrencies, getExchangeRates, convertCurrency } from '@/lib/api/exchange'

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: () => getCurrencies(),
  })
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: () => getExchangeRates(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useConvertCurrency(from: string, to: string, amount: number) {
  return useQuery({
    queryKey: ['convert', from, to, amount],
    queryFn: () => convertCurrency(from, to, amount),
    enabled: amount > 0 && from !== to,
  })
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- --testPathPattern="useExchange.test" --no-coverage
```

- [ ] **Step 5: Commit hooks**

```bash
git add src/hooks/usePayments.ts src/hooks/usePayments.test.ts src/hooks/useExchange.ts src/hooks/useExchange.test.ts
git commit -m "feat: add payment and exchange TanStack Query hooks"
```

---

## Chunk 2: Shared Account Components

### Task 2.1: AccountCard component

**Files:**
- Create: `src/components/accounts/AccountCard.tsx`
- Create: `src/components/accounts/AccountCard.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/accounts/AccountCard.test.tsx
import { screen } from '@testing-library/react'
import { AccountCard } from '@/components/accounts/AccountCard'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

describe('AccountCard', () => {
  const account = createMockAccount()

  it('displays account name and formatted number', () => {
    renderWithProviders(<AccountCard account={account} />)
    expect(screen.getByText('Tekući račun 1')).toBeInTheDocument()
    expect(screen.getByText('111-0001-000000000-11')).toBeInTheDocument()
  })

  it('displays formatted available balance', () => {
    renderWithProviders(<AccountCard account={account} />)
    expect(screen.getByText(/148,000\.00 RSD/)).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn()
    renderWithProviders(<AccountCard account={account} onClick={onClick} />)
    await screen.getByText('Tekući račun 1').click()
    expect(onClick).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern="AccountCard.test" --no-coverage
```

- [ ] **Step 3: Implement AccountCard**

```typescript
// src/components/accounts/AccountCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import { formatAccountNumber, formatCurrency } from '@/lib/utils/format'
import type { Account } from '@/types/account'

interface AccountCardProps {
  account: Account
  selected?: boolean
  onClick?: () => void
}

export function AccountCard({ account, selected, onClick }: AccountCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-colors ${selected ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <p className="font-medium text-sm">{account.name}</p>
        <p className="text-xs text-muted-foreground">{formatAccountNumber(account.account_number)}</p>
        <p className="text-lg font-bold mt-2">{formatCurrency(account.available_balance, account.currency)}</p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- --testPathPattern="AccountCard.test" --no-coverage
```

---

### Task 2.2: RecentTransactions component

**Files:**
- Create: `src/components/accounts/RecentTransactions.tsx`
- Create: `src/components/accounts/RecentTransactions.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/accounts/RecentTransactions.test.tsx
import { screen } from '@testing-library/react'
import { RecentTransactions } from '@/components/accounts/RecentTransactions'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockPayment } from '@/__tests__/fixtures/payment-fixtures'

describe('RecentTransactions', () => {
  it('renders transactions in a table', () => {
    const payments = [createMockPayment(), createMockPayment({ id: 2, amount: 1000, purpose: 'Lunch' })]
    renderWithProviders(<RecentTransactions transactions={payments} />)
    expect(screen.getByText('Za privatni čas')).toBeInTheDocument()
    expect(screen.getByText('Lunch')).toBeInTheDocument()
  })

  it('shows empty state when no transactions', () => {
    renderWithProviders(<RecentTransactions transactions={[]} />)
    expect(screen.getByText(/no transactions/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern="RecentTransactions.test" --no-coverage
```

- [ ] **Step 3: Implement RecentTransactions**

```typescript
// src/components/accounts/RecentTransactions.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils/format'
import type { Payment } from '@/types/payment'

interface RecentTransactionsProps {
  transactions: Payment[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No transactions found.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Purpose</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="text-sm">{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
            <TableCell className="text-sm">{tx.purpose}</TableCell>
            <TableCell className="text-sm">{tx.recipient_name}</TableCell>
            <TableCell className="text-sm text-right">{formatCurrency(tx.amount, tx.currency)}</TableCell>
            <TableCell><span className={`text-xs px-2 py-1 rounded ${tx.status === 'REALIZED' ? 'bg-green-100 text-green-800' : tx.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{tx.status}</span></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- --testPathPattern="RecentTransactions.test" --no-coverage
```

---

### Task 2.3: RenameAccountDialog

**Files:**
- Create: `src/components/accounts/RenameAccountDialog.tsx`
- Create: `src/components/accounts/RenameAccountDialog.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/accounts/RenameAccountDialog.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RenameAccountDialog } from '@/components/accounts/RenameAccountDialog'
import { renderWithProviders } from '@/__tests__/utils/test-utils'

describe('RenameAccountDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    currentName: 'Tekući račun 1',
    onRename: jest.fn(),
  }

  it('renders current name and input for new name', () => {
    renderWithProviders(<RenameAccountDialog {...defaultProps} />)
    expect(screen.getByText('Tekući račun 1')).toBeInTheDocument()
    expect(screen.getByLabelText(/new name/i)).toBeInTheDocument()
  })

  it('calls onRename with new name on submit', async () => {
    renderWithProviders(<RenameAccountDialog {...defaultProps} />)
    await userEvent.type(screen.getByLabelText(/new name/i), 'My Account')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(defaultProps.onRename).toHaveBeenCalledWith('My Account')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern="RenameAccountDialog.test" --no-coverage
```

- [ ] **Step 3: Implement RenameAccountDialog**

```typescript
// src/components/accounts/RenameAccountDialog.tsx
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface RenameAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
  onRename: (newName: string) => void
}

export function RenameAccountDialog({ open, onOpenChange, currentName, onRename }: RenameAccountDialogProps) {
  const [newName, setNewName] = useState('')
  const isValid = newName.trim().length > 0 && newName.trim() !== currentName

  const handleSubmit = () => {
    if (isValid) {
      onRename(newName.trim())
      setNewName('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">Current name: <strong>{currentName}</strong></p>
          <div>
            <Label htmlFor="new-name">New Name</Label>
            <Input id="new-name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- --testPathPattern="RenameAccountDialog.test" --no-coverage
```

- [ ] **Step 5: Commit components**

```bash
git add src/components/accounts/AccountCard.tsx src/components/accounts/AccountCard.test.tsx src/components/accounts/RecentTransactions.tsx src/components/accounts/RecentTransactions.test.tsx src/components/accounts/RenameAccountDialog.tsx src/components/accounts/RenameAccountDialog.test.tsx
git commit -m "feat: add AccountCard, RecentTransactions, and RenameAccountDialog components"
```

---

### Task 2.4: ChangeLimitsDialog component

**Files:**
- Create: `src/components/accounts/ChangeLimitsDialog.tsx`
- Create: `src/components/accounts/ChangeLimitsDialog.test.tsx`

> **Spec note:** "Promena limita (zahteva verifikaciju)" — only the account owner can change limits. The verification step (mobile code) is currently out of scope, so we show a confirmation step with a "Confirm" button. When the backend verification API is ready, a verification code input can be added here.

- [ ] **Step 1: Write failing test**

```typescript
// src/components/accounts/ChangeLimitsDialog.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangeLimitsDialog } from '@/components/accounts/ChangeLimitsDialog'
import { renderWithProviders } from '@/__tests__/utils/test-utils'

describe('ChangeLimitsDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    currentDailyLimit: 250000,
    currentMonthlyLimit: 1000000,
    currency: 'RSD',
    onSubmit: jest.fn(),
  }

  it('renders current limits and inputs for new limits', () => {
    renderWithProviders(<ChangeLimitsDialog {...defaultProps} />)
    expect(screen.getByLabelText(/daily limit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/monthly limit/i)).toBeInTheDocument()
  })

  it('calls onSubmit with new limits on save', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChangeLimitsDialog {...defaultProps} />)
    await user.clear(screen.getByLabelText(/daily limit/i))
    await user.type(screen.getByLabelText(/daily limit/i), '300000')
    await user.clear(screen.getByLabelText(/monthly limit/i))
    await user.type(screen.getByLabelText(/monthly limit/i), '1200000')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      daily_limit: 300000,
      monthly_limit: 1200000,
    })
  })

  it('disables save when limits are unchanged', () => {
    renderWithProviders(<ChangeLimitsDialog {...defaultProps} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern="ChangeLimitsDialog.test" --no-coverage
```

- [ ] **Step 3: Implement ChangeLimitsDialog**

```typescript
// src/components/accounts/ChangeLimitsDialog.tsx
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/format'

interface ChangeLimitsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentDailyLimit: number
  currentMonthlyLimit: number
  currency: string
  onSubmit: (limits: { daily_limit: number; monthly_limit: number }) => void
}

export function ChangeLimitsDialog({
  open, onOpenChange, currentDailyLimit, currentMonthlyLimit, currency, onSubmit,
}: ChangeLimitsDialogProps) {
  const [dailyLimit, setDailyLimit] = useState(currentDailyLimit)
  const [monthlyLimit, setMonthlyLimit] = useState(currentMonthlyLimit)

  const hasChanged = dailyLimit !== currentDailyLimit || monthlyLimit !== currentMonthlyLimit
  const isValid = hasChanged && dailyLimit > 0 && monthlyLimit > 0 && dailyLimit <= monthlyLimit

  const handleSubmit = () => {
    if (isValid) {
      onSubmit({ daily_limit: dailyLimit, monthly_limit: monthlyLimit })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Limits</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Current: {formatCurrency(currentDailyLimit, currency)} / day, {formatCurrency(currentMonthlyLimit, currency)} / month
          </p>
          <div>
            <Label htmlFor="daily-limit">Daily Limit</Label>
            <Input id="daily-limit" type="number" value={dailyLimit} onChange={(e) => setDailyLimit(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="monthly-limit">Monthly Limit</Label>
            <Input id="monthly-limit" type="number" value={monthlyLimit} onChange={(e) => setMonthlyLimit(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- --testPathPattern="ChangeLimitsDialog.test" --no-coverage
```

---

### Task 2.5: BusinessAccountInfo component

**Files:**
- Create: `src/components/accounts/BusinessAccountInfo.tsx`
- Create: `src/components/accounts/BusinessAccountInfo.test.tsx`

> **Spec note:** "Detaljan prikaz računa - poslovnog" — business account detail shows company info (name, registration number, etc.) alongside standard account details.

- [ ] **Step 1: Write failing test**

```typescript
// src/components/accounts/BusinessAccountInfo.test.tsx
import { screen } from '@testing-library/react'
import { BusinessAccountInfo } from '@/components/accounts/BusinessAccountInfo'
import { renderWithProviders } from '@/__tests__/utils/test-utils'

describe('BusinessAccountInfo', () => {
  const company = {
    id: 1,
    name: 'Firma DOO',
    registration_number: '12345678',
    tax_number: '123456789',
    activity_code: '01.9',
    address: 'Trg Republike V/5, Beograd, Srbija',
  }

  it('renders company details', () => {
    renderWithProviders(<BusinessAccountInfo company={company} />)
    expect(screen.getByText('Firma DOO')).toBeInTheDocument()
    expect(screen.getByText('12345678')).toBeInTheDocument()
    expect(screen.getByText('123456789')).toBeInTheDocument()
    expect(screen.getByText('01.9')).toBeInTheDocument()
    expect(screen.getByText('Trg Republike V/5, Beograd, Srbija')).toBeInTheDocument()
  })

  it('renders nothing when company is undefined', () => {
    const { container } = renderWithProviders(<BusinessAccountInfo company={undefined} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern="BusinessAccountInfo.test" --no-coverage
```

- [ ] **Step 3: Implement BusinessAccountInfo**

```typescript
// src/components/accounts/BusinessAccountInfo.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CompanyInfo {
  id: number
  name: string
  registration_number: string
  tax_number: string
  activity_code: string
  address: string
}

interface BusinessAccountInfoProps {
  company?: CompanyInfo
}

export function BusinessAccountInfo({ company }: BusinessAccountInfoProps) {
  if (!company) return null

  return (
    <Card>
      <CardHeader><CardTitle>Company Info</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Company Name</span><span>{company.name}</span>
          <span className="text-muted-foreground">Registration Number</span><span>{company.registration_number}</span>
          <span className="text-muted-foreground">Tax Number (PIB)</span><span>{company.tax_number}</span>
          <span className="text-muted-foreground">Activity Code</span><span>{company.activity_code}</span>
          <span className="text-muted-foreground">Address</span><span>{company.address}</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- --testPathPattern="BusinessAccountInfo.test" --no-coverage
```

- [ ] **Step 5: Commit new components**

```bash
git add src/components/accounts/ChangeLimitsDialog.tsx src/components/accounts/ChangeLimitsDialog.test.tsx src/components/accounts/BusinessAccountInfo.tsx src/components/accounts/BusinessAccountInfo.test.tsx
git commit -m "feat: add ChangeLimitsDialog and BusinessAccountInfo components"
```

---

## Chunk 3: Home Page Components

### Task 3.1: ExchangeCalculator

**Files:**
- Create: `src/components/home/ExchangeCalculator.tsx`
- Create: `src/components/home/ExchangeCalculator.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/home/ExchangeCalculator.test.tsx
import { screen } from '@testing-library/react'
import { ExchangeCalculator } from '@/components/home/ExchangeCalculator'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/exchange')

describe('ExchangeCalculator', () => {
  it('renders amount input and currency selectors', () => {
    const clientAuth = createMockAuthState({
      user: { id: 1, email: 'c@t.com', role: 'Client', permissions: [] },
    })
    renderWithProviders(<ExchangeCalculator />, {
      preloadedState: { auth: clientAuth },
    })
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/from/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern="ExchangeCalculator.test" --no-coverage
```

- [ ] **Step 3: Implement ExchangeCalculator**

```typescript
// src/components/home/ExchangeCalculator.tsx
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useConvertCurrency } from '@/hooks/useExchange'
import { SUPPORTED_CURRENCIES } from '@/lib/constants/banking'
import { formatCurrency } from '@/lib/utils/format'

export function ExchangeCalculator() {
  const [amount, setAmount] = useState(0)
  const [fromCurrency, setFromCurrency] = useState('RSD')
  const [toCurrency, setToCurrency] = useState('EUR')

  const { data: conversion, isLoading } = useConvertCurrency(fromCurrency, toCurrency, amount)

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Exchange Calculator</h3>
      <div>
        <Label htmlFor="calc-amount">Amount</Label>
        <Input id="calc-amount" type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="calc-from">From</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger id="calc-from"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="calc-to">To</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger id="calc-to"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Calculating...</p>}
      {conversion && (
        <p className="text-lg font-bold">{formatCurrency(conversion.to_amount, toCurrency)}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- --testPathPattern="ExchangeCalculator.test" --no-coverage
```

---

### Task 3.2: QuickPayment

**Files:**
- Create: `src/components/home/QuickPayment.tsx`
- Create: `src/components/home/QuickPayment.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/home/QuickPayment.test.tsx
import { screen } from '@testing-library/react'
import { QuickPayment } from '@/components/home/QuickPayment'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import * as paymentsApi from '@/lib/api/payments'
import { createMockPaymentRecipient } from '@/__tests__/fixtures/payment-fixtures'

jest.mock('@/lib/api/payments')

const mockGetRecipients = jest.mocked(paymentsApi.getPaymentRecipients)

describe('QuickPayment', () => {
  it('renders section title and add button', () => {
    mockGetRecipients.mockResolvedValue([])
    renderWithProviders(<QuickPayment />)
    expect(screen.getByText(/quick payment/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern="QuickPayment.test" --no-coverage
```

- [ ] **Step 3: Implement QuickPayment**

```typescript
// src/components/home/QuickPayment.tsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPaymentRecipients } from '@/lib/api/payments'
import { formatAccountNumber } from '@/lib/utils/format'

export function QuickPayment() {
  const { data: recipients = [] } = useQuery({
    queryKey: ['payment-recipients'],
    queryFn: () => getPaymentRecipients(),
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Quick Payment</h3>
        <Link to="/payments/recipients" className="text-sm text-primary hover:underline">Add</Link>
      </div>
      {recipients.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved recipients.</p>
      ) : (
        <div className="space-y-2">
          {recipients.slice(0, 5).map((r) => (
            <Link
              key={r.id}
              to={`/payments/new?recipient=${r.id}`}
              className="block p-2 border rounded text-sm hover:bg-accent"
            >
              <span className="font-medium">{r.name}</span>
              <span className="text-muted-foreground ml-2">{formatAccountNumber(r.account_number)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- --testPathPattern="QuickPayment.test" --no-coverage
```

- [ ] **Step 5: Commit home components**

```bash
git add src/components/home/
git commit -m "feat: add ExchangeCalculator and QuickPayment home page components"
```

---

## Chunk 4: Pages & Routes

### Task 4.1: HomePage

**Files:**
- Create: `src/pages/HomePage.tsx`
- Create: `src/pages/HomePage.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/pages/HomePage.test.tsx
import { screen } from '@testing-library/react'
import { HomePage } from '@/pages/HomePage'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/accounts')
jest.mock('@/lib/api/payments')
jest.mock('@/lib/api/exchange')

describe('HomePage', () => {
  const clientAuth = createMockAuthState({
    user: { id: 1, email: 'client@bank.com', role: 'Client', permissions: [] },
  })

  it('renders dashboard sections', () => {
    renderWithProviders(<HomePage />, {
      preloadedState: { auth: clientAuth },
    })
    expect(screen.getByText(/my accounts/i)).toBeInTheDocument()
    expect(screen.getByText(/recent transactions/i)).toBeInTheDocument()
    expect(screen.getByText(/quick payment/i)).toBeInTheDocument()
    expect(screen.getByText(/exchange calculator/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern="HomePage.test" --no-coverage
```

- [ ] **Step 3: Implement HomePage**

```typescript
// src/pages/HomePage.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountCard } from '@/components/accounts/AccountCard'
import { RecentTransactions } from '@/components/accounts/RecentTransactions'
import { QuickPayment } from '@/components/home/QuickPayment'
import { ExchangeCalculator } from '@/components/home/ExchangeCalculator'
import { useClientAccounts } from '@/hooks/useAccounts'
import { usePayments } from '@/hooks/usePayments'

export function HomePage() {
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selectedAccount = accounts[selectedIdx]

  const { data: paymentsData } = usePayments(
    selectedAccount ? { account_number: selectedAccount.account_number, page_size: 5 } : {}
  )

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader><CardTitle>My Accounts</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {accounts.map((acc, i) => (
              <div key={acc.id} className="min-w-[200px]">
                <AccountCard account={acc} selected={i === selectedIdx} onClick={() => setSelectedIdx(i)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <RecentTransactions transactions={paymentsData?.payments ?? []} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6"><QuickPayment /></CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6"><ExchangeCalculator /></CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- --testPathPattern="HomePage.test" --no-coverage
```

---

### Task 4.2: AccountListPage

**Files:**
- Create: `src/pages/AccountListPage.tsx`
- Create: `src/pages/AccountListPage.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/pages/AccountListPage.test.tsx
import { screen } from '@testing-library/react'
import { AccountListPage } from '@/pages/AccountListPage'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

jest.mock('@/lib/api/accounts')
jest.mock('@/lib/api/payments')

describe('AccountListPage', () => {
  it('renders page title', () => {
    const clientAuth = createMockAuthState({
      user: { id: 1, email: 'c@b.com', role: 'Client', permissions: [] },
    })
    renderWithProviders(<AccountListPage />, {
      preloadedState: { auth: clientAuth },
    })
    expect(screen.getByText(/accounts/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails, then implement**

```typescript
// src/pages/AccountListPage.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountCard } from '@/components/accounts/AccountCard'
import { RecentTransactions } from '@/components/accounts/RecentTransactions'
import { useClientAccounts } from '@/hooks/useAccounts'
import { usePayments } from '@/hooks/usePayments'

export function AccountListPage() {
  const { data: accountsData, isLoading } = useClientAccounts()
  const accounts = (accountsData?.accounts ?? []).sort((a, b) => b.available_balance - a.available_balance)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = accounts.find((a) => a.id === selectedId) ?? accounts[0]

  const { data: paymentsData } = usePayments(
    selected ? { account_number: selected.account_number } : {}
  )

  if (isLoading) return <p className="p-6">Loading accounts...</p>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Accounts</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id}>
            <AccountCard
              account={acc}
              selected={acc.id === (selected?.id ?? 0)}
              onClick={() => setSelectedId(acc.id)}
            />
            <Link to={`/accounts/${acc.id}`}>
              <Button variant="outline" size="sm" className="mt-2 w-full">Details</Button>
            </Link>
          </div>
        ))}
      </div>
      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions — {selected.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={paymentsData?.payments ?? []} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Run test — verify it passes**

```bash
npm test -- --testPathPattern="AccountListPage.test" --no-coverage
```

---

### Task 4.3: AccountDetailsPage

**Files:**
- Create: `src/pages/AccountDetailsPage.tsx`
- Create: `src/pages/AccountDetailsPage.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/pages/AccountDetailsPage.test.tsx
import { screen } from '@testing-library/react'
import { AccountDetailsPage } from '@/pages/AccountDetailsPage'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'
import * as accountsApi from '@/lib/api/accounts'
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures'

jest.mock('@/lib/api/accounts')

const mockGetAccount = jest.mocked(accountsApi.getAccount)

describe('AccountDetailsPage', () => {
  it('renders account details when loaded', async () => {
    mockGetAccount.mockResolvedValue(createMockAccount())
    const clientAuth = createMockAuthState({
      user: { id: 1, email: 'c@b.com', role: 'Client', permissions: [] },
    })
    renderWithProviders(<AccountDetailsPage />, {
      preloadedState: { auth: clientAuth },
      route: '/accounts/1',
      routePath: '/accounts/:id',
    })
    // The page should load and display account details
  })
})
```

- [ ] **Step 2: Run test — verify it fails, then implement**

```typescript
// src/pages/AccountDetailsPage.tsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RenameAccountDialog } from '@/components/accounts/RenameAccountDialog'
import { ChangeLimitsDialog } from '@/components/accounts/ChangeLimitsDialog'
import { BusinessAccountInfo } from '@/components/accounts/BusinessAccountInfo'
import { useAccount, useUpdateAccount } from '@/hooks/useAccounts'
import { formatAccountNumber, formatCurrency } from '@/lib/utils/format'

export function AccountDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const accountId = Number(id)
  const { data: account, isLoading } = useAccount(accountId)
  const updateAccount = useUpdateAccount(accountId)
  const [renameOpen, setRenameOpen] = useState(false)
  const [limitsOpen, setLimitsOpen] = useState(false)

  if (isLoading) return <p className="p-6">Loading...</p>
  if (!account) return <p className="p-6">Account not found.</p>

  const handleRename = (newName: string) => {
    updateAccount.mutate({ name: newName })
  }

  const handleChangeLimits = (limits: { daily_limit: number; monthly_limit: number }) => {
    updateAccount.mutate(limits)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Name</span><span>{account.name}</span>
            <span className="text-muted-foreground">Account Number</span><span>{formatAccountNumber(account.account_number)}</span>
            <span className="text-muted-foreground">Owner</span><span>{account.owner_name ?? '—'}</span>
            <span className="text-muted-foreground">Type</span><span>{account.account_type} / {account.subtype}</span>
            <span className="text-muted-foreground">Currency</span><span>{account.currency}</span>
            <span className="text-muted-foreground">Available Balance</span><span className="font-bold">{formatCurrency(account.available_balance, account.currency)}</span>
            <span className="text-muted-foreground">Reserved Funds</span><span>{formatCurrency(account.balance - account.available_balance, account.currency)}</span>
            <span className="text-muted-foreground">Account Balance</span><span>{formatCurrency(account.balance, account.currency)}</span>
            <span className="text-muted-foreground">Daily Limit</span><span>{formatCurrency(account.daily_limit, account.currency)}</span>
            <span className="text-muted-foreground">Monthly Limit</span><span>{formatCurrency(account.monthly_limit, account.currency)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Business accounts show company info */}
      {account.owner_type === 'BUSINESS' && account.company && (
        <BusinessAccountInfo company={account.company} />
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setRenameOpen(true)}>Rename Account</Button>
        <Link to="/payments/new"><Button>New Payment</Button></Link>
        <Button variant="outline" onClick={() => setLimitsOpen(true)}>Change Limits</Button>
      </div>

      <RenameAccountDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        currentName={account.name}
        onRename={handleRename}
      />
      <ChangeLimitsDialog
        open={limitsOpen}
        onOpenChange={setLimitsOpen}
        currentDailyLimit={account.daily_limit}
        currentMonthlyLimit={account.monthly_limit}
        currency={account.currency}
        onSubmit={handleChangeLimits}
      />
    </div>
  )
}
```

- [ ] **Step 3: Run test — verify it passes**

```bash
npm test -- --testPathPattern="AccountDetailsPage.test" --no-coverage
```

---

### Task 4.4: Add routes to App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add client routes**

```typescript
import { HomePage } from '@/pages/HomePage'
import { AccountListPage } from '@/pages/AccountListPage'
import { AccountDetailsPage } from '@/pages/AccountDetailsPage'

// Inside ProtectedRoute > AppLayout, add client routes:
<Route path="/home" element={<ProtectedRoute requiredRole="Client"><HomePage /></ProtectedRoute>} />
<Route path="/accounts" element={<ProtectedRoute requiredRole="Client"><AccountListPage /></ProtectedRoute>} />
<Route path="/accounts/:id" element={<ProtectedRoute requiredRole="Client"><AccountDetailsPage /></ProtectedRoute>} />
```

- [ ] **Step 2: Run all tests and quality checks**

```bash
npm test --no-coverage && npx tsc --noEmit && npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.tsx src/pages/HomePage.test.tsx src/pages/AccountListPage.tsx src/pages/AccountListPage.test.tsx src/pages/AccountDetailsPage.tsx src/pages/AccountDetailsPage.test.tsx src/App.tsx
git commit -m "feat: add client HomePage, AccountListPage, and AccountDetailsPage with routes"
```
