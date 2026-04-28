import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { RoleSwitcher } from '@/components/dev/RoleSwitcher'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { PageTransition } from '@/components/shared/PageTransition'
import { TopProgressBar } from '@/components/shared/TopProgressBar'

export function AppLayout() {
  return (
    <div className="min-h-screen flex">
      <TopProgressBar />
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end items-center gap-3 mb-4">
          <NotificationBell />
          <RoleSwitcher />
        </div>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}
