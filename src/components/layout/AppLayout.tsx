import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { RoleSwitcher } from '@/components/dev/RoleSwitcher'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { TopProgressBar } from '@/components/shared/TopProgressBar'
import { useNotificationSound } from '@/hooks/useNotificationSound'

export function AppLayout() {
  useNotificationSound()
  return (
    <div className="h-screen flex overflow-hidden">
      <TopProgressBar />
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        <div className="sticky top-0 z-10 flex justify-end items-center gap-3 p-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <NotificationBell />
          <RoleSwitcher />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
