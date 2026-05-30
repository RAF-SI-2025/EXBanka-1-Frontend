import { Label } from '@/components/ui/label'
import type { RecurringOrderInterval } from '@/types/recurringOrder'

interface ScheduleOrderFieldsProps {
  schedule: boolean
  onScheduleChange: (checked: boolean) => void
  frequency: RecurringOrderInterval
  onFrequencyChange: (value: RecurringOrderInterval) => void
}

export function ScheduleOrderFields({
  schedule,
  onScheduleChange,
  frequency,
  onFrequencyChange,
}: ScheduleOrderFieldsProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          aria-label="Schedule order"
          checked={schedule}
          onChange={(e) => onScheduleChange(e.target.checked)}
        />
        Schedule order
      </label>

      {schedule && (
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <select
            id="frequency"
            aria-label="Frequency"
            className="w-full border rounded px-3 py-2 text-sm mt-1"
            value={frequency}
            onChange={(e) => onFrequencyChange(e.target.value as RecurringOrderInterval)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}
    </div>
  )
}
