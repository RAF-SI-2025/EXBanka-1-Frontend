import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchClients } from '@/hooks/useClients'
import type { Client } from '@/types/client'

interface ClientSelectorProps {
  onClientSelected: (client: Client) => void
  onCreateNew?: () => void
  selectedClient?: Client | null
}

export function ClientSelector({
  onClientSelected,
  onCreateNew,
  selectedClient,
}: ClientSelectorProps) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useSearchClients(search)

  if (selectedClient) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-md">
        <span>
          {selectedClient.first_name} {selectedClient.last_name} ({selectedClient.email})
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onClientSelected(null as unknown as Client)}
        >
          Promeni
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Search client by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline" onClick={onCreateNew}>
          Create New
        </Button>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Searching...</p>}
      {data?.clients && data.clients.length > 0 && (
        <ul className="border rounded-md divide-y max-h-48 overflow-auto">
          {data.clients.map((client) => (
            <li
              key={client.id}
              className="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
              onClick={() => {
                onClientSelected(client)
                setSearch('')
              }}
            >
              {client.first_name} {client.last_name} — {client.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
