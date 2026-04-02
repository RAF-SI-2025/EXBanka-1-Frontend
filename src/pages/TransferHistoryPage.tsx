import { useState } from 'react'
import { useTransfers } from '@/hooks/useTransfers'
import { TransferHistoryTable } from '@/components/transfers/TransferHistoryTable'
import { PaginationControls } from '@/components/shared/PaginationControls'

const PAGE_SIZE = 10

export function TransferHistoryPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useTransfers({ page, page_size: PAGE_SIZE })
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  if (isLoading) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transfer History</h1>
      <TransferHistoryTable transfers={data?.transfers ?? []} />
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
