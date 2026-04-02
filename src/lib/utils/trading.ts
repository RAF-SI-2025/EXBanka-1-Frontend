import type { OrderType } from '@/types/order'

/** Infer order type from optional limit/stop field values. */
export function inferOrderType(limitValue?: string, stopValue?: string): OrderType {
  const hasLimit = !!limitValue && limitValue.trim() !== ''
  const hasStop = !!stopValue && stopValue.trim() !== ''
  if (hasStop && hasLimit) return 'stop_limit'
  if (hasStop) return 'stop'
  if (hasLimit) return 'limit'
  return 'market'
}

/**
 * Calculate the approximate total cost/proceeds of an order.
 * - Market: uses ask (buy) or bid (sell) as price per unit
 * - Limit / Stop-Limit: uses limit_value as price per unit
 * - Stop: uses stop_value as price per unit
 * Returns: contractSize × pricePerUnit × quantity
 */
export function calculateApproxPrice(
  orderType: OrderType,
  direction: 'buy' | 'sell',
  ask: string,
  bid: string,
  contractSize: number,
  quantity: number,
  limitValue?: string,
  stopValue?: string
): number {
  let pricePerUnit: number
  if (orderType === 'limit' || orderType === 'stop_limit') {
    pricePerUnit = parseFloat(limitValue ?? '0')
  } else if (orderType === 'stop') {
    pricePerUnit = parseFloat(stopValue ?? '0')
  } else {
    pricePerUnit = direction === 'buy' ? parseFloat(ask) : parseFloat(bid)
  }
  return contractSize * pricePerUnit * quantity
}
