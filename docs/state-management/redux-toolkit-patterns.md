# Redux Toolkit Patterns

---

## When to Use Redux (vs TanStack Query)

| Use Redux for | Use TanStack Query for |
|---|---|
| Multi-step transfer/payment flow state | Account balances and details |
| Auth state (user, roles, tokens) | Transaction history |
| Global notifications / banners | Exchange rates |
| Complex UI wizard state (step 1 → 2 → 3) | User profile data |
| Optimistic updates with compensating logic | Any data that lives on the server |

**Rule:** If you find yourself storing API response data in Redux and manually handling loading/error — move it to TanStack Query.

---

## Store Structure

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import transferReducer from './slices/transferSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transfer: transferReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## Typed Hooks (ALWAYS use these)

```typescript
// hooks/useAppDispatch.ts
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
export const useAppDispatch = () => useDispatch<AppDispatch>();

// hooks/useAppSelector.ts
import { useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '@/store';
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```typescript
// ✅ CORRECT — typed hooks
const dispatch = useAppDispatch();
const user = useAppSelector(state => state.auth.user);

// ❌ WRONG — untyped
const dispatch = useDispatch();
const user = useSelector((state: any) => state.auth.user);
```

---

## Slice Pattern

```typescript
// store/slices/transferSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '@/lib/api/transfers';

interface TransferState {
  step: 1 | 2 | 3;
  recipient: { id: string; name: string } | null;
  amount: number | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TransferState = {
  step: 1,
  recipient: null,
  amount: null,
  status: 'idle',
  error: null,
};

// Async thunk for the API call
export const submitTransfer = createAsyncThunk(
  'transfer/submit',
  async (payload: api.TransferPayload, { rejectWithValue }) => {
    try {
      return await api.createTransfer(payload);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? 'Transfer failed');
    }
  }
);

const transferSlice = createSlice({
  name: 'transfer',
  initialState,
  reducers: {
    setRecipient(state, action: PayloadAction<{ id: string; name: string }>) {
      state.recipient = action.payload;
      state.step = 2;
    },
    setAmount(state, action: PayloadAction<number>) {
      state.amount = action.payload;
      state.step = 3;
    },
    resetTransfer() {
      return initialState;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(submitTransfer.pending, state => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(submitTransfer.fulfilled, state => {
        state.status = 'succeeded';
      })
      .addCase(submitTransfer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setRecipient, setAmount, resetTransfer } = transferSlice.actions;
export default transferSlice.reducer;
```

---

## Auth Slice Pattern

```typescript
// store/slices/authSlice.ts
interface AuthState {
  user: { id: string; email: string } | null;
  roles: string[];
  accessToken: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      return await api.login(credentials);
    } catch (err) {
      return rejectWithValue('Invalid credentials');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, roles: [], accessToken: null, status: 'idle' } as AuthState,
  reducers: {
    logout(state) {
      state.user = null;
      state.roles = [];
      state.accessToken = null;
      state.status = 'idle';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.roles = action.payload.roles;
        state.accessToken = action.payload.accessToken;
        state.status = 'authenticated';
      })
      .addCase(login.rejected, state => {
        state.status = 'error';
      });
  },
});
```

---

## Selectors

Use memoized selectors for derived state:

```typescript
// store/selectors/authSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

export const selectIsAdmin = createSelector(
  (state: RootState) => state.auth.roles,
  roles => roles.includes('ADMIN')
);

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === 'authenticated';
```

```typescript
// Usage in component
const isAdmin = useAppSelector(selectIsAdmin);
```

---

## Testing Redux

### Slice test (pure reducer logic)

```typescript
import transferReducer, { setRecipient, resetTransfer } from './transferSlice';

describe('transferSlice', () => {
  it('sets recipient and advances to step 2', () => {
    const state = transferReducer(undefined, setRecipient({ id: 'acc-2', name: 'Jane' }));
    expect(state.recipient).toEqual({ id: 'acc-2', name: 'Jane' });
    expect(state.step).toBe(2);
  });

  it('resets to initial state', () => {
    const loaded = { step: 3 as const, recipient: { id: 'x', name: 'y' }, amount: 100, status: 'succeeded' as const, error: null };
    const state = transferReducer(loaded, resetTransfer());
    expect(state.step).toBe(1);
    expect(state.recipient).toBeNull();
  });
});
```

### Thunk test (async action)

```typescript
import { submitTransfer } from './transferSlice';
import * as api from '@/lib/api/transfers';

jest.mock('@/lib/api/transfers');

describe('submitTransfer thunk', () => {
  it('dispatches fulfilled on success', async () => {
    jest.mocked(api.createTransfer).mockResolvedValue({ id: 'tx-1' });

    const store = configureStore({ reducer: { transfer: transferReducer } });
    await store.dispatch(submitTransfer({ fromId: 'acc-1', toId: 'acc-2', amount: 1000 }));

    expect(store.getState().transfer.status).toBe('succeeded');
  });

  it('dispatches rejected on API failure', async () => {
    jest.mocked(api.createTransfer).mockRejectedValue({ response: { data: { message: 'Insufficient funds' } } });

    const store = configureStore({ reducer: { transfer: transferReducer } });
    await store.dispatch(submitTransfer({ fromId: 'acc-1', toId: 'acc-2', amount: 999999 }));

    expect(store.getState().transfer.status).toBe('failed');
    expect(store.getState().transfer.error).toBe('Insufficient funds');
  });
});
```
