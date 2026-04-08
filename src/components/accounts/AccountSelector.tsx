import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchAccounts } from '@/hooks/useAccounts'
import type { Account } from '@/types/account'

interface AccountSelectorProps {
  onAccountSelected: (account: Account | null) => void
  selectedAccount: Account | null
  businessOnly?: boolean
}

export function AccountSelector({
  onAccountSelected,
  selectedAccount,
  businessOnly,
}: AccountSelectorProps) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useSearchAccounts(search)

  const accounts = data?.accounts ?? []
  const visible = businessOnly
    ? accounts.filter((a) => a.account_category === 'business')
    : accounts

  if (selectedAccount) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-md">
        <span className="text-sm">
          {selectedAccount.account_number} — {selectedAccount.account_name} (
          {selectedAccount.currency_code})
        </span>
        <Button variant="ghost" size="sm" onClick={() => onAccountSelected(null)}>
          Change
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Input
        placeholder="Search account by number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isLoading && <p className="text-sm text-muted-foreground">Searching...</p>}
      {visible.length > 0 && (
        <ul className="border rounded-md divide-y max-h-48 overflow-auto">
          {visible.map((account) => (
            <li
              key={account.id}
              className="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
              onClick={() => {
                onAccountSelected(account)
                setSearch('')
              }}
            >
              {account.account_number} — {account.account_name} ({account.currency_code})
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
