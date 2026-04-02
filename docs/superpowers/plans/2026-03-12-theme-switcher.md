# Theme Switcher Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a light/dark theme toggle button to the sidebar bottom section, persisted to localStorage via React Context.

**Architecture:** A `ThemeContext` manages `isDark` state, reads/writes `localStorage`, and toggles the `.dark` class on `<html>`. `ThemeProvider` wraps the app in `main.tsx`. The `Sidebar` consumes `useTheme()` to render a Sun/Moon icon button next to the user email.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React (already installed via Shadcn), Jest + React Testing Library, @testing-library/user-event v14

---

## Chunk 1: ThemeContext

### Task 1: ThemeContext — tests then implementation

**Files:**
- Create: `src/contexts/ThemeContext.test.tsx`
- Create: `src/contexts/ThemeContext.tsx`

---

- [ ] **Step 1: Write the failing tests**

Create `src/contexts/ThemeContext.test.tsx`:

```tsx
import { act } from 'react'
import { renderHook } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'

// Note: `.dark` on <html> activates the CSS variable block in index.css (lines 45-79).
// The Tailwind `@custom-variant dark (&:is(.dark *))` targets *children* of .dark — both are correct and intentional.

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('useTheme', () => {
  it('defaults to light when localStorage has no value', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('initialises to dark when localStorage contains "dark"', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggleTheme from light adds .dark class and writes "dark" to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => { result.current.toggleTheme() })
    expect(result.current.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('toggleTheme from dark removes .dark class and writes "light" to localStorage', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => { result.current.toggleTheme() })
    expect(result.current.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('round-trip: toggleTheme twice from light returns to light', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => { result.current.toggleTheme() })
    act(() => { result.current.toggleTheme() })
    expect(result.current.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- src/contexts/ThemeContext.test.tsx --no-coverage --watchAll=false
```

Expected: FAIL — `Cannot find module '@/contexts/ThemeContext'`

- [ ] **Step 3: Implement ThemeContext**

Create `src/contexts/ThemeContext.tsx`:

```tsx
import { createContext, useContext, useEffect, useState } from 'react'

// Note: toggling .dark on <html> activates the CSS variable block in index.css.
// The Tailwind @custom-variant dark (&:is(.dark *)) targets children of .dark for utility classes.
// Both are intentional and correct.

interface ThemeContextValue {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem('theme') === 'dark'
  )

  // Apply/remove .dark class on <html> whenever isDark changes (including initial mount)
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  // Only write to localStorage when the user explicitly toggles (not on initial mount)
  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- src/contexts/ThemeContext.test.tsx --no-coverage --watchAll=false
```

Expected: 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/contexts/ThemeContext.tsx src/contexts/ThemeContext.test.tsx
git commit -m "$(cat <<'EOF'
feat: add ThemeContext with localStorage persistence

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Chunk 2: Wire up providers and Sidebar button

> **Prerequisite:** Chunk 1 must be complete and committed before starting this chunk.

### Task 2: Add ThemeProvider to setupTests, test-utils, and main.tsx

**Files:**
- Modify: `src/__tests__/utils/setupTests.ts`
- Modify: `src/__tests__/utils/test-utils.tsx`
- Modify: `src/main.tsx`

---

- [ ] **Step 1: Add global localStorage cleanup to setupTests**

`ThemeProvider` reads `localStorage` on mount. Any test that sets `localStorage` without cleanup can affect subsequent tests. Add a global `afterEach` to `src/__tests__/utils/setupTests.ts`:

```ts
import '@testing-library/jest-dom'

afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})
```

Note: `classList.remove('dark')` is used instead of `className = ''` to avoid wiping unrelated classes that may be set by jsdom or other test infrastructure.

- [ ] **Step 2: Update renderWithProviders to include ThemeProvider**

In `src/__tests__/utils/test-utils.tsx`, add the import after the existing imports:

```tsx
import { ThemeProvider } from '@/contexts/ThemeContext'
```

Replace the `Wrapper` function body to wrap `Provider` with `ThemeProvider`:

```tsx
function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>
            {routePath ? (
              <Routes>
                <Route path={routePath} element={children} />
              </Routes>
            ) : (
              children
            )}
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  )
}
```

- [ ] **Step 3: Run all tests to verify nothing broke**

```bash
npm test -- --no-coverage --passWithNoTests --watchAll=false --watchAll=false
```

Expected: all existing tests pass. If any test fails, it means a test was relying on unclean `localStorage` state — fix the offending test before continuing.

