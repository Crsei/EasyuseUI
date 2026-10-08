"use client"
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import { useSiteI18n } from "@/components/site/site-i18n"
export function TableDemo() {
  const { t } = useSiteI18n()
  return (
    <TableContainer>
      <Table>
        <TableCaption>{t("site.commonComponents.records")}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{t("site.commonComponents.name")}</TableHead>
            <TableHead>{t("site.commonComponents.tasks")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alpha worker</TableCell>
            <TableCell>42</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
