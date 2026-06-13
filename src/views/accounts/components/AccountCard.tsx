import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatAccountNumber } from '@/lib/utils/format'
import type { Account } from '@/types/account'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktivan',
  INACTIVE: 'Neaktivan',
  BLOCKED: 'Blokiran',
  CLOSED: 'Zatvoren',
}

interface AccountCardProps {
  account: Account
  onClick?: () => void
}

export function AccountCard({ account, onClick }: AccountCardProps) {
  return (
    <Card
      className={onClick ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="font-semibold">{account.account_name}</p>
            <p className="text-sm text-muted-foreground font-mono">
              {formatAccountNumber(account.account_number)}
            </p>
            <p className="text-sm text-muted-foreground">
              {account.account_kind === 'foreign' ? 'Devizni' : 'Tekući'} • {account.currency_code}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-lg font-bold">
              {formatCurrency(account.available_balance, account.currency_code)}
            </p>
            <StatusBadge status={account.status}>
              {STATUS_LABELS[account.status] ?? account.status}
            </StatusBadge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
