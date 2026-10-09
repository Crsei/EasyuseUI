"use client"
import { useState, type ReactNode } from "react"
import { FormSection } from "@/components/blocks/form-section"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Kbd } from "@/components/ui/kbd"
import { useI18n } from "@/lib/i18n-provider"
import { activeReceipt } from "@/lib/agent-workbench-model"
import type { WorkbenchViewProps } from "./view-props"
import { models, permissions, environments } from "./fixtures"
import { useWorkbenchExample } from "./provider"
import styles from "./enhancement.module.css"
import { exampleMessages } from "./messages"

export function SettingsForm({
  session,
  draft,
  query,
  preferences,
}: WorkbenchViewProps & { preferences: ReactNode }) {
  const { locale, t } = useI18n(),
    { state, dispatch } = useWorkbenchExample()
  const en = locale === "en"
  const groups = [
    "model",
    "permission",
    "environment",
    "tools",
    "context",
    "rules",
    "appearance",
    "shortcuts",
    "diagnostics",
  ] as const
  const labels = en
    ? [
        "Models",
        "Permissions",
        "Project & environment",
        "Tools & services",
        "Context",
        "Rules & Skills",
        "Appearance & layout",
        "Input & shortcuts",
        "Connection & diagnostics",
      ]
    : [
        "模型",
        "权限",
        "项目与环境",
        "工具与服务",
        "上下文",
        "规则与 Skills",
        "外观与布局",
        "输入与快捷键",
        "连接与诊断",
      ]
  const [group, setGroup] = useState<(typeof groups)[number]>("model")
  const [search, setSearch] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const error = errors[session.sessionId] ?? ""
  const setError = (value: string) =>
    setErrors((before) => ({ ...before, [session.sessionId]: value }))
  const config = state.settingsDrafts[session.sessionId]?.configuration ?? draft
  const validConfiguration = models.some((c) => c.id === config.modelId && !c.disabledReason) && environments.some((c) => c.id === config.environmentId) && permissions.some((c) => c.id === config.permissionId)
  const receipt = activeReceipt(state.receipts, `${session.sessionId}:settings`)
  const lastReceipt = state.receipts.findLast(
    (r) => r.targetId === `${session.sessionId}:settings`,
  )
  const locked =
    query.scenario === "readonly" ||
    state.projects.find((p) => p.projectId === session.projectId)?.readOnly
  const filtered = groups.filter(
    (id, i) =>
      id.includes(search.toLowerCase()) ||
      labels[i].toLowerCase().includes(search.toLowerCase()),
  )
  const visible = filtered.includes(group) ? group : filtered[0]
  const fields = [
    {
      key: "modelId",
      group: "model",
      choices: models,
      label: t("workbench.model"),
    },
    {
      key: "permissionId",
      group: "permission",
      choices: permissions,
      label: t("workbench.permission"),
    },
    {
      key: "environmentId",
      group: "environment",
      choices: environments,
      label: t("workbench.environment"),
    },
  ] as const
  const scope = en
    ? "Session configuration for the next request. Active run and service authorization remain source-owned."
    : "会话下次请求配置；当前运行环境与实际权限以来源为准。"
  return (
    <div
      className={styles.settingsForm}
      data-settings-session={session.sessionId}
    >
      <p className={styles.meta}>
        {scope} {session.sessionId}
      </p>
      <p className={styles.meta}>{en ? "Configuration valid" : "配置有效"}: {String(validConfiguration)}</p>
      {!validConfiguration && <p role="status">{exampleMessages[locale].invalidConfig}</p>}
      <Input
        aria-label={en ? "Search settings" : "搜索设置"}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className={styles.settingsColumns}>
        <nav
          aria-label={en ? "Settings categories" : "设置分类"}
          className={styles.categories}
        >
          {filtered.map((id) => (
            <Button
              key={id}
              variant="ghost"
              aria-pressed={visible === id}
              onClick={() => setGroup(id)}
            >
              {labels[groups.indexOf(id)]}
            </Button>
          ))}
        </nav>
        <div className={styles.settingsBody}>
          {!visible && <p>{en ? "No matching settings" : "没有匹配的设置"}</p>}
          {fields
            .filter((field) => field.group === visible)
            .map((field) => (
              <FormSection
                key={field.key}
                title={labels[groups.indexOf(field.group)]}
                description={scope}
              >
                <Field
                  label={field.label}
                  description={
                    en
                      ? "Local fixture capability; applies only after source confirmation"
                      : "本地 fixture 能力；来源确认后生效"
                  }
                >
                  {(props) => (
                    <Select
                      value={config[field.key]}
                      items={[{value: "", label: en ? "Unconfigured" : "未配置"}, ...field.choices.map((choice) => ({
                        value: choice.id,
                        label: choice.label,
                      }))]}
                      disabled={locked || Boolean(receipt)}
                      onValueChange={(value) => {
                        if (typeof value === "string")
                          dispatch({
                            type: "settings-draft",
                            id: session.sessionId,
                            configuration: {
                              modelId: config.modelId,
                              permissionId: config.permissionId,
                              environmentId: config.environmentId,
                              [field.key]: value,
                            },
                          })
                      }}
                    >
                      <SelectTrigger {...props}>
                        <SelectValue
                          placeholder={en ? "Choose configuration" : "选择配置"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{en ? "Unconfigured" : "未配置"}</SelectItem>
                        {field.choices.map((choice) => (
                          <SelectItem
                            key={choice.id}
                            value={choice.id}
                            disabled={Boolean(
                              "disabledReason" in choice &&
                              choice.disabledReason,
                            )}
                          >
                            {choice.label}
                            {"disabledReason" in choice
                              ? ` · ${choice.disabledReason}`
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <p className={styles.meta}>
                  {en ? "Effective value" : "已生效值"}:{" "}
                  {draft[field.key] || "—"}
                </p>
                {field.group === "environment" && (
                  <p>
                    {session.environment.branch ?? "—"} ·{" "}
                    {session.environment.worktree ?? "—"} ·{" "}
                    {session.environment.connection}
                  </p>
                )}
                {field.group === "model" && (
                  <p>
                    {en
                      ? "Strategy and reasoning parameters are not provided by this source."
                      : "此来源未提供执行策略与推理参数。"}
                  </p>
                )}
              </FormSection>
            ))}
          {visible === "appearance" && (
            <FormSection
              title={labels[6]}
              description={
                en
                  ? "Local preferences; changes preview immediately"
                  : "本地外观偏好；选择后即时预览"
              }
            >
              {preferences}
            </FormSection>
          )}
          {visible === "context" && (
            <>
              <p>
                {en
                  ? "Draft references; inclusion affects the next submission only"
                  : "草稿引用；包含状态仅影响下次提交"}
              </p>
              {draft.context.map((ref) => (
                <p key={ref.id}>
                  {ref.label} · {t(`workbench.${ref.availability}`)} ·{" "}
                  {ref.included ? t("workbench.included") : "—"}
                </p>
              ))}
              <p>
                {en
                  ? "Model history/tool budget snapshot and compression are unavailable."
                  : "来源未提供模型历史/工具预算快照与压缩能力。"}
              </p>
            </>
          )}
          {visible === "rules" && (
            <>
              {session.contextSources
                .filter((ref) => ["rule", "skill"].includes(ref.kind))
                .map((ref) => (
                  <p key={ref.id}>
                    {ref.label} · {ref.source} @{ref.version ?? "—"} ·{" "}
                    {en ? "Source policy; read only" : "来源规则；只读"}
                  </p>
                ))}
              <p>
                {en
                  ? "Browsing a rule does not execute a Skill."
                  : "查看规则不等于执行 Skill。"}
              </p>
            </>
          )}
          {visible === "tools" && (
            <>
              <p>{session.tools.map((tool) => tool.name).join(", ") || "—"}</p>
              <p>
                {en
                  ? "Tool connection/enablement configuration is unavailable. Single-call approval stays in the source request."
                  : "来源未提供工具连接/启用配置；单次批准仍在审批记录中操作。"}
              </p>
            </>
          )}
          {visible === "shortcuts" && (
            <>
              <p>
                <Kbd>Mod</Kbd> + <Kbd>K</Kbd> {t("workbench.searchSessions")}
              </p>
              <p>
                <Kbd>Enter</Kbd> {t("workbench.send")} · <Kbd>Shift+Enter</Kbd>{" "}
                {en ? "New line" : "换行"}
              </p>
              <p>
                {en
                  ? "IME composition never submits. Key remapping is unavailable."
                  : "中文输入法组合期间不会发送；未提供按键重映射能力。"}
              </p>
            </>
          )}
          {visible === "diagnostics" && (
            <dl>
              <dt>{t("workbench.source")}</dt>
              <dd>{session.source}</dd>
              <dt>{t("workbench.environment")}</dt>
              <dd>{session.environment.connection}</dd>
              <dt>{en ? "Last update" : "最后更新"}</dt>
              <dd>{session.updatedAt}</dd>
              <dt>Revision</dt>
              <dd>{session.revision}</dd>
            </dl>
          )}
        </div>
      </div>
      {locked && (
        <p role="status">
          {en ? "Project policy locks configuration" : "项目策略锁定配置"}
        </p>
      )}
      {(error || lastReceipt?.state === "failed") && (
        <p role="alert">
          {error ||
            lastReceipt?.reason ||
            (en
              ? "Save failed; effective values and draft retained"
              : "保存失败；已生效值和设置草稿保留")}
        </p>
      )}
      {receipt && (
        <p role="status">
          {t(`workbench.${receipt.state}`)} ·{" "}
          {en
            ? "Fixture receipts are controlled in Example settings"
            : "fixture 回执在“示例设置”中确认"}
        </p>
      )}
      <div className={styles.settingsFooter}>
        <Button
          variant="ghost"
          disabled={Boolean(receipt)}
          onClick={() => {
            dispatch({ type: "settings-cancel", id: session.sessionId })
            setError("")
          }}
        >
          {en ? "Cancel changes" : "取消修改"}
        </Button>
        {receipt?.state === "unknown" && (
          <Button
            variant="secondary"
            onClick={() =>
              dispatch({
                type: "settle",
                requestId: receipt.requestId,
                state: "confirmed",
              })
            }
          >
            {t("workbench.reconcile")}
          </Button>
        )}
        <Button
          disabled={
            locked ||
            Boolean(receipt) ||
            !state.settingsDrafts[session.sessionId]
          }
          onClick={() => {
            if (
              !models.some(
                (choice) =>
                  choice.id === config.modelId && !choice.disabledReason,
              ) ||
              !environments.some(
                (choice) => choice.id === config.environmentId,
              ) ||
              !permissions.some(
                (choice) => choice.id === config.permissionId,
              ) ||
              session.environment.connection !== "connected"
            ) {
              setError(
                en
                  ? "Configuration invalid or source disconnected"
                  : "配置无效或来源已断开",
              )
              return
            }
            setError("")
            dispatch({ type: "settings-save", id: session.sessionId })
          }}
        >
          {en ? "Apply configuration" : "应用配置"}
        </Button>
      </div>
    </div>
  )
}
