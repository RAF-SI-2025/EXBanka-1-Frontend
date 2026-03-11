# Common Anti-Patterns — Frontend

---

## 1. useEffect + useState for Data Fetching

**Problem:** Manual data fetching with `useEffect` is verbose, error-prone, and doesn't handle caching, deduplication, or background refresh.

```typescript
// ❌ WRONG
const [account, setAccount] = useState<Account | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  setLoading(true);
  api.getAccount(id)
    .then(setAccount)
    .catch(setError)
    .finally(() => setLoading(false));
}, [id]);
```

```typescript
// ✅ CORRECT — TanStack Query handles all of this
const { data: account, isLoading, error } = useQuery({
  queryKey: ['account', id],
  queryFn: () => api.getAccount(id),
});
```

---

## 2. `any` Type

**Problem:** Loses type safety across the entire call chain.

```typescript
// ❌ WRONG
const handleData = (data: any) => {
  console.log(data.accountId);  // no autocomplete, no type checking
};

const processResponse = (res: any) => { ... };
```

```typescript
// ✅ CORRECT
interface AccountResponse {
  accountId: string;
  balance: number;
  currency: string;
}

const handleData = (data: AccountResponse) => {
  console.log(data.accountId);  // typed, autocomplete works
};
```

**If you genuinely don't know the type:** use `unknown` and narrow it with a type guard.

---

## 3. Business Logic in Components

**Problem:** Components that do too much — they fetch data, transform it, apply business rules, and render.

```typescript
// ❌ WRONG — component doing too much
function TransferButton({ fromId, toId, amount }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const fee = amount * 0.015;            // business rule in component
    const total = amount + fee;
    if (total > 10000) {                   // business rule in component
      alert("Limit exceeded");
      return;
    }
    await api.transfer({ fromId, toId, amount: total });
    setLoading(false);
  };
  // ...
}
```

```typescript
// ✅ CORRECT — logic in hook, component renders
function TransferButton({ fromId, toId, amount }: Props) {
  const { submit, isLoading, error } = useTransfer();
  // component only handles UI
}

// hooks/useTransfer.ts — logic lives here
function useTransfer() {
  const dispatch = useAppDispatch();
  const submit = (params: TransferParams) => dispatch(submitTransfer(params));
  // ...
}

// store/slices/transferSlice.ts — business rules and async logic
const submitTransfer = createAsyncThunk('transfer/submit', async (params) => {
  // validation, fee calculation, API call
});
```

---

## 4. Redux for Server State

**Problem:** Fetching API data into Redux with manual loading/error state management when TanStack Query handles this better.

```typescript
// ❌ WRONG — server data in Redux
const fetchAccountsThunk = createAsyncThunk('accounts/fetch', api.getAccounts);
const accountsSlice = createSlice({
  name: 'accounts',
  initialState: { data: [], loading: false, error: null },
  extraReducers: builder => {
    builder.addCase(fetchAccountsThunk.pending, state => { state.loading = true; })
    // ... more boilerplate
  }
});
```

```typescript
// ✅ CORRECT — server data via TanStack Query
const { data: accounts, isLoading } = useQuery({
  queryKey: ['accounts'],
  queryFn: api.getAccounts,
});
// Redux only for complex flows, not for "what data is on the server"
```

---

## 5. Missing Role Check

**Problem:** Admin features rendered for all users, relying solely on backend to block access.

```typescript
// ❌ WRONG — anyone can see admin controls
function UserRow({ user }: Props) {
  return (
    <div>
      <span>{user.name}</span>
      <button onClick={() => deleteUser(user.id)}>Delete</button>  {/* shown to everyone */}
    </div>
  );
}
```

```typescript
// ✅ CORRECT — explicit role gate
function UserRow({ user }: Props) {
  const { roles } = useAppSelector(state => state.auth);
  const isAdmin = roles.includes('ADMIN');

  return (
    <div>
      <span>{user.name}</span>
      {isAdmin && <button onClick={() => deleteUser(user.id)}>Delete</button>}
    </div>
  );
}
```

---

## 6. God Component (> 150 Lines)

**Problem:** One component that renders the page, handles forms, manages state, and makes API calls.

```typescript
// ❌ WRONG — 300-line component
function AccountPage() {
  // 20 lines of state
  // 30 lines of useEffect
  // 50 lines of handlers
  // 200 lines of JSX
}
```

```typescript
// ✅ CORRECT — split responsibilities
function AccountPage() {
  const { account, isLoading } = useAccount(accountId);        // hook handles data
  if (isLoading) return <LoadingSpinner />;
  return <AccountView account={account} />;                    // pure rendering component
}

function AccountView({ account }: { account: Account }) {      // < 100 lines
  return (
    <>
      <AccountHeader account={account} />
      <TransactionList accountId={account.id} />
    </>
  );
}
```

---

## 7. Side Effects in lib/api/

**Problem:** API functions that dispatch, navigate, or cause other side effects.

```typescript
// ❌ WRONG — side effects in lib/
export const login = async (credentials: Credentials) => {
  const res = await axios.post('/auth/login', credentials);
  dispatch(setUser(res.data));    // side effect!
  navigate('/dashboard');          // side effect!
  return res.data;
};
```

```typescript
// ✅ CORRECT — lib/api/ is pure
export const login = (credentials: Credentials): Promise<AuthResponse> =>
  axios.post('/auth/login', credentials).then(res => res.data);

// Side effects happen in the thunk or component:
const loginThunk = createAsyncThunk('auth/login', async (credentials, { dispatch }) => {
  const user = await api.login(credentials);
  dispatch(setUser(user));      // side effect OK in thunk
  return user;
});
```
