import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TaxTrackingTable } from '@/components/tax/TaxTrackingTable'
import { useTaxRecords, useCollectTaxes } from '@/hooks/useTax'
import type { TaxFilters } from '@/types/tax'

export function TaxTrackingPage() {
  const [filters, setFilters] = useState<TaxFilters>({})
  const { data, isLoading } = useTaxRecords(filters)
  const { mutate: collectTaxes, isPending: isCollecting } = useCollectTaxes()

  if (isLoading) return <p>Loading...</p>

  const records = data?.tax_records ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tax Tracking</h1>
        <Button onClick={() => collectTaxes()} disabled={isCollecting}>
          {isCollecting ? 'Collecting...' : 'Collect Taxes'}
        </Button>
      </div>
      <div className="flex gap-3">
        <Select
          value={filters.user_type ?? 'all'}
          onValueChange={(v) =>
            setFilters((f) => ({
              ...f,
              user_type: v === 'all' ? undefined : (v as 'client' | 'actuary'),
            }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="actuary">Actuary</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search by name..."
          className="w-64"
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
        />
      </div>
      <TaxTrackingTable records={records} />
    </div>
  )
}
