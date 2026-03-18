# Missing Features & Component Extraction Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all missing user-facing features (create client, edit recipient, change limits, recent transactions, dashboard widgets) and extract inlined page logic into reusable sub-components as specified in the original plans.

**Architecture:** Three categories of work: (1) genuinely missing features that need new pages/forms, (2) missing sub-components that need to be extracted from existing pages, (3) dead code cleanup. All components follow TDD, use existing Shadcn UI components, TanStack Query hooks, React Hook Form + Zod validation, and the existing `renderWithProviders` test utility.

**Tech Stack:** React 19, TypeScript, Shadcn UI, TanStack Query, React Hook Form + Zod, Redux Toolkit, jsPDF (new dependency for PDF receipts), Jest + RTL

**Depends on:** All existing code in the repository. Reference `docs/missing-features.md` for the full audit.

---

## File Structure

```
src/
  pages/
    CreateClientPage.tsx              # NEW: standalone create-client page
    CreateClientPage.test.tsx
    AdminAccountsPage.tsx             # MODIFY: use extracted components
    AdminAccountCardsPage.tsx         # MODIFY: use AdminCardItem
    AdminClientsPage.tsx              # MODIFY: use extracted components + add "Novi klijent" button
    AdminLoanRequestsPage.tsx         # MODIFY: use LoanRequestCard
    AdminLoansPage.tsx                # MODIFY: use LoanFilters
    LoanListPage.tsx                  # MODIFY: use LoanCard
    LoanDetailsPage.tsx               # MODIFY: use LoanDetails + InstallmentTable
    LoanApplicationPage.tsx           # MODIFY: use LoanApplicationForm
    NewPaymentPage.tsx                # MODIFY: use NewPaymentForm + PaymentConfirmation
    InternalTransferPage.tsx          # MODIFY: use InternalTransferForm + TransferConfirmation
    PaymentHistoryPage.tsx            # MODIFY: use PaymentHistoryTable + PDF download
    PaymentRecipientsPage.tsx         # MODIFY: use RecipientForm + RecipientList + edit support
    AccountDetailsPage.tsx            # MODIFY: use ChangeLimitsDialog + BusinessAccountInfo
    AccountListPage.tsx               # MODIFY: use RecentTransactions
    HomePage.tsx                      # MODIFY: use QuickPayment + ExchangeCalculator
  components/
    accounts/
      ChangeLimitsDialog.tsx          # NEW
      ChangeLimitsDialog.test.tsx
      BusinessAccountInfo.tsx         # NEW
      BusinessAccountInfo.test.tsx
      RecentTransactions.tsx          # NEW
      RecentTransactions.test.tsx
    admin/
      AccountFilters.tsx              # NEW: extracted from AdminAccountsPage
      AccountFilters.test.tsx
      AccountTable.tsx                # NEW: extracted from AdminAccountsPage
      AccountTable.test.tsx
      AdminCardItem.tsx               # NEW: extracted from AdminAccountCardsPage
      AdminCardItem.test.tsx
      ClientFilters.tsx               # NEW: extracted from AdminClientsPage
      ClientFilters.test.tsx
      ClientTable.tsx                 # NEW: extracted from AdminClientsPage
      ClientTable.test.tsx
      EditClientForm.tsx              # NEW: extracted from EditClientPage
      EditClientForm.test.tsx
    home/
      QuickPayment.tsx                # NEW
      QuickPayment.test.tsx
      ExchangeCalculator.tsx          # NEW
      ExchangeCalculator.test.tsx
    loans/
      LoanCard.tsx                    # NEW: extracted from LoanListPage
      LoanCard.test.tsx
      LoanDetails.tsx                 # NEW: extracted from LoanDetailsPage
      LoanDetails.test.tsx
      InstallmentTable.tsx            # NEW: extracted from LoanDetailsPage
      InstallmentTable.test.tsx
      LoanApplicationForm.tsx         # NEW: extracted from LoanApplicationPage
      LoanApplicationForm.test.tsx
      LoanRequestCard.tsx             # NEW: extracted from AdminLoanRequestsPage
      LoanRequestCard.test.tsx
      LoanFilters.tsx                 # NEW: extracted from AdminLoansPage
      LoanFilters.test.tsx
    payments/
      NewPaymentForm.tsx              # NEW: extracted from NewPaymentPage
      NewPaymentForm.test.tsx
      PaymentConfirmation.tsx         # NEW: extracted from NewPaymentPage
      PaymentConfirmation.test.tsx
      InternalTransferForm.tsx        # NEW: extracted from InternalTransferPage
      InternalTransferForm.test.tsx
      TransferConfirmation.tsx        # NEW: extracted from InternalTransferPage
      TransferConfirmation.test.tsx
      RecipientForm.tsx               # NEW: extracted from PaymentRecipientsPage
      RecipientForm.test.tsx
      RecipientList.tsx               # NEW: extracted from PaymentRecipientsPage
      RecipientList.test.tsx
      PaymentHistoryTable.tsx         # NEW: extracted from PaymentHistoryPage
      PaymentHistoryTable.test.tsx
  lib/
    utils/
      receipt-pdf.ts                  # NEW: PDF receipt generation
      receipt-pdf.test.ts
      validation.ts                   # MODIFY: add createClientSchema
  hooks/
    useLoans.ts                       # MODIFY: remove dead useCreateLoanRequest
  App.tsx                             # MODIFY: add /admin/clients/new route
```

