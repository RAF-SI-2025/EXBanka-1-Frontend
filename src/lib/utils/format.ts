export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length < 8) return cardNumber
  const first = cardNumber.slice(0, 4)
  const last = cardNumber.slice(-4)
  const middleLen = cardNumber.length - 8
  const middleGroups = '*'.repeat(middleLen).match(/.{1,4}/g) ?? []
  return [first, ...middleGroups, last].join(' ')
}

export function formatAccountNumber(accountNumber: string): string {
  if (!accountNumber) return ''
  // Format as XXX-XXXXXXXXXX-XX
  if (accountNumber.length === 18) {
    return `${accountNumber.slice(0, 3)}-${accountNumber.slice(3, 16)}-${accountNumber.slice(16)}`
  }
  return accountNumber
}

// Human label for an account in a picker/dropdown. Anchors on the full account
// number so an option is always identifiable even when `account_name` is blank
// — prevents a Select trigger from falling back to the raw account id.
export function formatAccountOption(account: {
  account_name?: string | null
  account_number: string
  currency_code?: string | null
}): string {
  const number = formatAccountNumber(account.account_number)
  const base = account.account_name ? `${account.account_name} · ${number}` : number
  return account.currency_code ? `${base} (${account.currency_code})` : base
}

export function formatCurrency(amount: number, currency: string): string {
  return (
    new Intl.NumberFormat('sr-Latn-RS', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ` ${currency}`
  )
}

export function formatDate(dateString: string | number | null | undefined): string {
  if (!dateString && dateString !== 0) return '-'
  const normalized = typeof dateString === 'string' ? dateString.replace(/ UTC$/, 'Z') : dateString
  const date =
    typeof normalized === 'number'
      ? new Date(normalized < 1e12 ? normalized * 1000 : normalized)
      : new Date(normalized)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('sr-Latn-RS')
}

export function formatUnixDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('sr-Latn-RS')
}
