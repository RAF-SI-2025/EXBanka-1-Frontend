# Frontend Testing Strategy

## Stack

- **Jest** + **React Testing Library** — component tests
- **jest.mock** — API and module mocking
- **userEvent** — user interactions
- **renderWithProviders** — custom render with Redux store + QueryClient

---

## Test Types

| Type | What | Location |
|---|---|---|
| Component tests | Rendering, interactions, role-based UI | `components/**/*.test.tsx` |
| Hook tests | Custom hooks (React Query, custom) | `hooks/**/*.test.ts` |
| Redux slice tests | Reducer logic, async thunks | `store/slices/**/*.test.ts` |
| lib/api tests | Pure API functions | `lib/api/**/*.test.ts` |

---

## renderWithProviders (MANDATORY for component tests)

Every component test uses `renderWithProviders` — never bare `render`.

```typescript
// __tests__/utils/test-utils.tsx
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rootReducer } from '@/store';

interface RenderOptions {
  preloadedState?: Partial<RootState>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState = {} }: RenderOptions = {}
) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper }) };
}

// For renderHook with React Query
export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

---

## Fixture Factories (MANDATORY — no inline mocks)

Create fixture factories for all domain types as the project grows:

```typescript
// __tests__/fixtures/account-fixtures.ts
import { Account } from '@/types';

export function createMockAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 'acc-test-1',
    ownerId: 'user-test-1',
    balance: 100000,      // 1000.00 EUR
    currency: 'EUR',
    type: 'CHECKING',
    status: 'ACTIVE',
    ...overrides,
  };
}
```

```typescript
// Usage — always use fixture, never inline object
const account = createMockAccount({ balance: 0 });
```

---

## Component Test Pattern

```typescript
describe('AccountCard', () => {
  describe('Rendering', () => {
    it('displays balance', () => {
      const account = createMockAccount({ balance: 150000, currency: 'EUR' });
      renderWithProviders(<AccountCard account={account} />);
      expect(screen.getByText('1,500.00 EUR')).toBeInTheDocument();
    });
  });

  describe('Role-based UI', () => {
    it('shows close button for admin', () => {
      renderWithProviders(<AccountCard account={createMockAccount()} />, {
        preloadedState: { auth: { roles: ['ADMIN'], user: null, accessToken: null, status: 'authenticated' } },
      });
      expect(screen.getByRole('button', { name: /close account/i })).toBeInTheDocument();
    });

    it('hides close button for regular user', () => {
      renderWithProviders(<AccountCard account={createMockAccount()} />, {
        preloadedState: { auth: { roles: ['USER'], user: null, accessToken: null, status: 'authenticated' } },
      });
      expect(screen.queryByRole('button', { name: /close account/i })).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onSelect when card clicked', async () => {
      const onSelect = jest.fn();
      const account = createMockAccount();
      renderWithProviders(<AccountCard account={account} onSelect={onSelect} />);

      await userEvent.click(screen.getByRole('article'));

      expect(onSelect).toHaveBeenCalledWith(account);
    });
  });
});
```

---

## API Mocking Pattern

```typescript
import * as accountApi from '@/lib/api/accounts';
jest.mock('@/lib/api/accounts');

beforeEach(() => {
  jest.clearAllMocks();
});

it('displays accounts on load', async () => {
  jest.mocked(accountApi.getAccounts).mockResolvedValue([createMockAccount()]);

  renderWithProviders(<AccountList userId="user-1" />);

  await screen.findByText('1,000.00 EUR');
});

it('shows error state on API failure', async () => {
  jest.mocked(accountApi.getAccounts).mockRejectedValue(new Error('Network error'));

  renderWithProviders(<AccountList userId="user-1" />);

  await screen.findByText(/something went wrong/i);
});
```

---

## Coverage Targets

| Layer | Target |
|---|---|
| `components/` | 80%+ |
| `hooks/` | 90%+ |
| `store/slices/` | 90%+ |
| `lib/api/` | 70%+ |
| `lib/utils/` | 100% (pure functions) |
