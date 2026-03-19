import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { ClientFilters } from '@/components/admin/ClientFilters'
import { ClientTable } from '@/components/admin/ClientTable'

export function AdminClientsPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const { data, isLoading } = useAllClients({ name: name || undefined, email: email || undefined })
  const clients = data?.clients ?? []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upravljanje klijentima</h1>
        <Button onClick={() => navigate('/admin/clients/new')}>Novi klijent</Button>
      </div>

      <ClientFilters name={name} onNameChange={setName} email={email} onEmailChange={setEmail} />

      {isLoading ? (
        <p>Učitavanje...</p>
      ) : (
        <ClientTable
          clients={clients}
          onEdit={(clientId) => navigate(`/admin/clients/${clientId}`)}
        />
      )}
    </div>
  )
}
