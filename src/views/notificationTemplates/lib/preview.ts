import type { TemplateVariable } from '@/views/notificationTemplates/types'

const TOKEN_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g

// Substitute every {{var}} in `text` with the variable's `example` value, so
// the editor can show admins how a saved template will render at send time.
// Unknown tokens are kept verbatim (with their braces) so the live preview
// surfaces typos instead of silently dropping them.
export function renderPreview(text: string, variables: TemplateVariable[]): string {
  if (!text) return ''
  const lookup = new Map(variables.map((v) => [v.name, v.example]))
  return text.replace(TOKEN_RE, (match, name) => {
    const value = lookup.get(name)
    return value == null ? match : value
  })
}

// Returns the names of every {{var}} referenced in `text` that is NOT in the
// template's supported variable set. Mirrors the backend's PUT validation so
// the user sees the problem before they click Save.
export function findUnknownVariables(text: string, variables: TemplateVariable[]): string[] {
  if (!text) return []
  const allowed = new Set(variables.map((v) => v.name))
  const unknown = new Set<string>()
  for (const m of text.matchAll(TOKEN_RE)) {
    const name = m[1]
    if (!allowed.has(name)) unknown.add(name)
  }
  return Array.from(unknown)
}
