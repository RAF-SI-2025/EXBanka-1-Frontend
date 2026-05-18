import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { CreateFundPayload } from '@/types/fund'

interface CreateFundFormProps {
  onSubmit: (payload: CreateFundPayload) => void
  submitting: boolean
}

const DECIMAL_RE = /^\d+(\.\d{1,2})?$/

export function CreateFundForm({ onSubmit, submitting }: CreateFundFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [minimum, setMinimum] = useState('')
  const [touched, setTouched] = useState(false)

  const nameError = touched && name.trim().length === 0 ? 'Name is required.' : null
  const minimumError =
    touched && minimum.length > 0 && !DECIMAL_RE.test(minimum)
      ? 'Use a decimal value (e.g. 1000.00).'
      : null

  const isValid = name.trim().length > 0 && (minimum.length === 0 || DECIMAL_RE.test(minimum))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    const payload: CreateFundPayload = { name: name.trim() }
    if (description.trim()) payload.description = description.trim()
    if (minimum) payload.minimum_contribution_rsd = minimum
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <Label htmlFor="fund-name">Name</Label>
        <Input
          id="fund-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(nameError)}
        />
        {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
      </div>
      <div>
        <Label htmlFor="fund-description">Description</Label>
        <Input
          id="fund-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="fund-minimum">Minimum contribution (RSD)</Label>
        <Input
          id="fund-minimum"
          inputMode="decimal"
          value={minimum}
          onChange={(e) => setMinimum(e.target.value)}
          placeholder="0.00"
          aria-invalid={Boolean(minimumError)}
        />
        {minimumError && <p className="text-xs text-destructive mt-1">{minimumError}</p>}
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create fund'}
      </Button>
    </form>
  )
}
