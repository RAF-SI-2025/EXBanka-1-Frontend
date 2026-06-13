// Public surface of the Payments view module — three flows (new payment to a
// recipient, internal transfer to another EXBanka client, and the history of
// all sent payments). The saved-recipient management UI lives in
// `src/views/paymentRecipients/`.
export { NewPaymentView } from './NewPaymentView'
export { InternalTransferView } from './InternalTransferView'
export { PaymentHistoryView } from './PaymentHistoryView'
