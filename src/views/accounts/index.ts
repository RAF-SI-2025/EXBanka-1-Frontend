// Public surface of the Accounts view module — seven entry views covering
// client browsing (list, details, activity) and admin management (admin
// list, per-account cards, bank-account activity, create-new flow). The
// account-domain primitives (AccountCard, AccountTable, AccountSelector,
// ClientSelector, AdminCardItem, …) live in `components/` and are imported
// by sibling views in the home and orders modules through the public surface.
export { AccountListView } from './AccountListView'
export { AccountDetailsView } from './AccountDetailsView'
export { CreateAccountView } from './CreateAccountView'
export { AccountActivityView } from './AccountActivityView'
export { BankAccountActivityView } from './BankAccountActivityView'
export { AdminAccountsView } from './AdminAccountsView'
export { AdminAccountCardsView } from './AdminAccountCardsView'
