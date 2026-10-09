"use client"
import { ChevronDown } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Tag } from "@/components/ui/tag"
import { tagTones } from "./fixtures"
import styles from "./sales-crm-theme.module.css"
export function CrmSelect({
  label,
  value,
  options,
  onChange,
  prefix,
  id,
  described,
  invalid,
}: {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
  prefix?: string
  id?: string
  described?: string
  invalid?: boolean
}) {
  return (
    <Select
      value={value}
      items={options}
      onValueChange={(next) => {
        if (next !== null) onChange(next)
      }}
    >
      <SelectTrigger
        id={id}
        aria-label={label}
        aria-describedby={described}
        aria-invalid={invalid || undefined}
        className={styles.select}
      >
        {prefix && <span className={styles.selectPrefix}>{prefix}</span>}
        <span className={styles.selectValue}>
          <SelectValue />
          <ChevronDown size={12} aria-hidden="true" />
        </span>
      </SelectTrigger>
      <SelectContent className={styles.menu}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
export function CompanyTags({ tags }: { tags: readonly string[] }) {
  return (
    <span className={styles.tags}>
      {tags.map((tag) => (
        <Tag
          key={tag}
          className={styles.tag}
          data-crm-tone={tagTones[tag] ?? "neutral"}
        >
          {tag}
        </Tag>
      ))}
    </span>
  )
}
