import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useSetCardPin } from '@/hooks/useCards'
import { notifySuccess, notifyError } from '@/lib/errors'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardId: number
}

const PIN_RE = /^\d{4}$/

export function SetCardPinDialog({ open, onOpenChange, cardId }: Props) {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const setPinMutation = useSetCardPin()

  const isValid = PIN_RE.test(pin) && pin === confirm

  const handleSubmit = () => {
    if (!isValid) return
    setPinMutation.mutate(
      { cardId, pin },
      {
        onSuccess: () => {
          notifySuccess('PIN set successfully.')
          setPin('')
          setConfirm('')
          onOpenChange(false)
        },
        onError: (err) => notifyError(err),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set card PIN</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Choose a 4-digit PIN. You'll need it to use this card at terminals.
          </p>
          <div>
            <Label htmlFor="card-pin">New PIN</Label>
            <Input
              id="card-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="card-pin-confirm">Confirm PIN</Label>
            <Input
              id="card-pin-confirm"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
              autoComplete="off"
              aria-invalid={confirm.length === 4 && confirm !== pin}
            />
            {confirm.length === 4 && confirm !== pin && (
              <p className="text-xs text-destructive mt-1">PINs do not match.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || setPinMutation.isPending}>
            {setPinMutation.isPending ? 'Saving...' : 'Save PIN'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
