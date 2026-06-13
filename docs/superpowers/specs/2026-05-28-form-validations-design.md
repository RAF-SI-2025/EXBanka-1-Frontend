# Frontend Form Validations — Design

_Date: 2026-05-28_
_Status: Approved_

## Goal

Strengthen frontend validation in entity-creation/update forms for three fields:

1. **Email** — must be a valid format **and** unique. Uniqueness is enforced server-side; we surface duplicate-email errors **inline** under the email field rather than as a generic toast.
2. **Phone** — may contain digits only, with an optional `+` at the very start. No other characters; `+` may not appear anywhere except position 0.
3. **Date of birth** — must not be in the future, and the user must be **at least 16 years old** (i.e. DoB ≤ today − 16 years).

## Scope

### In scope

- Updates to `src/lib/utils/validation.ts` (Zod schemas) covering all create/update forms that already include email, phone, or date-of-birth fields.
- A new helper `src/lib/errors/isDuplicateEmailError.ts` that recognizes a server "email already taken" response.
- Wiring `onError` handlers in the 4 forms that create/edit entities with email so that a duplicate-email response sets an inline field error rather than producing a toast.
- Unit tests for the updated schemas and the new helper.
- Form-level tests covering the new "duplicate email → inline error" path.

### Out of scope

- Backend changes (no new uniqueness-check endpoint exists or is being added).
- Authentication forms (LoginForm, PasswordResetRequestForm) — they don't create entities and don't need the uniqueness handling.
- Visual redesign of any form.

## Architecture

### Layer 1 — Zod schemas (`src/lib/utils/validation.ts`)

Two new building blocks:

```ts
// Phone: optional "+" at the start, digits only, max 15 chars
export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9]+$/, 'Phone must contain only digits, optionally starting with "+"')
  .max(15, 'Phone number must be at most 15 characters')

// Date of birth from <input type="date"> (YYYY-MM-DD string)
const isAtLeast16YearsAgo = (date: Date): boolean => {
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 16)
  // Compare at day granularity to avoid time-of-day flakiness
  cutoff.setHours(23, 59, 59, 999)
  return date.getTime() <= cutoff.getTime()
}

export const dateOfBirthStringSchema = z
  .string()
  .min(1, 'Date of birth is required')
  .refine((val) => !Number.isNaN(new Date(val).getTime()), {
    message: 'Date of birth is invalid',
  })
  .refine((val) => new Date(val) <= new Date(), {
    message: 'Date of birth cannot be in the future',
  })
  .refine((val) => isAtLeast16YearsAgo(new Date(val)), {
    message: 'Must be at least 16 years old',
  })

// Variant for schemas that already store DoB as a Unix-timestamp number
export const dateOfBirthTimestampSchema = z
  .number()
  .refine((ts) => ts * 1000 <= Date.now(), {
    message: 'Date of birth cannot be in the future',
  })
  .refine((ts) => isAtLeast16YearsAgo(new Date(ts * 1000)), {
    message: 'Must be at least 16 years old',
  })
```

Schemas updated to use them:

| Schema | `phone` becomes | `date_of_birth` becomes |
|---|---|---|
| `createEmployeeSchema` | `phoneSchema.optional().or(z.literal(''))` | `dateOfBirthTimestampSchema` |
| `updateEmployeeSchema` | `phoneSchema.optional().or(z.literal(''))` | _(not editable)_ |
| `createClientSchema` | `phoneSchema.optional().or(z.literal(''))` | `dateOfBirthStringSchema` |
| `updateClientSchema` | `phoneSchema.optional().or(z.literal(''))` | _(not editable)_ |
| `authorizedPersonSchema` | `phoneSchema.optional().or(z.literal(''))` | `dateOfBirthStringSchema` |
| `createLoanRequestSchema` | `phoneSchema.optional().or(z.literal(''))` | _(no DoB field)_ |

`emailSchema` is left as-is — Zod's built-in `.email()` already accepts the standard `banka@primer.rs` format and rejects malformed addresses.

### Layer 2 — Duplicate-email detection (`src/lib/errors/isDuplicateEmailError.ts`)

```ts
import { parseApiError } from './parseApiError'

export const isDuplicateEmailError = (err: unknown): boolean => {
  const parsed = parseApiError(err)
  if (parsed.status === 409) return true
  if (parsed.status !== 400) return false
  const msg = parsed.message.toLowerCase()
  return msg.includes('email') && /exist|taken|duplicate|unique|alread/.test(msg)
}
```

