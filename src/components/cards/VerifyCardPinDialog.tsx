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
import { useVerifyCardPin } from '@/hooks/useCards'
import { notifyError } from '@/lib/errors'
import type { Card as CardModel } from '@/types/card'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: CardModel
}

const PIN_RE = /^\d{4}$/

export function VerifyCardPinDialog({ open, onOpenChange, card }: Props) {
  const [pin, setPin] = useState('')
  const [verified, setVerified] = useState(false)
  const verifyMutation = useVerifyCardPin()

  const handleSubmit = () => {
    if (!PIN_RE.test(pin)) return
    verifyMutation.mutate(
      { cardId: card.id, pin },
      {
        onSuccess: (response) => {
          if (response.valid) {
            setVerified(true)
          } else {
            notifyError('Incorrect PIN. The card is blocked after 3 failed attempts.')
            setPin('')
          }
        },
        onError: (err) => notifyError(err),
      }
    )
  }

  const handleClose = (next: boolean) => {
    if (!next) {
      setPin('')
      setVerified(false)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{verified ? 'Card details' : 'Enter PIN'}</DialogTitle>
        </DialogHeader>
        {!verified ? (
          <>
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                Enter the card's 4-digit PIN to view its details.
              </p>
              <div>
                <Label htmlFor="verify-pin">PIN</Label>
                <Input
                  id="verify-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  autoComplete="off"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!PIN_RE.test(pin) || verifyMutation.isPending}
              >
                {verifyMutation.isPending ? 'Verifying...' : 'Verify'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-3 py-2">
              <Detail label="Card number" value={card.card_number} />
              <Detail label="Cardholder" value={card.owner_name} />
              <Detail label="Expires" value={new Date(card.expires_at).toLocaleDateString()} />
              <Detail label="CVV" value={card.cvv} mono />
              <Detail label="PIN" value={pin} mono />
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? 'font-mono tracking-wider' : ''}`}>
        {value}
      </span>
    </div>
  )
}