**Note on admin hooks:** The original plans specified `useAdminAccounts`, `useAdminClients`, and `useAdminLoans` as separate hooks. These are intentionally omitted because `useAllAccounts`, `useAllClients`, and `useAllLoans` already serve the same purpose. Creating wrapper hooks would add indirection without benefit.

---

## Chunk 1: Missing Features (High Priority)

### Task 1.1: Create Client Page

**Files:**
- Modify: `src/lib/utils/validation.ts` — add `createClientSchema`
- Create: `src/pages/CreateClientPage.tsx`
- Create: `src/pages/CreateClientPage.test.tsx`
- Modify: `src/App.tsx` — add `/admin/clients/new` route
- Modify: `src/pages/AdminClientsPage.tsx` — add "Novi klijent" button
- Modify: `src/components/accounts/CreateAccountForm.tsx` — wire `onCreateNew` prop

- [ ] **Step 1: Add `createClientSchema` to validation.ts**

```typescript
// Add to src/lib/utils/validation.ts
export const createClientSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(20, 'First name must be at most 20 characters'),
  last_name: z.string().min(1, 'Last name is required').max(20, 'Last name must be at most 20 characters'),
  date_of_birth: z.number({ required_error: 'Date of birth is required' }),
  email: emailSchema,
  gender: z.string().optional(),
  phone: z.string().max(15, 'Phone number must be at most 15 digits').optional(),
  address: z.string().optional(),
  jmbg: z.string().regex(/^\d{13}$/, 'JMBG must be exactly 13 digits').optional().or(z.literal('')),
})
```

- [ ] **Step 2: Write failing test for CreateClientPage**

```typescript
// src/pages/CreateClientPage.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { CreateClientPage } from '@/pages/CreateClientPage'

jest.mock('@/lib/api/clients')

describe('CreateClientPage', () => {
  it('renders form title and required fields', () => {
    renderWithProviders(<CreateClientPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/novi klijent/i)
    expect(screen.getByLabelText('Ime')).toBeInTheDocument()
    expect(screen.getByLabelText('Prezime')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderWithProviders(<CreateClientPage />)
    expect(screen.getByRole('button', { name: /nazad/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test — verify it fails**

Run: `npm test -- CreateClientPage.test`
Expected: FAIL — module not found

- [ ] **Step 4: Implement CreateClientPage**

```typescript
// src/pages/CreateClientPage.tsx
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateClient } from '@/hooks/useClients'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientSchema } from '@/lib/utils/validation'
import type { z } from 'zod'

type FormValues = z.infer<typeof createClientSchema>

