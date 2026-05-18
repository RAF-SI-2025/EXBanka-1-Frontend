import { Skeleton } from '@/components/ui/skeleton'
import { useActuaryPerformance } from '@/hooks/useProfit'
import { ActuaryPerformanceTable } from '@/views/actuaries/components/ActuaryPerformanceTable'
import { ViewShell } from '@/views/shared'

export function ActuaryPerformanceView() {
  const { data, isLoading } = useActuaryPerformance()
  return (
    <ViewShell
      title="Actuary Performance"
      subtitle="Realised P&L per actuary across all trading activity."
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <ActuaryPerformanceTable actuaries={data?.actuaries ?? []} />
      )}
    </ViewShell>
  )
}
