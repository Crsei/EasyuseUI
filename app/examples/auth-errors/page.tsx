import { AuthErrorsPage } from "@/components/examples/auth-errors/auth-errors-demo"

export const metadata = {
  title: "Auth & errors · 认证与错误页面",
  description:
    "注册、登录、忘记密码以及 401、403、404、500、503 的完整本地页面示例。",
  alternates: { canonical: "/examples/auth-errors/" },
}

export default function Page() {
  return <AuthErrorsPage />
}
