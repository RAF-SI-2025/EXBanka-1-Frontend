# Admin Management Views Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 5 new admin pages for managing roles & permissions, employee limits, client limits, interest rate tiers & bank margins, and transfer fees — all admin-only with permission gates.

**Architecture:** Each page follows the existing admin pattern: FilterBar + Table + PaginationControls + Dialog for edit/create. Data fetching via TanStack Query hooks backed by Axios API functions. Routes protected by `ProtectedRoute` with `requiredPermission`. New "Settings" sidebar section.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Shadcn UI, Tailwind CSS, React Router v7

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/types/limits.ts` | EmployeeLimits, ClientLimits, LimitTemplate types |
| Create | `src/types/fee.ts` | TransferFee type |
| Modify | `src/types/interestRateTiers.ts` | Add `active`, `created_at`, `updated_at` fields |
| Create | `src/lib/api/roles.ts` | Role CRUD API functions |
| Create | `src/lib/api/permissions.ts` | Permissions list + employee role/perm assignment |
| Create | `src/lib/api/limits.ts` | Employee/client limits + templates API |
| Create | `src/lib/api/interestRateTiers.ts` | Interest rate tier CRUD + apply |
| Create | `src/lib/api/bankMargins.ts` | Bank margin list + update |
| Create | `src/lib/api/fees.ts` | Transfer fee CRUD |
| Create | `src/hooks/useRoles.ts` | TanStack Query hooks for roles |
| Create | `src/hooks/usePermissions.ts` | TanStack Query hooks for permissions |
| Create | `src/hooks/useLimits.ts` | TanStack Query hooks for limits + templates |
| Create | `src/hooks/useInterestRateTiers.ts` | TanStack Query hooks for tiers |
| Create | `src/hooks/useBankMargins.ts` | TanStack Query hooks for margins |
| Create | `src/hooks/useFees.ts` | TanStack Query hooks for fees |
| Create | `src/components/admin/RolesTable.tsx` | Roles list table |
| Create | `src/components/admin/PermissionsTable.tsx` | Read-only permissions reference |
| Create | `src/components/admin/CreateRoleDialog.tsx` | Create role form dialog |
| Create | `src/components/admin/EditRolePermissionsDialog.tsx` | Edit role permissions dialog |
| Create | `src/components/admin/EditEmployeeLimitsDialog.tsx` | Edit employee limits dialog |
| Create | `src/components/admin/LimitTemplatesDialog.tsx` | Manage limit templates dialog |
| Create | `src/components/admin/EditClientLimitsDialog.tsx` | Edit client limits dialog |
| Create | `src/components/admin/InterestRateTiersTable.tsx` | Interest rate tiers table |
| Create | `src/components/admin/CreateTierDialog.tsx` | Create tier form dialog |
| Create | `src/components/admin/EditTierDialog.tsx` | Edit tier form dialog |
| Create | `src/components/admin/BankMarginsTable.tsx` | Bank margins table |
| Create | `src/components/admin/EditMarginDialog.tsx` | Edit margin dialog |
| Create | `src/components/admin/FeesTable.tsx` | Transfer fees table |
| Create | `src/components/admin/CreateFeeDialog.tsx` | Create fee rule dialog |
| Create | `src/components/admin/EditFeeDialog.tsx` | Edit fee rule dialog |
| Create | `src/pages/AdminRolesPage.tsx` | Roles & permissions page |
| Create | `src/pages/AdminEmployeeLimitsPage.tsx` | Employee limits page |
| Create | `src/pages/AdminClientLimitsPage.tsx` | Client limits page |
| Create | `src/pages/AdminInterestRatesPage.tsx` | Interest rates & margins page |
| Create | `src/pages/AdminFeesPage.tsx` | Transfer fees page |
| Modify | `src/components/layout/Sidebar.tsx` | Add Settings section |
| Modify | `src/App.tsx` | Register new routes |

---

### Task 1: Types — limits and fees

**Files:**
- Create: `src/types/limits.ts`
- Create: `src/types/fee.ts`
- Modify: `src/types/interestRateTiers.ts`

- [ ] **Step 1: Create limits types**

Create `src/types/limits.ts`:

```typescript
export interface EmployeeLimits {
  id: number
  employee_id: number
  max_loan_approval_amount: string
  max_single_transaction: string
  max_daily_transaction: string
  max_client_daily_limit: string
  max_client_monthly_limit: string
}

export interface ClientLimits {
  id: number
  client_id: number
  daily_limit: string
  monthly_limit: string
  transfer_limit: string
  set_by_employee: number
}

export interface LimitTemplate {
  id: number
  name: string
  description: string
  max_loan_approval_amount: string
  max_single_transaction: string
  max_daily_transaction: string
  max_client_daily_limit: string
  max_client_monthly_limit: string
}

export interface LimitTemplateListResponse {
  templates: LimitTemplate[]
}

export interface CreateLimitTemplatePayload {
  name: string
  description: string
  max_loan_approval_amount: string
  max_single_transaction: string
  max_daily_transaction: string
  max_client_daily_limit: string
  max_client_monthly_limit: string
}

