import { useTransfers } from '@/hooks/useTransfers'
import { TransferHistoryTable } from '@/components/transfers/TransferHistoryTable'

export function TransferHistoryPage() {
  const { data, isLoading } = useTransfers({})

  if (isLoading) return <p>Učitavanje...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Istorija transfera</h1>
      <TransferHistoryTable transfers={data?.transfers ?? []} />
    </div>
  )
}
