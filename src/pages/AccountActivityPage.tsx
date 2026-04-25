import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
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

export function AccountActivityPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const accountId = Number(id) || 0
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAccountActivity(accountId, { page, page_size: PAGE_SIZE })
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/accounts')}>
          Back
        </Button>
        <h1 className="text-2xl font-bold">Account Activity</h1>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.entries.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Balance Before</TableHead>
                <TableHead>Balance After</TableHead>
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
                  <TableCell>{entry.amount}</TableCell>
                  <TableCell>{entry.currency}</TableCell>
                  <TableCell>{entry.balance_before}</TableCell>
                  <TableCell>{entry.balance_after}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground mt-2">{data.total_count} entries</p>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p>No activity found for this account.</p>
      )}
    </div>
  )
}
