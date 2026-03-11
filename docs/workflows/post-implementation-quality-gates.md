# Post-Implementation Quality Gates

Run after every implementation commit, in order. Each gate that produces fixes gets its own commit.

---

## Gate 1 — Code Review

**Tool:** `code-quality-enforcer` agent

Check for:
- `useState`+`useEffect` for server data (should be TanStack Query)
- `any` types
- Missing role checks on admin features
- Side effects in `lib/api/`
- Components > 150 lines
- Missing loading/error states

**Commit prefix:** `review: fix [description]`

---

## Gate 2 — All Tests

```bash
npm test
```

Fix any failure. Use TDD for fixes.

**Commit prefix:** `fix: resolve failing tests`

---

## Gate 3 — Coverage

```bash
npm test -- --coverage
```

Fill gaps using TDD. Focus on uncovered branches and error paths.

**Commit prefix:** `test: add coverage for [description]`

---

## Gate 4 — Lint + Types

```bash
npm run lint
npx tsc --noEmit
```

Auto-fix where possible:
```bash
npm run lint -- --fix
```

**Commit prefix:** `style: fix lint violations`

---

## Gate 5 — Formatting

```bash
npx prettier --check "src/**/*.{ts,tsx}"
# Auto-fix:
npx prettier --write "src/**/*.{ts,tsx}"
```

**Commit prefix:** `style: fix formatting`

---

## Gate 6 — Build

```bash
npm run build
```

Must succeed with no errors or type warnings.

---

## Summary

| # | Gate | Command | Commit prefix |
|---|------|---------|---------------|
| 1 | Code Review | `code-quality-enforcer` agent | `review:` |
| 2 | All Tests | `npm test` | `fix:` |
| 3 | Coverage | `npm test -- --coverage` | `test:` |
| 4 | Lint + Types | `npm run lint` + `npx tsc --noEmit` | `style:` |
| 5 | Format | `npx prettier --check` | `style:` |
| 6 | Build | `npm run build` | — |

If a gate finds no issues, skip the commit for that gate.
