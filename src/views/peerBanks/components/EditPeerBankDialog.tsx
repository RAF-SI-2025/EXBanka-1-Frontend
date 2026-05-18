import { useState } from 'react'
import type { PeerBank, UpdatePeerBankPayload } from '@/views/peerBanks/types'
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
import { Checkbox } from '@/components/ui/checkbox'
import { isValidUrl } from '@/views/peerBanks/lib/url'

interface EditPeerBankDialogProps {
  open: boolean
  peerBank: PeerBank | null
  onClose: () => void
  onSave: (id: number, payload: UpdatePeerBankPayload) => void
  loading: boolean
}

function EditPeerBankDialogInner({
  peerBank,
  onSave,
  loading,
}: {
  peerBank: PeerBank
  onSave: (id: number, payload: UpdatePeerBankPayload) => void
  loading: boolean
}) {
  const [baseUrl, setBaseUrl] = useState(peerBank.base_url)
  const [apiToken, setApiToken] = useState('')
  const [hmacInbound, setHmacInbound] = useState('')
  const [hmacOutbound, setHmacOutbound] = useState('')
  const [active, setActive] = useState(peerBank.active)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    const trimmedUrl = baseUrl.trim()
    if (trimmedUrl && !isValidUrl(trimmedUrl)) {
      setError('Base URL must be a valid http(s) URL')
      return
    }
    setError(null)
    const payload: UpdatePeerBankPayload = { active }
    if (trimmedUrl && trimmedUrl !== peerBank.base_url) {
      payload.base_url = trimmedUrl.replace(/\/+$/, '')
    }
    if (apiToken.trim()) payload.api_token = apiToken.trim()
    if (hmacInbound.trim()) payload.hmac_inbound_key = hmacInbound.trim()
    if (hmacOutbound.trim()) payload.hmac_outbound_key = hmacOutbound.trim()
    onSave(peerBank.id, payload)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Peer Bank — {peerBank.bank_code}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Bank Code</span>
          <span className="font-mono">{peerBank.bank_code}</span>
          <span className="text-muted-foreground">Routing Number</span>
          <span className="font-mono">{peerBank.routing_number}</span>
          <span className="text-muted-foreground">Current Token</span>
          <span className="font-mono">{peerBank.api_token_preview}</span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-peer-base-url">Base URL</Label>
          <Input
            id="edit-peer-base-url"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-peer-api-token">New API Token</Label>
          <Input
            id="edit-peer-api-token"
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Leave blank to keep current"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-peer-hmac-inbound">HMAC Inbound Key</Label>
          <Input
            id="edit-peer-hmac-inbound"
            type="password"
            value={hmacInbound}
            onChange={(e) => setHmacInbound(e.target.value)}
            placeholder="Leave blank to keep current"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-peer-hmac-outbound">HMAC Outbound Key</Label>
          <Input
            id="edit-peer-hmac-outbound"
            type="password"
            value={hmacOutbound}
            onChange={(e) => setHmacOutbound(e.target.value)}
            placeholder="Leave blank to keep current"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="edit-peer-active"
            checked={active}
            onCheckedChange={(checked) => setActive(checked === true)}
          />
          <Label htmlFor="edit-peer-active" className="text-sm font-normal">
            Active
          </Label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function EditPeerBankDialog({
  open,
  peerBank,
  onClose,
  onSave,
  loading,
}: EditPeerBankDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent>
        {open && peerBank && (
          <EditPeerBankDialogInner peerBank={peerBank} onSave={onSave} loading={loading} />
        )}
      </DialogContent>
    </Dialog>
  )
}
