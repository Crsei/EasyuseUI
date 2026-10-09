"use client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useI18n } from "@/lib/i18n-provider"
import {
  columnWidth,
  type ConfigurableColumn,
  type DataTableColumnConfig,
} from "@/lib/data-table-model"
export type DataTableControlsProps = {
  columns: readonly (ConfigurableColumn & { label: string })[]
  value: DataTableColumnConfig
  onValueChange: (value: DataTableColumnConfig) => void
}
/** All column changes are requests; the caller owns the returned configuration. */
export function DataTableControls({
  columns,
  value,
  onValueChange,
}: DataTableControlsProps) {
  const { t } = useI18n()
  const order = [
    ...new Set([...(value.order ?? []), ...columns.map((c) => c.id)]),
  ].filter((id) => columns.some((c) => c.id === id))
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        {t("tableControls.columns")}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3">
        <PopoverTitle className="mb-3 text-sm font-medium">
          {t("tableControls.columns")}
        </PopoverTitle>
        <div className="grid gap-3">
          {order.map((id, index) => {
            const column = columns.find((c) => c.id === id)!
            const hidden = new Set(value.hiddenIds ?? [])
            function move(delta: number) {
              const next = [...order]
              ;[next[index], next[index + delta]] = [
                next[index + delta],
                next[index],
              ]
              onValueChange({ ...value, order: next })
            }
            return (
              <div key={id} className="grid gap-2 border-b pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  <Checkbox
                    aria-label={column.label}
                    checked={!hidden.has(id)}
                    disabled={column.hideable === false}
                    onCheckedChange={(checked) => {
                      if (checked) hidden.delete(id)
                      else hidden.add(id)
                      onValueChange({ ...value, hiddenIds: [...hidden] })
                    }}
                  />
                  <span className="text-sm">{column.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    aria-label={t("tableControls.earlier", {
                      label: column.label,
                    })}
                    onClick={() => move(-1)}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === order.length - 1}
                    aria-label={t("tableControls.later", {
                      label: column.label,
                    })}
                    onClick={() => move(1)}
                  >
                    ↓
                  </Button>
                  <label className="flex min-w-0 items-center gap-2 text-xs">
                    {t("tableControls.width")}
                    <Input
                      type="number"
                      className="w-20"
                      aria-label={t("tableControls.columnWidth", {
                        label: column.label,
                      })}
                      min={column.minWidth ?? 80}
                      max={column.maxWidth ?? 640}
                      step={8}
                      value={columnWidth(column, value) ?? ""}
                      placeholder={t("tableControls.auto")}
                      onChange={(event) => {
                        const raw = event.target.value,
                          widths = { ...value.widths }
                        if (!raw) delete widths[id]
                        else if (Number.isFinite(Number(raw)))
                          widths[id] = columnWidth(column, {
                            widths: { [id]: Number(raw) },
                          })!
                        onValueChange({ ...value, widths })
                      }}
                    />
                  </label>
                </div>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
