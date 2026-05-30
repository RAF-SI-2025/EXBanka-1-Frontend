import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreateOrderPayload, OrderDirection } from '@/types/order'
import type { RecurringOrderInterval } from '@/types/recurringOrder'
import type { Account } from '@/types/account'
import { useCreateOrderForm } from './useCreateOrderForm'
import { ScheduleOrderFields } from './ScheduleOrderFields'
import { OrderTypeFields } from './OrderTypeFields'

interface CreateOrderFormProps {
  defaultDirection: OrderDirection
  onSubmit: (payload: CreateOrderPayload, frequency?: RecurringOrderInterval) => void
  submitting: boolean
  listingId?: number
  accounts?: Account[]
  depositAccounts?: Account[]
  schedulingEnabled?: boolean
  onScheduleOnly?: (payload: CreateOrderPayload, frequency: RecurringOrderInterval) => void
}

export function CreateOrderForm({
  defaultDirection,
  onSubmit,
  submitting,
  listingId,
  accounts = [],
  depositAccounts,
  schedulingEnabled,
  onScheduleOnly,
}: CreateOrderFormProps) {
  const f = useCreateOrderForm({
    defaultDirection,
    listingId,
    accounts,
    depositAccounts,
    schedulingEnabled,
  })

  const handlePlace = () =>
    f.isScheduling ? onSubmit(f.buildPayload(), f.frequency) : onSubmit(f.buildPayload())
  const handleScheduleOnly = () => onScheduleOnly?.(f.buildPayload(), f.frequency)

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <Label htmlFor="account">Account</Label>
        <select
          id="account"
          className="w-full border rounded px-3 py-2 text-sm mt-1"
          value={f.accountId ?? ''}
          onChange={(e) => f.setAccountId(Number(e.target.value) || undefined)}
        >
          <option value="">Select account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.account_number} ({acc.currency_code}) - {acc.account_name}
            </option>
          ))}
        </select>
      </div>

      {depositAccounts && (
        <div>
          <Label htmlFor="deposit-account">Deposit Account</Label>
          <select
            id="deposit-account"
            aria-label="Deposit Account"
            className="w-full border rounded px-3 py-2 text-sm mt-1"
            value={f.depositAccountId ?? ''}
            onChange={(e) => f.setDepositAccountId(Number(e.target.value) || undefined)}
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

      <OrderTypeFields
        orderType={f.orderType}
        onOrderTypeChange={f.setOrderType}
        limitValue={f.limitValue}
        onLimitValueChange={f.setLimitValue}
        stopValue={f.stopValue}
        onStopValueChange={f.setStopValue}
        showLimit={f.showLimit}
        showStop={f.showStop}
      />

      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          value={f.quantity}
          onChange={(e) => f.setQuantity(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={f.allOrNone}
            onChange={(e) => f.setAllOrNone(e.target.checked)}
          />
          All or None
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={f.margin}
            onChange={(e) => f.setMargin(e.target.checked)}
          />
          Margin
        </label>
      </div>

      {f.showScheduling && (
        <ScheduleOrderFields
          schedule={f.schedule}
          onScheduleChange={f.setSchedule}
          frequency={f.frequency}
          onFrequencyChange={f.setFrequency}
        />
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handlePlace} disabled={submitting}>
          {f.isScheduling ? 'Place order and schedule' : 'Place Order'}
        </Button>
        {f.isScheduling && (
          <Button variant="outline" onClick={handleScheduleOnly} disabled={submitting}>
            Schedule
          </Button>
        )}
      </div>
    </div>
  )
}
