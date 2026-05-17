import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAccountActivity } from '@/hooks/useAccounts'

const PAGE_SIZE = 20

interface AccountActivityPanelProps {
  accountId: number
}

export function AccountActivityPanel({ accountId }: AccountActivityPanelProps) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAccountActivity(accountId, { page, page_size: PAGE_SIZE })
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))

  if (isLoading) return <LoadingSpinner />

  if (!data?.entries.length) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Balance Before</TableHead>
              <TableHead className="text-right">Balance After</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.occurred_at * 1000).toLocaleString()}</TableCell>
                <TableCell>
                  <span
                    className={
                      entry.entry_type === 'credit'
                        ? 'text-green-600 font-medium'
                        : 'text-red-600 font-medium'
                    }
                  >
                    {entry.entry_type}
                  </span>
                </TableCell>
                <TableCell className="text-right">{entry.amount}</TableCell>
                <TableCell>{entry.currency}</TableCell>
                <TableCell className="text-right">{entry.balance_before}</TableCell>
                <TableCell className="text-right">{entry.balance_after}</TableCell>
                <TableCell className="max-w-xs truncate" title={entry.description}>
                  {entry.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{data.total_count} entries</p>
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  )
}
