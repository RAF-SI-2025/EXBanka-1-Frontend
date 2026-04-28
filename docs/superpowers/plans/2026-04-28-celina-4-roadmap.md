# Celina 4 — Roadmap & Decomposition

> **Index document.** This is not an implementation plan in itself — it splits Celina 4 into independent sub-features, ranks them, and links to the per-feature plans. Each sub-feature has (or will have) its own plan in `docs/superpowers/plans/`.

> _Updated 2026-04-29_ — backend has landed for **every** Celina 4 area (`REST_API_v3.md` §29 OTC option contracts, §30 Investment Funds, §31 actuaries `/performance`, §28 stock-public OTC). The readiness table below is now all 🟢. The corresponding sub-plans have been re-scoped against the real contracts.

**Source spec:** `docs/Celina 4(Nova).md`

**Backend reference:** `docs/REST_API_v3.md` (sections 27, 28, 29, 30, 31, 36 are most relevant)

---

## Why a roadmap

Celina 4 mixes **five mostly-independent feature areas** into one document. Bundling them into a single plan would create a giant, slow-to-merge branch with a high chance of one stuck dependency blocking everything else. Splitting them lets us ship each area independently against agreed-upon contracts.

---

## Backend readiness audit (from `REST_API_v3.md` as of 2026-04-29)

A feature is **green** if every backend endpoint it needs is documented in `REST_API_v3.md` today. **Yellow** = partially covered. **Red** = no endpoints yet.

| Sub-feature | Backend status | Endpoints |
|---|---|---|
| **Notifications (bell)** | 🟢 Green | §36 — already shipped (`docs/superpowers/plans/2026-04-28-notifications-bell.md`) |
| **OTC: stock-public discovery + buy** | 🟢 Green | §28: `GET /otc/offers`, `POST /otc/offers/:id/buy`, `POST /otc/offers/:id/buy-on-behalf`. §27 portfolio: `make-public`, `exercise` |
| **OTC: option-contract negotiations (counter / accept / reject)** | 🟢 Green | §29: `POST /otc/offers`, `POST /otc/offers/:id/counter`, `/accept`, `/reject`, `GET /otc/offers/:id`, `GET /me/otc/offers` (with revisions) |
| **OTC: option-contract exercise + listing** | 🟢 Green | §29: `POST /otc/contracts/:id/exercise`, `GET /otc/contracts/:id`, `GET /me/otc/contracts` |
| **Investment Funds — Discovery / Detail / Create** | 🟢 Green | §30: `GET /investment-funds`, `GET /investment-funds/:id`, `POST /investment-funds`, `PUT /investment-funds/:id` |
| **Investment Funds — Invest / Redeem / My Funds** | 🟢 Green | §30: `POST /investment-funds/:id/invest`, `/redeem`, `GET /me/investment-funds` |
| **Securities portal — buy on behalf of bank/fund** | 🟡 Yellow | §29 buy-on-behalf for OTC exists; equivalent for §26 standard orders may need a follow-up if the existing `POST /me/orders` doesn't expose `on_behalf_of_type`. Confirm before scoping. |
| **Profit Banke — Investment Funds Positions** | 🟢 Green | §30: `GET /investment-funds/positions` (requires `funds.bank-position-read`) |
| **Profit Banke — Actuary Performances** | 🟢 Green | §31: `GET /actuaries/performance` (requires `actuaries.read.all`) |
| **Employees mgmt addendum: ownership transfer when supervisor permission removed** | 🟡 Yellow | Backend logic; no new frontend route. Frontend update is just a confirmation dialog text change when an admin removes `isSupervisor` from a fund manager. |

---

## Sub-plans

| Phase | Sub-feature | Plan file | Status |
|---|---|---|---|
| 0 | Notifications (bell) | [`2026-04-28-notifications-bell.md`](./2026-04-28-notifications-bell.md) | ✅ Shipped on `feature/notifications-bell` |
| 1 | OTC Offers MVP (stock-public §28) | [`2026-04-28-celina-4-otc-offers-mvp.md`](./2026-04-28-celina-4-otc-offers-mvp.md) | Ready to execute |
| 2 | OTC Option Contracts (§29 negotiations) | [`2026-04-29-celina-4-otc-option-contracts.md`](./2026-04-29-celina-4-otc-option-contracts.md) | Ready to execute |
| 3 | Investment Funds (§30) | [`2026-04-28-celina-4-investment-funds.md`](./2026-04-28-celina-4-investment-funds.md) | Ready to execute |
| 4 | Profit Banke portal | [`2026-04-29-celina-4-profit-banke.md`](./2026-04-29-celina-4-profit-banke.md) | Ready to execute (depends on phase 3 for the fund-detail link target) |
| 5 | Securities portal — buy-on-behalf addendum | _stub — write after backend confirms `on_behalf_of_type` on `POST /me/orders`_ | Blocked on a small backend confirmation |

