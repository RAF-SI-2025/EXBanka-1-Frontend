import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ErrorFallback } from '@/components/shared/ErrorFallback'
import { PaginationControls } from '@/components/shared/PaginationControls'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { LoadingState, ViewShell } from '@/views/shared'
import { AuditLogTable } from '@/views/audit/components/AuditLogTable'
import type { AuditCategory } from '@/types/audit'

const CATEGORY_OPTIONS: { value: AuditCategory; label: string }[] = [
  { value: 'clients', label: 'Clients' },
  { value: 'employees', label: 'Employees' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'cards', label: 'Cards' },
  { value: 'loans', label: 'Loans' },
]

const PAGE_SIZE = 50

export function AuditLogsView() {
  const [category, setCategory] = useState<AuditCategory>('clients')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useAuditLogs(category, { page, page_size: PAGE_SIZE })
  const entries = data?.entries ?? []
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE))

  const handleCategoryChange = (next: AuditCategory) => {
    setCategory(next)
    setPage(1)
  }

  return (
    <ViewShell
      title="Logs"
      subtitle="Field-level audit trail across services. Pick a category to inspect its changelog."
    >
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="max-w-xs">
            <Label htmlFor="audit-category">Category</Label>
            <select
              id="audit-category"
              aria-label="Category"
              className="w-full border rounded px-3 py-2 text-sm mt-1"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as AuditCategory)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorFallback message="Could not load audit log." />
          ) : (
            <AuditLogTable entries={entries} />
          )}

          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </ViewShell>
  )
}
