import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import { useClientAccounts } from '@/hooks/useAccounts'
import { PaymentFilters } from '@/components/payments/PaymentFilters'
import { PaymentHistoryTable } from '@/components/payments/PaymentHistoryTable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { PaymentFilters as PaymentFiltersType } from '@/types/payment'

export function PaymentHistoryPage() {
  const { data: accountsData } = useClientAccounts()
  const accounts = accountsData?.accounts ?? []
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>('')
  const [filters, setFilters] = useState<PaymentFiltersType>({})

  const effectiveAccount = selectedAccountNumber || accounts[0]?.account_number
  const { data, isLoading } = usePayments(effectiveAccount, filters)
  const payments = data?.payments ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Istorija plaćanja</h1>
      {accounts.length > 1 && (
        <div className="flex items-center gap-2">
          <Label>Račun:</Label>
          <Select
            value={selectedAccountNumber}
            onValueChange={(v) => setSelectedAccountNumber(v ?? '')}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Svi računi" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.account_number} value={acc.account_number}>
                  {acc.account_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <PaymentFilters filters={filters} onFilterChange={setFilters} />
      {isLoading ? <p>Učitavanje...</p> : <PaymentHistoryTable payments={payments} />}
    </div>
  )
}
