import type { Notification } from '@/types/notification'

interface NotificationItemProps {
  notification: Notification
  onClick: (notification: Notification) => void
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { title, message, is_read, created_at } = notification
  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={`w-full text-left px-3 py-2 hover:bg-accent flex gap-2 items-start overflow-hidden ${
        is_read ? 'opacity-70' : ''
      }`}
      aria-label={title}
    >
      {!is_read && (
        <span
          data-testid="unread-dot"
          className="mt-1.5 h-2 w-2 rounded-full bg-accent-2 shrink-0"
          aria-hidden
        />
      )}
      <div className="flex-1 min-w-0 max-w-full">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground break-words line-clamp-2">{message}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelativeTime(created_at)}</p>
      </div>
    </button>
  )
}
