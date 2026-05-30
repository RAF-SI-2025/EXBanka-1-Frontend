import { useState } from 'react'
import type { OrderDirection, OrderType, CreateOrderPayload } from '@/types/order'
import type { RecurringOrderInterval } from '@/types/recurringOrder'
import type { Account } from '@/types/account'

interface UseCreateOrderFormArgs {
  defaultDirection: OrderDirection
  listingId?: number
  accounts: Account[]
  depositAccounts?: Account[]
  schedulingEnabled?: boolean
}

export function useCreateOrderForm({
  defaultDirection,
  listingId,
  accounts,
  depositAccounts,
  schedulingEnabled,
}: UseCreateOrderFormArgs) {
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
  const [schedule, setSchedule] = useState(false)
  const [frequency, setFrequency] = useState<RecurringOrderInterval>('monthly')

  const showLimit = orderType === 'limit' || orderType === 'stop_limit'
  const showStop = orderType === 'stop' || orderType === 'stop_limit'
  const showScheduling = Boolean(schedulingEnabled) && orderType === 'market'
  const isScheduling = showScheduling && schedule

  const buildPayload = (): CreateOrderPayload => ({
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
  })

  return {
    isForex,
    orderType,
    setOrderType,
    quantity,
    setQuantity,
    limitValue,
    setLimitValue,
    stopValue,
    setStopValue,
    allOrNone,
    setAllOrNone,
    margin,
    setMargin,
    accountId,
    setAccountId,
    depositAccountId,
    setDepositAccountId,
    schedule,
    setSchedule,
    frequency,
    setFrequency,
    showLimit,
    showStop,
    showScheduling,
    isScheduling,
    buildPayload,
  }
}
