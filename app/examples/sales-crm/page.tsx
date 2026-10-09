import type { Metadata } from "next"
import { SalesCrmDemo } from "@/components/examples/sales-crm/sales-crm-demo"
export const metadata: Metadata = {
  title: "Sales CRM Companies · EasyuseUI",
  description: "使用 EasyuseUI 通用组件构建的本地 Sales CRM Companies 示例。",
}
export default function SalesCrmPage() {
  return <SalesCrmDemo />
}
