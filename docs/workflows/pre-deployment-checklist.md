# Pre-Deployment Checklist

Run before declaring any feature complete or ready for deployment.

---

## Quality Gates (ALL must pass)

```bash
# 1. Tests
npm test

# 2. TypeScript
npx tsc --noEmit

# 3. Lint
npm run lint

# 4. Formatting
npx prettier --check "src/**/*.{ts,tsx}"

# 5. Build
npm run build
```

**One-liner:**
```bash
npm test && npx tsc --noEmit && npm run lint && npx prettier --check "src/**/*.{ts,tsx}" && npm run build && echo "✅ ALL CHECKS PASSED"
```

---

## Pass Criteria

- [ ] `npm test` — all tests pass
- [ ] `npx tsc --noEmit` — zero type errors
- [ ] `npm run lint` — zero lint errors
- [ ] `npx prettier --check` — all files formatted
- [ ] `npm run build` — build succeeds

---

## Architecture Checks (manual)

- [ ] No `any` type in new code (`grep -r ": any" src/`)
- [ ] No `useState`+`useEffect` for data fetching
- [ ] All admin-only UI has role check
- [ ] All routes have auth protection
- [ ] New API functions are in `lib/api/` and are pure
- [ ] New types are in `types/` (not inline in components)

---

## Common Fixes

```bash
# Auto-fix lint issues
npm run lint -- --fix

# Auto-fix formatting
npx prettier --write "src/**/*.{ts,tsx}"

# Check TypeScript in specific file
npx tsc --noEmit --strict src/components/SomeComponent.tsx
```
