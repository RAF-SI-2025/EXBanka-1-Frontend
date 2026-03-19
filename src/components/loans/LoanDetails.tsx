import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { LOAN_TYPES } from '@/lib/constants/banking'
import type { Loan } from '@/types/loan'

interface LoanDetailsProps {
  loan: Loan
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

const loanTypeLabel = (type: string) => LOAN_TYPES.find((t) => t.value === type)?.label ?? type

const interestTypeLabel = (type?: string) => {
  if (type === 'VARIABLE') return 'Varijabilna'
  if (type === 'FIXED') return 'Fiksna'
  return '—'
}

export function LoanDetails({ loan }: LoanDetailsProps) {
  const currency = loan.currency_code ?? 'RSD'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalji kredita</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow label="Broj kredita" value={loan.loan_number} />
        <InfoRow label="Tip kredita" value={loanTypeLabel(loan.loan_type)} />
        <InfoRow label="Valuta" value={currency} />
        <InfoRow label="Tip kamate" value={interestTypeLabel(loan.interest_type)} />
        <InfoRow label="Iznos" value={formatCurrency(loan.amount, currency)} />
        <InfoRow label="Kamatna stopa" value={`${loan.interest_rate}%`} />
        {loan.nominal_interest_rate !== undefined && (
          <InfoRow label="Nominalna kamatna stopa" value={`${loan.nominal_interest_rate}%`} />
        )}
        {loan.effective_interest_rate !== undefined && (
          <InfoRow label="Efektivna kamatna stopa" value={`${loan.effective_interest_rate}%`} />
        )}
        <InfoRow label="Period" value={`${loan.period} meseci`} />
        <InfoRow label="Mesečna rata" value={formatCurrency(loan.installment_amount, currency)} />
        {loan.remaining_debt !== undefined && (
          <InfoRow
            label="Preostalo dugovanje"
            value={formatCurrency(loan.remaining_debt, currency)}
          />
        )}
        {loan.next_installment_amount !== undefined && loan.next_installment_date && (
          <InfoRow
            label="Sledeća rata"
            value={`${formatCurrency(loan.next_installment_amount, currency)} — ${formatDate(loan.next_installment_date)}`}
          />
        )}
        {loan.contract_date && (
          <InfoRow label="Datum ugovora" value={formatDate(loan.contract_date)} />
        )}
        {loan.maturity_date && (
          <InfoRow label="Datum dospeća" value={formatDate(loan.maturity_date)} />
        )}
        <InfoRow label="Odobren" value={formatDate(loan.created_at)} />
      </CardContent>
    </Card>
  )
}
