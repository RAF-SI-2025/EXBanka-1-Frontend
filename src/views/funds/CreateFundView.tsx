import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useCreateFund } from '@/hooks/useFunds'
import { notifySuccess } from '@/lib/errors'
import { CreateFundForm } from '@/views/funds/components/CreateFundForm'
import { ViewShell } from '@/views/shared'

export function CreateFundView() {
  const navigate = useNavigate()
  const createMutation = useCreateFund()

  return (
    <ViewShell
      title="Create fund"
      subtitle="Define a new fund. The bank seeds liquidity; clients can invest immediately."
    >
      <Card>
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>
    </ViewShell>
  )
}
