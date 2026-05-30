import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { ClientSelector } from '@/views/accounts/components/ClientSelector'
import { Label } from '@/components/ui/label'
import {
  useCreateOrder,
  useCreateOrderOnBehalf,
  useCreateOrderOnBehalfFund,
} from '@/hooks/useOrders'
import { useCreateOptionOrder, useListingsForSell } from '@/hooks/useSecurities'
import { useAccountsByClient, useBankAccounts, useClientAccounts } from '@/hooks/useAccounts'
import { useFunds } from '@/hooks/useFunds'
import { useCreateRecurringOrder } from '@/hooks/useRecurringOrders'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import { notifyError } from '@/lib/errors'
import { buildRecurringOrderPayload } from '@/views/orders/components/buildRecurringOrderPayload'
import type { CreateOrderPayload, OrderDirection } from '@/types/order'
import type { RecurringOrderInterval } from '@/types/recurringOrder'
import type { CreateOptionOrderPayload } from '@/types/security'
import type { Client } from '@/types/client'
import type { Account } from '@/types/account'
import { usePiggy } from '@/hooks/usePiggy'
import { CreateOrderForm } from '@/views/orders/components/CreateOrderForm'
import { ViewShell } from '@/views/shared'

type ChargeMode = 'bank' | 'client' | 'fund'

