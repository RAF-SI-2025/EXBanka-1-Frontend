import { Link } from 'react-router-dom'
import { usePaymentRecipients } from '@/hooks/usePayments'

export function QuickPayment() {
  const { data: recipients = [] } = usePaymentRecipients()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Saved Recipients</h3>
        <Link to="/payments/recipients" className="text-sm text-primary hover:underline">
          Manage
        </Link>
      </div>
      {recipients.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved recipients.</p>
      ) : (
        <ul className="divide-y">
          {recipients.slice(0, 5).map((r) => (
            <li key={r.id} className="py-2 flex justify-between text-sm">
              <span>{r.recipient_name}</span>
              <Link to={`/payments/new?recipient=${r.id}`} className="text-primary hover:underline">
                Pay
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
