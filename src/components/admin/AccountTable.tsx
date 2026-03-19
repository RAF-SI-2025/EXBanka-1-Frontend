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
  ACTIVE: 'Aktivan',
  INACTIVE: 'Neaktivan',
  BLOCKED: 'Blokiran',
  CLOSED: 'Zatvoren',
}

const ACCOUNT_KIND_LABELS: Record<string, string> = {
  checking: 'Tekući',
  savings: 'Štedni',
  foreign: 'Devizni',
  business: 'Poslovni',
}

const ACCOUNT_CATEGORY_LABELS: Record<string, string> = {
  PERSONAL: 'Lični',
  COMPANY: 'Poslovni',
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
  clientsById?: Record<number, Client>
}

export function AccountTable({ accounts, onViewCards, clientsById }: AccountTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vlasnik</TableHead>
          <TableHead>Broj računa</TableHead>
          <TableHead>Naziv</TableHead>
          <TableHead>Tip</TableHead>
          <TableHead>Vlasnik tip</TableHead>
          <TableHead>Valuta</TableHead>
          <TableHead>Stanje</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Akcije</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((acc) => (
          <TableRow key={acc.id}>
            <TableCell>
              {acc.account_category === 'PERSONAL' && clientsById?.[acc.owner_id]
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
              <Button size="sm" variant="outline" onClick={() => onViewCards(acc.id)}>
                Kartice
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {accounts.length === 0 && (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground">
              Nema računa.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