export function CreateOrderView() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const listingId = Number(searchParams.get('listingId')) || undefined
  const optionId = Number(searchParams.get('optionId')) || undefined
  const direction = (searchParams.get('direction') as OrderDirection) || 'buy'
  const securityType = searchParams.get('securityType') ?? undefined
  const isForex = securityType === 'forex'
  const isOption = securityType === 'option'
  const isSell = direction === 'sell'
  const ticker = searchParams.get('ticker') ?? undefined
  const userType = useAppSelector(selectUserType)
  const isEmployee = userType === 'employee'

  const [chargeMode, setChargeMode] = useState<ChargeMode>('bank')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedListingId, setSelectedListingId] = useState<number | undefined>(undefined)

  const createOrderMutation = useCreateOrder()
  const createOrderOnBehalfMutation = useCreateOrderOnBehalf()
  const createOrderOnBehalfFundMutation = useCreateOrderOnBehalfFund()
  const createOptionOrderMutation = useCreateOptionOrder()
  const createRecurringOrderMutation = useCreateRecurringOrder()
  const { triggerPiggy } = usePiggy()
  const { data: clientAccountsData } = useClientAccounts()
  const { data: bankAccountsData } = useBankAccounts(isEmployee)
  const { data: clientSpecificData } = useAccountsByClient(selectedClient?.id ?? 0)
  const { data: fundsData } = useFunds({ active_only: true, page_size: 200 })
  const sellListings = useListingsForSell(
    isSell ? securityType : undefined,
    isSell ? ticker : undefined
  )

  const rawBankAccounts = bankAccountsData?.accounts
  const bankAccounts = rawBankAccounts ?? []

  // When chargeMode === 'fund', surface only the bank-owned accounts that are
  // attached to active funds (one RSD account per fund). The dropdown labels
  // are augmented with the fund name so the user picks a fund, not a raw account.
  const { fundAccounts, fundIdByAccountId } = useMemo(() => {
    const funds = fundsData?.funds ?? []
    const accountById = new Map((rawBankAccounts ?? []).map((a) => [a.id, a]))
    const list: Account[] = []
    const fundIds = new Map<number, number>()
    for (const fund of funds) {
      const acc = accountById.get(fund.rsd_account_id)
      if (!acc) continue
      list.push({ ...acc, account_name: `${fund.name} (${acc.account_name})` })
      fundIds.set(acc.id, fund.id)
    }
    return { fundAccounts: list, fundIdByAccountId: fundIds }
  }, [fundsData, rawBankAccounts])

  // Bank mode excludes accounts attached to investment funds — those are
  // reachable only through the dedicated Fund mode (and submit with
  // on_behalf_of_fund_id), not via the generic bank-on-behalf flow.
  const bankOnlyAccounts = useMemo(
    () => bankAccounts.filter((a) => !fundIdByAccountId.has(a.id)),
    [bankAccounts, fundIdByAccountId]
  )

  const accounts = isEmployee
    ? chargeMode === 'bank'
      ? bankOnlyAccounts
      : chargeMode === 'client'
        ? (clientSpecificData?.accounts ?? [])
        : fundAccounts
    : (clientAccountsData?.accounts ?? [])

  const depositAccounts = isForex && isEmployee ? bankOnlyAccounts : undefined

  const effectiveListingId = isSell ? selectedListingId : listingId

  // Scheduling a recurring buy maps to the recurring API's surface: a plain
  // market buy. Available to clients and employees in any charge mode — note
  // /me/recurring-orders is caller-scoped, so an employee's template is created
  // under the employee principal (with the chosen account_id), not the client
  // or fund being charged. The form additionally gates on order_type === 'market'.
  const schedulingEnabled = direction === 'buy' && !isOption && !isForex

  const scheduleRecurring = (
    payload: CreateOrderPayload,
    frequency: RecurringOrderInterval,
    onSuccess: () => void
  ) => {
    const recurringPayload = buildRecurringOrderPayload(payload, frequency)
    if (!recurringPayload) return
    createRecurringOrderMutation.mutate(recurringPayload, {
      onSuccess,
      // Buy already succeeded but the schedule did not — surface it and stay put.
      onError: (err) => notifyError(err),
    })
  }

  const handleScheduleOnly = (payload: CreateOrderPayload, frequency: RecurringOrderInterval) => {
    scheduleRecurring(payload, frequency, () => navigate('/orders'))
  }

  const handleSubmit = (payload: CreateOrderPayload, frequency?: RecurringOrderInterval) => {
    const onSuccess = () => {
      triggerPiggy(payload.direction === 'sell' ? 'fill' : 'break')
      if (frequency) {
        scheduleRecurring(payload, frequency, () => navigate('/orders'))
      } else {
        navigate('/orders')
      }
    }
    if (isOption && optionId) {
      const optionPayload: CreateOptionOrderPayload = {
        direction: payload.direction,
        order_type: payload.order_type,
        quantity: payload.quantity,
        account_id: payload.account_id,
        limit_value: payload.limit_value,
        stop_value: payload.stop_value,
        all_or_none: payload.all_or_none,
        margin: payload.margin,
      }
      createOptionOrderMutation.mutate({ optionId, payload: optionPayload }, { onSuccess })
    } else if (isEmployee && chargeMode === 'fund' && payload.account_id) {
      const fundId = fundIdByAccountId.get(payload.account_id)
      if (!fundId) return
      createOrderOnBehalfFundMutation.mutate(
        { ...payload, on_behalf_of_fund_id: fundId },
        { onSuccess }
      )
    } else if (isEmployee && chargeMode === 'client' && selectedClient) {
      createOrderOnBehalfMutation.mutate(
        { ...payload, client_id: selectedClient.id },
        { onSuccess }
      )
    } else {
      createOrderMutation.mutate(payload, { onSuccess })
    }
  }

  const handleChargeModeChange = (mode: ChargeMode) => {
    setChargeMode(mode)
    setSelectedClient(null)
  }

  return (
    <ViewShell
      title={isSell ? 'Sell Order' : isOption ? 'Buy Option' : 'Create Order'}
      subtitle="Configure the order before sending it to the matching engine."
    >
      <Card>
        <CardContent className="pt-6 space-y-4">
          {isSell && (
            <div className="max-w-md">
              <Label htmlFor="listing-select">Listing (exchange venue)</Label>
              <select
                id="listing-select"
                aria-label="Listing"
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                value={selectedListingId ?? ''}
                onChange={(e) => setSelectedListingId(Number(e.target.value) || undefined)}
              >
                <option value="">Select listing</option>
                {sellListings.map((l) => (
                  <option key={l.listing_id} value={l.listing_id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isEmployee && (
            <div className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="charge-mode">Charge As</Label>
                <select
                  id="charge-mode"
                  aria-label="Charge As"
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                  value={chargeMode}
                  disabled={isForex}
                  onChange={(e) => handleChargeModeChange(e.target.value as ChargeMode)}
                >
                  <option value="bank">Bank</option>
                  {!isForex && <option value="client">Client</option>}
                  {!isForex && <option value="fund">Fund</option>}
                </select>
              </div>

              {chargeMode === 'client' && !isForex && (
                <div>
                  <Label>Client</Label>
                  <ClientSelector
                    onClientSelected={setSelectedClient}
                    selectedClient={selectedClient}
                  />
                </div>
              )}
            </div>
          )}

          <CreateOrderForm
            defaultDirection={direction}
            onSubmit={handleSubmit}
            onScheduleOnly={handleScheduleOnly}
            schedulingEnabled={schedulingEnabled}
            submitting={
              createOrderMutation.isPending ||
              createOrderOnBehalfMutation.isPending ||
              createOrderOnBehalfFundMutation.isPending ||
              createOptionOrderMutation.isPending ||
              createRecurringOrderMutation.isPending
            }
            listingId={effectiveListingId}
            accounts={accounts}
            depositAccounts={depositAccounts}
          />
        </CardContent>
      </Card>
    </ViewShell>
  )
}
