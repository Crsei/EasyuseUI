import type {
  SessionSnapshot,
  ContextReference,
} from "@/lib/agent-workbench-model"
import type {
  ResourceSnapshot,
  CommandRecord,
} from "@/lib/workbench-resource-model"
import { redactText } from "@/lib/redact"
import { reportBody } from "./fixtures"
const pixel =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK1cAAAAASUVORK5CYII="
/** Fixture adapter supplies MIME/renderer/bytes explicitly. No actual filesystem or provider is read. */
export function workbenchResourceFixtures(
  session: SessionSnapshot,
): ResourceSnapshot[] {
  const identity = {
    projectId: session.projectId,
    sessionId: session.sessionId,
  }
  const base = {
    ...identity,
    revision: "fixture-1",
    availability: "available" as const,
    dataState: "success" as const,
    complete: true,
    updatedAt: session.updatedAt,
  }
  function text(
    resourceId: string,
    path: string,
    renderer: ResourceSnapshot["renderer"],
    mediaType: string,
    body: string,
  ): ResourceSnapshot {
    const safe = redactText(body)
    return {
      ...base,
      resourceId,
      name: path.split("/").at(-1)!,
      path,
      renderer,
      mediaType,
      text: safe,
      size: new TextEncoder().encode(safe).length,
      source: { label: "Local fixture resource" },
      context: {
        id: `ref-${resourceId}`,
        kind: "file",
        label: path,
        source: path,
        version: base.revision,
        included: true,
        removable: true,
        availability: "available",
      },
      download: () => new Blob([safe], { type: mediaType }),
    }
  }
  const files: ResourceSnapshot[] = session.changes.files
    .filter((file) => file.kind !== "deleted")
    .map((file) => {
      const body =
        file.content ??
        file.lines
          .filter((line) => line.kind !== "remove")
          .map((line) => line.text)
          .join("\n")
      const snapshot = text(
        file.fileId,
        file.path,
        file.kind === "binary" ? "unsupported" : "text",
        file.kind === "binary" ? "application/octet-stream" : "text/plain",
        body,
      )
      return {
        ...snapshot,
        revision: session.changes.revision,
        complete: !file.truncated,
        text: file.kind === "binary" ? undefined : snapshot.text,
        download: file.kind === "binary" ? undefined : snapshot.download,
        source: {
          label: "ChangeSet head snapshot",
          toolCallId:
            session.tools.find(
              (tool) =>
                tool.changeRevision === session.changes.revision &&
                tool.fileIds?.includes(file.fileId),
            )?.id ?? session.tools[0]?.id,
        },
        context: { ...snapshot.context!, version: session.changes.revision },
      }
    })
  const extras = [
    text(
      "resource-large",
      "fixtures/large.ts",
      "text",
      "text/plain",
      Array.from(
        { length: 1005 },
        (_, i) => `export const line${i + 1} = ${i + 1}`,
      ).join("\n"),
    ),
    text(
      "resource-json",
      "fixtures/result.json",
      "json",
      "application/json",
      '{"case":"Alpha","matched":true,"token":"secret-fixture-token"}',
    ),
    text(
      "resource-csv",
      "fixtures/results.csv",
      "csv",
      "text/csv",
      'case,result,duration\n"Alpha, beta",pass,12\nempty,pass,0\n"quoted ""cell""",fail,18',
    ),
    text(
      "resource-html",
      "fixtures/preview.html",
      "html",
      "text/html",
      '<h1>Fixture preview</h1>\n<script>window.UNSAFE_RESOURCE = true</script>\n<img src="https://untrusted.invalid/tracker">',
    ),
    text(
      "resource-svg",
      "fixtures/diagram.svg",
      "svg",
      "image/svg+xml",
      '<svg xmlns="http://www.w3.org/2000/svg"><text x="8" y="24">Fixture</text><script>alert("blocked")</script></svg>',
    ),
    text(
      "resource-md",
      "docs/workbench.md",
      "markdown",
      "text/markdown",
      "# 工作台说明\n\n这是可以下载的真实 fixture 文本。\n\n```ts\nfilter(['Alpha'], 'alpha')\n```",
    ),
    {
      ...base,
      resourceId: "resource-image",
      path: "fixtures/pixel.png",
      name: "pixel.png",
      renderer: "image" as const,
      mediaType: "image/png",
      image: {
        src: pixel,
        alt: "Local one-pixel fixture",
        width: 1,
        height: 1,
      },
      source: { label: "Local raster fixture" },
      context: {
        id: "ref-image",
        kind: "image" as const,
        label: "pixel.png",
        source: "fixtures/pixel.png",
        version: base.revision,
        included: true,
        removable: true,
        availability: "available" as const,
      },
      download: () =>
        new Blob(
          [Uint8Array.from(atob(pixel.split(",")[1]), (c) => c.charCodeAt(0))],
          { type: "image/png" },
        ),
    },
    {
      ...base,
      resourceId: "resource-denied",
      path: "private/config",
      name: "config",
      renderer: "unsupported" as const,
      mediaType: "application/octet-stream",
      availability: "denied" as const,
      reason: "Caller does not grant read access",
    },
    {
      ...base,
      resourceId: "resource-pdf",
      path: "fixtures/report.pdf",
      name: "report.pdf",
      renderer: "unsupported" as const,
      mediaType: "application/pdf",
      reason: "PDF renderer and source bytes are not provided",
    },
  ]
  const diffs: ResourceSnapshot[] = session.changes.files.map((file) => ({
    ...base,
    resourceId: `diff:${file.fileId}`,
    path: file.path,
    name: `${file.path.split("/").at(-1)} (Diff)`,
    revision: session.changes.revision,
    renderer: "diff",
    mediaType: "text/x-diff",
    diff: file,
    source: { label: `${session.changes.base} → ${session.changes.head}` },
  }))
  const artifacts = session.artifacts.map((artifact) => {
    const sourceMessage = session.messages.find((message) =>
      message.parts.some(
        (part) =>
          part.kind === "artifact" && part.referenceId === artifact.artifactId,
      ),
    )
    // This source fixture explicitly emits report text, independent of its filename.
    const linked =
      extras.find((r) => r.resourceId === artifact.resourceId) ??
      files.find((r) => r.resourceId === artifact.resourceId)
    const resource = linked
      ? { ...linked, resourceId: artifact.artifactId, name: artifact.name }
      : artifact.kind === "report"
        ? text(
            artifact.artifactId,
            `reports/${artifact.name}`,
            "markdown",
            "text/markdown",
            reportBody,
          )
        : {
            ...base,
            resourceId: artifact.artifactId,
            name: artifact.name,
            path: artifact.name,
            renderer: "unsupported" as const,
            mediaType: "application/octet-stream",
          }
    return {
      ...resource,
      availability:
        artifact.availability === "available"
          ? ("available" as const)
          : ("missing" as const),
      source: {
        label: "Generated artifact fixture; review/acceptance pending",
        artifactId: artifact.artifactId,
        messageId: sourceMessage?.messageId,
        toolCallId: session.tools[0]?.id,
      },
    }
  })
  return [...files, ...extras, ...artifacts, ...diffs]
}
export function resourceForReference(
  resources: readonly ResourceSnapshot[],
  reference: ContextReference,
) {
  return resources.find(
    (resource) =>
      (!reference.version || resource.revision === reference.version) &&
      (resource.context?.id === reference.id ||
        resource.path === reference.source ||
        resource.path === reference.label ||
        reference.source?.startsWith(`${resource.path}:`)),
  )
}
export function commandFixtures(session: SessionSnapshot): CommandRecord[] {
  const base = {
    sessionId: session.sessionId,
    runId: session.activeRunId,
    cwd: "/fixture/project",
    startedAt: session.updatedAt,
    connection: session.environment.connection,
    outcome: "known" as const,
  }
  const primary: CommandRecord[] = session.tools.map((tool, i) => ({
    ...base,
    commandId: `command-${tool.id}`,
    toolCallId: tool.id,
    command: tool.name,
    status: tool.status,
    exitCode: tool.exitCode,
    outcome: tool.outcome ?? "known",
    resourceIds: session.changes.files
      .filter((file) => file.kind !== "deleted")
      .slice(0, 1)
      .map((file) => file.fileId),
    messageId: session.messages.find((message) =>
      message.parts.some(
        (part) => part.kind === "tool" && part.referenceId === tool.id,
      ),
    )?.messageId,
    output:
      i === 0
        ? session.output
        : {
            text: typeof tool.output === "string" ? tool.output : "",
            source: tool.name,
            timestamp: session.updatedAt,
          },
  }))
  return [
    ...primary,
    {
      ...base,
      commandId: "command-continuous",
      command: "fixture continuous output",
      status: "running",
      output: {
        ...session.output,
        text: Array.from(
          { length: 500 },
          (_, i) => `record ${i}: bounded continuous source output`,
        ).join("\n"),
      },
    },
    {
      ...base,
      commandId: "command-running-empty",
      command: "fixture watch",
      status: "running",
      output: { ...session.output, text: "" },
    },
    {
      ...base,
      commandId: "command-failed",
      command: "fixture failing test",
      status: "failed",
      exitCode: 2,
      endedAt: session.updatedAt,
      durationMs: 420,
      output: {
        ...session.output,
        text: "FAIL source fixture\nAuthorization: private-fixture\nexit code 2",
      },
    },
    {
      ...base,
      commandId: "command-disconnected",
      command: "fixture disconnected output",
      status: "running",
      connection: "disconnected",
      output: {
        ...session.output,
        text: "Partial output retained\ntoken=private-fixture",
        truncated: true,
      },
    },
    {
      ...base,
      commandId: "command-unknown",
      command: "fixture unknown outcome",
      status: "waiting",
      outcome: "unknown",
      output: { ...session.output, text: "" },
    },
    {
      ...base,
      commandId: "command-ended-empty",
      command: "fixture no output",
      status: "completed",
      endedAt: session.updatedAt,
      durationMs: 0,
      output: { ...session.output, text: "" },
    },
  ]
}
