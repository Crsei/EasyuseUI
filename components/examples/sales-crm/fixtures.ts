import data from "./fixture-data.json" with { type: "json" }
import type {
  Company,
  CompanyDraft,
  Filters,
  Notification,
  Person,
} from "./model"
export const TODAY = "2026-09-14"
export const SEGMENTS = ["Enterprise", "Mid-Market", "SMB", "Strategic"]
export const STAGES = [
  "New Logo",
  "Upsell",
  "Expansion",
  "Renewal",
  "Pilot",
  "Co-Sell",
  "Land & Expand",
]
export const companiesFixture: readonly Company[] = data.companies
export const owners: readonly Person[] = data.owners
export const currentUser: Person = data.currentUser
export const defaultFilters: Filters = {
  owner: "all",
  stage: "any",
  activity: 90,
}
export const defaultDraft: CompanyDraft = {
  name: "",
  owner: owners[0].name,
  segment: SEGMENTS[0],
  stage: STAGES[0],
  openDeals: "0",
  pipelineValue: "0",
  winProbability: "50",
  date: TODAY,
  interaction: "Demo",
  logo: null,
}
export const notificationsFixture: readonly Notification[] = [
  {
    id: "n1",
    person: "Mark Darnalds",
    companyId: "microsoft",
    kind: "mention",
    unread: true,
  },
  {
    id: "n2",
    person: "Sarah Nguyen",
    companyId: "lvmh",
    kind: "renewal",
    unread: true,
  },
  {
    id: "n3",
    person: "Ava Brooks",
    companyId: "slack",
    kind: "risk",
    unread: true,
  },
  {
    id: "n4",
    person: "Emma Green",
    companyId: "shopify",
    kind: "score",
    unread: false,
  },
  {
    id: "n5",
    person: "Noah Lee",
    companyId: "stripe",
    kind: "demo",
    unread: false,
  },
  {
    id: "n6",
    person: "Grace Miller",
    companyId: "snowflake",
    kind: "pipeline",
    unread: false,
  },
  {
    id: "n7",
    person: "Chloe Park",
    companyId: "hubspot",
    kind: "invite",
    unread: false,
  },
]
export const tagTones: Record<string, string> = {
  Enterprise: "blue",
  "Mid-Market": "moss",
  SMB: "yellow",
  Strategic: "red",
  "New Logo": "green",
  Upsell: "purple",
  Expansion: "green",
  Renewal: "green",
  Pilot: "orange",
  "Co-Sell": "amber",
  "Land & Expand": "teal",
}
