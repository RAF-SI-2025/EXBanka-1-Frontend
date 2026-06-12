# OTC Negotiation Button Flags — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render OTC negotiation buttons (Accept/Counter/Reject/Withdraw) and revision "You"/Accept affordances directly from the backend's viewer-relative flags, removing the client-side turn derivation in `turn.ts`.

**Architecture:** Thread new optional wire fields through the API normalizers (`normalizeNegotiation`, `normalizeRevision`) and the timeline mapping, defaulting absent flags to `false`/`''`. Both panels then key each button off its own flag (`can_accept`/`can_counter`/`can_reject`/`can_withdraw`, `awaiting_viewer`, `last_action_mine`). Revision/timeline tables use `mine`/`is_latest`. The now-orphaned `turn.ts` is deleted.

**Tech Stack:** React 19 + TypeScript, TanStack Query, Jest + React Testing Library. Agent routing per CLAUDE.md: implementation via `react-typescript-coder`, review via `code-quality-enforcer`. TDD mandatory.

**Reference spec:** `docs/superpowers/specs/2026-06-12-otc-negotiation-button-flags-design.md`

---

## Conventions for every task

- Run a single test file with: `npx jest <path> --silent=false`
- Commit messages end with the Co-Authored-By trailer:
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```
- We are on branch `dev` (per project policy `main` is forbidden for direct commits; `dev` is the integration branch — stay on it).
- `.tsx`/`.ts` edits to component/hook/api logic go through `react-typescript-coder`; `types/`-style additions and test files may be edited directly.

---

## Task 1: Add viewer-relative flags to the types

**Files:**
- Modify: `src/views/otcOptions/types.ts`

These are type-only additions (allowed as direct edits per CLAUDE.md). No standalone test — the flags are exercised by Tasks 2–8.

- [ ] **Step 1: Add the action-hint fields to `OtcNegotiation`**

In `src/views/otcOptions/types.ts`, the `OtcNegotiation` interface (currently ending at the `updated_at` field) gains these required fields. Add them right after `last_action_by?: OtcParty`:

```typescript
  last_action_by?: OtcParty
  // Viewer-relative action hints computed per caller by the backend
  // (REST_API_v3 §47.2). The FE renders buttons directly from these instead of
  // re-deriving turn rules. Normalized at the API boundary: absent ⇒ false / ''.
  // `viewer_role`: the caller's side on this chain.
  viewer_role: '' | 'bidder' | 'poster'
  // `last_action_mine`: caller authored the latest revision (counterparty's turn).
  last_action_mine: boolean
  // `awaiting_viewer`: caller's turn — chain live AND the other side moved last.
  awaiting_viewer: boolean
  // `can_accept`/`can_counter` == awaiting_viewer (turn-based).
  can_accept: boolean
  can_counter: boolean
  // `can_reject`: live AND viewer is the poster — NOT turn-gated.
  can_reject: boolean
  // `can_withdraw`: live AND viewer is the bidder.
  can_withdraw: boolean
```

- [ ] **Step 2: Add `mine`/`is_latest` to `OtcNegotiationRevision`**

In the `OtcNegotiationRevision` interface, after `created_at: string`, add:

```typescript
  created_at: string
  // Viewer-relative flags (REST_API_v3 §47.2). Normalized at the boundary:
  // absent ⇒ false. `mine`: caller authored this revision. `is_latest`: this is
  // the chain's most recent revision.
  mine: boolean
  is_latest: boolean
```

- [ ] **Step 3: Add wire-optional `mine`/`is_latest` to `OtcTimelineEntry`**

In the `OtcTimelineEntry` interface, after `created_at: string`, add:

```typescript
  created_at: string
  // Per-caller / per-chain flags on the merged timeline (REST_API_v3 §47.2).
  // Wire-optional; the hook defaults them to false.
  mine?: boolean
  is_latest?: boolean
```

- [ ] **Step 4: Verify the project still type-checks**

Run: `npx tsc --noEmit`
Expected: FAIL — `normalizeNegotiation` / `normalizeRevision` (api) and `makeNeg` (OfferActivityPanel test) no longer satisfy the now-required fields. These are fixed in Tasks 2 and 7/8. (If you prefer a green tree between tasks, you may proceed straight into Task 2 before committing.)

- [ ] **Step 5: Commit**

```bash
git add src/views/otcOptions/types.ts
git commit -m "$(cat <<'EOF'
feat(otc): add viewer-relative flag fields to negotiation/revision types

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Thread the flags through the API normalizers