The exact backend error string for "duplicate email" is not documented in `docs/REST_API_v3.md` — only the generic `{"error": "validation error"}`. We use HTTP 409 (the conventional code) **and** a 400 with a heuristic message match. If the implementation reveals the backend returns a more specific code/message, we tighten the matcher accordingly (this is the only place to change).

### Layer 3 — Form-level wiring

Four forms gain an `onError` in their mutation hook:

| Form | Mutation hook |
|---|---|
| `EmployeeCreateForm` | `useCreateEmployee` |
| `CreateClientView` (or its inner form component) | `useCreateClient` |
| `EditClientForm` | `useUpdateClient` |
| `AuthorizedPersonForm` | `useCreateAuthorizedPerson` |

Pattern:

```ts
const mutation = useCreateEmployee({
  onError: (err) => {
    if (isDuplicateEmailError(err)) {
      form.setError('email', { message: 'Email is already in use' })
      return // intentionally NO toast — inline error is the UX
    }
    notifyError(err) // fallback for all other errors
  },
  onSuccess: /* unchanged */,
})
```

This conforms to `CLAUDE.md`'s error-handling rule: when we own `onError`, we either render inline UX or call `notifyError`. Here we do both depending on the error class.

## Data Flow — duplicate email submission

```
user submits form
  → react-hook-form passes Zod-validated payload
    → useCreateEmployee mutation → POST /api/v3/employees
      → backend returns 409 (or 400 with "email already exists")
        → mutation.onError fires
          → isDuplicateEmailError(err) === true
            → form.setError('email', { message: 'Email is already in use' })
              → FormField renders error text under email input
              → NO toast shown
```

## Testing

### `src/lib/utils/validation.test.ts` — new cases

**phone:**
- ✅ accepts `+381601234567`
- ✅ accepts `0601234567`
- ❌ rejects `+38160-1234567` (contains `-`)
- ❌ rejects `abc123` (letters)
- ❌ rejects `++3811` (`+` not at start of remaining)
- ❌ rejects `123+456` (`+` mid-string)
- ❌ rejects `+12345678901234567` (>15 chars)
- ✅ accepts `''` (empty string for optional fields)

**date_of_birth (string variant):**
- ✅ accepts a DoB exactly 16 years ago today
- ✅ accepts `1990-01-01`
- ❌ rejects tomorrow's date (future)
- ❌ rejects a DoB 15 years 364 days ago (under 16)
- ❌ rejects empty string

**date_of_birth (timestamp variant):**
- analogous cases, expressed as Unix seconds

### `src/lib/errors/isDuplicateEmailError.test.ts` — new file

- ✅ HTTP 409 → `true`
- ✅ HTTP 400 + message "email already exists" → `true`
- ✅ HTTP 400 + message "Email is taken" (case-insensitive) → `true`
- ❌ HTTP 400 + generic "validation error" → `false`
- ❌ HTTP 500 → `false`
- ❌ Network error / non-axios → `false`

### Form tests — new "duplicate email" case per form

For each of `EmployeeCreateForm`, `CreateClientForm`, `EditClientForm`, `AuthorizedPersonForm`:

- Render the form with `renderWithProviders`.
- Fill required fields with valid data.
- Mock axios to return a 409 (or 400 with "email already exists") for the relevant POST/PUT.
- Submit.
- Assert: `getByText('Email is already in use')` is present.
- Assert: `toast` was **not** called (or queryClient's mutation cache onError did not fire its global handler — depending on what's easier to assert in this codebase).

## Verification Checklist (per CLAUDE.md Quality Gates)

After implementation:

- [ ] `npm test` — all green, including new cases
- [ ] `npm test -- --coverage` — new helper and schemas covered
- [ ] `npm run lint` — clean
- [ ] `npx tsc --noEmit` — clean
- [ ] `npm run build` — succeeds
- [ ] Specification updated (`specification.md` §11 reflects new schemas)
- [ ] No empty `catch`, no `onError: () => {}` introduced

## Risks / Open Questions

1. **Backend error shape for "duplicate email" is not documented.** We use a heuristic. If it doesn't match in practice, we update `isDuplicateEmailError` — only one file changes.
2. **Cypress fixtures** may need updates if any current e2e suite covers create-employee or create-client and the new validation rules fire on existing fixture data (e.g., a fixture with a `12+34` phone). Will verify when running the full test suite.
3. **Timezone for DoB** — `new Date('YYYY-MM-DD')` parses as UTC midnight. We accept that DoB validation is at calendar-day granularity, not user-local time. For a 16-year-old whose birthday is "today," the validation passes (≤ today). This matches user intent.
