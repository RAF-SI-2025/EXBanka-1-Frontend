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

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktivan',
  INACTIVE: 'Neaktivan',
  BLOCKED: 'Blokiran',
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CURRENT: 'Tekući',
  FOREIGN_CURRENCY: 'Devizni',
}

const OWNER_TYPE_LABELS: Record<string, string> = {
  PERSONAL: 'Lični',
  BUSINESS: 'Poslovni',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  INACTIVE: 'secondary',
  BLOCKED: 'destructive',
}

interface AccountTableProps {
  accounts: Account[]
  onViewCards: (accountId: number) => void
}

export function AccountTable({ accounts, onViewCards }: AccountTableProps) {
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
            <TableCell>{acc.owner_name}</TableCell>
            <TableCell className="font-mono text-sm">
              {formatAccountNumber(acc.account_number)}
            </TableCell>
            <TableCell>{acc.name}</TableCell>
            <TableCell>{ACCOUNT_TYPE_LABELS[acc.account_type] ?? acc.account_type}</TableCell>
            <TableCell>{OWNER_TYPE_LABELS[acc.owner_type] ?? acc.owner_type}</TableCell>
            <TableCell>{acc.currency}</TableCell>
            <TableCell>{formatCurrency(acc.available_balance, acc.currency)}</TableCell>
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
