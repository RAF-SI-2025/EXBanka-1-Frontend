# Testing Quick Reference — Frontend

## Commands

```bash
npm test                                    # All tests
npm test AccountCard                        # Tests matching filename
npm test -- --coverage                      # Coverage report
npm test -- --watch                         # Watch mode
npm test -- --testPathPattern="components"  # Tests in directory
```

---

## Query Priority (React Testing Library)

Use queries in this order (most accessible first):

```typescript
screen.getByRole('button', { name: /submit/i })     // 1st choice
screen.getByLabelText(/email/i)                      // for inputs
screen.getByText(/account balance/i)                 // for display text
screen.getByTestId('transfer-form')                  // last resort
```

---

## Async Testing

```typescript
// Wait for element to appear (async render / API response)
await screen.findByText('1,500.00 EUR');

// Wait for condition
await waitFor(() => expect(mockFn).toHaveBeenCalled());

// User interactions are always async
await userEvent.click(screen.getByRole('button', { name: /submit/i }));
await userEvent.type(screen.getByLabelText(/amount/i), '100');
```

---

## Common Patterns

```typescript
// Check element is NOT present
expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

// Check element is disabled
expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();

// Check input value
expect(screen.getByLabelText(/amount/i)).toHaveValue('100');

// Check link href
expect(screen.getByRole('link', { name: /details/i })).toHaveAttribute('href', '/accounts/1');
```

---

## Mocking

```typescript
// Mock entire module
jest.mock('@/lib/api/accounts');

// Mock specific function return
jest.mocked(api.getAccounts).mockResolvedValue([createMockAccount()]);
jest.mocked(api.getAccounts).mockRejectedValue(new Error('Network error'));

// Check mock was called
expect(api.createTransfer).toHaveBeenCalledWith({
  fromId: 'acc-1', toId: 'acc-2', amount: 1000
});
expect(api.createTransfer).toHaveBeenCalledTimes(1);

// Reset between tests
beforeEach(() => jest.clearAllMocks());
```

---

## renderWithProviders Options

```typescript
// Default (authenticated admin)
renderWithProviders(<Component />);

// With specific auth state
renderWithProviders(<Component />, {
  preloadedState: {
    auth: { roles: ['USER'], user: { id: '1', email: 'user@test.com' }, accessToken: 'token', status: 'authenticated' }
  }
});

// With pre-filled Redux state
renderWithProviders(<TransferStep2 />, {
  preloadedState: {
    transfer: { step: 2, recipient: { id: 'acc-2', name: 'Jane' }, amount: null, status: 'idle', error: null }
  }
});
```

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Using bare `render` instead of `renderWithProviders` | Always use `renderWithProviders` |
| Inline mock objects `{ id: '1', name: 'test' }` | Use `createMockAccount()` fixtures |
| Missing `await` on user interactions | All `userEvent.*` calls need `await` |
| `getByText` on async data (not yet loaded) | Use `findByText` (waits automatically) |
| Not clearing mocks between tests | Add `beforeEach(() => jest.clearAllMocks())` |
| Testing implementation details (internal state) | Test behavior: what the user sees and does |
