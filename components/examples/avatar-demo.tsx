"use client"
import { Avatar } from "@/components/ui/avatar"
export function AvatarDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" src="data:image/png;base64,broken" />
        <Avatar name="Lin Chen" initials="LC" size={40} />
      </>
    </div>
  )
}
