interface InfoEntry {
  label: string
  value: string
}

interface SecurityInfoPanelProps {
  entries: InfoEntry[]
  title?: string
}

export function SecurityInfoPanel({ entries, title }: SecurityInfoPanelProps) {
  return (
    <div className="rounded-lg border p-4">
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        {entries.map((entry) => (
          <div key={entry.label} className="flex justify-between">
            <dt className="text-sm text-muted-foreground">{entry.label}</dt>
            <dd className="text-sm font-medium">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
