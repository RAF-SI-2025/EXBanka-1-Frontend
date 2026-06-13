import { useMemo, useState } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useRevertNotificationTemplate,
  useUpdateNotificationTemplate,
} from '@/views/notificationTemplates/hooks/useNotificationTemplateMutations'
import { findUnknownVariables, renderPreview } from '@/views/notificationTemplates/lib/preview'
import type { NotificationTemplate } from '@/views/notificationTemplates/types'

interface Props {
  template: NotificationTemplate
  onBack: () => void
}

// Outer wrapper re-keys the inner form on (channel, type) so navigating between
// templates resets the local subject/body state without an effect-based hack.
export function TemplateEditorPanel(props: Props) {
  return (
    <EditorForm
      key={`${props.template.channel}:${props.template.type}`}
      template={props.template}
      onBack={props.onBack}
    />
  )
}

function EditorForm({ template, onBack }: Props) {
  const [subject, setSubject] = useState(template.current_subject)
  const [body, setBody] = useState(template.current_body)
  const update = useUpdateNotificationTemplate()
  const revert = useRevertNotificationTemplate()

  const unknownSubject = useMemo(
    () => findUnknownVariables(subject, template.variables),
    [subject, template.variables]
  )
  const unknownBody = useMemo(
    () => findUnknownVariables(body, template.variables),
    [body, template.variables]
  )
  const hasUnknown = unknownSubject.length + unknownBody.length > 0

  const subjectChanged = subject !== template.current_subject
  const bodyChanged = body !== template.current_body
  const dirty = subjectChanged || bodyChanged
  const empty = subject.trim() === '' || body.trim() === ''

  const handleSave = () => {
    update.mutate({
      channel: template.channel,
      type: template.type,
      payload: { subject, body },
    })
  }

  const handleRevert = () => {
    revert.mutate(
      { channel: template.channel, type: template.type },
      {
        onSuccess: (fresh) => {
          setSubject(fresh.current_subject)
          setBody(fresh.current_body)
        },
      }
    )
  }

  const handleResetToDefault = () => {
    setSubject(template.default_subject)
    setBody(template.default_body)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold truncate">{template.type}</h2>
            <p className="text-xs text-muted-foreground">
              <span className="uppercase">{template.channel}</span> · {template.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {template.is_customized ? (
            <Badge variant="secondary">Customized</Badge>
          ) : (
            <Badge variant="outline">Default</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">Content</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetToDefault}
              disabled={subject === template.default_subject && body === template.default_body}
              title="Load the registry default into the editor (does not save)"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Load default
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject</Label>
              <Input
                id="template-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
              />
              {unknownSubject.length > 0 && (
                <p className="text-xs text-destructive">
                  Unknown variable{unknownSubject.length > 1 ? 's' : ''}:{' '}
                  {unknownSubject.map((n) => `{{${n}}}`).join(', ')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-body">Body</Label>
              <Textarea
                id="template-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={template.channel === 'email' ? 10 : 5}
                placeholder="Message body — use {{variable}} placeholders"
              />
              {unknownBody.length > 0 && (
                <p className="text-xs text-destructive">
                  Unknown variable{unknownBody.length > 1 ? 's' : ''}:{' '}
                  {unknownBody.map((n) => `{{${n}}}`).join(', ')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                <p className="text-sm font-medium">{renderPreview(subject, template.variables)}</p>
                <pre className="text-xs whitespace-pre-wrap font-sans text-muted-foreground">
                  {renderPreview(body, template.variables)}
                </pre>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Substituted using each variable's example value.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t">
              <Button
                variant="destructive"
                onClick={handleRevert}
                disabled={!template.is_customized || revert.isPending}
                title={
                  template.is_customized
                    ? 'Delete the override and use the registry default'
                    : 'Already using the registry default'
                }
              >
                {revert.isPending ? 'Reverting…' : 'Revert to default'}
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={onBack} disabled={update.isPending}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!dirty || empty || hasUnknown || update.isPending}
                >
                  {update.isPending ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Variables ({template.variables.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {template.variables.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                This template type accepts no variables.
              </p>
            ) : (
              template.variables.map((v) => (
                <div key={v.name} className="space-y-1">
                  <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted">{`{{${v.name}}}`}</code>
                  <p className="text-xs text-muted-foreground">{v.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    e.g. <span className="italic">{v.example}</span>
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