export function CreateClientPage() {
  const navigate = useNavigate()
  const createClient = useCreateClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(createClientSchema),
  })

  const onSubmit = (data: FormValues) => {
    createClient.mutate(data, { onSuccess: () => navigate('/admin/clients') })
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>← Nazad</Button>
        <h1 className="text-2xl font-bold">Novi klijent</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Podaci o klijentu</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Ime</Label>
                <Input id="first_name" {...register('first_name')} />
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="last_name">Prezime</Label>
                <Input id="last_name" {...register('last_name')} />
                {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="date_of_birth">Datum rođenja (Unix timestamp)</Label>
              <Input id="date_of_birth" type="number" {...register('date_of_birth', { valueAsNumber: true })} />
              {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>}
            </div>

            <div>
              <Label htmlFor="jmbg">JMBG (opciono)</Label>
              <Input id="jmbg" {...register('jmbg')} placeholder="1234567890123" />
              {errors.jmbg && <p className="text-sm text-destructive">{errors.jmbg.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Telefon (opciono)</Label>
              <Input id="phone" {...register('phone')} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="address">Adresa (opciono)</Label>
              <Input id="address" {...register('address')} />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={() => navigate('/admin/clients')}>Otkaži</Button>
              <Button type="submit" disabled={createClient.isPending}>
                {createClient.isPending ? 'Kreiranje...' : 'Kreiraj klijenta'}
              </Button>
            </div>

            {createClient.isError && (
              <p className="text-sm text-destructive">Greška pri kreiranju klijenta. Pokušajte ponovo.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: Run test — verify it passes**

Run: `npm test -- CreateClientPage.test`
Expected: PASS

- [ ] **Step 6: Add route and wire navigation**

In `src/App.tsx`, inside the employee protected routes section, add:

```tsx
<Route
  path="/admin/clients/new"
  element={
    <ProtectedRoute requiredRole="Employee">
      <CreateClientPage />
    </ProtectedRoute>
  }
/>
```

Import `CreateClientPage` at the top.

In `src/pages/AdminClientsPage.tsx`, add a "Novi klijent" button next to the heading:

```tsx
<div className="flex justify-between items-center">
  <h1 className="text-2xl font-bold">Upravljanje klijentima</h1>
  <Button onClick={() => navigate('/admin/clients/new')}>Novi klijent</Button>
</div>
```

In `src/components/accounts/CreateAccountForm.tsx`, wire the `onCreateNew` prop:

```tsx
<ClientSelector
  onClientSelected={handleClientSelected}
  selectedClient={selectedClient}
  onCreateNew={() => window.open('/admin/clients/new', '_blank')}
/>
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/utils/validation.ts src/pages/CreateClientPage.tsx src/pages/CreateClientPage.test.tsx src/App.tsx src/pages/AdminClientsPage.tsx src/components/accounts/CreateAccountForm.tsx
git commit -m "feat: add CreateClientPage with route, wire onCreateNew in ClientSelector"
```

---

### Task 1.2: Edit Payment Recipient

**Files:**
- Modify: `src/pages/PaymentRecipientsPage.tsx` — add edit button and form pre-fill

- [ ] **Step 1: Write failing test**

```typescript
// Add to existing src/pages/PaymentRecipientsPage.test.tsx
it('renders edit button for each recipient', () => {
  jest.mocked(usePaymentsHook.usePaymentRecipients).mockReturnValue({
    data: [createMockPaymentRecipient()],
    isLoading: false,
  } as any)
  renderWithProviders(<PaymentRecipientsPage />)
  expect(screen.getByRole('button', { name: /izmeni/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test — verify it fails**

Run: `npm test -- PaymentRecipientsPage.test`
Expected: FAIL — no "Izmeni" button found

- [ ] **Step 3: Add edit support to PaymentRecipientsPage**

Modify `src/pages/PaymentRecipientsPage.tsx`:
- Import `useUpdatePaymentRecipient` from `@/hooks/usePayments`
- Add `editingId` state: `const [editingId, setEditingId] = useState<number | null>(null)`
- When editing, pre-fill form with existing recipient data
- Add "Izmeni" button in table rows
- When save is clicked on an edit, call `useUpdatePaymentRecipient` instead of create
- Reset `editingId` to `null` on success

The table cell for each recipient should include:

```tsx
<Button size="sm" variant="outline" onClick={() => {
  setEditingId(r.id)
  setShowForm(true)
  reset({ name: r.name, account_number: r.account_number, reference: r.reference ?? '', payment_code: r.payment_code ?? '' })
}}>
  Izmeni
</Button>
```

First, the `useUpdatePaymentRecipient` hook takes `id` at init time but `editingId` is dynamic. To avoid violating React's rules of hooks, modify `src/hooks/usePayments.ts` so `useUpdatePaymentRecipient` takes `id` inside `mutationFn` instead:

```typescript
// Modify in src/hooks/usePayments.ts
export function useUpdatePaymentRecipient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Partial<CreatePaymentRecipientRequest>) =>
      updatePaymentRecipient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-recipients'] })
    },
  })
}
```

Then the form submit handler branches:

```typescript
const updateRecipient = useUpdatePaymentRecipient()

const onSubmit = (data: FormValues) => {
  if (editingId) {
    updateRecipient.mutate({ id: editingId, ...data }, {
      onSuccess: () => { reset(); setShowForm(false); setEditingId(null) },
    })
  } else {
    createRecipient.mutate(data, {
      onSuccess: () => { reset(); setShowForm(false) },
    })
  }
}
```

The form title should change: `editingId ? 'Izmeni primaoca' : 'Novi primalac'`

- [ ] **Step 4: Run test — verify it passes**

Run: `npm test -- PaymentRecipientsPage.test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/PaymentRecipientsPage.tsx src/pages/PaymentRecipientsPage.test.tsx
git commit -m "feat: add edit recipient support to PaymentRecipientsPage"
```

---

### Task 1.3: Dead Code Cleanup

**Files:**
- Modify: `src/hooks/useLoans.ts` — remove unused `useCreateLoanRequest`

- [ ] **Step 1: Remove `useCreateLoanRequest` from useLoans.ts**

Delete the `useCreateLoanRequest` function (lines 28-36). The `createLoanRequest` import from `@/lib/api/loans` is still used by `loanSlice.ts`, so keep the API function.

- [ ] **Step 2: Verify no imports broke**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLoans.ts
git commit -m "chore: remove unused useCreateLoanRequest hook"
```

---

## Chunk 2: Client Dashboard Missing Components

### Task 2.1: RecentTransactions component

**Files:**
- Create: `src/components/accounts/RecentTransactions.tsx`
- Create: `src/components/accounts/RecentTransactions.test.tsx`
- Modify: `src/pages/AccountListPage.tsx` — integrate component

- [ ] **Step 1: Write failing test**

```typescript
// src/components/accounts/RecentTransactions.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { RecentTransactions } from '@/components/accounts/RecentTransactions'
import { createMockPayment } from '@/__tests__/fixtures/payment-fixtures'

describe('RecentTransactions', () => {
  it('renders transactions in a table', () => {
    const payments = [createMockPayment(), createMockPayment({ id: 2, receiver_name: 'Firma DOO' })]
    renderWithProviders(<RecentTransactions transactions={payments} />)
    expect(screen.getByText('Elektro Beograd')).toBeInTheDocument()
    expect(screen.getByText('Firma DOO')).toBeInTheDocument()
  })

  it('shows empty state when no transactions', () => {
    renderWithProviders(<RecentTransactions transactions={[]} />)
    expect(screen.getByText(/nema transakcija/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run: `npm test -- RecentTransactions.test`
Expected: FAIL

- [ ] **Step 3: Implement RecentTransactions**

```typescript
// src/components/accounts/RecentTransactions.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { Payment } from '@/types/payment'

const STATUS_LABELS: Record<string, string> = {
  REALIZED: 'Realizovano', REJECTED: 'Odbijeno', PROCESSING: 'U obradi',
}
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  REALIZED: 'default', REJECTED: 'destructive', PROCESSING: 'secondary',
}

