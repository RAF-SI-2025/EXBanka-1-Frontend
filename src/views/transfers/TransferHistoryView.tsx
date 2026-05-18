import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { useTransfers } from '@/hooks/useTransfers'
import { TransferHistoryTable } from '@/views/transfers/components/TransferHistoryTable'
import { LoadingState, ViewShell } from '@/views/shared'

const PAGE_SIZE = 10

export function TransferHistoryView() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useTransfers({ page, page_size: PAGE_SIZE })
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  return (
    <ViewShell title="Transfer History" subtitle="All transfers you've made between your accounts.">
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <TransferHistoryTable transfers={data?.transfers ?? []} />
              <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </ViewShell>
  )
}
