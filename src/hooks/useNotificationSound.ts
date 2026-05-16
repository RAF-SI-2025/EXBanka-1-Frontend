import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotifications } from '@/lib/api/notifications'
import dingdong from '@/assets/dingdong.m4a'

// Polls /me/notifications every 2s and plays a ding when a notification with
// a higher id than the one we last saw appears. The first successful response
// only establishes the baseline so existing notifications at page load don't
// trigger the sound.
export function useNotificationSound() {
  const baselineSetRef = useRef(false)
  const lastSeenIdRef = useRef<number>(0)
  const qc = useQueryClient()

  const { data } = useQuery({
    // Isolated key prefix on purpose: invalidating ['notifications'] elsewhere
    // (e.g. user marks-as-read) must NOT cascade into our 2-second poll,
    // otherwise the data ref churns and the new-id detection de-syncs from
    // the actual arrival event.
    queryKey: ['notification-sound-poll'],
    queryFn: () => getNotifications({ page: 1, page_size: 1 }),
    refetchInterval: 2_000,
    refetchIntervalInBackground: false,
    // A transient poll failure (offline blip, 5xx) shouldn't toast every 2s.
    meta: { suppressGlobalError: true },
  })

  useEffect(() => {
    if (!data) return
    const newest = data.notifications?.[0]?.id ?? 0

    if (!baselineSetRef.current) {
      baselineSetRef.current = true
      lastSeenIdRef.current = newest
      return
    }

    if (newest > lastSeenIdRef.current) {
      lastSeenIdRef.current = newest
      const audio = new Audio(dingdong)
      audio.volume = 0.6
      audio.play().catch(() => {
        // Browsers may block autoplay until the user has interacted with
        // the page — silent failure is fine; the bell badge still updates.
      })
      // Force the bell badge and the dropdown list to refetch right now
      // instead of waiting for their own intervals (60s / default).
      qc.invalidateQueries({ queryKey: ['notifications'] })
    }
  }, [data, qc])
}
