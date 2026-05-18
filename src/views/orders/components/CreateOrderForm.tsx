import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OrderDirection, OrderType, CreateOrderPayload } from '@/types/order'
import type { Account } from '@/types/account'

interface CreateOrderFormProps {
  defaultDirection: OrderDirection
  onSubmit: (payload: CreateOrderPayload) => void
  submitting: boolean
  listingId?: number
  accounts?: Account[]
  depositAccounts?: Account[]
}

export function CreateOrderForm({
  defaultDirection,
  onSubmit,
  submitting,
  listingId,
  accounts = [],
  depositAccounts,
}: CreateOrderFormProps) {
  const isForex = depositAccounts !== undefined
  const [orderType, setOrderType] = useState<OrderType>('market')
  const [quantity, setQuantity] = useState('')
  const [limitValue, setLimitValue] = useState('')
  const [stopValue, setStopValue] = useState('')
  const [allOrNone, setAllOrNone] = useState(false)
  const [margin, setMargin] = useState(false)
  const [accountId, setAccountId] = useState<number | undefined>(accounts[0]?.id)
  const [depositAccountId, setDepositAccountId] = useState<number | undefined>(
    depositAccounts?.[0]?.id
  )

  const showLimit = orderType === 'limit' || orderType === 'stop_limit'
  const showStop = orderType === 'stop' || orderType === 'stop_limit'

  const handleSubmit = () => {
    const payload: CreateOrderPayload = {
      direction: defaultDirection,
      order_type: orderType,
      quantity: Number(quantity) || 0,
      all_or_none: allOrNone,
      margin,
      ...(listingId ? { listing_id: listingId } : {}),
      ...(showLimit && limitValue ? { limit_value: limitValue } : {}),
      ...(showStop && stopValue ? { stop_value: stopValue } : {}),
      ...(accountId ? { account_id: accountId } : {}),
      ...(isForex && depositAccountId
        ? { base_account_id: depositAccountId, security_type: 'forex' }
        : {}),
    }
    onSubmit(payload)
  }

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="account">Account</Label>
        <select
          id="account"
          className="w-full border rounded px-3 py-2 text-sm mt-1"
          value={accountId ?? ''}
          onChange={(e) => setAccountId(Number(e.target.value) || undefined)}
        >
          <option value="">Select account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.account_number} ({acc.currency_code}) - {acc.account_name}
            </option>
          ))}
        </select>
      </div>

      {isForex && (
        <div>
          <Label htmlFor="deposit-account">Deposit Account</Label>
          <select
            id="deposit-account"
            aria-label="Deposit Account"
            className="w-full border rounded px-3 py-2 text-sm mt-1"
            value={depositAccountId ?? ''}
            onChange={(e) => setDepositAccountId(Number(e.target.value) || undefined)}
          >
            <option value="">Select deposit account</option>
            {depositAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_number} ({acc.currency_code}) - {acc.account_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <Label htmlFor="order-type">Order Type</Label>
        <select
          id="order-type"
          className="w-full border rounded px-3 py-2 text-sm mt-1"
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as OrderType)}
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop">Stop</option>
          <option value="stop_limit">Stop Limit</option>
        </select>
      </div>

      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="mt-1"
        />
      </div>

      {showLimit && (
        <div>
          <Label htmlFor="limit-value">Limit Value</Label>
          <Input
            id="limit-value"
            type="text"
            value={limitValue}
            onChange={(e) => setLimitValue(e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      {showStop && (
        <div>
          <Label htmlFor="stop-value">Stop Value</Label>
          <Input
            id="stop-value"
            type="text"
            value={stopValue}
            onChange={(e) => setStopValue(e.target.value)}
            className="mt-1"
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allOrNone}
            onChange={(e) => setAllOrNone(e.target.checked)}
          />
          All or None
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={margin} onChange={(e) => setMargin(e.target.checked)} />
          Margin
        </label>
      </div>

      <Button onClick={handleSubmit} disabled={submitting}>
        Place Order
      </Button>
    </div>
  )
}
