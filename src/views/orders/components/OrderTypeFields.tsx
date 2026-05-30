import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OrderType } from '@/types/order'

interface OrderTypeFieldsProps {
  orderType: OrderType
  onOrderTypeChange: (value: OrderType) => void
  limitValue: string
  onLimitValueChange: (value: string) => void
  stopValue: string
  onStopValueChange: (value: string) => void
  showLimit: boolean
  showStop: boolean
}

export function OrderTypeFields({
  orderType,
  onOrderTypeChange,
  limitValue,
  onLimitValueChange,
  stopValue,
  onStopValueChange,
  showLimit,
  showStop,
}: OrderTypeFieldsProps) {
  return (
    <>
      <div>
        <Label htmlFor="order-type">Order Type</Label>
        <select
          id="order-type"
          className="w-full border rounded px-3 py-2 text-sm mt-1"
          value={orderType}
          onChange={(e) => onOrderTypeChange(e.target.value as OrderType)}
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
          <option value="stop">Stop</option>
          <option value="stop_limit">Stop Limit</option>
        </select>
      </div>

      {showLimit && (
        <div>
          <Label htmlFor="limit-value">Limit Value</Label>
          <Input
            id="limit-value"
            type="text"
            value={limitValue}
            onChange={(e) => onLimitValueChange(e.target.value)}
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
            onChange={(e) => onStopValueChange(e.target.value)}
            className="mt-1"
          />
        </div>
      )}
    </>
  )
}
