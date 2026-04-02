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
  if (type === 'VARIABLE') return 'Variable'
  if (type === 'FIXED') return 'Fixed'
  return '—'
}

export function LoanDetails({ loan }: LoanDetailsProps) {
  const currency = loan.currency_code ?? 'RSD'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow label="Loan Number" value={loan.loan_number} />
        <InfoRow label="Loan Type" value={loanTypeLabel(loan.loan_type)} />
        <InfoRow label="Currency" value={currency} />
        <InfoRow label="Interest Type" value={interestTypeLabel(loan.interest_type)} />
        <InfoRow label="Amount" value={formatCurrency(loan.amount, currency)} />
        <InfoRow label="Interest Rate" value={`${loan.interest_rate}%`} />
        {loan.nominal_interest_rate !== undefined && (
          <InfoRow label="Nominal Interest Rate" value={`${loan.nominal_interest_rate}%`} />
        )}
        {loan.effective_interest_rate !== undefined && (
          <InfoRow label="Effective Interest Rate" value={`${loan.effective_interest_rate}%`} />
        )}
        <InfoRow label="Period" value={`${loan.period} months`} />
        <InfoRow
          label="Monthly Installment"
          value={formatCurrency(loan.installment_amount, currency)}
        />
        {loan.remaining_debt !== undefined && (
          <InfoRow label="Remaining Debt" value={formatCurrency(loan.remaining_debt, currency)} />
        )}
        {loan.next_installment_amount !== undefined && loan.next_installment_date && (
          <InfoRow
            label="Next Installment"
            value={`${formatCurrency(loan.next_installment_amount, currency)} — ${formatDate(loan.next_installment_date)}`}
          />
        )}
        {loan.contract_date && (
          <InfoRow label="Contract Date" value={formatDate(loan.contract_date)} />
        )}
        {loan.maturity_date && (
          <InfoRow label="Maturity Date" value={formatDate(loan.maturity_date)} />
        )}
        <InfoRow label="Approved" value={formatDate(loan.created_at)} />
      </CardContent>
    </Card>
  )
}
