import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AccountSelector } from '@/components/accounts/AccountSelector'
import { ClientSelector } from '@/components/accounts/ClientSelector'
import { useCreateCard } from '@/hooks/useCards'
import type { Account } from '@/types/account'
import type { Client } from '@/types/client'
import type { CardBrand } from '@/types/card'

interface CreateCardDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateCardDialog({ open, onClose }: CreateCardDialogProps) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [cardBrand, setCardBrand] = useState<CardBrand | ''>('')
  const [error, setError] = useState<string | null>(null)
  const createCard = useCreateCard()

  const canSubmit = selectedAccount !== null && selectedClient !== null && cardBrand !== ''

  const handleClose = () => {
    setSelectedAccount(null)
    setSelectedClient(null)
    setCardBrand('')
    setError(null)
    onClose()
  }

  const handleSubmit = () => {
    if (!selectedAccount || !selectedClient || !cardBrand) return
    setError(null)
    createCard.mutate(
      { account: selectedAccount, client: selectedClient, cardBrand },
      {
        onSuccess: () => handleClose(),
        onError: (err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Failed to create card. Please try again.'
          setError(message)
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Card</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div>
            <Label>Company Account</Label>
            <AccountSelector
              onAccountSelected={setSelectedAccount}
              selectedAccount={selectedAccount}
              businessOnly
            />
          </div>

          <div>
            <Label>Card Owner (Client)</Label>
            <ClientSelector
              onClientSelected={(c) => setSelectedClient(c)}
              selectedClient={selectedClient}
            />
          </div>

          <div>
            <Label htmlFor="card-brand-select">Card Brand</Label>
            <Select value={cardBrand} onValueChange={(v) => setCardBrand(v as CardBrand | '')}>
              <SelectTrigger id="card-brand-select" aria-label="Card Brand">
                <SelectValue placeholder="Select card brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VISA">Visa</SelectItem>
                <SelectItem value="MASTERCARD">MasterCard</SelectItem>
                <SelectItem value="DINACARD">DinaCard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || createCard.isPending}>
            {createCard.isPending ? 'Creating...' : 'Create Card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
