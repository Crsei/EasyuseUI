import { notFound } from "next/navigation"
import { AuthErrorsPage } from "@/components/examples/auth-errors/auth-errors-demo"
import {
  authExampleMessages,
  authScreens,
  type AuthScreen,
} from "@/components/examples/auth-errors/messages"

export const dynamicParams = false
export function generateStaticParams() {
  return authScreens.map((screen) => ({ screen }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ screen: string }>
}) {
  const { screen } = await params
  if (!authScreens.includes(screen as AuthScreen)) return {}
  return {
    title: `${authExampleMessages["zh-CN"][screen as AuthScreen].replace(/^\d+ \/ /, "")} · Auth & errors`,
    alternates: { canonical: `/examples/auth-errors/${screen}/` },
  }
}
export default async function Page({
  params,
}: {
  params: Promise<{ screen: string }>
}) {
  const { screen } = await params
  if (!authScreens.includes(screen as AuthScreen)) notFound()
  return <AuthErrorsPage screen={screen as AuthScreen} />
}
