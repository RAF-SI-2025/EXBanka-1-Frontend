import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplateEditorPanel } from '@/views/notificationTemplates/components/TemplateEditorPanel'
import { TemplatesTable } from '@/views/notificationTemplates/components/TemplatesTable'
import { useNotificationTemplates } from '@/views/notificationTemplates/hooks/useNotificationTemplatesLists'
import type { ChannelFilter, NotificationTemplate } from '@/views/notificationTemplates/types'
import { ViewShell, LoadingState, ErrorState, panelEnter } from '@/views/shared'

export function NotificationTemplatesView() {
  const [channel, setChannel] = useState<ChannelFilter>('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<NotificationTemplate | null>(null)

  const { data, isLoading, error } = useNotificationTemplates(
    channel === 'all' ? undefined : channel
  )

  // Re-pull the freshest version of the currently-edited template out of the
  // list response after every refetch (e.g. after Save). Saves us from holding
  // duplicate state and keeps the editor's `is_customized` badge accurate.
  const liveEditing = useMemo(() => {
    if (!editing || !data) return editing
    return (
      data.templates.find((t) => t.channel === editing.channel && t.type === editing.type) ??
      editing
    )
  }, [editing, data])

  const filtered = useMemo(() => {
    const all = data?.templates ?? []
    const q = search.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      (t) =>
        t.type.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.current_subject.toLowerCase().includes(q)
    )
  }, [data, search])

  if (liveEditing) {
    return (
      <ViewShell className={panelEnter}>
        <TemplateEditorPanel template={liveEditing} onBack={() => setEditing(null)} />
      </ViewShell>
    )
  }

  return (
    <ViewShell
      title="Notification Templates"
      subtitle={
        <>
          Customise the subject and body text sent to clients. Each template type accepts a fixed
          set of <code className="text-[11px]">{`{{variables}}`}</code>.
        </>
      }
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base">Templates</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search type, description, subject…"
              className="h-8 w-64"
            />
            <Tabs value={channel} onValueChange={(v) => setChannel(v as ChannelFilter)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="push">Push</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <LoadingState />}
          {error && <ErrorState message="Could not load templates." />}
          {!isLoading && !error && (
            <TemplatesTable templates={filtered} onEdit={(t) => setEditing(t)} />
          )}
        </CardContent>
      </Card>
    </ViewShell>
  )
}
