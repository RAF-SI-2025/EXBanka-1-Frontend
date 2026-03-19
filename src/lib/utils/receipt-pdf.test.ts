jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
    internal: { pageSize: { getWidth: () => 210 } },
  }))
})

import { generateReceiptPdf } from '@/lib/utils/receipt-pdf'
import { createMockPayment } from '@/__tests__/fixtures/payment-fixtures'

describe('generateReceiptPdf', () => {
  it('calls jsPDF save with correct filename', () => {
    const payment = createMockPayment({ order_number: '123' })
    generateReceiptPdf(payment)
     
    const jsPDF = require('jspdf')
    const instance = jsPDF.mock.results[0].value
    expect(instance.save).toHaveBeenCalledWith('receipt-123.pdf')
  })

  it('calls text with payment receiver name', () => {
    const payment = createMockPayment({ receiver_name: 'Test Primalac', order_number: '456' })
    generateReceiptPdf(payment)
     
    const jsPDF = require('jspdf')
    const instance = jsPDF.mock.results[1].value
    const calls = instance.text.mock.calls.map((c: unknown[]) => c[0])
    expect(calls).toContain('Test Primalac')
  })

  it('sets font size before writing content', () => {
    const payment = createMockPayment({ order_number: '789' })
    generateReceiptPdf(payment)
     
    const jsPDF = require('jspdf')
    const instance = jsPDF.mock.results[2].value
    expect(instance.setFontSize).toHaveBeenCalled()
  })
})
