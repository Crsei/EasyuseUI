export const authExampleMessages = {
  "zh-CN": {
    title: "认证与错误页面",
    description: "从进入账户到恢复访问，八个页面，一套一致的体验。",
    overview: "页面总览",
    backExamples: "全部示例",
    theme: "切换浅色与深色主题",
    fixture: "本地交互演示 · 不连接认证或邮件服务",
    login: "01 / 登录",
    register: "02 / 注册",
    "forgot-password": "03 / 忘记密码",
    "401": "04 / 需要登录",
    "403": "05 / 权限不足",
    "404": "06 / 页面未找到",
    "500": "07 / 服务器错误",
    "503": "08 / 服务不可用",
    scenario: "演示结果",
    success: "通过",
    error: "拒绝",
    unknown: "未知",
    submitting: "本地演示：正在检查表单…",
    loginSuccess: "本地演示：登录表单验证通过。没有建立真实登录会话。",
    registerSuccess: "本地演示：注册表单验证通过。没有创建真实账户。",
    forgotSuccess:
      "本地演示：如果该邮箱对应账户，你将收到重置密码的指引。此示例未发送邮件。",
    loginError: "本地演示：邮箱或密码不正确。请检查后重试。",
    registerError: "本地演示：暂时无法创建账户。你的输入已保留，请稍后重试。",
    forgotError: "本地演示：无法提交重置请求。邮箱已保留，请稍后重试。",
    unknownResult: "本地演示：连接中断，无法确认请求结果。提交已锁定。",
    resetFixture: "确认演示未执行并恢复编辑",
    retryFixture:
      "本地演示：已重试读取，仍然展示此错误。请稍后重试或返回总览。",
    home: "返回总览",
    signIn: "前往登录",
    switchAccount: "切换账户",
    registerAction: "注册账户",
    terms: "查看示例使用条款",
    termsBody:
      "此条款仅用于演示接受条款的交互。示例没有账户服务，不收集、不保存或发送输入信息。接入真实产品时，应由产品方提供正式使用条款与隐私政策。",
    technical: "开发说明与组件映射",
    stack:
      "已采用 Next 16.3.8、React 19.3、TypeScript 6、Tailwind 4.3、Base UI 1.8、Lucide 0.577 和 CSS Modules。没有新增依赖或认证 SDK。",
    mapping:
      "复用 Field、Input、Button、Checkbox、Alert、NativeSelect；新增 AuthForm、AuthPageShell、ErrorPage、AuthPageGallery 与 AuthPagePreview。当前页面同时挂载所有表单和错误模块。",
    boundary:
      "账户、权限、会话、邮件发送和未知结果查询由调用方负责。独立页面静态导出，只加载当前页面内容；文档演示通过显式 loader 懒加载。开发总览可选择通过、拒绝或未知结果，不代表真实服务。",
    docs: "组件 API 与安装",
  },
  en: {
    title: "Auth & errors",
    description:
      "From signing in to finding a way back. Eight pages, one consistent experience.",
    overview: "All pages",
    backExamples: "All examples",
    theme: "Toggle light and dark theme",
    fixture: "Local demo · No authentication or email service",
    login: "01 / Sign in",
    register: "02 / Sign up",
    "forgot-password": "03 / Forgot password",
    "401": "04 / Authentication required",
    "403": "05 / Access denied",
    "404": "06 / Page not found",
    "500": "07 / Server error",
    "503": "08 / Service unavailable",
    scenario: "Demo outcome",
    success: "Accept",
    error: "Reject",
    unknown: "Unknown",
    submitting: "Local demo: checking the form…",
    loginSuccess:
      "Local demo: sign-in validation passed. No real session was created.",
    registerSuccess:
      "Local demo: registration validation passed. No real account was created.",
    forgotSuccess:
      "Local demo: if this email belongs to an account, you will receive reset instructions. This example sent no email.",
    loginError:
      "Local demo: incorrect email or password. Check your details and try again.",
    registerError:
      "Local demo: your account could not be created. Your input is retained. Try again later.",
    forgotError:
      "Local demo: the reset request could not be submitted. Your email is retained. Try again later.",
    unknownResult:
      "Local demo: the connection was interrupted and the outcome is unconfirmed. Submission is locked.",
    resetFixture: "Confirm no demo operation occurred and edit again",
    retryFixture:
      "Local demo: the read was retried and this error remains visible. Try later or return to all pages.",
    home: "All pages",
    signIn: "Sign in",
    switchAccount: "Switch accounts",
    registerAction: "Create account",
    terms: "Read example terms",
    termsBody:
      "These terms demonstrate the acceptance interaction only. The example has no account service and does not collect, store or send your input. A real product must supply its own terms and privacy policy.",
    technical: "Developer notes and component mapping",
    stack:
      "Uses Next 16.3.8, React 19.3, TypeScript 6, Tailwind 4.3, Base UI 1.8, Lucide 0.577 and CSS Modules. No new dependencies or authentication SDK.",
    mapping:
      "Reuses Field, Input, Button, Checkbox, Alert and NativeSelect. Adds AuthForm, AuthPageShell, ErrorPage, AuthPageGallery and AuthPagePreview. All forms and error modules are mounted together here.",
    boundary:
      "The caller owns accounts, permissions, sessions, email and outcome reconciliation. Individual pages are statically exported and load only their content; docs demos use an explicit lazy loader. Demo outcomes on this developer gallery are fixtures, not service results.",
    docs: "Component API and installation",
  },
} as const

export const authScreens = [
  "login",
  "register",
  "forgot-password",
  "401",
  "403",
  "404",
  "500",
  "503",
] as const
export type AuthScreen = (typeof authScreens)[number]