export interface UpdateEmployeeLimitsPayload {
  max_loan_approval_amount: string
  max_single_transaction: string
  max_daily_transaction: string
  max_client_daily_limit: string
  max_client_monthly_limit: string
}

export interface UpdateClientLimitsPayload {
  daily_limit: string
  monthly_limit: string
  transfer_limit: string
}
```

- [ ] **Step 2: Create fee types**

Create `src/types/fee.ts`:

```typescript
export interface TransferFee {
  id: number
  name: string
  fee_type: 'percentage' | 'fixed'
  fee_value: string
  min_amount: string
  max_fee: string
  transaction_type: 'payment' | 'transfer' | 'all'
  currency_code: string
  active: boolean
}

export interface FeeListResponse {
  fees: TransferFee[]
}

export interface CreateFeePayload {
  name: string
  fee_type: 'percentage' | 'fixed'
  fee_value: string
  min_amount?: string
  max_fee?: string
  transaction_type: 'payment' | 'transfer' | 'all'
  currency_code?: string
}

export interface UpdateFeePayload {
  name?: string
  fee_type?: 'percentage' | 'fixed'
  fee_value?: string
  min_amount?: string
  max_fee?: string
  transaction_type?: 'payment' | 'transfer' | 'all'
  currency_code?: string
  active?: boolean
}
```

- [ ] **Step 3: Update InterestRateTier type to include active, created_at, updated_at**

In `src/types/interestRateTiers.ts`, update the `InterestRateTier` interface:

```typescript
export interface InterestRateTier {
  id: number
  amount_from: number
  amount_to: number
  fixed_rate: number
  variable_base: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateTierPayload {
  amount_from: number
  amount_to: number
  fixed_rate: number
  variable_base: number
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/types/limits.ts src/types/fee.ts src/types/interestRateTiers.ts
git commit -m "feat: add types for limits, fees, and update interest rate tiers"
```

---

### Task 2: API functions — roles, permissions, limits

**Files:**
- Create: `src/lib/api/roles.ts`
- Create: `src/lib/api/permissions.ts`
- Create: `src/lib/api/limits.ts`

- [ ] **Step 1: Create roles API**

Create `src/lib/api/roles.ts`:

```typescript
import { apiClient } from '@/lib/api/axios'
import type { Role, CreateRolePayload } from '@/types/roles'

export interface RoleListResponse {
  roles: Role[]
}

export async function getRoles(): Promise<RoleListResponse> {
  const { data } = await apiClient.get<RoleListResponse>('/api/roles')
  return { ...data, roles: data.roles ?? [] }
}

export async function getRole(id: number): Promise<Role> {
  const { data } = await apiClient.get<Role>(`/api/roles/${id}`)
  return data
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const { data } = await apiClient.post<Role>('/api/roles', payload)
  return data
}

export async function updateRolePermissions(
  id: number,
  permissionCodes: string[]
): Promise<Role> {
  const { data } = await apiClient.put<Role>(`/api/roles/${id}/permissions`, {
    permission_codes: permissionCodes,
  })
  return data
}
```

- [ ] **Step 2: Create permissions API**

Create `src/lib/api/permissions.ts`:

```typescript
import { apiClient } from '@/lib/api/axios'
import type { Permission } from '@/types/roles'
import type { Employee } from '@/types/employee'

export interface PermissionListResponse {
  permissions: Permission[]
}

export async function getPermissions(): Promise<PermissionListResponse> {
  const { data } = await apiClient.get<PermissionListResponse>('/api/permissions')
  return { ...data, permissions: data.permissions ?? [] }
}

export async function setEmployeeRoles(
  id: number,
  roleNames: string[]
): Promise<Employee> {
  const { data } = await apiClient.put<Employee>(`/api/employees/${id}/roles`, {
    role_names: roleNames,
  })
  return data
}

export async function setEmployeePermissions(
  id: number,
  permissionCodes: string[]
): Promise<Employee> {
  const { data } = await apiClient.put<Employee>(`/api/employees/${id}/permissions`, {
    permission_codes: permissionCodes,
  })
  return data
}
```

- [ ] **Step 3: Create limits API**

Create `src/lib/api/limits.ts`:

```typescript
import { apiClient } from '@/lib/api/axios'
import type {
  EmployeeLimits,
  ClientLimits,
  LimitTemplate,
  LimitTemplateListResponse,
  UpdateEmployeeLimitsPayload,
  UpdateClientLimitsPayload,
  CreateLimitTemplatePayload,
} from '@/types/limits'

export async function getEmployeeLimits(id: number): Promise<EmployeeLimits> {
  const { data } = await apiClient.get<EmployeeLimits>(`/api/employees/${id}/limits`)
  return data
}

export async function updateEmployeeLimits(
  id: number,
  payload: UpdateEmployeeLimitsPayload
): Promise<EmployeeLimits> {
  const { data } = await apiClient.put<EmployeeLimits>(
    `/api/employees/${id}/limits`,
    payload
  )
  return data
}

export async function applyLimitTemplate(
  employeeId: number,
  templateName: string
): Promise<EmployeeLimits> {
  const { data } = await apiClient.post<EmployeeLimits>(
    `/api/employees/${employeeId}/limits/template`,
    { template_name: templateName }
  )
  return data
}

export async function getLimitTemplates(): Promise<LimitTemplateListResponse> {
  const { data } = await apiClient.get<LimitTemplateListResponse>('/api/limits/templates')
  return { ...data, templates: data.templates ?? [] }
}

export async function createLimitTemplate(
  payload: CreateLimitTemplatePayload
): Promise<LimitTemplate> {
  const { data } = await apiClient.post<LimitTemplate>('/api/limits/templates', payload)
  return data
}

export async function getClientLimits(id: number): Promise<ClientLimits> {
  const { data } = await apiClient.get<ClientLimits>(`/api/clients/${id}/limits`)
  return data
}

export async function updateClientLimits(
  id: number,
  payload: UpdateClientLimitsPayload
): Promise<ClientLimits> {
  const { data } = await apiClient.put<ClientLimits>(
    `/api/clients/${id}/limits`,
    payload
  )
  return data
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/roles.ts src/lib/api/permissions.ts src/lib/api/limits.ts
git commit -m "feat: add API functions for roles, permissions, and limits"
```

---

### Task 3: API functions — interest rate tiers, bank margins, fees

**Files:**
- Create: `src/lib/api/interestRateTiers.ts`
- Create: `src/lib/api/bankMargins.ts`
- Create: `src/lib/api/fees.ts`

- [ ] **Step 1: Create interest rate tiers API**

Create `src/lib/api/interestRateTiers.ts`:

```typescript
import { apiClient } from '@/lib/api/axios'
import type { InterestRateTier, CreateTierPayload } from '@/types/interestRateTiers'

export interface TierListResponse {
  tiers: InterestRateTier[]
}

export interface ApplyTierResponse {
  affected_loans: number
}

export async function getInterestRateTiers(): Promise<TierListResponse> {
  const { data } = await apiClient.get<TierListResponse>('/api/interest-rate-tiers')
  return { ...data, tiers: data.tiers ?? [] }
}

export async function createTier(payload: CreateTierPayload): Promise<InterestRateTier> {
  const { data } = await apiClient.post<InterestRateTier>(
    '/api/interest-rate-tiers',
    payload
  )
  return data
}

export async function updateTier(
  id: number,
  payload: CreateTierPayload
): Promise<InterestRateTier> {
  const { data } = await apiClient.put<InterestRateTier>(
    `/api/interest-rate-tiers/${id}`,
    payload
  )
  return data
}

export async function deleteTier(id: number): Promise<void> {
  await apiClient.delete(`/api/interest-rate-tiers/${id}`)
}

export async function applyTier(id: number): Promise<ApplyTierResponse> {
  const { data } = await apiClient.post<ApplyTierResponse>(
    `/api/interest-rate-tiers/${id}/apply`
  )
  return data
}
```

- [ ] **Step 2: Create bank margins API**

Create `src/lib/api/bankMargins.ts`:

```typescript
import { apiClient } from '@/lib/api/axios'
import type { BankMargin } from '@/types/bankMargins'

export interface MarginListResponse {
  margins: BankMargin[]
}

export async function getBankMargins(): Promise<MarginListResponse> {
  const { data } = await apiClient.get<MarginListResponse>('/api/bank-margins')
  return { ...data, margins: data.margins ?? [] }
}

export async function updateBankMargin(
  id: number,
  margin: number
): Promise<BankMargin> {
  const { data } = await apiClient.put<BankMargin>(`/api/bank-margins/${id}`, {
    margin,
  })
  return data
}
```

- [ ] **Step 3: Create fees API**

Create `src/lib/api/fees.ts`:

```typescript
import { apiClient } from '@/lib/api/axios'
import type {
  TransferFee,
  FeeListResponse,
  CreateFeePayload,
  UpdateFeePayload,
} from '@/types/fee'

export async function getFees(): Promise<FeeListResponse> {
  const { data } = await apiClient.get<FeeListResponse>('/api/fees')
  return { ...data, fees: data.fees ?? [] }
}

export async function createFee(payload: CreateFeePayload): Promise<TransferFee> {
  const { data } = await apiClient.post<TransferFee>('/api/fees', payload)
  return data
}

export async function updateFee(
  id: number,
  payload: UpdateFeePayload
): Promise<TransferFee> {
  const { data } = await apiClient.put<TransferFee>(`/api/fees/${id}`, payload)
  return data
}

export async function deleteFee(id: number): Promise<void> {
  await apiClient.delete(`/api/fees/${id}`)
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/interestRateTiers.ts src/lib/api/bankMargins.ts src/lib/api/fees.ts
git commit -m "feat: add API functions for interest rate tiers, bank margins, and fees"
```

---

### Task 4: TanStack Query hooks — all domains

**Files:**
- Create: `src/hooks/useRoles.ts`
- Create: `src/hooks/usePermissions.ts`
- Create: `src/hooks/useLimits.ts`
- Create: `src/hooks/useInterestRateTiers.ts`
- Create: `src/hooks/useBankMargins.ts`
- Create: `src/hooks/useFees.ts`

- [ ] **Step 1: Create roles hooks**

Create `src/hooks/useRoles.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRoles, createRole, updateRolePermissions } from '@/lib/api/roles'
import type { CreateRolePayload } from '@/types/roles'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permissionCodes }: { id: number; permissionCodes: string[] }) =>
      updateRolePermissions(id, permissionCodes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  })
}
```

- [ ] **Step 2: Create permissions hooks**

Create `src/hooks/usePermissions.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPermissions,
  setEmployeeRoles,
  setEmployeePermissions,
} from '@/lib/api/permissions'

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
  })
}

