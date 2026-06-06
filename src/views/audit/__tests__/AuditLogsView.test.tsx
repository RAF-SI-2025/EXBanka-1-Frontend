import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AuditLogsView } from '@/views/audit/AuditLogsView'
import * as auditApi from '@/lib/api/audit'
import { createMockAuditEntry } from '@/__tests__/fixtures/audit-fixtures'

jest.mock('@/lib/api/audit')

const mockedGet = auditApi.getAuditChangelog as jest.MockedFunction<
  typeof auditApi.getAuditChangelog
>

beforeEach(() => {
  mockedGet.mockReset()
  mockedGet.mockResolvedValue({
    entries: [createMockAuditEntry()],
    total: 1,
    page: 1,
    page_size: 50,
  })
})

describe('AuditLogsView', () => {
  it('defaults to the Clients category and fetches its changelog', async () => {
    renderWithProviders(<AuditLogsView />)
    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalledWith('clients', expect.any(Object))
    })
    expect((screen.getByLabelText(/Category/i) as HTMLSelectElement).value).toBe('clients')
  })

  it('renders all five category options', () => {
    renderWithProviders(<AuditLogsView />)
    const select = screen.getByLabelText(/Category/i) as HTMLSelectElement
    const optionValues = Array.from(select.options).map((o) => o.value)
    expect(optionValues).toEqual(['clients', 'employees', 'accounts', 'cards', 'loans'])
  })

  it('refetches with the new category when the dropdown changes', async () => {
    renderWithProviders(<AuditLogsView />)
    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('clients', expect.any(Object)))

    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'employees' } })

    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('employees', expect.any(Object)))
  })

  it('renders rows from the API response in the table', async () => {
    mockedGet.mockResolvedValue({
      entries: [
        createMockAuditEntry({
          id: 1,
          entity_type: 'account',
          entity_id: 9,
          field_name: 'status',
          old_value: 'active',
          new_value: 'inactive',
        }),
      ],
      total: 1,
      page: 1,
      page_size: 50,
    })

    renderWithProviders(<AuditLogsView />)

    await waitFor(() => expect(screen.getByText('account')).toBeInTheDocument())
    expect(screen.getByText(/#9/)).toBeInTheDocument()
    expect(screen.getByText('status')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('inactive')).toBeInTheDocument()
  })

  it('shows the empty state when there are no entries', async () => {
    mockedGet.mockResolvedValue({ entries: [], total: 0, page: 1, page_size: 50 })
    renderWithProviders(<AuditLogsView />)
    await waitFor(() => expect(screen.getByText(/No audit entries/i)).toBeInTheDocument())
  })
})