interface RecentTransactionsProps {
  transactions: Payment[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Nema transakcija.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Primalac</TableHead>
          <TableHead className="text-right">Iznos</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="text-sm">{formatDate(tx.timestamp)}</TableCell>
            <TableCell className="text-sm">{tx.receiver_name}</TableCell>
            <TableCell className="text-sm text-right">{formatCurrency(tx.amount, tx.currency)}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[tx.status] ?? 'secondary'}>
                {STATUS_LABELS[tx.status] ?? tx.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

Run: `npm test -- RecentTransactions.test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/accounts/RecentTransactions.tsx src/components/accounts/RecentTransactions.test.tsx
git commit -m "feat: add RecentTransactions component"
```

---

### Task 2.2: ChangeLimitsDialog component

**Files:**
- Create: `src/components/accounts/ChangeLimitsDialog.tsx`
- Create: `src/components/accounts/ChangeLimitsDialog.test.tsx`
- Modify: `src/pages/AccountDetailsPage.tsx` — add change limits button and dialog

- [ ] **Step 1: Write failing test**

```typescript
// src/components/accounts/ChangeLimitsDialog.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ChangeLimitsDialog } from '@/components/accounts/ChangeLimitsDialog'

describe('ChangeLimitsDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    currentDailyLimit: 250000,
    currentMonthlyLimit: 1000000,
    currency: 'RSD',
    onSubmit: jest.fn(),
    loading: false,
  }

  it('renders limit inputs', () => {
    renderWithProviders(<ChangeLimitsDialog {...defaultProps} />)
    expect(screen.getByLabelText(/dnevni limit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mesečni limit/i)).toBeInTheDocument()
  })

  it('calls onSubmit with new limits', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ChangeLimitsDialog {...defaultProps} />)
    const dailyInput = screen.getByLabelText(/dnevni limit/i)
    const monthlyInput = screen.getByLabelText(/mesečni limit/i)
    await user.clear(dailyInput)
    await user.type(dailyInput, '300000')
    await user.clear(monthlyInput)
    await user.type(monthlyInput, '1200000')
    await user.click(screen.getByRole('button', { name: /sačuvaj/i }))
    expect(defaultProps.onSubmit).toHaveBeenCalledWith({ daily_limit: 300000, monthly_limit: 1200000 })
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

Run: `npm test -- ChangeLimitsDialog.test`

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
  loading: boolean
}

export function ChangeLimitsDialog({
  open, onOpenChange, currentDailyLimit, currentMonthlyLimit, currency, onSubmit, loading,
}: ChangeLimitsDialogProps) {
  const [dailyLimit, setDailyLimit] = useState(currentDailyLimit)
  const [monthlyLimit, setMonthlyLimit] = useState(currentMonthlyLimit)

  const hasChanged = dailyLimit !== currentDailyLimit || monthlyLimit !== currentMonthlyLimit
  const isValid = hasChanged && dailyLimit > 0 && monthlyLimit > 0 && dailyLimit <= monthlyLimit

  const handleSubmit = () => {
    if (isValid) {
      onSubmit({ daily_limit: dailyLimit, monthly_limit: monthlyLimit })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Promena limita</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Trenutno: {formatCurrency(currentDailyLimit, currency)} / dan, {formatCurrency(currentMonthlyLimit, currency)} / mesec
          </p>
          <div>
            <Label htmlFor="daily-limit">Dnevni limit</Label>
            <Input id="daily-limit" type="number" value={dailyLimit} onChange={(e) => setDailyLimit(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="monthly-limit">Mesečni limit</Label>
            <Input id="monthly-limit" type="number" value={monthlyLimit} onChange={(e) => setMonthlyLimit(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Otkaži</Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading ? 'Čuvanje...' : 'Sačuvaj'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

Run: `npm test -- ChangeLimitsDialog.test`

- [ ] **Step 5: Integrate into AccountDetailsPage**

In `src/pages/AccountDetailsPage.tsx`:
- Import `ChangeLimitsDialog`
- Add state: `const [limitsOpen, setLimitsOpen] = useState(false)`
- Add button: `<Button variant="outline" onClick={() => setLimitsOpen(true)}>Promeni limite</Button>`
- Add handler: `const handleLimitsChange = (limits) => { updateAccount.mutate(limits, { onSuccess: () => setLimitsOpen(false) }) }`
- Add dialog at the end of the JSX

- [ ] **Step 6: Commit**

```bash
git add src/components/accounts/ChangeLimitsDialog.tsx src/components/accounts/ChangeLimitsDialog.test.tsx src/pages/AccountDetailsPage.tsx
git commit -m "feat: add ChangeLimitsDialog component and integrate into AccountDetailsPage"
```

---

### Task 2.3: BusinessAccountInfo component

**Files:**
- Create: `src/components/accounts/BusinessAccountInfo.tsx`
- Create: `src/components/accounts/BusinessAccountInfo.test.tsx`
- Modify: `src/pages/AccountDetailsPage.tsx` — replace inline company info

- [ ] **Step 1: Write failing test**

```typescript
// src/components/accounts/BusinessAccountInfo.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { BusinessAccountInfo } from '@/components/accounts/BusinessAccountInfo'

describe('BusinessAccountInfo', () => {
  const company = {
    name: 'Firma DOO',
    registration_number: '12345678',
    tax_number: '123456789',
    activity_code: '62.01',
    address: 'Bulevar Kralja Aleksandra 1',
  }

  it('renders company details', () => {
    renderWithProviders(<BusinessAccountInfo company={company} />)
    expect(screen.getByText('Firma DOO')).toBeInTheDocument()
    expect(screen.getByText('12345678')).toBeInTheDocument()
    expect(screen.getByText('123456789')).toBeInTheDocument()
  })

  it('renders nothing when company is undefined', () => {
    renderWithProviders(<BusinessAccountInfo company={undefined} />)
    expect(screen.queryByText(/podaci o firmi/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

- [ ] **Step 3: Implement BusinessAccountInfo**

```typescript
// src/components/accounts/BusinessAccountInfo.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Company } from '@/types/account'

interface BusinessAccountInfoProps {
  company?: Company
}

export function BusinessAccountInfo({ company }: BusinessAccountInfoProps) {
  if (!company) return null

  return (
    <Card>
      <CardHeader><CardTitle>Podaci o firmi</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Naziv</span><span>{company.name}</span>
          <span className="text-muted-foreground">Matični broj</span><span>{company.registration_number}</span>
          <span className="text-muted-foreground">PIB</span><span>{company.tax_number}</span>
          <span className="text-muted-foreground">Šifra delatnosti</span><span>{company.activity_code}</span>
          <span className="text-muted-foreground">Adresa</span><span>{company.address}</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

- [ ] **Step 5: Integrate into AccountDetailsPage**

In `src/pages/AccountDetailsPage.tsx`, replace the inline company `InfoRow` calls:

```tsx
{account.company && <BusinessAccountInfo company={account.company} />}
```

Remove the inline `<InfoRow label="Firma" .../>` and `<InfoRow label="PIB" .../>` lines.

- [ ] **Step 6: Commit**

```bash
git add src/components/accounts/BusinessAccountInfo.tsx src/components/accounts/BusinessAccountInfo.test.tsx src/pages/AccountDetailsPage.tsx
git commit -m "feat: add BusinessAccountInfo component and integrate into AccountDetailsPage"
```

---

### Task 2.4: QuickPayment component

**Files:**
- Create: `src/components/home/QuickPayment.tsx`
- Create: `src/components/home/QuickPayment.test.tsx`
- Modify: `src/pages/HomePage.tsx` — replace static buttons with component

- [ ] **Step 1: Write failing test**

```typescript
// src/components/home/QuickPayment.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { QuickPayment } from '@/components/home/QuickPayment'
import * as paymentsApi from '@/lib/api/payments'

jest.mock('@/lib/api/payments')

describe('QuickPayment', () => {
  it('renders section title', () => {
    jest.mocked(paymentsApi.getPaymentRecipients).mockResolvedValue([])
    renderWithProviders(<QuickPayment />)
    expect(screen.getByText(/sačuvani primaoci/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

- [ ] **Step 3: Implement QuickPayment**

```typescript
// src/components/home/QuickPayment.tsx
import { Link } from 'react-router-dom'
import { usePaymentRecipients } from '@/hooks/usePayments'

export function QuickPayment() {
  const { data: recipients = [] } = usePaymentRecipients()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Sačuvani primaoci</h3>
        <Link to="/payments/recipients" className="text-sm text-primary hover:underline">Upravljaj</Link>
      </div>
      {recipients.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nema sačuvanih primalaca.</p>
      ) : (
        <ul className="divide-y">
          {recipients.slice(0, 5).map((r) => (
            <li key={r.id} className="py-2 flex justify-between text-sm">
              <span>{r.name}</span>
              <Link to={`/payments/new?recipient=${r.id}`} className="text-primary hover:underline">Uplati</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

- [ ] **Step 5: Commit**

```bash
git add src/components/home/QuickPayment.tsx src/components/home/QuickPayment.test.tsx
git commit -m "feat: add QuickPayment home widget"
```

---

### Task 2.5: ExchangeCalculator home widget

**Files:**
- Create: `src/components/home/ExchangeCalculator.tsx`
- Create: `src/components/home/ExchangeCalculator.test.tsx`
- Modify: `src/pages/HomePage.tsx` — replace static exchange links with widget

- [ ] **Step 1: Write failing test**

```typescript
// src/components/home/ExchangeCalculator.test.tsx
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { ExchangeCalculator } from '@/components/home/ExchangeCalculator'

jest.mock('@/lib/api/exchange')

describe('ExchangeCalculator', () => {
  it('renders amount input and currency selectors', () => {
    renderWithProviders(<ExchangeCalculator />)
    expect(screen.getByLabelText(/iznos/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

- [ ] **Step 3: Implement ExchangeCalculator**

```typescript
// src/components/home/ExchangeCalculator.tsx
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useConvertCurrency } from '@/hooks/useExchange'
import { SUPPORTED_CURRENCIES } from '@/lib/constants/banking'
import { formatCurrency } from '@/lib/utils/format'

export function ExchangeCalculator() {
  const [amount, setAmount] = useState(0)
  const [fromCurrency, setFromCurrency] = useState('RSD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [triggered, setTriggered] = useState(false)
  const convert = useConvertCurrency()

  const handleConvert = () => {
    if (amount > 0) {
      convert.mutate({ from_currency: fromCurrency, to_currency: toCurrency, amount })
      setTriggered(true)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Brza konverzija</h3>
      <div>
        <Label htmlFor="calc-amount">Iznos</Label>
        <Input id="calc-amount" type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Iz</Label>
          <Select value={fromCurrency} onValueChange={(v) => setFromCurrency(v ?? 'RSD')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>U</Label>
          <Select value={toCurrency} onValueChange={(v) => setToCurrency(v ?? 'EUR')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleConvert} className="w-full" disabled={amount <= 0 || convert.isPending}>
        {convert.isPending ? 'Izračunavanje...' : 'Izračunaj'}
      </Button>
      {triggered && convert.data && (
        <p className="text-lg font-bold text-center">
          {formatCurrency(convert.data.to_amount, toCurrency)}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test — verify it passes**

- [ ] **Step 5: Integrate QuickPayment and ExchangeCalculator into HomePage**

In `src/pages/HomePage.tsx`, replace the static "Brze akcije" and "Menjačnica" cards with:

```tsx
import { QuickPayment } from '@/components/home/QuickPayment'
import { ExchangeCalculator } from '@/components/home/ExchangeCalculator'

// Replace the two static cards:
<Card>
  <CardHeader><CardTitle className="text-sm">Brze akcije</CardTitle></CardHeader>
  <CardContent>
    <QuickPayment />
  </CardContent>
</Card>

<Card>
  <CardHeader><CardTitle className="text-sm">Menjačnica</CardTitle></CardHeader>
  <CardContent>
    <ExchangeCalculator />
  </CardContent>
</Card>
```

- [ ] **Step 6: Commit**

```bash
git add src/components/home/ExchangeCalculator.tsx src/components/home/ExchangeCalculator.test.tsx src/pages/HomePage.tsx
git commit -m "feat: add ExchangeCalculator home widget, integrate both widgets into HomePage"
```

---

## Chunk 3: Admin Component Extraction

### Task 3.1: AccountFilters + AccountTable

**Files:**
- Create: `src/components/admin/AccountFilters.tsx` + test
- Create: `src/components/admin/AccountTable.tsx` + test
- Modify: `src/pages/AdminAccountsPage.tsx` — use extracted components

- [ ] **Step 1: Write failing tests for both components**

AccountFilters test: renders two inputs, calls `onFilterChange` on input. AccountTable test: renders account rows, calls `onViewCards` on button click.

- [ ] **Step 2: Extract AccountFilters from AdminAccountsPage**

Extract the filter inputs (`<Input placeholder="Ime vlasnika..." .../>` and `<Input placeholder="Broj računa..." .../>`) into `AccountFilters` component with props:

```typescript
interface AccountFiltersProps {
  ownerName: string
  onOwnerNameChange: (value: string) => void
  accountNumber: string
  onAccountNumberChange: (value: string) => void
}
```

- [ ] **Step 3: Extract AccountTable from AdminAccountsPage**

Extract the `<Table>` section into `AccountTable` component with props:

```typescript
interface AccountTableProps {
  accounts: Account[]
  onViewCards: (accountId: number) => void
}
```

- [ ] **Step 4: Refactor AdminAccountsPage to use both components**

The page becomes ~25 lines: state + hooks + render with `<AccountFilters>` and `<AccountTable>`.

- [ ] **Step 5: Run all tests — verify nothing broke**

Run: `npm test -- AdminAccountsPage.test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/AccountFilters.tsx src/components/admin/AccountFilters.test.tsx src/components/admin/AccountTable.tsx src/components/admin/AccountTable.test.tsx src/pages/AdminAccountsPage.tsx
git commit -m "refactor: extract AccountFilters and AccountTable from AdminAccountsPage"
```

---

### Task 3.2: AdminCardItem

**Files:**
- Create: `src/components/admin/AdminCardItem.tsx` + test
- Modify: `src/pages/AdminAccountCardsPage.tsx` — use extracted component

- [ ] **Step 1: Write failing test**

Test: renders masked card number, shows correct action buttons based on status (ACTIVE: Blokiraj, BLOCKED: Odblokiraj + Deaktiviraj, DEACTIVATED: no buttons).

- [ ] **Step 2: Extract card rendering from AdminAccountCardsPage**

Move the `<Card>` with card details + action buttons into `AdminCardItem`:

```typescript
interface AdminCardItemProps {
  card: Card
  onBlock: (id: number) => void
  onUnblock: (id: number) => void
  onDeactivate: (id: number) => void
}
```

- [ ] **Step 3: Refactor AdminAccountCardsPage**

Replace inline card rendering with `<AdminCardItem>` mapping.

- [ ] **Step 4: Run tests, commit**

```bash
git add src/components/admin/AdminCardItem.tsx src/components/admin/AdminCardItem.test.tsx src/pages/AdminAccountCardsPage.tsx
git commit -m "refactor: extract AdminCardItem from AdminAccountCardsPage"
```

---

### Task 3.3: ClientFilters + ClientTable + EditClientForm

**Files:**
- Create: `src/components/admin/ClientFilters.tsx` + test
- Create: `src/components/admin/ClientTable.tsx` + test
- Create: `src/components/admin/EditClientForm.tsx` + test
- Modify: `src/pages/AdminClientsPage.tsx` — use extracted components
- Modify: `src/pages/EditClientPage.tsx` — use EditClientForm

Same pattern as Task 3.1: extract filters, table, and form. EditClientForm takes `client`, `onSubmit`, `submitting` props.

- [ ] **Step 1: Write failing tests for all three**
- [ ] **Step 2: Implement components by extracting from pages**
- [ ] **Step 3: Refactor pages to use components**
- [ ] **Step 4: Run tests, commit**

```bash
git add src/components/admin/ClientFilters.tsx src/components/admin/ClientFilters.test.tsx src/components/admin/ClientTable.tsx src/components/admin/ClientTable.test.tsx src/components/admin/EditClientForm.tsx src/components/admin/EditClientForm.test.tsx src/pages/AdminClientsPage.tsx src/pages/EditClientPage.tsx
git commit -m "refactor: extract ClientFilters, ClientTable, EditClientForm from admin pages"
```

---

## Chunk 4: Loan Component Extraction

### Task 4.1: LoanCard

- Create: `src/components/loans/LoanCard.tsx` + test
- Modify: `src/pages/LoanListPage.tsx`

Extract the `<Card>` rendering for each loan into `LoanCard`:

```typescript
interface LoanCardProps {
  loan: Loan
  onClick: () => void
}
```

---

### Task 4.2: LoanDetails + InstallmentTable

- Create: `src/components/loans/LoanDetails.tsx` + test
- Create: `src/components/loans/InstallmentTable.tsx` + test
- Modify: `src/pages/LoanDetailsPage.tsx`

Extract the loan info card into `LoanDetails` and the installment table into `InstallmentTable`:

```typescript
interface LoanDetailsProps { loan: Loan }
interface InstallmentTableProps { installments: LoanInstallment[] }
```

---

### Task 4.3: LoanApplicationForm

- Create: `src/components/loans/LoanApplicationForm.tsx` + test
- Modify: `src/pages/LoanApplicationPage.tsx`

Extract the form (but NOT the Redux step logic) into `LoanApplicationForm`:

```typescript
interface LoanApplicationFormProps {
  accounts: Account[]
  onSubmit: (data: CreateLoanRequest) => void
  submitting: boolean
  error: string | null
}
```

---

### Task 4.4: LoanRequestCard + LoanFilters

- Create: `src/components/loans/LoanRequestCard.tsx` + test
- Create: `src/components/loans/LoanFilters.tsx` + test
- Modify: `src/pages/AdminLoanRequestsPage.tsx`
- Modify: `src/pages/AdminLoansPage.tsx`

`LoanRequestCard` props: `request`, `onApprove`, `onReject`, `approving`, `rejecting`
`LoanFilters` props: `accountNumber`, `onAccountNumberChange`

- [ ] **Commit all loan extractions:**

```bash
git add src/components/loans/ src/pages/LoanListPage.tsx src/pages/LoanDetailsPage.tsx src/pages/LoanApplicationPage.tsx src/pages/AdminLoanRequestsPage.tsx src/pages/AdminLoansPage.tsx
git commit -m "refactor: extract loan sub-components from pages"
```

---

## Chunk 5: Payment Component Extraction

### Task 5.1: NewPaymentForm + PaymentConfirmation

- Create: `src/components/payments/NewPaymentForm.tsx` + test
- Create: `src/components/payments/PaymentConfirmation.tsx` + test
- Modify: `src/pages/NewPaymentPage.tsx`

Extract the form section and the confirmation section. The page keeps Redux step orchestration.

`NewPaymentForm` props: `accounts`, `recipients`, `onSubmit`, `errors` from react-hook-form
`PaymentConfirmation` props: `data` (the form values), `onConfirm`, `onBack`, `submitting`, `error`

---

### Task 5.2: InternalTransferForm + TransferConfirmation

- Create: `src/components/payments/InternalTransferForm.tsx` + test
- Create: `src/components/payments/TransferConfirmation.tsx` + test
- Modify: `src/pages/InternalTransferPage.tsx`

Same pattern as 5.1 but for internal transfers.

---

### Task 5.3: RecipientForm + RecipientList

- Create: `src/components/payments/RecipientForm.tsx` + test
- Create: `src/components/payments/RecipientList.tsx` + test
- Modify: `src/pages/PaymentRecipientsPage.tsx`

`RecipientForm` props: `onSubmit`, `submitting`, `defaultValues?` (for edit), `title`
`RecipientList` props: `recipients`, `onEdit`, `onDelete`

---

### Task 5.4: PaymentFilters + PaymentHistoryTable

- Create: `src/components/payments/PaymentFilters.tsx` + test
- Create: `src/components/payments/PaymentHistoryTable.tsx` + test
- Modify: `src/pages/PaymentHistoryPage.tsx`

Extract `PaymentFilters` for date/status filtering:

```typescript
interface PaymentFiltersProps {
  filters: PaymentFilters
  onFilterChange: (filters: PaymentFilters) => void
}
```

Extract the table from `PaymentHistoryPage`:

```typescript
interface PaymentHistoryTableProps {
  payments: Payment[]
}
```

---

### Task 5.5: PDF Receipt Utility

**Files:**
- Create: `src/lib/utils/receipt-pdf.ts`
- Create: `src/lib/utils/receipt-pdf.test.ts`
- Modify: `src/pages/PaymentHistoryPage.tsx` — add download button

- [ ] **Step 1: Install jsPDF**

```bash
npm install jspdf
```

- [ ] **Step 2: Write test for generateReceiptPdf**

```typescript
// src/lib/utils/receipt-pdf.test.ts
import { createMockPayment } from '@/__tests__/fixtures/payment-fixtures'

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
    internal: { pageSize: { getWidth: () => 210 } },
  }))
})

import { generateReceiptPdf } from '@/lib/utils/receipt-pdf'

describe('generateReceiptPdf', () => {
  it('calls jsPDF save with correct filename', () => {
    const payment = createMockPayment({ order_number: '123' })
    generateReceiptPdf(payment)
    const jsPDF = require('jspdf')
    const instance = jsPDF.mock.results[0].value
    expect(instance.save).toHaveBeenCalledWith('receipt-123.pdf')
  })
})
```

- [ ] **Step 3: Implement generateReceiptPdf**

```typescript
// src/lib/utils/receipt-pdf.ts
import jsPDF from 'jspdf'
import { formatCurrency, formatDate, formatAccountNumber } from '@/lib/utils/format'
import type { Payment } from '@/types/payment'

export function generateReceiptPdf(payment: Payment): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(18)
  doc.text('Potvrda o plaćanju', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(11)
  let y = 40
  const lines: [string, string][] = [
    ['Broj naloga:', payment.order_number],
    ['Sa računa:', formatAccountNumber(payment.from_account)],
    ['Na račun:', formatAccountNumber(payment.to_account)],
    ['Primalac:', payment.receiver_name],
    ['Iznos:', formatCurrency(payment.amount, payment.currency)],
    ['Šifra plaćanja:', payment.payment_code],
    ['Status:', payment.status],
    ['Datum:', formatDate(payment.timestamp)],
  ]

  for (const [label, value] of lines) {
    doc.text(label, 20, y)
    doc.text(value, 80, y)
    y += 10
  }

  doc.save(`receipt-${payment.order_number}.pdf`)
}
```

- [ ] **Step 4: Add download button to PaymentHistoryPage**

In each table row, add:

```tsx
<TableCell>
  <Button size="sm" variant="ghost" onClick={() => generateReceiptPdf(p)}>PDF</Button>
</TableCell>
```

- [ ] **Step 5: Commit all payment extractions**

```bash
git add src/components/payments/ src/lib/utils/receipt-pdf.ts src/lib/utils/receipt-pdf.test.ts src/pages/NewPaymentPage.tsx src/pages/InternalTransferPage.tsx src/pages/PaymentHistoryPage.tsx src/pages/PaymentRecipientsPage.tsx
git commit -m "refactor: extract payment sub-components and add PDF receipt download"
```

---

## Chunk 6: Final Integration & Verification

### Task 6.1: Integration of RecentTransactions into pages

- Modify: `src/pages/AccountListPage.tsx` — show recent transactions per selected account
- Modify: `src/pages/HomePage.tsx` — show recent transactions below accounts

Both pages need to fetch payments for the selected account using `usePayments({ account_number: ... })` and pass them to `<RecentTransactions>`.

- [ ] **Step 1: Update AccountListPage**
- [ ] **Step 2: Update HomePage**
- [ ] **Step 3: Commit**

---

### Task 6.2: Full Quality Gate

- [ ] **Step 1: Run all tests**

```bash
npm test -- --passWithNoTests
```
Expected: All pass

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Lint**

```bash
npm run lint
```
Expected: 0 errors

- [ ] **Step 4: Build**

```bash
npm run build
```
Expected: Success

- [ ] **Step 5: Final commit if any fixups needed**
