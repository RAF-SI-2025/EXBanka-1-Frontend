import jsPDF from 'jspdf'
import { formatCurrency, formatDate, formatAccountNumber } from '@/lib/utils/format'
import type { Payment } from '@/types/payment'

export function generateReceiptPdf(payment: Payment): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(18)
  doc.text('Potvrda o plaćanju', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(11)
  let y = 40
  const lines: [string, string][] = [
    ['ID transakcije:', String(payment.id)],
    ['Sa računa:', formatAccountNumber(payment.from_account_number)],
    ['Na račun:', formatAccountNumber(payment.to_account_number)],
    ['Primalac:', payment.recipient_name],
    ['Iznos:', formatCurrency(payment.initial_amount, 'RSD')],
    ['Šifra plaćanja:', payment.payment_code],
    ['Status:', payment.status],
    ['Datum:', formatDate(payment.timestamp)],
  ]

  for (const [label, value] of lines) {
    doc.text(label, 20, y)
    doc.text(value, 80, y)
    y += 10
  }

  doc.save(`receipt-${payment.id}.pdf`)
}