---

## Recommended build order

1. **OTC Offers MVP** (phase 1) — already mostly built; just routing + employee buy-on-behalf + Cypress. Safe warm-up.
2. **Investment Funds** (phase 3) — biggest feature. Discovery, Detail, Create, My Funds tab, Invest / Redeem dialogs. Other phases depend on the routing and link targets from this one.
3. **Profit Banke** (phase 4) — small read-only supervisor portal once Funds detail exists.
4. **OTC Option Contracts** (phase 2) — heaviest UX (negotiation thread, revisions, accept/reject/exercise). Coordinates with Funds for the bank-as-counterparty case.
5. **Securities buy-on-behalf** (phase 5) — small follow-up to wire the supervisor "buy for fund" addendum from spec §"Dodatak za Hartije od vrednosti".

---

## Cross-cutting concerns (apply to every plan below)

**Routes added in this celina (proposed):**

| Route | Role | Page |
|---|---|---|
| `/otc` | client + employee with `securities.trade` + `otc.trade` | OTC offers discovery (combined §28 stock-public + §29 option-contract feed) |
| `/otc/offers/:id` | same | OTC offer detail with negotiation history |
| `/otc/contracts` | same | "Active contracts" + "Concluded contracts" tabs |
| `/otc/contracts/:id` | same | Contract detail with Exercise CTA |
| `/funds` | client + employee | Funds discovery |
| `/funds/new` | supervisor only (`funds.manage`) | Create fund |
| `/funds/:id` | client + employee | Fund detail |
| `/portfolio?tab=funds` | client + supervisor | "My Funds" tab on portfolio page |
| `/admin/profit/actuaries` | supervisor (`actuaries.read.all`) | Actuary Performances |
| `/admin/profit/funds` | supervisor (`funds.bank-position-read`) | Bank Fund Positions |

**Sidebar additions (proposed):**

| Section | Item | Route | Visibility |
|---|---|---|---|
| Trading (client + employee) | "OTC Market" | `/otc` | `securities.trade` permission |
| Trading | "OTC Contracts" | `/otc/contracts` | `securities.trade` |
| Trading | "Funds" | `/funds` | always (read-only for non-trading) |
| Trading | "Create Fund" | `/funds/new` | `funds.manage` |
| Settings — new "Bank Profit" group (supervisors only) | "Actuary Profit" | `/admin/profit/actuaries` | `actuaries.read.all` |
| Bank Profit | "Fund Positions" | `/admin/profit/funds` | `funds.bank-position-read` |

**Permission keys (confirmed against backend):**
- `securities.trade` — list/place orders, post own holdings as public, OTC trade actions
- `otc.trade` — required (with `securities.trade`) for §29 OTC negotiation actions
- `otc.trade.accept` — already exists per §28 buy-on-behalf
- `funds.manage` — supervisor create + manage funds
- `funds.bank-position-read` — supervisor view bank's own fund positions
- `actuaries.read.all` — supervisor view actuary performance feed

---

## Deliverables checklist (used by each sub-plan)

Every Celina 4 sub-plan ends with the same gate as Notifications:

- [ ] All affected routes added in `src/App.tsx`
- [ ] Sidebar updated for both `ClientNav` and `EmployeeNav`
- [ ] All gates pass: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`
- [ ] `specification.md` updated (Project Structure, Routes, State Management, API Layer, Hooks, Test Coverage)
- [ ] Cypress fixtures updated; `grep -rE "/api/v[0-9]" cypress/` clean (no stale versions)
- [ ] Component files all under 150 lines (CLAUDE.md cap)
- [ ] **Error handling mandate:** every new query/mutation either uses the global toast OR has a deliberate inline error UX (CLAUDE.md "Standardized Error Handling")

---

## Open questions to resolve (down to one)

1. **Securities buy-on-behalf payload.** Does `POST /me/orders` accept `on_behalf_of_type: 'self' | 'bank' | 'fund'` + a `target_id`? If yes, phase 5 is a straight UI addition (extend `CreateOrderForm` with a fund picker). If no, backend needs that field before phase 5 can ship. **Action:** confirm with backend team before starting phase 5.

(Previous open questions about negotiation entity shape and unread-marking convention are now resolved by §29: contracts are first-class — `OptionContract` separate from `OTCOffer` — and unread is exposed as `unread: bool` on the offer in `GET /me/otc/offers`.)
