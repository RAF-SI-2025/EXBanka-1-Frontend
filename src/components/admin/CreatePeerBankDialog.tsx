import { useState } from 'react'
import type { CreatePeerBankPayload } from '@/types/peerBank'
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

interface CreatePeerBankDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreatePeerBankPayload) => void
  loading: boolean
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function CreatePeerBankDialogInner({
  onSubmit,
  loading,
}: Pick<CreatePeerBankDialogProps, 'onSubmit' | 'loading'>) {
  const [bankCode, setBankCode] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [hmacInbound, setHmacInbound] = useState('')
  const [hmacOutbound, setHmacOutbound] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const trimmedBankCode = bankCode.trim()
  const trimmedRouting = routingNumber.trim()
  const trimmedBaseUrl = baseUrl.trim()
  const trimmedApiToken = apiToken.trim()

  const ready =
    trimmedBankCode.length > 0 &&
    trimmedRouting.length > 0 &&
    trimmedBaseUrl.length > 0 &&
    trimmedApiToken.length > 0

  function handleSubmit() {
    if (!ready) return
    if (!isValidUrl(trimmedBaseUrl)) {
      setError('Base URL must be a valid http(s) URL')
      return
    }
    const routing = Number(trimmedRouting)
    if (!Number.isFinite(routing) || routing < 0) {
      setError('Routing number must be a non-negative integer')
      return
    }
    setError(null)
    const payload: CreatePeerBankPayload = {
      bank_code: trimmedBankCode,
      routing_number: routing,
      base_url: trimmedBaseUrl.replace(/\/+$/, ''),
      api_token: trimmedApiToken,
      active,
    }
    if (hmacInbound.trim()) payload.hmac_inbound_key = hmacInbound.trim()
    if (hmacOutbound.trim()) payload.hmac_outbound_key = hmacOutbound.trim()
    onSubmit(payload)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Peer Bank</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
        <div className="flex flex-col gap-2">
          <Label htmlFor="peer-bank-code">Bank Code *</Label>
          <Input
            id="peer-bank-code"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            placeholder="222"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="peer-routing-number">Routing Number *</Label>
          <Input
            id="peer-routing-number"
            type="number"
            value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value)}
            placeholder="222"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="peer-base-url">Base URL *</Label>
          <Input
            id="peer-base-url"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://peer-bank.example.com/api/v3"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="peer-api-token">API Token *</Label>
          <Input
            id="peer-api-token"
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Issued by peer bank"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="peer-hmac-inbound">HMAC Inbound Key</Label>
          <Input
            id="peer-hmac-inbound"
            type="password"
            value={hmacInbound}
            onChange={(e) => setHmacInbound(e.target.value)}
            placeholder="Optional — verify HMAC requests from peer"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="peer-hmac-outbound">HMAC Outbound Key</Label>
          <Input
            id="peer-hmac-outbound"
            type="password"
            value={hmacOutbound}
            onChange={(e) => setHmacOutbound(e.target.value)}
            placeholder="Optional — sign requests to peer"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="peer-active"
            checked={active}
            onCheckedChange={(checked) => setActive(checked === true)}
          />
          <Label htmlFor="peer-active" className="text-sm font-normal">
            Accept traffic to/from this peer
          </Label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={!ready || loading}>
          {loading ? 'Adding...' : 'Add Peer Bank'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function CreatePeerBankDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: CreatePeerBankDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <CreatePeerBankDialogInner onSubmit={onSubmit} loading={loading} />}
      </DialogContent>
    </Dialog>
  )
}
