# OTC Negotiation Buttons — Drive Visibility from Backend Flags

_Design spec · 2026-06-12_

## Problem

OTC option negotiation buttons (Accept / Counter / Reject / Withdraw) currently
have their visibility derived **client-side** from turn rules in
`src/views/otcOptions/lib/turn.ts` (`isOwnerTurn` for the poster panel,
`isCallerTurn` for the bidder panel), comparing `last_action_by` against the
chain's `bidder` / the caller's identity. This re-implements the backend's
turn-guard in the FE and defaults **permissive** ("turn unknown ⇒ show button"),
so it can offer an action the backend then rejects with a 409.

The backend now ships authoritative, per-caller action hints. The FE should
render buttons directly from those flags and stop re-deriving turn rules.

## Backend contract (REST_API_v3 §47.2)

**On each negotiation** (`GET /me/otc/options/negotiations` **and**
`GET /otc/options/:id/negotiations`) — omitted-when-false, treat absent as
`false`:

| Field | Meaning |
|---|---|
| `viewer_role` | `"bidder"` \| `"poster"` \| `""` (caller is neither) |
| `last_action_mine` | caller authored the chain's latest revision (counterparty's turn) |
| `awaiting_viewer` | caller's turn — chain live (`open`/`countered`) AND other side moved last |
| `can_accept` | `== awaiting_viewer` |
| `can_counter` | `== awaiting_viewer` (turn-based) |
| `can_reject` | live AND `viewer_role == "poster"` — **NOT turn-gated** |
| `can_withdraw` | live AND `viewer_role == "bidder"` |

**On each revision / timeline entry**
(`GET /me/otc/options/negotiations/:nid/revisions` and
`GET /otc/options/:id/timeline`):

| Field | Meaning |
|---|---|
| `mine` | caller authored this revision |
| `is_latest` | chain's most recent revision (per-chain in the merged timeline) |

FE derivation: show **Accept + Counter** when `awaiting_viewer`; **Withdraw**
when `can_withdraw`; **Reject** when `can_reject`; otherwise "waiting for
counterparty". In a revision table, Accept attaches to the latest revision that
is not `mine`.

## Decisions

1. **Trust the flags fully.** Render strictly from `can_*` / `awaiting_viewer`;
   absent ⇒ hidden. Remove the local turn derivation from the panels. The
   backend stays the single source of turn truth.
2. **Adopt `mine` / `is_latest`** in the revision/timeline tables (not only the
   panel buttons).
3. **`mine` wins, keep `currentPrincipal`.** Tables label "You" from `mine` when
   set; `currentPrincipal` remains the fallback path inside `formatActor`. No
   downstream `currentPrincipal` threading is removed — minimal blast radius.
4. **Reject follows the doc exactly.** Reject shows whenever `can_reject`
   (live + poster), independent of turn; Accept/Counter only when
   `awaiting_viewer`. The three buttons are no longer one combined gate.

## Changes

### 1. Types — `src/views/otcOptions/types.ts`
- `OtcNegotiation`: add `viewer_role: '' | 'bidder' | 'poster'`,
  `last_action_mine: boolean`, `awaiting_viewer: boolean`,
  `can_accept: boolean`, `can_counter: boolean`, `can_reject: boolean`,
  `can_withdraw: boolean` (normalized to concrete values, never `undefined`).
- `OtcNegotiationRevision`: add `mine: boolean`, `is_latest: boolean`.
- `OtcTimelineEntry`: add `mine?: boolean`, `is_latest?: boolean` (wire-optional).

### 2. API normalization — `api/otcOptionsApi.ts`
- `RawNegotiation` / `RawRevision` gain the optional wire fields.
- `normalizeNegotiation` passes the flags through, defaulting each absent flag
  to `false` and `viewer_role` to `''`. Applies to `listNegotiations` and
  `listMyNegotiations` (and the bid/counter/accept/reject single-row responses,
  which reuse `normalizeNegotiation`).