Also verify: Chunk 1's `ThemeContext.test.tsx` tests each set their own state in `beforeEach` and do not rely on cross-test localStorage persistence (they use `beforeEach(() => localStorage.clear())`) — confirmed in the plan. The global `afterEach` in setupTests runs after each test, which is compatible with per-test `beforeEach` resets.

- [ ] **Step 4: Update main.tsx to include ThemeProvider**

In `src/main.tsx`, add the import after the existing imports:

```tsx
import { ThemeProvider } from '@/contexts/ThemeContext'
```

Replace the `createRoot(...).render(...)` call:

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  </StrictMode>
)
```

- [ ] **Step 5: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/__tests__/utils/setupTests.ts src/__tests__/utils/test-utils.tsx src/main.tsx
git commit -m "$(cat <<'EOF'
feat: wire ThemeProvider into app and test utils

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Add theme toggle button to Sidebar

**Files:**
- Modify: `src/components/layout/Sidebar.test.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

---

- [ ] **Step 1: Write the failing Sidebar tests**

The current `Sidebar.test.tsx` imports only `screen`. Add `userEvent` and 3 new tests inside the existing `describe('Sidebar', ...)` block. The full updated file:

```tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { Sidebar } from '@/components/layout/Sidebar'
import { createMockAuthState } from '@/__tests__/fixtures/auth-fixtures'

describe('Sidebar', () => {
  it('shows employee management link', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByRole('link', { name: /employees/i })).toHaveAttribute('href', '/employees')
  })

  it('shows logout button', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })

  it('displays user email', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
  })

  it('renders theme toggle button with aria-label "Switch to dark mode" in light mode', () => {
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i })
    ).toBeInTheDocument()
  })

  it('renders theme toggle button with aria-label "Switch to light mode" in dark mode', () => {
    // Must be set BEFORE render — ThemeProvider reads localStorage only on mount
    localStorage.setItem('theme', 'dark')
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    expect(
      screen.getByRole('button', { name: /switch to light mode/i })
    ).toBeInTheDocument()
  })

  it('clicking the theme toggle button toggles the .dark class on <html>', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Sidebar />, {
      preloadedState: { auth: createMockAuthState() },
    })
    const toggleBtn = screen.getByRole('button', { name: /switch to dark mode/i })
    await user.click(toggleBtn)
    // waitFor ensures the useEffect in ThemeContext has flushed before asserting the DOM
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })
})
```

Note: `userEvent.setup()` + `await user.click()` correctly flushes React state updates and `useEffect` calls. The `.dark` class is applied inside a `useEffect` in `ThemeContext`, so async click handling is required.

- [ ] **Step 2: Run new tests to verify they fail**

```bash
npm test -- src/components/layout/Sidebar.test.tsx --no-coverage --watchAll=false
```

Expected: 3 new tests FAIL — button not found

- [ ] **Step 3: Update Sidebar to add the toggle button**

Replace the contents of `src/components/layout/Sidebar.tsx`. (The bank name `"EXBanka"` is unchanged from the existing file.)

```tsx
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logoutThunk } from '@/store/slices/authSlice'
import { selectCurrentUser } from '@/store/selectors/authSelectors'
import { useTheme } from '@/contexts/ThemeContext'

export function Sidebar() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = () => {
    dispatch(logoutThunk())
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col p-4">
      <div className="text-lg font-bold mb-6 text-accent-2">EXBanka</div>
      <nav className="flex-1 space-y-1">
        <Link
          to="/employees"
          className="block px-3 py-2 rounded-md hover:bg-sidebar-accent text-sm text-sidebar-foreground"
        >
          Employees
        </Link>
      </nav>
      <div className="border-t border-sidebar-border pt-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-sidebar-foreground/70">{user?.email}</p>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-accent-2 text-white border-accent-2 hover:bg-accent-2/90"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Run all Sidebar tests to verify they pass**

```bash
npm test -- src/components/layout/Sidebar.test.tsx --no-coverage --watchAll=false
```

Expected: all 6 tests pass (3 existing + 3 new)

- [ ] **Step 5: Run the full test suite**

```bash
npm test -- --no-coverage --passWithNoTests --watchAll=false
```

Expected: all tests pass

- [ ] **Step 6: Run lint and TypeScript check**

```bash
npm run lint && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/components/layout/Sidebar.test.tsx
git commit -m "$(cat <<'EOF'
feat: add theme toggle button to Sidebar

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```
