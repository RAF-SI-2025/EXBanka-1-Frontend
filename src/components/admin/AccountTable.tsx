import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatAccountNumber } from '@/lib/utils/format'
import type { Account } from '@/types/account'
import type { Client } from '@/types/client'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  BLOCKED: 'Blocked',
  CLOSED: 'Closed',
}

const ACCOUNT_KIND_LABELS: Record<string, string> = {
  current: 'Checking',
  foreign: 'Foreign Currency',
}

const ACCOUNT_CATEGORY_LABELS: Record<string, string> = {
  personal: 'Personal',
  business: 'Business',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  BLOCKED: 'destructive',
  CLOSED: 'secondary',
}

interface AccountTableProps {
  accounts: Account[]
  onViewCards: (accountId: number) => void
  onViewActivity?: (accountId: number) => void
  clientsById?: Record<number, Client>
}

export function AccountTable({
  accounts,
  onViewCards,
  onViewActivity,
  clientsById,
}: AccountTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Owner</TableHead>
          <TableHead>Account Number</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Owner Type</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((acc) => (
          <TableRow key={acc.id}>
            <TableCell>
              {acc.account_category === 'personal' && clientsById?.[acc.owner_id]
                ? `${clientsById[acc.owner_id].first_name} ${clientsById[acc.owner_id].last_name}`
                : acc.owner_name}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {formatAccountNumber(acc.account_number)}
            </TableCell>
            <TableCell>{acc.account_name}</TableCell>
            <TableCell>{ACCOUNT_KIND_LABELS[acc.account_kind] ?? acc.account_kind}</TableCell>
            <TableCell>
              {ACCOUNT_CATEGORY_LABELS[acc.account_category] ?? acc.account_category}
            </TableCell>
            <TableCell>{acc.currency_code}</TableCell>
            <TableCell>{formatCurrency(acc.available_balance, acc.currency_code)}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[acc.status] ?? 'secondary'}>
                {STATUS_LABELS[acc.status] ?? acc.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onViewCards(acc.id)}>
                  Cards
                </Button>
                {onViewActivity && (
                  <Button size="sm" variant="outline" onClick={() => onViewActivity(acc.id)}>
                    Activity
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {accounts.length === 0 && (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground">
              No accounts.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
