import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CreateOrderForm } from '@/components/orders/CreateOrderForm'
import { ClientSelector } from '@/components/accounts/ClientSelector'
import { useCreateOrder, useCreateOrderOnBehalf } from '@/hooks/useOrders'
import { useCreateOptionOrder } from '@/hooks/useSecurities'
import { useClientAccounts, useBankAccounts, useAccountsByClient } from '@/hooks/useAccounts'
import { useListingsForSell } from '@/hooks/useSecurities'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import { Label } from '@/components/ui/label'
import type { CreateOrderPayload, OrderDirection } from '@/types/order'
import type { CreateOptionOrderPayload } from '@/types/security'
import type { Client } from '@/types/client'
import { usePiggy } from '@/hooks/usePiggy'

type ChargeMode = 'bank' | 'client'

export function CreateOrderPage() {
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

  const [chargeMode, setChargeMode] = useState<ChargeMode>('bank')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedListingId, setSelectedListingId] = useState<number | undefined>(undefined)

  const createOrderMutation = useCreateOrder()
  const createOrderOnBehalfMutation = useCreateOrderOnBehalf()
  const createOptionOrderMutation = useCreateOptionOrder()
  const { triggerPiggy } = usePiggy()
  const { data: clientAccountsData } = useClientAccounts()
  const { data: bankAccountsData } = useBankAccounts()
  const { data: clientSpecificData } = useAccountsByClient(selectedClient?.id ?? 0)
  const sellListings = useListingsForSell(
    isSell ? securityType : undefined,
    isSell ? ticker : undefined
  )

  const bankAccounts = bankAccountsData?.accounts ?? []

  const accounts =
    userType === 'employee'
      ? chargeMode === 'bank'
        ? bankAccounts
        : (clientSpecificData?.accounts ?? [])
      : (clientAccountsData?.accounts ?? [])

  const depositAccounts = isForex && userType === 'employee' ? bankAccounts : undefined

  const effectiveListingId = isSell ? selectedListingId : listingId

  const handleSubmit = (payload: CreateOrderPayload) => {
    const onSuccess = () => {
      triggerPiggy(payload.direction === 'sell' ? 'fill' : 'break')
      navigate('/orders')
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
    } else if (userType === 'employee' && chargeMode === 'client' && selectedClient) {
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
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isSell ? 'Sell Order' : isOption ? 'Buy Option' : 'Create Order'}
      </h1>

      {isSell && (
        <div className="max-w-md mb-4">
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

      {userType === 'employee' && (
        <div className="space-y-4 max-w-md mb-4">
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
        submitting={
          createOrderMutation.isPending ||
          createOrderOnBehalfMutation.isPending ||
          createOptionOrderMutation.isPending
        }
        listingId={effectiveListingId}
        accounts={accounts}
        depositAccounts={depositAccounts}
      />
    </div>
  )
}