export function useSetEmployeeRoles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roleNames }: { id: number; roleNames: string[] }) =>
      setEmployeeRoles(id, roleNames),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useSetEmployeePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permissionCodes }: { id: number; permissionCodes: string[] }) =>
      setEmployeePermissions(id, permissionCodes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}
```

- [ ] **Step 3: Create limits hooks**

Create `src/hooks/useLimits.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEmployeeLimits,
  updateEmployeeLimits,
  applyLimitTemplate,
  getLimitTemplates,
  createLimitTemplate,
  getClientLimits,
  updateClientLimits,
} from '@/lib/api/limits'
import type {
  UpdateEmployeeLimitsPayload,
  UpdateClientLimitsPayload,
  CreateLimitTemplatePayload,
} from '@/types/limits'

export function useEmployeeLimits(id: number) {
  return useQuery({
    queryKey: ['employeeLimits', id],
    queryFn: () => getEmployeeLimits(id),
    enabled: id > 0,
  })
}

export function useUpdateEmployeeLimits() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEmployeeLimitsPayload }) =>
      updateEmployeeLimits(id, payload),
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: ['employeeLimits', vars.id] }),
  })
}

export function useApplyLimitTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, templateName }: { employeeId: number; templateName: string }) =>
      applyLimitTemplate(employeeId, templateName),
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: ['employeeLimits', vars.employeeId] }),
  })
}