- `normalizeRevision` passes `mine ?? false`, `is_latest ?? false`.

### 3. Timeline mapping — `hooks/useOtcOptionsLists.ts`
- `RevisionWithChain` carries `mine` / `is_latest`; the timeline `.map` reads
  `e.mine ?? false`, `e.is_latest ?? false`.

### 4. Poster panel — `components/OfferActivityPanel.tsx`
- Drop `isOwnerTurn`. Per chain, render each button off its own flag:
  **Accept** when `neg.can_accept`, **Counter** when `neg.can_counter`,
  **Reject** when `neg.can_reject`. Show "Waiting on bidder" when the chain is
  active but none of the three apply (`!awaiting_viewer && !can_reject`).

### 5. Bidder panel — `components/BidderActivityPanel.tsx`
- Drop `isCallerTurn` / `partiesMatch`. Derive `whoseTurn` from
  `awaiting_viewer` (→ "you") / `last_action_mine` (→ "owner"). Render
  **Counter** when `chain.can_counter`; pass the in-table **Accept** config when
  `chain.can_accept`; render **Withdraw** when `chain.can_withdraw`. Show
  "Waiting on the other side" when `!awaiting_viewer`.

### 6. Revision/timeline tables
- `lib/actor.ts`: `formatActor` gains an optional trailing `mine?: boolean`;
  when `true`, returns `"You"` (short-circuits before principal matching).
- `NegotiationRevisionsTable`: label "By" via `r.mine`; gate the in-table Accept
  button on `r.is_latest && !r.mine` (replaces the
  `action_by_principal_type === 'seller'` heuristic).
- `OfferHistoryTable`: label "By" via `r.mine`.

### 7. Delete dead code
- Remove `src/views/otcOptions/lib/turn.ts` and
  `src/views/otcOptions/lib/__tests__/turn.test.ts`. Confirmed: the only
  importers are the two panels (`useBidOrCounter.ts` has its own private
  `partiesMatch`, not an import).

### 8. Tests & fixtures (TDD)
- `src/__tests__/fixtures/otcOption-fixtures.ts`: add the new flags to
  negotiation/revision/timeline factories (with helpers to set turn state).
- Rewrite button-visibility cases in `OfferActivityPanel.test.tsx` and
  `BidderActivityPanel.test.tsx` to drive off the flags (not `last_action_by`):
  - awaiting_viewer ⇒ Accept + Counter visible.
  - poster, not their turn ⇒ Reject visible, Accept/Counter hidden.
  - bidder, live ⇒ Withdraw visible; Counter/Accept only when `can_counter`/`can_accept`.
  - all flags false ⇒ "waiting" message, no action buttons.
- Add `normalizeNegotiation` / `normalizeRevision` coverage for flag pass-through
  and absent ⇒ `false` defaulting in `otcOption.test.ts` (or the api test file).
- Tables: `mine` ⇒ "You"; Accept attaches to `is_latest && !mine` revision.
- Delete `turn.test.ts`.

### 9. Cypress (mandatory on response-shape change)
- This adds fields to the negotiations/revisions/timeline response shapes. Audit
  `cypress/e2e/otc-*.cy.ts` for tests that exercise these buttons; update the
  relevant `cypress/fixtures/*` so the mocked responses carry the flags the
  buttons now key off. No endpoint/version/path change, so intercept URLs are
  unaffected.

## Out of scope
- `me_owner` / `minted_contract_id` on `OtcNegotiation` (not needed for buttons).
- Optimistic updates of the flags after a mutation (we already invalidate and
  refetch, which returns fresh flags).

## Verification
Post-implementation quality gates per CLAUDE.md: `npm test`, coverage on new
paths, `npm run lint`, `npx tsc --noEmit`, prettier check, `npm run build`.
Update `specification.md` (types, components, test coverage) per the spec-maintenance rule.
