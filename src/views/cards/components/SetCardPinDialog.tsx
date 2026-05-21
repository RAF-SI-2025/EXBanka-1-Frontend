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
import { useSetCardPin, useVerifyCardPin } from '@/hooks/useCards'
import { notifySuccess, notifyError } from '@/lib/errors'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardId: number
}

const PIN_RE = /^\d{4}$/

export function SetCardPinDialog({ open, onOpenChange, cardId }: Props) {
  const [current, setCurrent] = useState('')
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [currentError, setCurrentError] = useState('')
  const verifyMutation = useVerifyCardPin()
  const setPinMutation = useSetCardPin()

  const isValid = PIN_RE.test(current) && PIN_RE.test(pin) && pin === confirm

  const handleSubmit = () => {
    if (!isValid) return
    setCurrentError('')
    verifyMutation.mutate(
      { cardId, pin: current },
      {
        onSuccess: () => {
          setPinMutation.mutate(
            { cardId, pin },
            {
              onSuccess: () => {
                notifySuccess('PIN changed successfully.')
                setCurrent('')
                setPin('')
                setConfirm('')
                onOpenChange(false)
              },
              onError: (err) => notifyError(err),
            }
          )
        },
        onError: () => {
          setCurrentError('Incorrect current PIN.')
        },
      }
    )
  }

  const isPending = verifyMutation.isPending || setPinMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change card PIN</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="card-pin-current">Current PIN</Label>
            <Input
              id="card-pin-current"
              aria-label="Current PIN"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={current}
              onChange={(e) => setCurrent(e.target.value.replace(/\D/g, '').slice(0, 4))}
              autoComplete="current-password"
            />
            {currentError && <p className="text-xs text-destructive mt-1">{currentError}</p>}
          </div>
          <div>
            <Label htmlFor="card-pin-new">New PIN</Label>
            <Input
              id="card-pin-new"
              aria-label="New PIN"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label htmlFor="card-pin-confirm">Confirm PIN</Label>
            <Input
              id="card-pin-confirm"
              aria-label="Confirm PIN"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
              autoComplete="new-password"
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
          <Button onClick={handleSubmit} disabled={!isValid || isPending}>
            {isPending ? 'Saving...' : 'Save PIN'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
