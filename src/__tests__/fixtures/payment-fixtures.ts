import type { Payment, PaymentRecipient } from '@/types/payment'

export function createMockPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1,
    from_account_number: '111000100000000011',
    to_account_number: '111000100000000099',
    recipient_name: 'Elektro Beograd',
    initial_amount: 5000,
    final_amount: 5000,
    commission: 0,
    payment_code: '221',
    reference_number: '97 1234567890',
    payment_purpose: 'Račun za struju',
    status: 'COMPLETED',
    timestamp: '2026-03-13T10:00:00Z',
    ...overrides,
  }
}

export function createMockPaymentRecipient(
  overrides: Partial<PaymentRecipient> = {}
): PaymentRecipient {
  return {
    id: 1,
    client_id: 1,
    recipient_name: 'Elektro Beograd',
    account_number: '111000100000000099',
    created_at: '2026-03-13T10:00:00Z',
    ...overrides,
  }
}
