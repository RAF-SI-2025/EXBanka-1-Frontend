const RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'At most 32 characters', test: (v: string) => v.length <= 32 },
  { label: 'At least 2 numbers', test: (v: string) => (v.match(/\d/g) ?? []).length >= 2 },
  { label: 'At least 1 uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'At least 1 lowercase letter', test: (v: string) => /[a-z]/.test(v) },
]

export function PasswordRequirements({ value }: { value: string }) {
  return (
    <ul className="mt-2 space-y-1">
      {RULES.map((rule) => {
        const met = value.length > 0 && rule.test(value)
        return (
          <li
            key={rule.label}
            className={`text-xs flex items-center gap-1 ${met ? 'text-green-600' : 'text-destructive'}`}
          >
            {met ? '✓' : '✗'} {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
