import { useNavigate } from 'react-router-dom'
import { CreateFundForm } from '@/components/funds/CreateFundForm'
import { useCreateFund } from '@/hooks/useFunds'
import { notifySuccess } from '@/lib/errors'

export function CreateFundPage() {
  const navigate = useNavigate()
  const createMutation = useCreateFund()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Create fund</h1>
      <CreateFundForm
        submitting={createMutation.isPending}
        onSubmit={(payload) =>
          createMutation.mutate(payload, {
            onSuccess: ({ fund }) => {
              notifySuccess(`Fund "${fund.name}" created.`)
              navigate(`/funds/${fund.id}`)
            },
          })
        }
      />
    </div>
  )
}
