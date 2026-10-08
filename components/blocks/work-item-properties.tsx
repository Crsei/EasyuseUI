"use client"
import { memo, type ReactNode } from "react"
import {
  Circle,
  Flag,
  CalendarDays,
  Paperclip,
  Link as LinkIcon,
  ListTree,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Combobox,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxEmpty,
  ComboboxItem,
} from "@/components/ui/combobox"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { RuntimeStatusBadge } from "@/components/ui/runtime-status-badge"
import { useI18n } from "@/lib/i18n-provider"
import {
  isMutationLocked,
  isOverdue,
  type MutationState,
  type WorkItemCapabilities,
  type WorkItemCatalog,
  type WorkItemField,
  type WorkItemOption,
  type WorkItemPatch,
  type WorkItemProperty,
  type WorkItemRecord,
} from "@/lib/work-items-model"
import styles from "./work-items.module.css"

export type WorkItemSinglePickerProps = {
  value: string
  options: readonly WorkItemOption[]
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
}
function SinglePicker({
  value,
  options,
  onChange,
  disabled,
  label,
  icon,
}: WorkItemSinglePickerProps & { icon: ReactNode }) {
  const items = options.map((option) => ({
    value: option.id,
    label: option.label,
  }))
  return (
    <Select
      value={value}
      items={items}
      onValueChange={(value) => {
        if (value !== null) onChange(value)
      }}
      disabled={disabled}
    >
      <SelectTrigger aria-label={label} className={styles.picker}>
        {icon}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            <span aria-hidden="true" style={{ color: option.color }}>
              {icon}
            </span>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
export function WorkItemStatePicker(props: WorkItemSinglePickerProps) {
  const { t } = useI18n()
  return (
    <SinglePicker
      {...props}
      label={props.label ?? t("workItems.state")}
      icon={<Circle size={14} />}
    />
  )
}
export function WorkItemPriorityPicker(props: WorkItemSinglePickerProps) {
  const { t } = useI18n()
  return (
    <SinglePicker
      {...props}
      label={props.label ?? t("workItems.priority")}
      icon={<Flag size={14} />}
    />
  )
}
export type WorkItemMultiPickerProps = {
  value: readonly string[]
  options: readonly WorkItemOption[]
  onChange: (value: string[]) => void
  disabled?: boolean
  label?: string
}
function MultiPicker({
  value,
  options,
  onChange,
  disabled,
  label,
}: WorkItemMultiPickerProps & { label: string }) {
  const ids = options.map((option) => option.id)
  const name = (id: string) =>
    options.find((option) => option.id === id)?.label ?? id
  const { t } = useI18n()
  return (
    <Combobox
      multiple
      items={ids}
      value={[...value]}
      onValueChange={onChange}
      itemToStringLabel={name}
      disabled={disabled}
    >
      <ComboboxTrigger
        render={<Button variant="ghost" size="sm" />}
        aria-label={label}
      >
        {value.length
          ? value.slice(0, 2).map(name).join(", ") +
            (value.length > 2 ? ` +${value.length - 2}` : "")
          : t("workItems.none")}
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput
          aria-label={label}
          placeholder={t("workItems.searchOptions")}
        />
        <ComboboxEmpty>{t("workItems.noMatches")}</ComboboxEmpty>
        <ComboboxList>
          {(id: string) => (
            <ComboboxItem key={id} value={id}>
              {name(id)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
export function WorkItemAssigneePicker(props: WorkItemMultiPickerProps) {
  const { t } = useI18n()
  return (
    <MultiPicker {...props} label={props.label ?? t("workItems.assignees")} />
  )
}
export function WorkItemLabelPicker(props: WorkItemMultiPickerProps) {
  const { t } = useI18n()
  return <MultiPicker {...props} label={props.label ?? t("workItems.labels")} />
}
export function WorkItemDueDateField({
  value,
  onChange,
  disabled,
  label,
}: {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
  label?: string
}) {
  const { t } = useI18n()
  return (
    <Input
      className={styles.dateInput}
      type="date"
      value={value ?? ""}
      aria-label={label ?? t("workItems.dueDate")}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value || null)}
    />
  )
}
export function PropertyOverflow({
  label,
  children,
  count,
}: {
  label: string
  children: ReactNode
  count: number
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="sm" aria-label={label} />}
      >
        +{count}
      </PopoverTrigger>
      <PopoverContent>
        <div className={styles.overflow}>{children}</div>
      </PopoverContent>
    </Popover>
  )
}
export function AvatarGroup({
  people,
  limit = 2,
}: {
  people: readonly WorkItemOption[]
  limit?: number
}) {
  const { t } = useI18n()
  return (
    <span className={styles.avatarGroup}>
      {people.slice(0, limit).map((person) => (
        <Avatar key={person.id} name={person.label} size={24} />
      ))}
      {people.length > limit && (
        <PropertyOverflow
          label={t("workItems.allAssignees")}
          count={people.length - limit}
        >
          {people.map((person) => (
            <span key={person.id}>{person.label}</span>
          ))}
        </PropertyOverflow>
      )}
      {!people.length && <span>{t("workItems.none")}</span>}
    </span>
  )
}
export type WorkItemPropertiesProps = {
  item: WorkItemRecord
  catalog: WorkItemCatalog
  visibleProperties: readonly WorkItemProperty[]
  layout?: "row" | "card" | "detail" | "table"
  capabilities?: WorkItemCapabilities
  onPatchItem?: (item: WorkItemRecord, patch: WorkItemPatch) => void
  mutation?: MutationState
  today?: string
  agentLabel?: string
}
function WorkItemPropertiesContent({
  item,
  catalog,
  visibleProperties,
  layout = "row",
  capabilities,
  onPatchItem,
  mutation,
  today,
  agentLabel,
}: WorkItemPropertiesProps) {
  const { t } = useI18n()
  const editable = (field: WorkItemField) =>
    !!onPatchItem &&
    !!capabilities?.canEditField(item, field) &&
    !isMutationLocked(mutation)
  const patch = (value: WorkItemPatch) => onPatchItem?.(item, value)
  const option = (options: readonly WorkItemOption[], id: string) =>
    options.find((option) => option.id === id)
  const values: Record<WorkItemProperty, ReactNode> = {
    state: editable("stateId") ? (
      <WorkItemStatePicker
        value={item.stateId}
        options={catalog.states}
        onChange={(stateId) => patch({ stateId })}
      />
    ) : (
      <span className={styles.readValue}>
        <Circle
          size={14}
          style={{ color: option(catalog.states, item.stateId)?.color }}
        />
        {option(catalog.states, item.stateId)?.label ?? item.stateId}
      </span>
    ),
    priority: editable("priorityId") ? (
      <WorkItemPriorityPicker
        value={item.priorityId}
        options={catalog.priorities}
        onChange={(priorityId) => patch({ priorityId })}
      />
    ) : (
      <span className={styles.readValue}>
        <Flag size={14} />
        {option(catalog.priorities, item.priorityId)?.label ?? item.priorityId}
      </span>
    ),
    assignees: editable("assigneeIds") ? (
      <WorkItemAssigneePicker
        value={item.assigneeIds}
        options={catalog.assignees}
        onChange={(assigneeIds) => patch({ assigneeIds })}
      />
    ) : (
      <AvatarGroup
        people={item.assigneeIds.map(
          (id) => option(catalog.assignees, id) ?? { id, label: id },
        )}
      />
    ),
    labels: editable("labelIds") ? (
      <WorkItemLabelPicker
        value={item.labelIds}
        options={catalog.labels}
        onChange={(labelIds) => patch({ labelIds })}
      />
    ) : (
      <span className={styles.labels}>
        {item.labelIds.slice(0, 2).map((id) => (
          <span key={id}>{option(catalog.labels, id)?.label ?? id}</span>
        ))}
        {item.labelIds.length > 2 && (
          <PropertyOverflow
            label={t("workItems.allLabels")}
            count={item.labelIds.length - 2}
          >
            {item.labelIds.map((id) => (
              <span key={id}>{option(catalog.labels, id)?.label ?? id}</span>
            ))}
          </PropertyOverflow>
        )}
        {!item.labelIds.length && "—"}
      </span>
    ),
    dueDate: editable("dueDate") ? (
      <WorkItemDueDateField
        value={item.dueDate}
        onChange={(dueDate) => patch({ dueDate })}
      />
    ) : (
      <span
        className={styles.readValue}
        data-overdue={isOverdue(item.dueDate, today) || undefined}
      >
        <CalendarDays size={14} />
        {item.dueDate ?? "—"}
      </span>
    ),
    counts: (
      <span className={styles.readValue}>
        <ListTree size={14} />
        {item.subItemCount ?? "—"}
        <Paperclip size={14} />
        {item.attachmentCount ?? "—"}
        <LinkIcon size={14} />
        {item.linkCount ?? "—"}
      </span>
    ),
  }
  const labels: Record<WorkItemProperty, string> = {
    state: t("workItems.state"),
    priority: t("workItems.priority"),
    assignees: t("workItems.assignees"),
    labels: t("workItems.labels"),
    dueDate: t("workItems.dueDate"),
    counts: t("workItems.counts"),
  }
  return (
    <div className={styles.properties} data-layout={layout}>
      {visibleProperties.map((key, index) => (
        <div
          key={key}
          className={
            index > 2 && layout === "row" ? styles.lowProperty : undefined
          }
          data-property={key}
        >
          {layout === "detail" && (
            <span className={styles.fieldLabel}>{labels[key]}</span>
          )}
          {values[key]}
        </div>
      ))}
      {layout === "row" && visibleProperties.length > 3 && (
        <div className={styles.responsiveOverflow}>
          <PropertyOverflow
            label={t("workItems.moreProperties")}
            count={visibleProperties.length - 3}
          >
            {visibleProperties.slice(3).map((key) => (
              <div key={key}>
                {labels[key]}
                {values[key]}
              </div>
            ))}
          </PropertyOverflow>
        </div>
      )}
      {item.agentStatus && (
        <span className={styles.readValue}>
          {agentLabel ?? t("workItems.agent")}{" "}
          <RuntimeStatusBadge status={item.agentStatus} />
        </span>
      )}
    </div>
  )
}

/** Ignore presentation-only callbacks; field edits still use the current onPatchItem. */
export const WorkItemProperties = memo(
  WorkItemPropertiesContent,
  (a, b) =>
    a.item === b.item &&
    a.catalog === b.catalog &&
    a.visibleProperties === b.visibleProperties &&
    a.layout === b.layout &&
    a.capabilities === b.capabilities &&
    a.onPatchItem === b.onPatchItem &&
    a.mutation === b.mutation &&
    a.today === b.today &&
    a.agentLabel === b.agentLabel,
)
