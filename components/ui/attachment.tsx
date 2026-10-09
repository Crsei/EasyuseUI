"use client"
import { Paperclip, X } from "lucide-react"
import { useI18n } from "@/lib/i18n-provider"
import { Item } from "./item"
import { Button } from "./button"
export type AttachmentStatus =
  "idle" | "uploading" | "processing" | "done" | "error" | "unknown"
export type AttachmentProps = {
  name: string
  description?: string
  status?: AttachmentStatus
  error?: string
  disabled?: boolean
  onOpen?: () => void
  onRemove?: () => void
  className?: string
}
/** A caller-owned attachment descriptor. It never reads files or starts uploads. */
export function Attachment({
  name,
  description,
  status = "done",
  error,
  disabled,
  onOpen,
  onRemove,
  className,
}: AttachmentProps) {
  const { t } = useI18n()
  const state = t(`attachment.${status}`)
  return (
    <Item
      density="compact"
      className={className}
      title={name}
      description={[description, state].filter(Boolean).join(" · ")}
      leading={<Paperclip size={16} aria-hidden="true" />}
      error={error}
      disabled={disabled}
      onSelect={status === "done" ? onOpen : undefined}
      trailing={
        onRemove ? (
          <Button
            size="icon"
            variant="ghost"
            disabled={
              disabled ||
              status === "uploading" ||
              status === "processing" ||
              status === "unknown"
            }
            aria-label={t("attachment.remove", { name })}
            onClick={onRemove}
          >
            <X aria-hidden="true" size={16} />
          </Button>
        ) : undefined
      }
    />
  )
}
