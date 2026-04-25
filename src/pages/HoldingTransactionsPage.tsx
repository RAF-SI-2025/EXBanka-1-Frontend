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
import { useHoldingTransactions } from '@/hooks/usePortfolio'

const PAGE_SIZE = 10

export function HoldingTransactionsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const holdingId = Number(id) || 0
  const [page, setPage] = useState(1)

  const { data, isLoading } = useHoldingTransactions(holdingId, { page, page_size: PAGE_SIZE })
  const totalPages = Math.max(1, Math.ceil((data?.total_count ?? 0) / PAGE_SIZE))

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/portfolio')}>
          Back
        </Button>
        <h1 className="text-2xl font-bold">Holding Transactions</h1>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : data?.transactions.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price / Unit</TableHead>
                <TableHead>Native Amount</TableHead>
                <TableHead>Native Currency</TableHead>
                <TableHead>Converted Amount</TableHead>
                <TableHead>Account Currency</TableHead>
                <TableHead>FX Rate</TableHead>
                <TableHead>Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>{new Date(txn.executed_at).toLocaleString()}</TableCell>
                  <TableCell className="font-mono font-semibold">{txn.ticker}</TableCell>
                  <TableCell>
                    <span
                      className={
                        txn.direction === 'buy'
                          ? 'text-green-600 font-medium'
                          : 'text-red-600 font-medium'
                      }
                    >
                      {txn.direction}
                    </span>
                  </TableCell>
                  <TableCell>{txn.quantity}</TableCell>
                  <TableCell>{txn.price_per_unit}</TableCell>
                  <TableCell>{txn.native_amount}</TableCell>
                  <TableCell>{txn.native_currency}</TableCell>
                  <TableCell>{txn.converted_amount}</TableCell>
                  <TableCell>{txn.account_currency}</TableCell>
                  <TableCell>{txn.fx_rate}</TableCell>
                  <TableCell>{txn.commission}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground mt-2">{data.total_count} transactions</p>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <p>No transactions found for this holding.</p>
      )}
    </div>
  )
}