export function useLimitTemplates() {
  return useQuery({
    queryKey: ['limitTemplates'],
    queryFn: getLimitTemplates,
  })
}

export function useCreateLimitTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateLimitTemplatePayload) => createLimitTemplate(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['limitTemplates'] }),
  })
}

export function useClientLimits(id: number) {
  return useQuery({
    queryKey: ['clientLimits', id],
    queryFn: () => getClientLimits(id),
    enabled: id > 0,
  })
}

export function useUpdateClientLimits() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateClientLimitsPayload }) =>
      updateClientLimits(id, payload),
    onSuccess: (_data, vars) =>
      queryClient.invalidateQueries({ queryKey: ['clientLimits', vars.id] }),
  })
}
```

- [ ] **Step 4: Create interest rate tiers hooks**

Create `src/hooks/useInterestRateTiers.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getInterestRateTiers,
  createTier,
  updateTier,
  deleteTier,
  applyTier,
} from '@/lib/api/interestRateTiers'
import type { CreateTierPayload } from '@/types/interestRateTiers'

export function useInterestRateTiers() {
  return useQuery({
    queryKey: ['interestRateTiers'],
    queryFn: getInterestRateTiers,
  })
}

export function useCreateTier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTierPayload) => createTier(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interestRateTiers'] }),
  })
}

export function useUpdateTier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateTierPayload }) =>
      updateTier(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interestRateTiers'] }),
  })
}

export function useDeleteTier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interestRateTiers'] }),
  })
}

export function useApplyTier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => applyTier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interestRateTiers'] }),
  })
}
```

- [ ] **Step 5: Create bank margins hooks**

Create `src/hooks/useBankMargins.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBankMargins, updateBankMargin } from '@/lib/api/bankMargins'

export function useBankMargins() {
  return useQuery({
    queryKey: ['bankMargins'],
    queryFn: getBankMargins,
  })
}

export function useUpdateBankMargin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, margin }: { id: number; margin: number }) =>
      updateBankMargin(id, margin),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bankMargins'] }),
  })
}
```

- [ ] **Step 6: Create fees hooks**

Create `src/hooks/useFees.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFees, createFee, updateFee, deleteFee } from '@/lib/api/fees'
import type { CreateFeePayload, UpdateFeePayload } from '@/types/fee'

export function useFees() {
  return useQuery({
    queryKey: ['fees'],
    queryFn: getFees,
  })
}

export function useCreateFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFeePayload) => createFee(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fees'] }),
  })
}

export function useUpdateFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateFeePayload }) =>
      updateFee(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fees'] }),
  })
}

export function useDeleteFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteFee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fees'] }),
  })
}
```

- [ ] **Step 7: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useRoles.ts src/hooks/usePermissions.ts src/hooks/useLimits.ts src/hooks/useInterestRateTiers.ts src/hooks/useBankMargins.ts src/hooks/useFees.ts
git commit -m "feat: add TanStack Query hooks for all admin management domains"
```

---

### Task 5: AdminRolesPage — components and page

