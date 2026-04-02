import jsPDF from 'jspdf'
import { formatCurrency, formatDate, formatAccountNumber } from '@/lib/utils/format'
import type { Payment } from '@/types/payment'

export function generateReceiptPdf(payment: Payment): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(18)
  doc.text('Payment Receipt', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(11)
  let y = 40
  const lines: [string, string][] = [
    ['Transaction ID:', String(payment.id)],
    ['From Account:', formatAccountNumber(payment.from_account_number)],
    ['To Account:', formatAccountNumber(payment.to_account_number)],
    ['Recipient:', payment.recipient_name],
    ['Amount:', formatCurrency(payment.initial_amount, 'RSD')],
    ['Payment Code:', payment.payment_code],
    ['Status:', payment.status],
    ['Date:', formatDate(payment.timestamp)],
  ]

  for (const [label, value] of lines) {
    doc.text(label, 20, y)
    doc.text(value, 80, y)
    y += 10
  }

  doc.save(`receipt-${payment.id}.pdf`)
}
