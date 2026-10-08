"use client"
import { useSiteI18n } from "@/components/site/site-i18n"

import { useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DialogDemo() {
  const { t } = useSiteI18n()

  const id = useId()
  const [name, setName] = useState("")
  const [created, setCreated] = useState("")

  return (
    <div className="flex flex-col items-center gap-4">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          {t("site.createProject")}
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{t("site.createANewProject")}</DialogTitle>
          <DialogDescription>
            {t("site.nameTheProjectThisActionIsOnlyAComponent")}
          </DialogDescription>
          <div className="my-6 space-y-2">
            <label htmlFor={id} className="text-sm font-medium">
              {t("site.projectName")}
            </label>
            <Input
              id={id}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("site.myNewProject")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose render={<Button variant="ghost" />}>
              {t("site.cancel")}
            </DialogClose>
            <DialogClose
              disabled={!name.trim()}
              render={<Button />}
              onClick={() => setCreated(name.trim())}
            >
              {t("site.confirmCreation")}
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      <p role="status" className="text-xs text-muted-foreground">
        {created
          ? t("site.demoProjectValueCreated", { value0: created })
          : t("site.supportsKeyboardOperationEscapeAndFocusRestoration")}
      </p>
    </div>
  )
}
