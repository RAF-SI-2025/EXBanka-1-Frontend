# Celina 4 — Roadmap & Decomposition

> **Index document.** This is not an implementation plan in itself — it splits Celina 4 into independent sub-features, ranks them, and links to the per-feature plans. Each sub-feature has (or will have) its own plan in `docs/superpowers/plans/`.

**Source spec:** `docs/Celina 4(Nova).md`

**Backend reference:** `docs/REST_API_v3.md` (sections 28, 29, 35, 36 are most relevant)

---

## Why a roadmap

Celina 4 mixes **five mostly-independent feature areas** into one document. Bundling them into a single plan would create a giant, slow-to-merge branch with a high chance of one stuck dependency blocking everything else. Splitting them lets us ship the pieces whose backends are ready, while UI work for the rest proceeds in parallel against agreed-upon contracts.

---

## Backend readiness audit (from `REST_API_v3.md`)

A feature is **green** if every backend endpoint it needs is documented in `REST_API_v3.md` today. **Yellow** = partially covered. **Red** = no endpoints yet.

| Sub-feature | Backend status | Endpoints found | Endpoints still needed |
|---|---|---|---|
| **Notifications (bell)** | 🟢 Green | §35: `GET /me/notifications`, `GET /me/notifications/unread-count`, `POST /me/notifications/:id/read`, `POST /me/notifications/read-all` | — (separate plan: `2026-04-28-notifications-bell.md`) |
| **OTC: discovery + buy** | 🟢 Green | §29: `GET /otc/offers`, `POST /otc/offers/:id/buy`, `POST /otc/offers/:id/buy-on-behalf`. §28-derived: `POST /me/portfolio/:id/make-public`, `POST /me/portfolio/:id/exercise` | — |
| **OTC: negotiations / counter-offers / options-contract entity** | 🔴 Red | None | Counter-offer create, list "active negotiations" by participant, accept/reject negotiation, contract list with status filter (`active`/`expired`), "exercise contract" lifecycle that deducts premium and triggers SAGA |
| **Investment Funds (Discovery / Detail / Create)** | 🔴 Red | None | `GET /funds`, `GET /funds/:id`, `POST /funds`, `POST /funds/:id/invest`, `POST /funds/:id/redeem`, `GET /me/funds`, `GET /funds/:id/positions` |
| **Securities portal — buy on behalf of bank/fund** | 🟡 Yellow | Existing `POST /me/orders` is single-account. Buy-on-behalf for OTC exists | New flag/field on order create: `on_behalf_of: 'bank' \| 'fund' \| 'self'`, `target_id` (bank account or fund id) |
| **My Portfolio → My Funds tab** | 🔴 Red | None | `GET /me/funds` (positions), `POST /funds/:id/invest`, `POST /funds/:id/redeem` |
| **Profit Banke portal: actuary performances** | 🟡 Yellow | §30 lists actuaries (`GET /actuaries`) but not realized profit | `GET /actuaries/profit` (or extend §30 with profit field) |
| **Profit Banke portal: bank fund positions** | 🔴 Red | None | `GET /funds/positions/bank` (or similar) + invest/redeem variant for bank actor |
| **Employees mgmt addendum: ownership transfer when supervisor permission removed** | 🔴 Red | None | Backend logic on permission removal endpoint; no new frontend route |

---

## Recommended build order

