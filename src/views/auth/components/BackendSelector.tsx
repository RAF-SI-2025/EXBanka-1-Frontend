import { useState } from 'react'
import { Server } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormField } from '@/components/shared/FormField'
import {
  BACKEND_PRESETS,
  CUSTOM_PRESET_ID,
  getCurrentSelection,
  setSelection,
  type BackendPresetId,
} from '@/lib/api/backendHost'

interface BackendSelectorProps {
  onHostChange?: (host: string) => void
  className?: string
}

export function BackendSelector({ onHostChange, className }: BackendSelectorProps) {
  const initial = getCurrentSelection()
  const [presetId, setPresetId] = useState<BackendPresetId>(initial.presetId)
  const [customUrl, setCustomUrl] = useState<string>(initial.customUrl)
  const [error, setError] = useState<string | null>(null)

  const handlePresetChange = (next: BackendPresetId) => {
    setPresetId(next)
    setError(null)
    if (next === CUSTOM_PRESET_ID) {
      // Wait for the user to enter / Apply the URL — don't persist yet.
      return
    }
    try {
      setSelection({ presetId: next })
      const host = BACKEND_PRESETS.find((p) => p.id === next)?.baseUrl ?? ''
      onHostChange?.(host)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save selection')
    }
  }

  const handleApplyCustom = () => {
    try {
      setSelection({ presetId: CUSTOM_PRESET_ID, customUrl })
      onHostChange?.(customUrl.replace(/\/+$/, ''))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid URL')
    }
  }

  return (
    <div className={className}>
      <Label htmlFor="backend-selector" className="flex items-center gap-1.5 mb-1">
        <Server className="size-4" aria-hidden />
        Backend
      </Label>
      <Select value={presetId} onValueChange={(v) => v && handlePresetChange(v as BackendPresetId)}>
        <SelectTrigger id="backend-selector" className="w-full">
          <SelectValue>
            {(value: string) => BACKEND_PRESETS.find((p) => p.id === value)?.label ?? value}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          className="w-auto max-w-[min(95vw,40rem)] min-w-[min(95vw,32rem)] overflow-x-visible"
        >
          {BACKEND_PRESETS.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {presetId === CUSTOM_PRESET_ID && (
        <div className="mt-2 space-y-1.5">
          <FormField label="Custom backend URL" id="backend-custom-url" error={error ?? undefined}>
            <div className="flex gap-2">
              <Input
                id="backend-custom-url"
                type="url"
                placeholder="https://my-backend.example.com"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={handleApplyCustom}>
                Apply
              </Button>
            </div>
          </FormField>
        </div>
      )}

      {presetId !== CUSTOM_PRESET_ID && error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
