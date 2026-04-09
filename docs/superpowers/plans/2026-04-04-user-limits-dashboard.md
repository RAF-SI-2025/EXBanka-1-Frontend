# User Limits Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show visual spending limit usage (progress bars with color coding) on every account details page for all user types.

**Architecture:** Add `daily_spending` and `monthly_spending` fields to the existing `Account` type, create a `LimitsUsageCard` component with progress bars, and integrate it into `AccountDetailsPage` replacing plain-text limit display.

**Tech Stack:** React, TypeScript, Tailwind CSS, existing Shadcn Card component

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/types/account.ts` | Add `daily_spending`, `monthly_spending` fields |
| Create | `src/components/accounts/LimitsUsageCard.tsx` | Progress bar limit display component |
| Create | `src/components/accounts/LimitsUsageCard.test.tsx` | Unit tests |
| Modify | `src/pages/AccountDetailsPage.tsx` | Replace plain-text limits with `LimitsUsageCard` |

---

### Task 1: Add spending fields to Account type

**Files:**
- Modify: `src/types/account.ts`

- [ ] **Step 1: Add daily_spending and monthly_spending to Account interface**

In `src/types/account.ts`, add after `monthly_limit`:

```typescript
  daily_spending?: number
  monthly_spending?: number
```

The full updated `Account` interface will be:

```typescript
export interface Account {
  id: number
  account_number: string
  account_name: string
  currency_code: string
  account_kind: AccountKind
  account_type: AccountType
  account_category: AccountCategory
  balance: number
  available_balance: number
  status: AccountStatus
  owner_id: number
  owner_name?: string
  daily_limit?: number
  monthly_limit?: number
  daily_spending?: number
  monthly_spending?: number
  company?: Company
  created_at?: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (new optional fields are backward-compatible)

- [ ] **Step 3: Commit**

```bash
git add src/types/account.ts
git commit -m "feat: add daily_spending and monthly_spending to Account type"
```

---

### Task 2: Create LimitsUsageCard component (TDD)

**Files:**
- Create: `src/components/accounts/LimitsUsageCard.test.tsx`
- Create: `src/components/accounts/LimitsUsageCard.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/accounts/LimitsUsageCard.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { LimitsUsageCard } from './LimitsUsageCard'

describe('LimitsUsageCard', () => {
  it('renders daily and monthly progress bars with amounts', () => {
    render(
      <LimitsUsageCard
        dailyLimit={250000}
        monthlyLimit={1000000}
        dailySpending={150000}
        monthlySpending={600000}
        currency="RSD"
      />
    )

    expect(screen.getByText('Spending Limits')).toBeInTheDocument()
    expect(screen.getByText('Daily')).toBeInTheDocument()
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    // Formatted amounts
    expect(screen.getByText(/150,000/)).toBeInTheDocument()
    expect(screen.getByText(/250,000/)).toBeInTheDocument()
    expect(screen.getByText(/600,000/)).toBeInTheDocument()
    expect(screen.getByText(/1,000,000/)).toBeInTheDocument()
    // Percentages
    expect(screen.getByText(/60%/)).toBeInTheDocument()
  })

  it('shows green color when usage is below 70%', () => {
    const { container } = render(
      <LimitsUsageCard
        dailyLimit={100000}
        monthlyLimit={500000}
        dailySpending={50000}
        monthlySpending={200000}
        currency="RSD"
      />
    )

    const progressBars = container.querySelectorAll('[data-testid="progress-fill"]')
    expect(progressBars[0]).toHaveClass('bg-green-500')
    expect(progressBars[1]).toHaveClass('bg-green-500')
  })

  it('shows yellow color when usage is between 70% and 90%', () => {
    const { container } = render(
      <LimitsUsageCard
        dailyLimit={100000}
        monthlyLimit={500000}
        dailySpending={80000}
        monthlySpending={400000}
        currency="RSD"
      />
    )

    const progressBars = container.querySelectorAll('[data-testid="progress-fill"]')
    expect(progressBars[0]).toHaveClass('bg-yellow-500')
    expect(progressBars[1]).toHaveClass('bg-yellow-500')
  })

  it('shows red color when usage is above 90%', () => {
    const { container } = render(
      <LimitsUsageCard
        dailyLimit={100000}
        monthlyLimit={500000}
        dailySpending={95000}
        monthlySpending={460000}
        currency="RSD"
      />
    )

    const progressBars = container.querySelectorAll('[data-testid="progress-fill"]')
    expect(progressBars[0]).toHaveClass('bg-red-500')
    expect(progressBars[1]).toHaveClass('bg-red-500')
  })

  it('shows "No limit configured" when limits are undefined', () => {
    render(
      <LimitsUsageCard
        dailyLimit={undefined}
        monthlyLimit={undefined}
        dailySpending={undefined}
        monthlySpending={undefined}
        currency="RSD"
      />
    )

    expect(screen.getAllByText('No limit configured')).toHaveLength(2)
  })

  it('handles zero limit gracefully', () => {
    render(
      <LimitsUsageCard
        dailyLimit={0}
        monthlyLimit={0}
        dailySpending={0}
        monthlySpending={0}
        currency="RSD"
      />
    )

    expect(screen.getAllByText('No limit configured')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --testPathPattern="LimitsUsageCard" --watchAll=false`
Expected: FAIL — module not found

- [ ] **Step 3: Implement LimitsUsageCard**

Create `src/components/accounts/LimitsUsageCard.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'

interface LimitsUsageCardProps {
  dailyLimit: number | undefined
  monthlyLimit: number | undefined
  dailySpending: number | undefined
  monthlySpending: number | undefined
  currency: string
}

function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

function LimitRow({
  label,
  spent,
  limit,
  currency,
}: {
  label: string
  spent: number | undefined
  limit: number | undefined
  currency: string
}) {
  if (!limit) {
    return (
      <div className="space-y-1">
        <span className="text-sm font-medium">{label}</span>
        <p className="text-sm text-muted-foreground">No limit configured</p>
      </div>
    )
  }

  const spentAmount = spent ?? 0
  const percentage = Math.min(Math.round((spentAmount / limit) * 100), 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {formatCurrency(spentAmount, currency)} / {formatCurrency(limit, currency)} ({percentage}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          data-testid="progress-fill"
          className={`h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function LimitsUsageCard({
  dailyLimit,
  monthlyLimit,
  dailySpending,
  monthlySpending,
  currency,
}: LimitsUsageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Limits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LimitRow label="Daily" spent={dailySpending} limit={dailyLimit} currency={currency} />
        <LimitRow label="Monthly" spent={monthlySpending} limit={monthlyLimit} currency={currency} />
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- --testPathPattern="LimitsUsageCard" --watchAll=false`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/accounts/LimitsUsageCard.tsx src/components/accounts/LimitsUsageCard.test.tsx
git commit -m "feat: add LimitsUsageCard component with progress bars and color coding"
```

---

### Task 3: Integrate LimitsUsageCard into AccountDetailsPage

**Files:**
- Modify: `src/pages/AccountDetailsPage.tsx`

- [ ] **Step 1: Replace plain-text limit display with LimitsUsageCard**

In `src/pages/AccountDetailsPage.tsx`, add the import:

```typescript
import { LimitsUsageCard } from '@/components/accounts/LimitsUsageCard'
```

Then replace the two `InfoRow` blocks for limits (lines 73-84):

```typescript
          {account.daily_limit !== undefined && (
            <InfoRow
              label="Daily Limit"
              value={formatCurrency(account.daily_limit, account.currency_code)}
            />
          )}
          {account.monthly_limit !== undefined && (
            <InfoRow
              label="Monthly Limit"
              value={formatCurrency(account.monthly_limit, account.currency_code)}
            />
          )}
```

Remove those lines from inside the `<CardContent>`.

Then add the `LimitsUsageCard` after the closing `</Card>` of the Details card and before `<BusinessAccountInfo>`:

```typescript
      <LimitsUsageCard
        dailyLimit={account.daily_limit}
        monthlyLimit={account.monthly_limit}
        dailySpending={account.daily_spending}
        monthlySpending={account.monthly_spending}
        currency={account.currency_code}
      />
```

The final order in the JSX should be:
1. Back button + h1
2. AccountCard
3. Details Card (without limit InfoRows)
4. **LimitsUsageCard** (new)
5. BusinessAccountInfo
6. Action buttons
7. Dialogs

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run all tests**

Run: `npm test -- --watchAll=false`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add src/pages/AccountDetailsPage.tsx
git commit -m "feat: integrate LimitsUsageCard into AccountDetailsPage"
```

---

### Task 4: Quality gates

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: Zero violations

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run format check**

Run: `npx prettier --check "src/**/*.{ts,tsx}"`
Expected: All files formatted (run `npx prettier --write "src/**/*.{ts,tsx}"` if not)

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: Success
