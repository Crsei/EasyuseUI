"use client"

import { useLayoutEffect, useRef, useState } from "react"

/** Follows only near the bottom; prepended history retains its scroll anchor. */
export function useFollowTail(
  ids: string[],
  revision: string,
  notifyOnUpdate = true,
) {
  const ref = useRef<HTMLDivElement>(null)
  const following = useRef(true)
  const previous = useRef({ ids: [] as string[], height: 0, revision: "" })
  const [unread, setUnread] = useState(0)
  const key = JSON.stringify(ids)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const currentIds = JSON.parse(key) as string[]
    const before = previous.current
    const firstOldIndex = before.ids.length
      ? currentIds.indexOf(before.ids[0])
      : -1
    const prepended =
      firstOldIndex > 0 &&
      before.ids.every((id, index) => currentIds[firstOldIndex + index] === id)
    const additions = prepended
      ? 0
      : currentIds.filter((id) => !before.ids.includes(id)).length
    let frame: number | undefined
    if (prepended && !following.current)
      element.scrollTop += element.scrollHeight - before.height
    else if (following.current) {
      element.scrollTop = element.scrollHeight
      frame = requestAnimationFrame(() => setUnread(0))
    } else if (additions || (notifyOnUpdate && revision !== before.revision))
      frame = requestAnimationFrame(() =>
        setUnread((count) => count + Math.max(1, additions)),
      )
    previous.current = {
      ids: currentIds,
      height: element.scrollHeight,
      revision,
    }
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame)
    }
  }, [key, revision, notifyOnUpdate])
  useLayoutEffect(() => {
    const element = ref.current
    const content = element?.firstElementChild
    if (!element || !content) return
    const observer = new ResizeObserver(() => {
      if (following.current) element.scrollTop = element.scrollHeight
      else if (notifyOnUpdate && element.scrollHeight > previous.current.height)
        setUnread((count) => Math.max(1, count))
      previous.current.height = element.scrollHeight
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [notifyOnUpdate])
  function onScroll() {
    const element = ref.current
    if (!element) return
    following.current =
      element.scrollHeight - element.scrollTop - element.clientHeight <= 64
    if (following.current) setUnread(0)
  }
  function jumpToLatest() {
    const element = ref.current
    if (element) element.scrollTop = element.scrollHeight
    following.current = true
    setUnread(0)
  }
  return { ref, unread, onScroll, jumpToLatest }
}
