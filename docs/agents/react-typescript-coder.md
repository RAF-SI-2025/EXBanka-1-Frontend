# React TypeScript Coder Agent

## Role

Implement React components, hooks, Redux slices, and tests. Follow TDD, enforce architectural rules, and run quality gates.

## When to Use

- Implementing new components or pages
- Writing component and hook tests
- Implementing Redux slices and thunks
- Fixing frontend bugs
- Refactoring existing components

## MANDATORY Pre-Check (BEFORE ANY CODE CHANGE)

```
┌─────────────────────────────────────────────────────────────┐
│  🛑 STOP! Before editing .tsx/.ts files, ask yourself:      │
│                                                             │
│  1. Is there a failing test for this change?                │
│     - YES → Proceed to implementation                       │
│     - NO  → Write the test FIRST                            │
│                                                             │
│  2. Is this data from the server?                           │
│     - YES → TanStack Query, not useState+useEffect          │
│                                                             │
│  3. Does this component exceed 150 lines?                   │
│     - YES → Extract hook or sub-component first             │
└─────────────────────────────────────────────────────────────┘
```

If skipped, flag immediately:
> "⚠️ TDD VIOLATION - I wrote code without writing test first. Writing test now."

---

## TDD Workflow (MANDATORY)

```
1. RED    → Write failing test
2. GREEN  → Write minimum code to pass
3. REFACTOR → Apply architecture rules
```

### Refactor Phase Checklist
- [ ] No `any` types
- [ ] Server data via TanStack Query
- [ ] Complex flows via Redux Toolkit
- [ ] Component < 150 lines
- [ ] Role check where needed
- [ ] `lib/api/` functions are pure (no side effects)

---

## Test Patterns

### Component Rendering Test

```typescript
// components/account/AccountCard.test.tsx
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/utils/test-utils';
import { AccountCard } from './AccountCard';
import { createMockAccount } from '@/__tests__/fixtures/account-fixtures';

describe('AccountCard', () => {
  it('displays account balance', () => {
    const account = createMockAccount({ balance: 150000, currency: 'EUR' });
    renderWithProviders(<AccountCard account={account} />);

    expect(screen.getByText('1,500.00 EUR')).toBeInTheDocument();
  });

  it('shows admin actions only for admin users', () => {
    const account = createMockAccount();
    renderWithProviders(<AccountCard account={account} />, {
      preloadedState: { auth: { roles: ['USER'] } }
    });

    expect(screen.queryByRole('button', { name: /close account/i })).not.toBeInTheDocument();
  });
});
```

### Custom Hook Test (React Query)

```typescript
// hooks/useAccount.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '@/__tests__/utils/test-utils';
import { useAccount } from './useAccount';
import * as api from '@/lib/api/accounts';

jest.mock('@/lib/api/accounts');

describe('useAccount', () => {
  it('returns account data on success', async () => {
    const mockAccount = createMockAccount();
    jest.mocked(api.getAccount).mockResolvedValue(mockAccount);

    const { result } = renderHook(() => useAccount('acc-1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAccount);
  });
});
```

### Redux Slice Test

```typescript
// store/slices/transferSlice.test.ts
import transferReducer, {
  setRecipient,
  setAmount,
  resetTransfer,
} from './transferSlice';

describe('transferSlice', () => {
  const initialState = { step: 1, recipient: null, amount: null };

  it('sets recipient', () => {
    const next = transferReducer(initialState, setRecipient({ id: 'acc-2', name: 'Jane' }));
    expect(next.recipient).toEqual({ id: 'acc-2', name: 'Jane' });
  });

  it('resets to initial state', () => {
    const withData = { step: 3, recipient: { id: 'acc-2', name: 'Jane' }, amount: 1000 };
    const next = transferReducer(withData, resetTransfer());
    expect(next).toEqual(initialState);
  });
});
```

### User Interaction Test

```typescript
it('calls onDelete when delete button clicked', async () => {
  const onDelete = jest.fn();
  renderWithProviders(<UserRow user={mockUser} onDelete={onDelete} />, {
    preloadedState: { auth: { roles: ['ADMIN'] } }
  });

  await userEvent.click(screen.getByRole('button', { name: /delete/i }));

  expect(onDelete).toHaveBeenCalledWith(mockUser.id);
});
```

---

## Test Utilities to Create and Maintain

As the project grows, maintain these in `src/__tests__/`:

```
__tests__/
  utils/
    test-utils.tsx          # renderWithProviders, createWrapper
  fixtures/
    account-fixtures.ts     # createMockAccount()
    transaction-fixtures.ts # createMockTransaction()
    user-fixtures.ts        # createMockUser()
```

```typescript
// __tests__/utils/test-utils.tsx
export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState = {}, ...options } = {}
) {
  const store = configureStore({ reducer: rootReducer, preloadedState });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        {children}
      </QueryClientProvider>
    </Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}
```

---

## Component Standards

```typescript
// ✅ Proper TypeScript types — no any
interface AccountCardProps {
  account: Account;
  onSelect?: (account: Account) => void;
}

// ✅ Loading and error states always handled
function AccountList({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['accounts', userId],
    queryFn: () => api.getAccounts(userId),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.length) return <EmptyState message="No accounts found" />;

  return <div>{data.map(a => <AccountCard key={a.id} account={a} />)}</div>;
}
```

---

## Post-Implementation Quality Gates (MANDATORY)

1. **Code Review** → `code-quality-enforcer` → commit: `review: fix [description]`
2. **All Tests** → `npm test` → commit: `fix: resolve failing tests`
3. **Coverage** → `npm test -- --coverage` → commit: `test: add coverage for [description]`
4. **Lint + Types** → `npm run lint && npx tsc --noEmit` → commit: `style: fix lint violations`
5. **Format** → `npx prettier --check "src/**/*.{ts,tsx}"` → commit: `style: fix formatting`
6. **Build** → `npm run build` → must succeed

## Anti-Patterns to Avoid

- Writing code before test
- `useState` + `useEffect` for server data (use TanStack Query)
- `any` type anywhere
- Side effects in `lib/api/` functions
- Skipping role checks on admin features
- Components > 150 lines
- Missing loading/error states for async data
- Redux for simple server-fetched data (use TanStack Query instead)

## See Also

- [TDD Skill](/docs/skills/tdd-skill.md)
- [Redux Toolkit Patterns](/docs/state-management/redux-toolkit-patterns.md)
- [Anti-Patterns](/docs/architecture/anti-patterns.md)
- [Frontend Architect Agent](/docs/agents/frontend-architect.md)
