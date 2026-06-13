# Environments & How to Test

This document explains how the frontend selects its API host and how to run / build the app against each backend.

## TL;DR

| Goal | Command | API host |
|---|---|---|
| Dev against local backend (default) | `npm run dev` | `http://localhost:8080` |
| Dev against bytenity backend | `npm run dev -- --mode production` | `https://bytenity.com` |
| One-off override | `VITE_API_HOST=https://bytenity.com npm run dev` | (whatever you set) |
| Production build | `npm run build` | `https://bytenity.com` |
| Preview the production build locally | `npm run build && npm run preview` | `https://bytenity.com` |

**Do not edit `.env.development` or `.env.production` to switch backends.** Those files are checked in and represent the canonical hosts. Use `--mode` or an inline env var instead.

## How Vite picks the env file

Vite loads exactly one `.env.<mode>` file based on the `--mode` flag (or the default for the command):

- `vite` / `vite dev` → `mode = "development"` → loads `.env.development`
- `vite build` / `vite preview` → `mode = "production"` → loads `.env.production`
- `vite --mode <name>` → loads `.env.<name>`

Only variables prefixed with `VITE_` are exposed to the client bundle. We currently expose one:

```
VITE_API_HOST=<scheme>://<host>[:<port>]
```

The Axios base URL is derived from this in `src/lib/api/` and pinned to `/api/v3`.

## The two checked-in env files

```
.env.development   # VITE_API_HOST=http://localhost:8080
.env.production    # VITE_API_HOST=https://bytenity.com
```

If you want a third target (e.g. a staging server) without touching the existing two, create a new mode file and run with `--mode <name>`:

```
.env.staging       # VITE_API_HOST=https://staging.example.com
```

```sh
npm run dev -- --mode staging
```

## Common scenarios

### "I want to develop against my locally running backend"
```sh
npm run dev
```
This is the default. Start your backend on `:8080` first.

### "I want to develop against the bytenity backend"
```sh
npm run dev -- --mode production
```
HMR / fast refresh still work — only the API host changes.

### "I'm running Cypress tests against bytenity"
Cypress intercepts use the host-agnostic glob `**/api/v3/...` so the same suite works against either backend. Just point the dev server at the host you want first:

```sh
npm run dev -- --mode production   # in one terminal
npm run cypress                    # in another
```

### "I want to override the host without changing files or modes"
```sh
VITE_API_HOST=https://my-branch.bytenity.com npm run dev
```
Inline env vars take precedence over `.env.*` files.

## What NOT to do

- ❌ **Do not commit changes to `.env.development` / `.env.production`** that swap the host. They are the source of truth and are read by CI as well as by developers.
- ❌ **Do not introduce a `.env.local`** that points at bytenity. `.env.local` overrides every mode silently and will confuse the next person who clones the repo.
- ❌ **Do not hardcode `http://localhost:8080` or `https://bytenity.com`** anywhere in the source. Always read from `import.meta.env.VITE_API_HOST` (or, in practice, the Axios instance that already does this).

## Verifying the active host

Before reporting "it works on localhost but not on bytenity," confirm which host the app is actually talking to:

1. DevTools → Network → look at the Request URL of any `/api/v3/...` call.
2. Or in the console: `import.meta.env.VITE_API_HOST` (only visible from a module loaded by Vite).