**Files:**
- Create: `src/components/admin/RolesTable.tsx`
- Create: `src/components/admin/PermissionsTable.tsx`
- Create: `src/components/admin/CreateRoleDialog.tsx`
- Create: `src/components/admin/EditRolePermissionsDialog.tsx`
- Create: `src/pages/AdminRolesPage.tsx`
- Test: `src/pages/AdminRolesPage.test.tsx`

- [ ] **Step 1: Write failing test for AdminRolesPage**

Create `src/pages/AdminRolesPage.test.tsx`:

```typescript
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { AdminRolesPage } from './AdminRolesPage'
import * as rolesApi from '@/lib/api/roles'
import * as permissionsApi from '@/lib/api/permissions'

jest.mock('@/lib/api/roles')
jest.mock('@/lib/api/permissions')

const mockRoles = {
  roles: [
    { id: 1, name: 'EmployeeBasic', description: 'Basic employee role', permissions: ['clients.read', 'accounts.create'] },
    { id: 2, name: 'EmployeeAgent', description: 'Agent role', permissions: ['clients.read', 'securities.trade'] },
  ],
}

const mockPermissions = {
  permissions: [
    { id: 1, code: 'clients.read', description: 'View client profiles', category: 'clients' },
    { id: 2, code: 'accounts.create', description: 'Create bank accounts', category: 'accounts' },
    { id: 3, code: 'securities.trade', description: 'Trade securities', category: 'securities' },
  ],
}

beforeEach(() => {
  ;(rolesApi.getRoles as jest.Mock).mockResolvedValue(mockRoles)
  ;(permissionsApi.getPermissions as jest.Mock).mockResolvedValue(mockPermissions)
})

describe('AdminRolesPage', () => {
  it('renders roles table with role data', async () => {
    renderWithProviders(<AdminRolesPage />)

    await waitFor(() => {
      expect(screen.getByText('EmployeeBasic')).toBeInTheDocument()
    })
    expect(screen.getByText('EmployeeAgent')).toBeInTheDocument()
    expect(screen.getByText('Basic employee role')).toBeInTheDocument()
  })

  it('shows permissions tab with all permissions', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AdminRolesPage />)

    await waitFor(() => {
      expect(screen.getByText('EmployeeBasic')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('tab', { name: /All Permissions/i }))

    await waitFor(() => {
      expect(screen.getByText('clients.read')).toBeInTheDocument()
    })
    expect(screen.getByText('accounts.create')).toBeInTheDocument()
    expect(screen.getByText('securities.trade')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern="AdminRolesPage" --watchAll=false`
Expected: FAIL — module not found

- [ ] **Step 3: Create RolesTable component**

Create `src/components/admin/RolesTable.tsx`:

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Role } from '@/types/roles'

interface RolesTableProps {
  roles: Role[]
  onEditPermissions: (role: Role) => void
}

export function RolesTable({ roles, onEditPermissions }: RolesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="font-medium">{role.name}</TableCell>
            <TableCell>{role.description}</TableCell>
            <TableCell>
              <Badge variant="secondary">{role.permissions.length}</Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditPermissions(role)}
              >
                Edit Permissions
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 4: Create PermissionsTable component**

Create `src/components/admin/PermissionsTable.tsx`:

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Permission } from '@/types/roles'

interface PermissionsTableProps {
  permissions: Permission[]
}

