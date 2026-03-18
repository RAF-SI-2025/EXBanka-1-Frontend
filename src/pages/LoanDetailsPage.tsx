import { useParams, useNavigate } from 'react-router-dom'
import { useLoan } from '@/hooks/useLoans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { LOAN_TYPES } from '@/lib/constants/banking'

const INSTALLMENT_STATUS_LABELS: Record<string, string> = {
  PAID: 'Plaćena',
  UNPAID: 'Neplaćena',
  OVERDUE: 'Zakasnela',
}
const INSTALLMENT_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  PAID: 'default',
  UNPAID: 'secondary',
  OVERDUE: 'destructive',
}

export function LoanDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: loan, isLoading } = useLoan(Number(id))
  const loanTypeLabel = (type: string) => LOAN_TYPES.find((t) => t.value === type)?.label ?? type

  if (isLoading) return <p>Učitavanje...</p>
  if (!loan) return <p>Kredit nije pronađen.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/loans')}>
          ← Nazad
        </Button>
        <h1 className="text-2xl font-bold">{loanTypeLabel(loan.loan_type)}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalji kredita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Iznos" value={formatCurrency(loan.amount, 'RSD')} />
          <InfoRow label="Kamatna stopa" value={`${loan.interest_rate}%`} />
          <InfoRow label="Period" value={`${loan.period} meseci`} />
          <InfoRow label="Mesečna rata" value={formatCurrency(loan.installment_amount, 'RSD')} />
          <InfoRow label="Odobren" value={formatDate(loan.created_at)} />
        </CardContent>
      </Card>

      {loan.installments && loan.installments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Rok plaćanja</TableHead>
                  <TableHead>Iznos</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loan.installments.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell>{inst.installment_number}</TableCell>
                    <TableCell>{formatDate(inst.due_date)}</TableCell>
                    <TableCell>{formatCurrency(inst.amount, 'RSD')}</TableCell>
                    <TableCell>
                      <Badge variant={INSTALLMENT_VARIANT[inst.status] ?? 'secondary'}>
                        {INSTALLMENT_STATUS_LABELS[inst.status] ?? inst.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