**Files:**
- Modify: `src/views/otcOptions/api/otcOptionsApi.ts` (`normalizeNegotiation` ~L55, `normalizeRevision` ~L211, `RawRevision` ~L202)
- Test: `src/views/otcOptions/__tests__/otcOptionsApi.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `src/views/otcOptions/__tests__/otcOptionsApi.test.ts`:

```typescript
describe('otcOptionsApi — negotiation action-hint flags', () => {
  it('passes viewer-relative flags through listNegotiations', async () => {
    mockGet.mockResolvedValue({
      data: {
        negotiations: [
          {
            id: 7,
            status: 'countered',
            bidder_owner_type: 'client',
            bidder_owner_id: 5,
            viewer_role: 'poster',
            last_action_mine: false,
            awaiting_viewer: true,
            can_accept: true,
            can_counter: true,
            can_reject: true,
            can_withdraw: false,
          },
        ],
        total: 1,
      },
    })

    const { negotiations } = await otcOptionsApi.listNegotiations(42)

    expect(negotiations[0]).toMatchObject({
      viewer_role: 'poster',
      last_action_mine: false,
      awaiting_viewer: true,
      can_accept: true,
      can_counter: true,
      can_reject: true,
      can_withdraw: false,
    })
  })

  it('defaults absent flags to false / empty string', async () => {
    mockGet.mockResolvedValue({
      data: { negotiations: [{ id: 7, status: 'open' }], total: 1 },
    })

    const { negotiations } = await otcOptionsApi.listMyNegotiations()

    expect(negotiations[0]).toMatchObject({
      viewer_role: '',
      last_action_mine: false,
      awaiting_viewer: false,
      can_accept: false,
      can_counter: false,
      can_reject: false,
      can_withdraw: false,
    })
  })

  it('passes mine / is_latest through listNegotiationRevisions and defaults them to false', async () => {
    mockGet.mockResolvedValue({
      data: {
        revisions: [
          {
            id: 1,
            negotiation_id: 5,
            revision_number: 2,
            action: 'COUNTER',
            action_by_principal_type: 'seller',
            mine: false,
            is_latest: true,
          },
          {
            id: 2,
            negotiation_id: 5,
            revision_number: 1,
            action: 'BID',
            action_by_principal_type: 'client',
            action_by_principal_id: 5,
            // no mine / is_latest → default false
          },
        ],
      },
    })

    const { revisions } = await otcOptionsApi.listNegotiationRevisions(5)

    expect(revisions[0]).toMatchObject({ mine: false, is_latest: true })
    expect(revisions[1]).toMatchObject({ mine: false, is_latest: false })
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/views/otcOptions/__tests__/otcOptionsApi.test.ts`
Expected: FAIL — the normalizers drop the new fields, so `toMatchObject` finds `undefined`.

- [ ] **Step 3: Implement — pass flags through `normalizeNegotiation`**

In `src/views/otcOptions/api/otcOptionsApi.ts`, the `normalizeNegotiation` return object (currently ending with `updated_at: raw.updated_at ?? '',`) adds the flags:

```typescript
    created_at: raw.created_at ?? '',
    updated_at: raw.updated_at ?? '',
    viewer_role: raw.viewer_role ?? '',
    last_action_mine: raw.last_action_mine ?? false,
    awaiting_viewer: raw.awaiting_viewer ?? false,
    can_accept: raw.can_accept ?? false,
    can_counter: raw.can_counter ?? false,
    can_reject: raw.can_reject ?? false,
    can_withdraw: raw.can_withdraw ?? false,
  }
}
```

(`RawNegotiation extends Partial<OtcNegotiation>`, so the wire fields are already in scope — no change to `RawNegotiation` needed.)

- [ ] **Step 4: Implement — pass `mine`/`is_latest` through `normalizeRevision`**

`RawRevision extends Partial<OtcNegotiationRevision>` already includes optional `mine`/`is_latest`. In `normalizeRevision`, the return object (currently ending `action_by_principal_id: toPrincipalId(...)`, then `created_at`) adds:

```typescript
    created_at: raw.created_at ?? '',
    mine: raw.mine ?? false,
    is_latest: raw.is_latest ?? false,
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx jest src/views/otcOptions/__tests__/otcOptionsApi.test.ts`
Expected: PASS (all suites in the file).

- [ ] **Step 6: Commit**

```bash
git add src/views/otcOptions/api/otcOptionsApi.ts src/views/otcOptions/__tests__/otcOptionsApi.test.ts
git commit -m "$(cat <<'EOF'
feat(otc): normalize viewer-relative negotiation/revision flags

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Carry `mine`/`is_latest` through the timeline mapping

**Files:**
- Modify: `src/views/otcOptions/hooks/useOtcOptionsLists.ts` (`RevisionWithChain` ~L59, the timeline `.map` ~L82)
- Test: `src/views/otcOptions/__tests__/useOtcOfferTimeline.test.ts`

- [ ] **Step 1: Write the failing test**

Append to the `describe('useOtcOfferTimeline', ...)` block in `src/views/otcOptions/__tests__/useOtcOfferTimeline.test.ts`:

```typescript
  it('carries mine / is_latest onto the mapped rows, defaulting absent to false', async () => {
    getOfferTimeline.mockResolvedValue({
      offer: {},
      timeline: [
        entry({ revision_number: 2, created_at: '2026-06-01T12:05:00Z', mine: true, is_latest: true }),
        entry({ revision_number: 1, created_at: '2026-06-01T12:00:00Z' }),
      ],
    })

    const { result } = renderHook(() => useOtcOfferTimeline(42), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const revs = result.current.revisions
    expect(revs[0]).toMatchObject({ mine: true, is_latest: true })
    expect(revs[1]).toMatchObject({ mine: false, is_latest: false })
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest src/views/otcOptions/__tests__/useOtcOfferTimeline.test.ts`
Expected: FAIL — mapped rows lack `mine`/`is_latest`.

- [ ] **Step 3: Implement**

In `src/views/otcOptions/hooks/useOtcOptionsLists.ts`:

(a) Extend the `RevisionWithChain` interface:

```typescript
export interface RevisionWithChain extends OtcNegotiationRevision {
  chain_id: number
  chain_bidder: OtcParty
  chain_bidder_name?: string
}
```

— no field additions needed here because `RevisionWithChain extends OtcNegotiationRevision`, which now (Task 1) requires `mine`/`is_latest`. The compiler will force the `.map` to set them.

(b) In the timeline `.map`, add `mine`/`is_latest` to each mapped object (after `created_at: e.created_at,` and before `chain_id`):

```typescript
    created_at: e.created_at,
    mine: e.mine ?? false,
    is_latest: e.is_latest ?? false,
    chain_id: e.negotiation_id,
    chain_bidder: { owner_type: e.bidder_owner_type, owner_id: e.bidder_owner_id },
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest src/views/otcOptions/__tests__/useOtcOfferTimeline.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/otcOptions/hooks/useOtcOptionsLists.ts src/views/otcOptions/__tests__/useOtcOfferTimeline.test.ts
git commit -m "$(cat <<'EOF'
feat(otc): carry mine/is_latest through the offer timeline mapping

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `formatActor` honors a `mine` flag

**Files:**
- Modify: `src/views/otcOptions/lib/actor.ts`
- Test: `src/views/otcOptions/lib/__tests__/actor.test.ts`

- [ ] **Step 1: Write the failing tests**

Append inside the `describe('formatActor', ...)` block in `actor.test.ts`:

```typescript
  it('returns "You" when the mine flag is true, regardless of principal', () => {
    expect(formatActor('seller', null, undefined, true)).toBe('You')
    expect(formatActor('client', 99, { owner_type: 'client', owner_id: 1 }, true)).toBe('You')
  })

  it('falls back to principal/role rendering when mine is false or absent', () => {
    expect(formatActor('seller', null, undefined, false)).toBe('Seller')
    expect(formatActor('client', 99, undefined)).toBe('client-99')
  })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx jest src/views/otcOptions/lib/__tests__/actor.test.ts`
Expected: FAIL — `formatActor` ignores the 4th argument.

- [ ] **Step 3: Implement**

In `src/views/otcOptions/lib/actor.ts`, update the signature and add the short-circuit at the top of the function body:

```typescript
export function formatActor(
  type: string | null | undefined,
  id: number | null | undefined,
  currentPrincipal?: OtcParty | null,
  mine?: boolean
): string {
  if (mine) return 'You'
  if (id != null) {
    if (
      currentPrincipal &&
      currentPrincipal.owner_type === type &&
      currentPrincipal.owner_id === id
    ) {
      return 'You'
    }
    return `${type}-${id}`
  }
  return prettyRole(type)
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx jest src/views/otcOptions/lib/__tests__/actor.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/otcOptions/lib/actor.ts src/views/otcOptions/lib/__tests__/actor.test.ts
git commit -m "$(cat <<'EOF'
feat(otc): formatActor short-circuits to "You" on the mine flag

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `NegotiationRevisionsTable` uses `mine` / `is_latest`

**Files:**
- Modify: `src/views/otcOptions/components/NegotiationRevisionsTable.tsx`
- Test: Create `src/views/otcOptions/components/__tests__/NegotiationRevisionsTable.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/views/otcOptions/components/__tests__/NegotiationRevisionsTable.test.tsx`:

```typescript
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { NegotiationRevisionsTable } from '@/views/otcOptions/components/NegotiationRevisionsTable'
import type { OtcNegotiationRevision } from '@/views/otcOptions/types'

function rev(overrides: Partial<OtcNegotiationRevision> = {}): OtcNegotiationRevision {
  return {
    id: 1,
    negotiation_id: 5,
    revision_number: 1,
    action: 'BID',
    quantity: '10',
    strike_price: '150.00',
    premium: '7.50',
    settlement_date: '2026-07-01T00:00:00Z',
    action_by_principal_type: 'client',
    action_by_principal_id: 42,
    created_at: '2026-06-01T12:00:00Z',
    mine: false,
    is_latest: false,
    ...overrides,
  }
}

describe('NegotiationRevisionsTable', () => {
  it('labels a revision authored by the caller as "You" via the mine flag', () => {
    renderWithProviders(<NegotiationRevisionsTable revisions={[rev({ mine: true })]} />)
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('offers Accept only on the latest revision that is not mine', () => {
    const accept = { accounts: [], pending: false, onAccept: jest.fn() }
    renderWithProviders(
      <NegotiationRevisionsTable
        revisions={[
          rev({ id: 1, revision_number: 1, action: 'BID', mine: true, is_latest: false }),
          rev({ id: 2, revision_number: 2, action: 'COUNTER', mine: false, is_latest: true }),
        ]}
        accept={accept}
      />
    )
    // Exactly one Accept button — on the latest, not-mine revision.
    expect(screen.getAllByRole('button', { name: /^accept$/i })).toHaveLength(1)
  })

  it('shows no Accept when the latest revision is mine', () => {
    const accept = { accounts: [], pending: false, onAccept: jest.fn() }
    renderWithProviders(
      <NegotiationRevisionsTable
        revisions={[rev({ id: 2, revision_number: 2, action: 'COUNTER', mine: true, is_latest: true })]}
        accept={accept}
      />
    )
    expect(screen.queryByRole('button', { name: /^accept$/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest src/views/otcOptions/components/__tests__/NegotiationRevisionsTable.test.tsx`
Expected: FAIL — current code labels "You" via `currentPrincipal` (none passed) and gates Accept on `action_by_principal_type === 'seller'`.

- [ ] **Step 3: Implement**

In `src/views/otcOptions/components/NegotiationRevisionsTable.tsx`:

(a) Replace the `acceptable` derivation (currently `const acceptable = accept && r.action_by_principal_type === 'seller'`) with:

```typescript
          const acceptable = accept && r.is_latest && !r.mine
```

(b) Pass `r.mine` into `formatActor` in the "By" cell:

```tsx
                <TableCell className="text-xs">
                  {formatActor(
                    r.action_by_principal_type,
                    r.action_by_principal_id,
                    currentPrincipal,
                    r.mine
                  )}
                </TableCell>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest src/views/otcOptions/components/__tests__/NegotiationRevisionsTable.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/otcOptions/components/NegotiationRevisionsTable.tsx src/views/otcOptions/components/__tests__/NegotiationRevisionsTable.test.tsx
git commit -m "$(cat <<'EOF'
feat(otc): gate revision Accept and "You" label on mine/is_latest

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `OfferHistoryTable` labels "You" via `mine`

**Files:**
- Modify: `src/views/otcOptions/components/OfferHistoryTable.tsx`
- Test: Create `src/views/otcOptions/components/__tests__/OfferHistoryTable.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/views/otcOptions/components/__tests__/OfferHistoryTable.test.tsx`:

```typescript
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OfferHistoryTable } from '@/views/otcOptions/components/OfferHistoryTable'
import type { RevisionWithChain } from '@/views/otcOptions/hooks/useOtcOptionsLists'

function row(overrides: Partial<RevisionWithChain> = {}): RevisionWithChain {
  return {
    id: 1,
    negotiation_id: 5,
    revision_number: 1,
    action: 'BID',
    quantity: '10',
    strike_price: '150.00',
    premium: '7.50',
    settlement_date: '2026-07-01T00:00:00Z',
    action_by_principal_type: 'client',
    action_by_principal_id: 42,
    created_at: '2026-06-01T12:00:00Z',
    mine: false,
    is_latest: false,
    chain_id: 5,
    chain_bidder: { owner_type: 'client', owner_id: 42 },
    ...overrides,
  }
}

describe('OfferHistoryTable', () => {
  it('labels the actor "You" when mine is true', () => {
    renderWithProviders(<OfferHistoryTable revisions={[row({ mine: true })]} />)
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('renders the principal when mine is false', () => {
    renderWithProviders(<OfferHistoryTable revisions={[row({ mine: false })]} />)
    expect(screen.getByText('client-42')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest src/views/otcOptions/components/__tests__/OfferHistoryTable.test.tsx`
Expected: FAIL — the first case renders `client-42`, not `You` (no `currentPrincipal` passed and `mine` unused).

- [ ] **Step 3: Implement**

In `src/views/otcOptions/components/OfferHistoryTable.tsx`, update `actorLabel` to pass `mine`:

```typescript
function actorLabel(r: RevisionWithChain, currentPrincipal: OtcParty | null | undefined): string {
  return formatActor(r.action_by_principal_type, r.action_by_principal_id, currentPrincipal, r.mine)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest src/views/otcOptions/components/__tests__/OfferHistoryTable.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/otcOptions/components/OfferHistoryTable.tsx src/views/otcOptions/components/__tests__/OfferHistoryTable.test.tsx
git commit -m "$(cat <<'EOF'
feat(otc): OfferHistoryTable labels "You" via the mine flag

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Poster panel (`OfferActivityPanel`) — flag-driven buttons

**Files:**
- Modify: `src/views/otcOptions/components/OfferActivityPanel.tsx` (remove `isOwnerTurn` import L46; the `negotiations.map` block L158–219)
- Test: `src/views/otcOptions/__tests__/OfferActivityPanel.test.tsx`

- [ ] **Step 1: Rewrite the test to drive off flags**

Replace the whole body of `src/views/otcOptions/__tests__/OfferActivityPanel.test.tsx` with:

```typescript
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { OfferActivityPanel } from '@/views/otcOptions/components/OfferActivityPanel'
import { otcOptionsApi } from '@/views/otcOptions/api/otcOptionsApi'
import type { OtcNegotiation, OtcOptionRow, OtcParty } from '@/views/otcOptions/types'

jest.mock('@/views/otcOptions/api/otcOptionsApi', () => ({
  otcOptionsApi: {
    listNegotiations: jest.fn(),
    getOfferTimeline: jest.fn(),
    listNegotiationRevisions: jest.fn(),
    acceptNegotiation: jest.fn(),
    rejectNegotiation: jest.fn(),
    counter: jest.fn(),
    cancelListing: jest.fn(),
    updateListing: jest.fn(),
  },
}))

const bidder: OtcParty = { owner_type: 'client', owner_id: 5 }
const owner: OtcParty = { owner_type: 'bank', owner_id: null }

function makeOffer(overrides: Partial<OtcOptionRow> = {}): OtcOptionRow {
  return {
    id: 42,
    kind: 'local',
    bank_code: '111',
    ticker: 'AAPL',
    amount: '10',
    strike_price: '150.00',
    strike_currency: 'USD',
    premium: '5.00',
    premium_currency: 'USD',
    settlement_date: '2027-01-01',
    direction: 'sell_initiated',
    status: 'open',
    seller_id: 'bank',
    ...overrides,
  } as OtcOptionRow
}

function makeNeg(overrides: Partial<OtcNegotiation> = {}): OtcNegotiation {
  return {
    id: 7,
    parent_offer_id: 42,
    status: 'countered',
    bidder,
    quantity: '10',
    strike_price: '150.00',
    premium: '5.00',
    settlement_date: '2027-01-01',
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    viewer_role: 'poster',
    last_action_mine: false,
    awaiting_viewer: false,
    can_accept: false,
    can_counter: false,
    can_reject: false,
    can_withdraw: false,
    ...overrides,
  }
}

const defaultProps = {
  offer: makeOffer(),
  accounts: [],
  currentPrincipal: owner,
  onBack: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(otcOptionsApi.getOfferTimeline).mockResolvedValue({ offer: {}, timeline: [] })
  jest.mocked(otcOptionsApi.listNegotiationRevisions).mockResolvedValue({ revisions: [] })
})

describe('OfferActivityPanel — flag-driven buttons', () => {
  it('shows Accept/Counter/Reject when awaiting the viewer (can_* all true)', async () => {
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({
      negotiations: [
        makeNeg({
          awaiting_viewer: true,
          can_accept: true,
          can_counter: true,
          can_reject: true,
        }),
      ],
      total: 1,
    })

    renderWithProviders(<OfferActivityPanel {...defaultProps} />)

    expect(await screen.findByRole('button', { name: /^accept$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^counter$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^reject$/i })).toBeInTheDocument()
    expect(screen.queryByText(/waiting on bidder/i)).not.toBeInTheDocument()
  })

  it('keeps Reject but hides Accept/Counter when it is NOT the poster’s turn (can_reject only)', async () => {
    // Poster moved last → not their turn for accept/counter, but they may still
    // reject a live bid (can_reject == live && poster, not turn-gated).
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({
      negotiations: [
        makeNeg({
          last_action_mine: true,
          awaiting_viewer: false,
          can_accept: false,
          can_counter: false,
          can_reject: true,
        }),
      ],
      total: 1,
    })

    renderWithProviders(<OfferActivityPanel {...defaultProps} />)

    expect(await screen.findByRole('button', { name: /^reject$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^accept$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^counter$/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/waiting on bidder/i)).not.toBeInTheDocument()
  })

  it('shows the waiting hint and no action buttons when all flags are false', async () => {
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({
      negotiations: [makeNeg({ status: 'countered' })],
      total: 1,
    })

    renderWithProviders(<OfferActivityPanel {...defaultProps} />)

    expect(await screen.findByText(/waiting on bidder/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^accept$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^counter$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^reject$/i })).not.toBeInTheDocument()
    // Unilateral controls remain available regardless of turn.
    expect(screen.getByRole('button', { name: /see history/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel listing/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest src/views/otcOptions/__tests__/OfferActivityPanel.test.tsx`
Expected: FAIL — the panel still derives a single `canAct` via `isOwnerTurn`, so Reject won't appear in the "not your turn" case.

- [ ] **Step 3: Implement — replace the combined `canAct` gate with per-flag buttons**

In `src/views/otcOptions/components/OfferActivityPanel.tsx`:

(a) Remove the import line `import { isOwnerTurn } from '@/views/otcOptions/lib/turn'` (L46).

(b) Inside `negotiations.map((neg) => { ... })`, replace the `const isActive = ...; const canAct = ...` lines and the Actions `<div>` block. The new `const` lines:

```typescript
                const isActive = isNegotiationActive(neg.status)
                // Buttons key off the backend's per-caller flags directly:
                // accept/counter when it's the poster's turn (awaiting_viewer),
                // reject whenever the chain is live (can_reject is not
                // turn-gated). No client-side turn derivation.
                const showWaiting =
                  isActive && !neg.can_accept && !neg.can_counter && !neg.can_reject
```

(c) Replace the Actions cell's `{canAct ? (<>…</>) : (isActive && <span>…</span>)}` with independent flags:

```tsx
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end flex-wrap">
                            <Button size="sm" variant="ghost" onClick={() => setHistoryChain(neg)}>
                              See history
                            </Button>
                            {neg.can_accept && (
                              <Button
                                size="sm"
                                onClick={() => setAcceptingId(neg.id)}
                                disabled={accept.isPending}
                              >
                                Accept
                              </Button>
                            )}
                            {neg.can_counter && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCounteringId(neg.id)}
                                disabled={counter.isPending}
                              >
                                Counter
                              </Button>
                            )}
                            {neg.can_reject && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => reject.mutate(neg.id)}
                                disabled={reject.isPending}
                              >
                                Reject
                              </Button>
                            )}
                            {showWaiting && (
                              <span className="text-xs text-muted-foreground self-center">
                                Waiting on bidder
                              </span>
                            )}
                          </div>
                        </TableCell>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest src/views/otcOptions/__tests__/OfferActivityPanel.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/otcOptions/components/OfferActivityPanel.tsx src/views/otcOptions/__tests__/OfferActivityPanel.test.tsx
git commit -m "$(cat <<'EOF'
feat(otc): poster panel buttons key off can_accept/can_counter/can_reject

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Bidder panel (`BidderActivityPanel`) — flag-driven buttons

**Files:**
- Modify: `src/views/otcOptions/components/BidderActivityPanel.tsx` (remove `isCallerTurn, partiesMatch` import L27; `whoseTurn` derivation L63–67; `YourChainBody` L153–254)
- Test: `src/views/otcOptions/__tests__/BidderActivityPanel.test.tsx`

- [ ] **Step 1: Rewrite the test's turn cases to drive off flags**

Replace `makeNegotiation` in `src/views/otcOptions/__tests__/BidderActivityPanel.test.tsx` so it carries the flags (defaults all false; tests opt in):

```typescript
function makeNegotiation(overrides: Partial<OtcNegotiation> = {}): OtcNegotiation {
  return {
    id: 99,
    parent_offer_id: 999,
    offer_id: undefined,
    status: 'open',
    quantity: '5',
    strike_price: '175.00',
    premium: '10.00',
    settlement_date: '2027-01-01',
    kind: 'remote',
    viewer_role: 'bidder',
    last_action_mine: false,
    awaiting_viewer: false,
    can_accept: false,
    can_counter: false,
    can_reject: false,
    can_withdraw: false,
    ...overrides,
  } as OtcNegotiation
}
```

Then replace the four tests in `describe('BidderActivityPanel — isTerminal for remote chains', ...)` so they set flags instead of `last_action_by`:

```typescript
describe('BidderActivityPanel — flag-driven buttons', () => {
  it('shows Counter and Withdraw when it is the bidder’s turn (can_counter + can_withdraw)', async () => {
    const offer = makeOffer({ my_negotiation_id: 99 })
    const negotiation = makeNegotiation({
      id: 99,
      status: 'ongoing',
      awaiting_viewer: true,
      can_counter: true,
      can_withdraw: true,
    })

    jest
      .mocked(otcOptionsApi.listMyNegotiations)
      .mockResolvedValue({ negotiations: [negotiation], total: 1 })
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({ negotiations: [], total: 0 })

    renderWithProviders(<BidderActivityPanel {...defaultProps} offer={offer} />)
    expect(await screen.findByRole('button', { name: /counter/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /withdraw/i })).toBeInTheDocument()
  })

  it("accepts the seller's terms with the chosen acceptor account", async () => {
    const offer = makeOffer({ my_negotiation_id: 99 }) // resolveListingId → 42
    const negotiation = makeNegotiation({
      id: 99,
      status: 'ongoing',
      awaiting_viewer: true,
      can_accept: true,
      can_counter: true,
      can_withdraw: true,
    })
    jest
      .mocked(otcOptionsApi.listMyNegotiations)
      .mockResolvedValue({ negotiations: [negotiation], total: 1 })
    jest.mocked(otcOptionsApi.listNegotiationRevisions).mockResolvedValue({
      revisions: [
        {
          id: 11,
          negotiation_id: 99,
          revision_number: 2,
          action: 'COUNTER',
          quantity: '5',
          strike_price: '175.00',
          premium: '10.00',
          settlement_date: '2027-01-01T00:00:00Z',
          action_by_principal_type: 'seller',
          action_by_principal_id: null,
          created_at: '2026-06-01T12:00:00Z',
          mine: false,
          is_latest: true,
        },
      ],
    })
    jest.mocked(otcOptionsApi.acceptNegotiation).mockResolvedValue({ contract: { id: 1 } } as never)

    renderWithProviders(
      <BidderActivityPanel {...defaultProps} offer={offer} accounts={[account({ id: 7 })]} />
    )

    fireEvent.click(await screen.findByRole('button', { name: /^accept$/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm accept/i }))

    await waitFor(() =>
      expect(otcOptionsApi.acceptNegotiation).toHaveBeenCalledWith(42, 99, {
        acceptor_account_id: 7,
      })
    )
  })

  it('hides Counter but keeps Withdraw when it is NOT the bidder’s turn', async () => {
    const offer = makeOffer({ my_negotiation_id: 99 })
    // Bidder moved last → owner's turn. can_counter false, can_withdraw true.
    const negotiation = makeNegotiation({
      id: 99,
      status: 'ongoing',
      last_action_mine: true,
      awaiting_viewer: false,
      can_counter: false,
      can_withdraw: true,
    })
    jest
      .mocked(otcOptionsApi.listMyNegotiations)
      .mockResolvedValue({ negotiations: [negotiation], total: 1 })

    renderWithProviders(<BidderActivityPanel {...defaultProps} offer={offer} />)
    expect(await screen.findByRole('button', { name: /withdraw/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /counter/i })).not.toBeInTheDocument()
    expect(screen.getByText(/waiting on the other side/i)).toBeInTheDocument()
  })

  it('does not offer Accept when it is NOT the bidder’s turn (can_accept false)', async () => {
    const offer = makeOffer({ my_negotiation_id: 99 })
    const negotiation = makeNegotiation({
      id: 99,
      status: 'ongoing',
      last_action_mine: true,
      awaiting_viewer: false,
      can_accept: false,
      can_withdraw: true,
    })
    jest
      .mocked(otcOptionsApi.listMyNegotiations)
      .mockResolvedValue({ negotiations: [negotiation], total: 1 })
    jest.mocked(otcOptionsApi.listNegotiationRevisions).mockResolvedValue({
      revisions: [
        {
          id: 11,
          negotiation_id: 99,
          revision_number: 2,
          action: 'COUNTER',
          quantity: '5',
          strike_price: '175.00',
          premium: '10.00',
          settlement_date: '2027-01-01T00:00:00Z',
          action_by_principal_type: 'client',
          action_by_principal_id: 1,
          created_at: '2026-06-01T12:00:00Z',
          mine: true,
          is_latest: true,
        },
      ],
    })

    renderWithProviders(
      <BidderActivityPanel {...defaultProps} offer={offer} accounts={[account({ id: 7 })]} />
    )
    await screen.findByRole('button', { name: /withdraw/i })
    expect(screen.queryByRole('button', { name: /^accept$/i })).not.toBeInTheDocument()
  })

  it('hides Counter and Withdraw when the chain is terminal (accepted)', async () => {
    const offer = makeOffer({ my_negotiation_id: 99 })
    const negotiation = makeNegotiation({ id: 99, status: 'accepted' })

    jest
      .mocked(otcOptionsApi.listMyNegotiations)
      .mockResolvedValue({ negotiations: [negotiation], total: 1 })
    jest.mocked(otcOptionsApi.listNegotiations).mockResolvedValue({ negotiations: [], total: 0 })

    renderWithProviders(<BidderActivityPanel {...defaultProps} offer={offer} />)
    await screen.findByText(/your bidding history/i)
    expect(screen.queryByRole('button', { name: /counter/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /withdraw/i })).not.toBeInTheDocument()
  })
})
```

Leave the `describe('BidderActivityPanel — chain lookup', ...)` block unchanged (it tests chain resolution, not buttons; `makeNegotiation` now supplies flags by default).

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest src/views/otcOptions/__tests__/BidderActivityPanel.test.tsx`
Expected: FAIL — the panel still derives `canAct` via `isCallerTurn` and gates the in-table Accept via the seller heuristic.

- [ ] **Step 3: Implement**

In `src/views/otcOptions/components/BidderActivityPanel.tsx`:

(a) Change the import on L27 from:
```typescript
import { isCallerTurn, partiesMatch } from '@/views/otcOptions/lib/turn'
```
to (remove it entirely — no replacement import needed).

(b) Replace the `whoseTurn` derivation (L63–67) with a flag-based one driven by the chain. Since `whoseTurn` needs the chain, move it into `YourChainBody` (the parent no longer needs `partiesMatch`). Delete the parent `whoseTurn` block and remove `whoseTurn` from the `<YourChainBody .../>` props and the `YourChainBody` signature.

(c) In `YourChainBody`, replace the `isTerminal` / `canAct` lines:

```typescript
  const [showCounterForm, setShowCounterForm] = useState(false)
  const isTerminal = !isNegotiationActive(chain.status)
  // Whose move is it? Driven entirely by the backend's per-caller flags.
  const whoseTurn: 'you' | 'owner' | null = chain.awaiting_viewer
    ? 'you'
    : chain.last_action_mine
      ? 'owner'
      : null
```

(d) Replace the revisions table `accept` prop gate — change `accept={canAct ? { ... } : undefined}` to:

```tsx
            accept={chain.can_accept ? { accounts, pending: acceptPending, onAccept } : undefined}
```

(e) Replace the action block (`{!isTerminal && !showCounterForm && (...)}`) body so each button keys off its flag:

```tsx
      {!isTerminal && !showCounterForm && (
        <div className="space-y-2 pt-1">
          {!chain.awaiting_viewer && (
            <p className="text-xs text-muted-foreground">
              Waiting on the other side — you can counter or accept once they respond.
            </p>
          )}
          <div className="flex gap-2">
            {chain.can_counter && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowCounterForm(true)}
                disabled={counterPending}
              >
                Counter
              </Button>
            )}
            {chain.can_withdraw && (
              <Button
                size="sm"
                variant="destructive"
                onClick={onWithdraw}
                disabled={withdrawPending}
              >
                {withdrawPending ? 'Withdrawing…' : 'Withdraw'}
              </Button>
            )}
          </div>
        </div>
      )}
```

Note: the `whoseTurn` "Waiting on" Row at the top of `YourChainBody` (L195–197) stays — it now reads the flag-derived `whoseTurn`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest src/views/otcOptions/__tests__/BidderActivityPanel.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/otcOptions/components/BidderActivityPanel.tsx src/views/otcOptions/__tests__/BidderActivityPanel.test.tsx
git commit -m "$(cat <<'EOF'
feat(otc): bidder panel buttons key off can_counter/can_accept/can_withdraw

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Delete the now-dead `turn.ts`

**Files:**
- Delete: `src/views/otcOptions/lib/turn.ts`
- Delete: `src/views/otcOptions/lib/__tests__/turn.test.ts`

- [ ] **Step 1: Confirm no remaining importers**

Run: `git grep -n "lib/turn'" src/ ; git grep -n "isOwnerTurn\|isCallerTurn\|bidderMovedLast" src/`
Expected: only `src/views/otcOptions/lib/turn.ts` and `turn.test.ts` match (the panels no longer import them after Tasks 7–8). `useBidOrCounter.ts` defines its own private `partiesMatch` and does NOT import from `turn.ts`, so it is unaffected.

- [ ] **Step 2: Delete both files**

```bash
git rm src/views/otcOptions/lib/turn.ts src/views/otcOptions/lib/__tests__/turn.test.ts
```

- [ ] **Step 3: Verify type-check + the otcOptions suite are green**

Run: `npx tsc --noEmit && npx jest src/views/otcOptions`
Expected: PASS (no broken imports; all otcOptions tests pass).

- [ ] **Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
refactor(otc): drop client-side turn derivation now backend ships flags

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Cypress — keep fixtures faithful to the new response shape

**Files:**
- Audit: `cypress/e2e/otc-celina4.cy.ts`, `cypress/e2e/portfolio.cy.ts`
- Possibly modify: the `/negotiations` intercept bodies that feed the Activity panels

The change adds optional fields to the negotiations/revisions/timeline responses. No endpoint/version/path change, so intercept URLs are untouched. Per CLAUDE.md, mocked response bodies should still reflect what the backend now returns where a test reaches the panels.

- [ ] **Step 1: Audit which Cypress assertions reach the panel buttons**

Run: `git grep -n "Accept\|Counter\|Reject\|Withdraw\|negotiations" cypress/e2e/`
Expected finding (from current tree): Scenario 18's `Counter` assertion is a **marketplace-row** action keyed off `my_negotiation_id`, not a panel button — so it is unaffected. Scenario 16b stubs `/negotiations` with an empty array (no panel buttons). Confirm no test asserts Accept/Counter/Reject/Withdraw rendered from a populated `/negotiations` response.

- [ ] **Step 2: Add flags to any populated `/negotiations` intercept that feeds a panel**

If (and only if) Step 1 finds a test that populates `/otc/options/*/negotiations` AND asserts a panel button, add the matching flags to that negotiation object in the intercept body, e.g.:

```typescript
    cy.intercept('GET', '**/api/v3/otc/options/*/negotiations', {
      body: {
        negotiations: [
          {
            id: 7,
            status: 'countered',
            bidder_owner_type: 'client',
            bidder_owner_id: 5,
            quantity: '10',
            strike_price: '150.00',
            premium: '5.00',
            settlement_date: '2027-01-01',
            viewer_role: 'poster',
            awaiting_viewer: true,
            can_accept: true,
            can_counter: true,
            can_reject: true,
          },
        ],
        total: 1,
      },
    })
```

If Step 1 finds nothing (the expected outcome), make NO change and record that in the commit body. Do not invent assertions.

- [ ] **Step 3: Run the affected Cypress spec headless to confirm green**

Run: `npx cypress run --spec cypress/e2e/otc-celina4.cy.ts`
Expected: PASS. (If the environment can't run Cypress headless here, note that and defer to CI; do NOT mark this task complete on an unrun suite.)

- [ ] **Step 4: Commit (only if files changed)**

```bash
git add cypress/
git commit -m "$(cat <<'EOF'
test(otc): keep cypress negotiation fixtures faithful to action-hint flags

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Quality gates, spec, and final verification

**Files:**
- Modify: `specification.md`

- [ ] **Step 1: Code review**

Dispatch the `code-quality-enforcer` agent over the diff from this plan (Tasks 1–10). Address any logical-error / SOLID / DRY findings before continuing.

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: all suites pass (baseline was 235 suites / 1410 tests; expect the count to shift by the added/removed tests, all green).

- [ ] **Step 3: Coverage on the touched files**

Run: `npm test -- --coverage --collectCoverageFrom='src/views/otcOptions/**/*.{ts,tsx}'`
Expected: the new flag branches in both panels, the normalizers, the timeline mapping, `formatActor`, and both tables are covered.

- [ ] **Step 4: Lint + types**

Run: `npm run lint && npx tsc --noEmit`
Expected: zero violations.

- [ ] **Step 5: Format**

Run: `npx prettier --check "src/**/*.{ts,tsx}"`
If it reports unformatted files: `npx prettier --write "src/**/*.{ts,tsx}"` and re-check.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 7: Update `specification.md`**

Per the spec-maintenance rule, update:
- **Types & Interfaces** — `OtcNegotiation` gains `viewer_role`/`last_action_mine`/`awaiting_viewer`/`can_*`; `OtcNegotiationRevision` and `OtcTimelineEntry` gain `mine`/`is_latest`.
- **Components** — `OfferActivityPanel` / `BidderActivityPanel` now render buttons from backend flags; `NegotiationRevisionsTable` / `OfferHistoryTable` use `mine`/`is_latest`.
- **Project Structure** — remove `src/views/otcOptions/lib/turn.ts`.
- **Test Coverage** — re-run `npm test -- --coverage --coverageReporters=text` and update the table + `_Last updated_` date (2026-06-12).

- [ ] **Step 8: Commit the spec update**

```bash
git add specification.md
git commit -m "$(cat <<'EOF'
docs: update specification for flag-driven OTC negotiation buttons

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review (completed during authoring)

- **Spec coverage:** spec §1→Task 1; §2→Task 2; §3→Task 3; §4→Task 7; §5→Task 8; §6→Tasks 4/5/6; §7→Task 9; §8→Tasks 2/3/5/6/7/8; §9→Task 10. Verification section→Task 11. All sections mapped.
- **Placeholders:** none — every code step shows full code; the one conditional step (Task 10 §2) is explicitly gated on an audit result with a "make no change" branch, not a TODO.
- **Type consistency:** field names (`viewer_role`, `last_action_mine`, `awaiting_viewer`, `can_accept`, `can_counter`, `can_reject`, `can_withdraw`, `mine`, `is_latest`) are used identically across Tasks 1, 2, 3, 5, 6, 7, 8. `formatActor`'s new 4th param `mine?: boolean` (Task 4) matches its call sites (Tasks 5, 6).
