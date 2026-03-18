import type { Payment, PaymentRecipient } from '@/types/payment'

export function createMockPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1,
    order_number: '9876543210123',
    from_account: '111000100000000011',
    to_account: '111000100000000099',
    receiver_name: 'Elektro Beograd',
    amount: 5000,
    currency: 'RSD',
    payment_code: '221',
    reference: '97 1234567890',
    description: 'Račun za struju',
    status: 'REALIZED',
    timestamp: '2026-03-13T10:00:00Z',
    ...overrides,
  }
}

export function createMockPaymentRecipient(
  overrides: Partial<PaymentRecipient> = {}
): PaymentRecipient {
  return {
    id: 1,
    name: 'Elektro Beograd',
    account_number: '111000100000000099',
    reference: '97 1234567890',
    payment_code: '221',
    ...overrides,
  }
}
