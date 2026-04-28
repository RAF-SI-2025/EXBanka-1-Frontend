import { Skeleton } from '@/components/ui/skeleton'
import { useActuaryPerformance } from '@/hooks/useProfit'
import { ActuaryPerformanceTable } from '@/components/profit/ActuaryPerformanceTable'

export function ActuaryPerformancePage() {
  const { data, isLoading } = useActuaryPerformance()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Actuary Performance</h1>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <ActuaryPerformanceTable actuaries={data?.actuaries ?? []} />
      )}
    </div>
  )
}