export function PermissionsTable({ permissions }: PermissionsTableProps) {
  const grouped = permissions.reduce(
    (acc, perm) => {
      const cat = perm.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(perm)
      return acc
    },
    {} as Record<string, Permission[]>
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(grouped).map(([category, perms]) =>
          perms.map((perm) => (
            <TableRow key={perm.id}>
              <TableCell className="font-mono text-sm">{perm.code}</TableCell>
              <TableCell>{perm.description}</TableCell>
              <TableCell>
                <Badge variant="outline">{category}</Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 5: Create CreateRoleDialog component**

Create `src/components/admin/CreateRoleDialog.tsx`:

```typescript
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { Permission } from '@/types/roles'

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permissions: Permission[]
  onSubmit: (data: { name: string; description: string; permission_codes: string[] }) => void
  loading: boolean
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  permissions,
  onSubmit,
  loading,
}: CreateRoleDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const grouped = permissions.reduce(
    (acc, p) => {
      const cat = p.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(p)
      return acc
    },
    {} as Record<string, Permission[]>
  )

  const togglePermission = (code: string) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const handleSubmit = () => {
    onSubmit({ name, description, permission_codes: selected })
    setName('')
    setDescription('')
    setSelected([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="role-name">Name</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CustomRole"
            />
          </div>
          <div>
            <Label htmlFor="role-desc">Description</Label>
            <Input
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label>Permissions</Label>
            {Object.entries(grouped).map(([category, perms]) => (
              <div key={category} className="mt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {category}
                </p>
                {perms.map((perm) => (
                  <label
                    key={perm.code}
                    className="flex items-center gap-2 py-1 text-sm"
                  >
                    <Checkbox
                      checked={selected.includes(perm.code)}
                      onCheckedChange={() => togglePermission(perm.code)}
                    />
                    <span className="font-mono text-xs">{perm.code}</span>
                    <span className="text-muted-foreground">— {perm.description}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name || loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 6: Create EditRolePermissionsDialog component**

Create `src/components/admin/EditRolePermissionsDialog.tsx`:

```typescript
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Role, Permission } from '@/types/roles'

interface EditRolePermissionsDialogProps {
  open: boolean
  role: Role | null
  allPermissions: Permission[]
  onClose: () => void
  onSave: (roleId: number, permissionCodes: string[]) => void
  loading: boolean
}

export function EditRolePermissionsDialog({
  open,
  role,
  allPermissions,
  onClose,
  onSave,
  loading,
}: EditRolePermissionsDialogProps) {
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (role) setSelected([...role.permissions])
  }, [role])

  const grouped = allPermissions.reduce(
    (acc, p) => {
      const cat = p.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(p)
      return acc
    },
    {} as Record<string, Permission[]>
  )

  const togglePermission = (code: string) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Permissions — {role?.name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{role?.description}</p>
        <div className="space-y-3 py-4">
          {Object.entries(grouped).map(([category, perms]) => (
            <div key={category}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {category}
              </p>
              {perms.map((perm) => (
                <label
                  key={perm.code}
                  className="flex items-center gap-2 py-1 text-sm"
                >
                  <Checkbox
                    checked={selected.includes(perm.code)}
                    onCheckedChange={() => togglePermission(perm.code)}
                  />
                  <span className="font-mono text-xs">{perm.code}</span>
                  <span className="text-muted-foreground">— {perm.description}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => role && onSave(role.id, selected)} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 7: Create AdminRolesPage**

Create `src/pages/AdminRolesPage.tsx`:

```typescript
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { RolesTable } from '@/components/admin/RolesTable'
import { PermissionsTable } from '@/components/admin/PermissionsTable'
import { CreateRoleDialog } from '@/components/admin/CreateRoleDialog'
import { EditRolePermissionsDialog } from '@/components/admin/EditRolePermissionsDialog'
import { useRoles, useCreateRole, useUpdateRolePermissions } from '@/hooks/useRoles'
import { usePermissions } from '@/hooks/usePermissions'
import type { Role } from '@/types/roles'

export function AdminRolesPage() {
  const { data: rolesData, isLoading: rolesLoading } = useRoles()
  const { data: permsData, isLoading: permsLoading } = usePermissions()
  const createRoleMutation = useCreateRole()
  const updatePermsMutation = useUpdateRolePermissions()

  const [createOpen, setCreateOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const isLoading = rolesLoading || permsLoading

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <Button onClick={() => setCreateOpen(true)}>Create Role</Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">All Permissions</TabsTrigger>
          </TabsList>
          <TabsContent value="roles">
            {rolesData?.roles.length ? (
              <RolesTable
                roles={rolesData.roles}
                onEditPermissions={setEditingRole}
              />
            ) : (
              <p>No roles found.</p>
            )}
          </TabsContent>
          <TabsContent value="permissions">
            {permsData?.permissions.length ? (
              <PermissionsTable permissions={permsData.permissions} />
            ) : (
              <p>No permissions found.</p>
            )}
          </TabsContent>
        </Tabs>
      )}

      <CreateRoleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        permissions={permsData?.permissions ?? []}
        onSubmit={(data) => {
          createRoleMutation.mutate(data, { onSuccess: () => setCreateOpen(false) })
        }}
        loading={createRoleMutation.isPending}
      />

      <EditRolePermissionsDialog
        open={editingRole !== null}
        role={editingRole}
        allPermissions={permsData?.permissions ?? []}
        onClose={() => setEditingRole(null)}
        onSave={(roleId, codes) => {
          updatePermsMutation.mutate(
            { id: roleId, permissionCodes: codes },
            { onSuccess: () => setEditingRole(null) }
          )
        }}
        loading={updatePermsMutation.isPending}
      />
    </div>
  )
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- --testPathPattern="AdminRolesPage" --watchAll=false`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/admin/RolesTable.tsx src/components/admin/PermissionsTable.tsx src/components/admin/CreateRoleDialog.tsx src/components/admin/EditRolePermissionsDialog.tsx src/pages/AdminRolesPage.tsx src/pages/AdminRolesPage.test.tsx
git commit -m "feat: add AdminRolesPage with roles table, permissions view, and CRUD dialogs"
```

---

### Task 6: AdminEmployeeLimitsPage and AdminClientLimitsPage

**Files:**
- Create: `src/components/admin/EditEmployeeLimitsDialog.tsx`
- Create: `src/components/admin/LimitTemplatesDialog.tsx`
- Create: `src/components/admin/EditClientLimitsDialog.tsx`
- Create: `src/pages/AdminEmployeeLimitsPage.tsx`
- Create: `src/pages/AdminClientLimitsPage.tsx`
- Test: `src/pages/AdminEmployeeLimitsPage.test.tsx`

This task follows the same pattern as Task 5. The implementing agent should:

- [ ] **Step 1: Write failing test for AdminEmployeeLimitsPage** — test that it renders employee list, clicking a row opens EditEmployeeLimitsDialog with 5 limit fields, saving calls the mutation. Mock `useEmployees` (existing), `useEmployeeLimits`, `useUpdateEmployeeLimits`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern="AdminEmployeeLimitsPage" --watchAll=false`
Expected: FAIL

- [ ] **Step 3: Create EditEmployeeLimitsDialog** — Dialog with 5 Input fields (max_loan_approval_amount, max_single_transaction, max_daily_transaction, max_client_daily_limit, max_client_monthly_limit), "Apply Template" Select in footer, Save/Cancel buttons. Follow the `EditLimitDialog` pattern from `src/components/actuaries/EditLimitDialog.tsx`.

- [ ] **Step 4: Create LimitTemplatesDialog** — Dialog listing templates in a table, with a "Create Template" expandable form (name, description, 5 limit fields). Uses `useLimitTemplates()` and `useCreateLimitTemplate()`.

- [ ] **Step 5: Create EditClientLimitsDialog** — Dialog with 3 Input fields (daily_limit, monthly_limit, transfer_limit), info banner showing employee's own max authority. Follow same dialog pattern.

- [ ] **Step 6: Create AdminEmployeeLimitsPage** — Uses Tabs ("Employee Limits" / "Client Limits") where "Employee Limits" tab is active. Reuses `FilterBar` + employee list from `useEmployees` hook. Row click fetches limits via `useEmployeeLimits(selectedId)` and opens `EditEmployeeLimitsDialog`. "Manage Templates" button opens `LimitTemplatesDialog`. Follow `ActuaryListPage` pattern exactly.

- [ ] **Step 7: Create AdminClientLimitsPage** — Same Tabs wrapper with "Client Limits" active. Uses `useAllClients` to list clients, row click fetches limits via `useClientLimits(selectedId)` and opens `EditClientLimitsDialog`. Follow same pattern.

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- --testPathPattern="AdminEmployeeLimitsPage" --watchAll=false`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/admin/EditEmployeeLimitsDialog.tsx src/components/admin/LimitTemplatesDialog.tsx src/components/admin/EditClientLimitsDialog.tsx src/pages/AdminEmployeeLimitsPage.tsx src/pages/AdminClientLimitsPage.tsx src/pages/AdminEmployeeLimitsPage.test.tsx
git commit -m "feat: add employee and client limits management pages with dialogs"
```

---

### Task 7: AdminInterestRatesPage

**Files:**
- Create: `src/components/admin/InterestRateTiersTable.tsx`
- Create: `src/components/admin/CreateTierDialog.tsx`
- Create: `src/components/admin/EditTierDialog.tsx`
- Create: `src/components/admin/BankMarginsTable.tsx`
- Create: `src/components/admin/EditMarginDialog.tsx`
- Create: `src/pages/AdminInterestRatesPage.tsx`
- Test: `src/pages/AdminInterestRatesPage.test.tsx`

- [ ] **Step 1: Write failing test** — test renders tiers table and margins table in tabs, mock `useInterestRateTiers` and `useBankMargins`.

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Create InterestRateTiersTable** — Table columns: Amount Range (formatted), Fixed Rate %, Variable Base %, Active (Badge), Actions (Edit, Delete, Apply). Each action is a callback prop.

- [ ] **Step 4: Create CreateTierDialog and EditTierDialog** — Dialog with 4 fields: amount_from, amount_to, fixed_rate, variable_base. Follow `EditLimitDialog` pattern. `EditTierDialog` pre-fills from existing tier.

- [ ] **Step 5: Create BankMarginsTable** — Table columns: Loan Type (capitalized), Margin %, Active (Badge), Last Updated. Edit button per row.

- [ ] **Step 6: Create EditMarginDialog** — Single Input field for margin value. Follow `EditLimitDialog` pattern.

- [ ] **Step 7: Create AdminInterestRatesPage** — Tabs: "Interest Rate Tiers" and "Bank Margins". Tiers tab has "Create Tier" button, table, edit/delete/apply dialogs with confirmation for delete and apply. Apply shows "X loans updated" result. Margins tab has table with edit dialog. Uses `useInterestRateTiers`, `useCreateTier`, `useUpdateTier`, `useDeleteTier`, `useApplyTier`, `useBankMargins`, `useUpdateBankMargin`.

- [ ] **Step 8: Run test to verify it passes**

- [ ] **Step 9: Commit**

```bash
git add src/components/admin/InterestRateTiersTable.tsx src/components/admin/CreateTierDialog.tsx src/components/admin/EditTierDialog.tsx src/components/admin/BankMarginsTable.tsx src/components/admin/EditMarginDialog.tsx src/pages/AdminInterestRatesPage.tsx src/pages/AdminInterestRatesPage.test.tsx
git commit -m "feat: add AdminInterestRatesPage with tiers CRUD and bank margins management"
```

---

### Task 8: AdminFeesPage

**Files:**
- Create: `src/components/admin/FeesTable.tsx`
- Create: `src/components/admin/CreateFeeDialog.tsx`
- Create: `src/components/admin/EditFeeDialog.tsx`
- Create: `src/pages/AdminFeesPage.tsx`
- Test: `src/pages/AdminFeesPage.test.tsx`

- [ ] **Step 1: Write failing test** — test renders fees table, mock `useFees`.

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Create FeesTable** — Table columns: Name, Type (Badge), Value, Min Amount, Max Fee Cap, Transaction Type, Currency, Active (Badge), Actions (Edit, Deactivate/Reactivate).

- [ ] **Step 4: Create CreateFeeDialog** — Fields: name, fee_type (Select: percentage/fixed), fee_value, min_amount, max_fee, transaction_type (Select: payment/transfer/all), currency_code (Select from SUPPORTED_CURRENCIES + empty "All"). Follow dialog pattern.

- [ ] **Step 5: Create EditFeeDialog** — Same as CreateFeeDialog but pre-filled, plus active toggle checkbox. Uses `useUpdateFee`.

- [ ] **Step 6: Create AdminFeesPage** — "Create Fee Rule" button, FeesTable, deactivate with confirmation dialog (`DELETE /api/fees/:id`), reactivate via `PUT /api/fees/:id` with `active: true`. Uses `useFees`, `useCreateFee`, `useUpdateFee`, `useDeleteFee`.

- [ ] **Step 7: Run test to verify it passes**

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/FeesTable.tsx src/components/admin/CreateFeeDialog.tsx src/components/admin/EditFeeDialog.tsx src/pages/AdminFeesPage.tsx src/pages/AdminFeesPage.test.tsx
git commit -m "feat: add AdminFeesPage with transfer fee CRUD and soft-delete"
```

---

### Task 9: Sidebar navigation and route registration

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add Settings section to Sidebar**

In `src/components/layout/Sidebar.tsx`, add new permission checks in the `Sidebar` component:

```typescript
const canManagePermissions = useAppSelector((state) => selectHasPermission(state, 'employees.permissions'))
const canManageLimits = useAppSelector((state) => selectHasPermission(state, 'limits.manage'))
const canManageInterestRates = useAppSelector((state) => selectHasPermission(state, 'interest-rates.manage'))
const canManageFees = useAppSelector((state) => selectHasPermission(state, 'fees.manage'))
```

Pass these to `EmployeeNav` as new props. Then in the `EmployeeNav` component, add after the Tax link and before the closing `</>`:

```tsx
{(canManagePermissions || canManageLimits || canManageInterestRates || canManageFees) && (
  <div className="mt-2">
    <p className="px-3 py-1 text-xs text-sidebar-foreground/50 uppercase tracking-wider">
      Settings
    </p>
    {canManagePermissions && (
      <Link to="/admin/roles" className={navLinkClass}>
        Roles & Permissions
      </Link>
    )}
    {canManageLimits && (
      <Link to="/admin/limits/employees" className={navLinkClass}>
        Limits
      </Link>
    )}
    {canManageInterestRates && (
      <Link to="/admin/interest-rates" className={navLinkClass}>
        Interest Rates
      </Link>
    )}
    {canManageFees && (
      <Link to="/admin/fees" className={navLinkClass}>
        Transfer Fees
      </Link>
    )}
  </div>
)}
```

- [ ] **Step 2: Register new routes in App.tsx**

Add imports at the top of `src/App.tsx`:

```typescript
import { AdminRolesPage } from '@/pages/AdminRolesPage'
import { AdminEmployeeLimitsPage } from '@/pages/AdminEmployeeLimitsPage'
import { AdminClientLimitsPage } from '@/pages/AdminClientLimitsPage'
import { AdminInterestRatesPage } from '@/pages/AdminInterestRatesPage'
import { AdminFeesPage } from '@/pages/AdminFeesPage'
```

Add route definitions after the `admin/tax` route and before the closing `</Route>` of the protected routes block:

```tsx
{/* Admin settings routes */}
<Route
  path="/admin/roles"
  element={
    <ProtectedRoute requiredPermission="employees.permissions">
      <AdminRolesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/limits/employees"
  element={
    <ProtectedRoute requiredPermission="limits.manage">
      <AdminEmployeeLimitsPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/limits/clients"
  element={
    <ProtectedRoute requiredPermission="limits.manage">
      <AdminClientLimitsPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/interest-rates"
  element={
    <ProtectedRoute requiredPermission="interest-rates.manage">
      <AdminInterestRatesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/fees"
  element={
    <ProtectedRoute requiredPermission="fees.manage">
      <AdminFeesPage />
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/App.tsx
git commit -m "feat: add sidebar Settings section and register admin management routes"
```

---

### Task 10: Quality gates

- [ ] **Step 1: Run all tests**

Run: `npm test -- --watchAll=false`
Expected: All pass

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: Zero violations

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Run format check and fix**

Run: `npx prettier --write "src/**/*.{ts,tsx}"` then `npx prettier --check "src/**/*.{ts,tsx}"`
Expected: All formatted

- [ ] **Step 5: Run build**

Run: `npm run build`
Expected: Success

- [ ] **Step 6: Commit any formatting fixes**

```bash
git add -A
git commit -m "style: format new admin management files"
```
