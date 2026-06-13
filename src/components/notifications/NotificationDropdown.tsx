import { useNavigate } from 'react-router-dom'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { NotificationItem } from './NotificationItem'
import type { Notification } from '@/types/notification'

function resolveNavigationPath(n: Notification): string | null {
  // OTC event notifications (SCREAMING_SNAKE_CASE per SI-TX protocol) direct
  // the user to the OTC Options view where they can find their chain via
  // GET /me/otc/options/negotiations. ref_id is not always populated for
  // cross-bank events, so we navigate to the view without a specific offer id.
  if (n.type.startsWith('OTC_')) return '/otc/options'
  return null
}

const PAGE_SIZE = 10

export function NotificationDropdown() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useNotifications({ page: 1, page_size: PAGE_SIZE })
  const markOne = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const notifications = data?.notifications ?? []
  const hasUnread = notifications.some((n) => !n.is_read)

  const handleItemClick = (n: Notification) => {
    if (!n.is_read) markOne.mutate(n.id)
    const path = resolveNavigationPath(n)
    if (path) navigate(path)
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center px-3 py-2 border-b gap-2">
        <h3 className="text-sm font-semibold shrink-0">Notifications</h3>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            Mark all as read
          </Button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <p className="p-4 text-sm text-destructive">Could not load notifications.</p>
        ) : notifications.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onClick={handleItemClick} />
          ))
        )}
      </div>
    </div>
  )
}
