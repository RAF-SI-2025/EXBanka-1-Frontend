import { useState } from 'react'
import { useCardRequests, useApproveCardRequest, useRejectCardRequest } from '@/hooks/useCards'
import { useAllClients } from '@/hooks/useClients'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { CardRequestDenyDialog } from '@/components/cards/CardRequestDenyDialog'

const PAGE_SIZE = 10

export function AdminCardRequestsPage() {
  const [page, setPage] = useState(1)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)

  const { data, isLoading } = useCardRequests({ status: 'pending', page, page_size: PAGE_SIZE })
  const { data: clientsData } = useAllClients()
  const approve = useApproveCardRequest()
  const reject = useRejectCardRequest()

  const requests = data?.requests ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))
  const clientsById = Object.fromEntries((clientsData?.clients ?? []).map((c) => [c.id, c]))

  const isDisabled = approve.isPending || reject.isPending

  const handleDenyConfirm = (reason: string) => {
    if (selectedRequestId !== null) {
      reject.mutate({ id: selectedRequestId, reason })
    }
    setSelectedRequestId(null)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Card Requests</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Card Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No requests.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => {
                const client = clientsById[req.client_id]
                return (
                  <TableRow key={req.id}>
                    <TableCell>{client?.first_name ?? '—'}</TableCell>
                    <TableCell>{client?.last_name ?? '—'}</TableCell>
                    <TableCell className="font-mono text-sm">{req.account_number}</TableCell>
                    <TableCell>{req.card_type}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approve.mutate(req.id)}
                          disabled={isDisabled}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedRequestId(req.id)}
                          disabled={isDisabled}
                        >
                          Deny
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      )}
      <CardRequestDenyDialog
        open={selectedRequestId !== null}
        onClose={() => setSelectedRequestId(null)}
        onConfirm={handleDenyConfirm}
      />
      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
