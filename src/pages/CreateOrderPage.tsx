import { useSearchParams, useNavigate } from 'react-router-dom'
import { CreateOrderForm } from '@/components/orders/CreateOrderForm'
import { useCreateOrder } from '@/hooks/useOrders'
import { useClientAccounts } from '@/hooks/useAccounts'
import type { CreateOrderPayload, OrderDirection } from '@/types/order'

export function CreateOrderPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const listingId = Number(searchParams.get('listingId')) || undefined
  const holdingId = Number(searchParams.get('holdingId')) || undefined
  const direction = (searchParams.get('direction') as OrderDirection) || 'buy'

  const createOrderMutation = useCreateOrder()
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []

  const handleSubmit = (payload: CreateOrderPayload) => {
    createOrderMutation.mutate(payload, {
      onSuccess: () => navigate('/orders'),
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Order</h1>
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
