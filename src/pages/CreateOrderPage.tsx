import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CreateOrderForm } from '@/components/orders/CreateOrderForm'
import { ClientSelector } from '@/components/accounts/ClientSelector'
import { useCreateOrder } from '@/hooks/useOrders'
import { useClientAccounts, useBankAccounts, useAccountsByClient } from '@/hooks/useAccounts'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectUserType } from '@/store/selectors/authSelectors'
import { Label } from '@/components/ui/label'
import type { CreateOrderPayload, OrderDirection } from '@/types/order'
import type { Client } from '@/types/client'

type ChargeMode = 'bank' | 'client'

export function CreateOrderPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const listingId = Number(searchParams.get('listingId')) || undefined
  const holdingId = Number(searchParams.get('holdingId')) || undefined
  const direction = (searchParams.get('direction') as OrderDirection) || 'buy'
  const userType = useAppSelector(selectUserType)

  const [chargeMode, setChargeMode] = useState<ChargeMode>('bank')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const createOrderMutation = useCreateOrder()
  const { data: clientAccountsData } = useClientAccounts()
  const { data: bankAccountsData } = useBankAccounts()
  const { data: clientSpecificData } = useAccountsByClient(selectedClient?.id ?? 0)

  const accounts =
    userType === 'employee'
      ? chargeMode === 'bank'
        ? (bankAccountsData?.accounts ?? [])
        : (clientSpecificData?.accounts ?? [])
      : (clientAccountsData?.accounts ?? [])

  const handleSubmit = (payload: CreateOrderPayload) => {
    createOrderMutation.mutate(payload, {
      onSuccess: () => navigate('/orders'),
    })
  }

  const handleChargeModeChange = (mode: ChargeMode) => {
    setChargeMode(mode)
    setSelectedClient(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Order</h1>

      {userType === 'employee' && (
        <div className="space-y-4 max-w-md mb-4">
          <div>
            <Label htmlFor="charge-mode">Charge As</Label>
            <select
              id="charge-mode"
              aria-label="Charge As"
              className="w-full border rounded px-3 py-2 text-sm mt-1"
              value={chargeMode}
              onChange={(e) => handleChargeModeChange(e.target.value as ChargeMode)}
            >
              <option value="bank">Bank</option>
              <option value="client">Client</option>
            </select>
          </div>

          {chargeMode === 'client' && (
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
        submitting={createOrderMutation.isPending}
        listingId={listingId}
        holdingId={holdingId}
        accounts={accounts}
      />
    </div>
  )
}
