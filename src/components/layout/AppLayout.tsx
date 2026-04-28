import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { RoleSwitcher } from '@/components/dev/RoleSwitcher'

export function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-4">
          <RoleSwitcher />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
