import { Bell } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useUnreadNotificationCount } from '@/hooks/useNotifications'
import { NotificationDropdown } from './NotificationDropdown'

export function NotificationBell() {
  const { data } = useUnreadNotificationCount()
  const unread = data?.unread_count ?? 0
  const badge = unread > 9 ? '9+' : String(unread)

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Notifications"
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'relative')}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span
            data-testid="unread-badge"
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-2 text-[10px] font-bold text-white flex items-center justify-center"
          >
            {badge}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <NotificationDropdown />
      </PopoverContent>
    </Popover>
  )
}
