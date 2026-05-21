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
import { useAccountActivity } from '@/hooks/useAccounts'
import { parseApiError } from '@/lib/errors'
import { EmptyState, LoadingState, ViewShell } from '@/views/shared'

const PAGE_SIZE = 20

export function AccountActivityView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const accountId = Number(id) || 0
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error } = useAccountActivity(accountId, {
    page,
    page_size: PAGE_SIZE,
  })
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))
  const isForbidden = isError && parseApiError(error).status === 403

  return (
    <ViewShell
      title={
        <span className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/accounts')}>
            ← Back
          </Button>
          Account Activity
        </span>
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <EmptyState
          title={
            isForbidden
              ? "You don't have permission to view this account's activity."
              : 'Could not load activity.'
          }
          hint={
            isForbidden
              ? 'Only the account owner can see the full activity ledger for personal accounts.'
              : undefined
          }
        />
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
        <EmptyState title="No activity found for this account." />
      )}
    </ViewShell>
  )
}