| # | Sub-feature | Why this order | Plan file |
|---|---|---|---|
| 1 | **Notifications (bell)** | Tiny, fully unblocked, immediately useful, exercises the same `me/*` URL pattern other sub-features will reuse. | [`2026-04-28-notifications-bell.md`](./2026-04-28-notifications-bell.md) |
| 2 | **OTC offers MVP** (discovery + buy + make-public + exercise) | Backend is 🟢. Lets us ship the OTC portal skeleton and validate the SAGA-pattern UX. The negotiation pieces can be added on top once backend exists. | [`2026-04-28-celina-4-otc-offers-mvp.md`](./2026-04-28-celina-4-otc-offers-mvp.md) |
| 3 | **Investment Funds — frontend scaffold** (Discovery, Detail, Create, My Funds tab) | Backend is 🔴 today, but the frontend can be designed and built against a typed mock API layer. When real endpoints land, only the API file and fixture JSON change — the components, hooks, routes, and tests stay. | [`2026-04-28-celina-4-investment-funds.md`](./2026-04-28-celina-4-investment-funds.md) |
| 4 | **Securities buy-on-behalf addendum** | Small change; depends on the new fund picker (#3). | _plan TBD after #3 spec_ |
| 5 | **Profit Banke portal** (Actuary Performances + Investment Funds Positions) | Depends on (#3) for the fund detail link target and on actuary-profit endpoint. | _plan TBD after #3 spec_ |
| 6 | **OTC negotiations / counter-offer flow** | Largest UX surface; needs the most backend work. | _plan TBD when backend contract is firm_ |

---

## Cross-cutting concerns (apply to every plan below)

**Routes added in this celina (proposed):**

| Route | Role | Page |
|---|---|---|
| `/otc` | client + employee with `otc.trade` perm | OTC offers discovery |
| `/otc/offers/:id` | same | OTC offer detail (read-only) |
| `/otc/contracts` | same (employee variant on negotiations) | "Active negotiations" + "Concluded contracts" tabs (phase 6) |
| `/funds` | client + employee | Funds discovery |
| `/funds/new` | supervisor only | Create fund (phase 3) |
| `/funds/:id` | client + employee | Fund detail |
| `/portfolio?tab=funds` | client + supervisor | "My Funds" tab on portfolio page |
| `/admin/profit/actuaries` | supervisor only | Actuary Performances (phase 5) |
| `/admin/profit/funds` | supervisor only | Bank Fund Positions (phase 5) |

**Sidebar additions (proposed):**

| Section | Item | Route | Visibility |
|---|---|---|---|
| Trading (client + employee) | "OTC Market" | `/otc` | `otc.trade` permission |
| Trading | "Funds" | `/funds` | always (read-only for non-trading) |
| Settings (admin only) — new "Bank Profit" section | "Actuary Profit" | `/admin/profit/actuaries` | supervisor or admin |
| Bank Profit | "Fund Positions" | `/admin/profit/funds` | supervisor or admin |

**Permission keys (proposed; coordinate with backend on naming):**
- `otc.trade` — list/buy OTC offers, post own holdings as public
- `otc.trade.accept` — already exists per §29
- `funds.invest` — client invest/redeem
- `funds.manage` — supervisor create + manage funds
- `funds.bank-invest` — supervisor invest on behalf of the bank
- `bank-profit.read` — supervisor view profit/positions

---

## Deliverables checklist (used by each sub-plan)

Every Celina 4 sub-plan ends with the same gate as Notifications:

- [ ] All affected routes added in `src/App.tsx`
- [ ] Sidebar updated for both `ClientNav` and `EmployeeNav`
- [ ] All gates pass: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`
- [ ] `specification.md` updated (Project Structure, Routes, State Management, API Layer, Hooks, Test Coverage)
- [ ] If any new endpoint, fixture, or JWT shape was used in tests, update Cypress (`grep -rE "/api/v[0-9]" cypress/` clean) per CLAUDE.md
- [ ] Component files all under 150 lines (CLAUDE.md cap)

---

## Open questions to resolve before starting #6 (OTC negotiations)

1. Does the backend track an "options contract" entity separate from "offer", or is offer + status the same row? (frontend will model whichever is chosen)
2. How are unread negotiations marked? Spec proposes `lastEntranceTimestamp` (Discord-style) OR `modifiedBy != currentUser`. Pick one — affects API + UI.
3. What's the rollback UX when a SAGA step fails after the user clicked "Exercise"? (toast? dedicated error page? retry button?)

These don't block #1–#5 but should be locked before sinking time into #6.
