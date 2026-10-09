export type Company = {
  id: string
  name: string
  tags: string[]
  owner: string
  openDeals: number
  pipelineValue: number
  winProbability: number
  trend: number[]
  lastInteraction: { date: string; label: string }
  activityDays: number
  logo?: string
}
export type Person = {
  name: string
  email: string
  phone: string
  role: string
}
export type Filters = { owner: string; stage: string; activity: number }
export type Sort = { columnId: string; direction: "asc" | "desc" } | null
export type Overlay =
  { type: "company" | "profile"; id: string } | { type: "new" } | null
export type Scenario =
  "success" | "loading" | "empty" | "partial" | "error" | "refresh-error"
export type CompanyDraft = {
  name: string
  owner: string
  segment: string
  stage: string
  openDeals: string
  pipelineValue: string
  winProbability: string
  date: string
  interaction: string
  logo: File | null
}
export type DraftErrors = Partial<Record<keyof CompanyDraft | "submit", string>>
export type Notification = {
  id: string
  person: string
  companyId: string
  kind:
    "mention" | "renewal" | "risk" | "score" | "demo" | "pipeline" | "invite"
  unread: boolean
}
