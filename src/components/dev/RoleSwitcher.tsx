import { useState } from 'react'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { logoutThunk, loginThunk } from '@/store/slices/authSlice'
import { selectCurrentUser, selectUserType } from '@/store/selectors/authSelectors'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type RoleKey = 'admin' | 'supervisor' | 'agent' | 'client'

const TEST_PASSWORD = 'AdminAdmin2026!.'

const TEST_USERS: Record<RoleKey, { email: string; password: string }> = {
  admin: { email: 'admin+testadmin@admin.com', password: TEST_PASSWORD },
  supervisor: { email: 'admin+testsupervisor@admin.com', password: TEST_PASSWORD },
  agent: { email: 'admin+testagent@admin.com', password: TEST_PASSWORD },
  client: { email: 'admin+testclient@admin.com', password: TEST_PASSWORD },
}

export function RoleSwitcher() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const userType = useAppSelector(selectUserType)
  const [busy, setBusy] = useState(false)

  const currentRole: RoleKey | undefined =
    userType === 'client'
      ? 'client'
      : user?.role === 'EmployeeAdmin'
        ? 'admin'
        : user?.role === 'EmployeeSupervisor'
          ? 'supervisor'
          : user?.role === 'EmployeeAgent'
            ? 'agent'
            : undefined

  const handleSwitch = async (next: RoleKey) => {
    if (busy || next === currentRole) return
    setBusy(true)
    try {
      await dispatch(logoutThunk())
      const result = await dispatch(loginThunk(TEST_USERS[next]))
      if (loginThunk.fulfilled.match(result)) {
        window.location.href = next === 'client' ? '/home' : '/admin/accounts'
      } else {
        setBusy(false)
      }
    } catch {
      setBusy(false)
    }
  }

  return (
    <Tabs value={currentRole ?? ''}>
      <TabsList>
        <TabsTrigger value="admin" onClick={() => handleSwitch('admin')} disabled={busy}>
          Admin
        </TabsTrigger>
        <TabsTrigger value="supervisor" onClick={() => handleSwitch('supervisor')} disabled={busy}>
          Supervisor
        </TabsTrigger>
        <TabsTrigger value="agent" onClick={() => handleSwitch('agent')} disabled={busy}>
          Agent
        </TabsTrigger>
        <TabsTrigger value="client" onClick={() => handleSwitch('client')} disabled={busy}>
          Client
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
