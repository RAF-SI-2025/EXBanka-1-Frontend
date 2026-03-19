import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import { PaymentFilters } from '@/components/payments/PaymentFilters'
import { PaymentHistoryTable } from '@/components/payments/PaymentHistoryTable'
import type { PaymentFilters as PaymentFiltersType } from '@/types/payment'

export function PaymentHistoryPage() {
  const [filters, setFilters] = useState<PaymentFiltersType>({})
  const { data, isLoading } = usePayments(filters)
  const payments = data?.payments ?? []

  if (isLoading) return <p>Učitavanje...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Istorija plaćanja</h1>
      <PaymentFilters filters={filters} onFilterChange={setFilters} />
      <PaymentHistoryTable payments={payments} />
    </div>
  )
}
