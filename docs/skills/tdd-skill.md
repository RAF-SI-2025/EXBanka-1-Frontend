# TDD Skill — Frontend

Quick reference for test-driven development in React + TypeScript. For full patterns, see [Testing Strategy](/docs/testing/strategy.md).

---

## The TDD Cycle

```
1. RED    → Write a failing test
2. GREEN  → Write minimum code to pass
3. REFACTOR → Clean up, enforce architecture rules
```

---

## Step 1: RED — Write the Failing Test First

```typescript
// components/account/AccountCard.test.tsx
it('displays formatted balance', () => {
  const account = createMockAccount({ balance: 150000, currency: 'EUR' });
  renderWithProviders(<AccountCard account={account} />);

  // This will fail — AccountCard doesn't exist yet
  expect(screen.getByText('1,500.00 EUR')).toBeInTheDocument();
});
```

Run: `npm test AccountCard` → should FAIL.

---

## Step 2: GREEN — Minimum Implementation

```typescript
// components/account/AccountCard.tsx
export function AccountCard({ account }: { account: Account }) {
  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: account.currency,
  }).format(account.balance / 100);

  return <div>{formatted}</div>;
}
```

Run: `npm test AccountCard` → should PASS.

---

## Step 3: REFACTOR — Apply Architecture Rules

```typescript
// ✅ After refactor — proper types, role check, loading state
interface AccountCardProps {
  account: Account;
  onSelect?: (account: Account) => void;
}

export function AccountCard({ account, onSelect }: AccountCardProps) {
  const { roles } = useAppSelector(state => state.auth);
  const isAdmin = roles.includes('ADMIN');
  const formatted = formatCurrency(account.balance, account.currency);  // extracted to lib/utils

  return (
    <div role="article" onClick={() => onSelect?.(account)}>
      <span>{formatted}</span>
      {isAdmin && <AdminControls account={account} />}
    </div>
  );
}
```

Refactor checklist:
- [ ] Proper TypeScript types (no `any`)
- [ ] Role checks where needed
- [ ] Pure utility extracted to `lib/utils/`
- [ ] Component < 150 lines
- [ ] Tests still pass after refactor

---

## Component TDD Checklist

For every new component, write tests for:
- [ ] Basic rendering (required content visible)
- [ ] Role-based UI (admin vs user sees different things)
- [ ] User interactions (clicks call correct handlers)
- [ ] Async states (loading spinner, error message, empty state)
- [ ] Which API endpoint is called when action triggered

---

## Redux Slice TDD

```typescript
// 1. RED — write test first
it('sets recipient and advances to step 2', () => {
  const next = transferReducer(undefined, setRecipient({ id: 'acc-2', name: 'Jane' }));
  expect(next.step).toBe(2);  // fails — setRecipient doesn't exist
});

// 2. GREEN — add action to slice
setRecipient(state, action: PayloadAction<Recipient>) {
  state.recipient = action.payload;
  state.step = 2;
}

// 3. REFACTOR — verify types, check for edge cases
```

---

## Bug Fix Protocol

1. Write a failing test that reproduces the bug (RED)
2. Fix the bug (GREEN)
3. Verify test passes and no regressions (`npm test`)

```typescript
// Bug: balance was displaying in euros but stored in cents
// Regression test first:
it('displays balance correctly (balance is in cents)', () => {
  const account = createMockAccount({ balance: 100, currency: 'EUR' }); // 100 cents = 1 EUR
  renderWithProviders(<AccountCard account={account} />);
  expect(screen.getByText('1.00 EUR')).toBeInTheDocument();  // RED — was showing 100.00 EUR
});
```
