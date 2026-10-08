import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export type InputProps = ComponentProps<"input">

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "h-control w-full min-w-0 rounded-control border bg-surface px-3 text-sm leading-5 transition-colors duration-[var(--motion-hover)] ease-out outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-45 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20 motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11",
        className,
      )}
      {...props}
    />
  )
}
