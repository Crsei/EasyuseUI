import { canvasId, type CanvasDocument } from "@/lib/canvas-model"

export type CanvasSaveReceipt = {
  documentId: string
  requestId: string
  documentRevision: number
  serverRevision: string
  savedAt?: string
}
export type CanvasSaveRequest = {
  document: CanvasDocument
  expectedServerRevision: string
  requestId: string
}
export type CanvasWriteResult =
  | { kind: "saved"; receipt: CanvasSaveReceipt }
  | { kind: "conflict"; serverRevision: string }
  | { kind: "unknown" }
  | { kind: "rejected"; message: string }
export type CanvasStorageAdapter = {
  save: (request: CanvasSaveRequest) => Promise<CanvasWriteResult>
  querySave: (requestId: string) => Promise<CanvasWriteResult>
}
export type CanvasSaveState = {
  documentId: string
  status: "saved" | "dirty" | "saving" | "error" | "conflict" | "unknown"
  serverRevision: string
  receipt?: CanvasSaveReceipt
  requestId?: string
  message?: string
  conflictingRevision?: string
}
const fingerprint = (document: CanvasDocument) => JSON.stringify(document)
/** CAS storage protocol; no timer, browser storage, implicit overwrite or retry. */
export function createCanvasPersistence(
  initial: CanvasDocument,
  serverRevision: string,
  adapter: CanvasStorageAdapter,
) {
  let document = initial,
    confirmed = fingerprint(initial)
  let state: CanvasSaveState = {
    documentId: initial.id,
    status: "saved",
    serverRevision,
  }
  let request: CanvasSaveRequest | undefined
  let pending = false,
    generation = 0
  const listeners = new Set<() => void>()
  function emit(next: CanvasSaveState) {
    state = next
    for (const listener of listeners) listener()
  }
  function setDocument(next: CanvasDocument) {
    if (next.id !== state.documentId)
      throw new Error("存储会话不能切换文档 ID。")
    if (fingerprint(next) === fingerprint(document)) return
    document = next
    emit({
      ...state,
      status: ["unknown", "conflict", "saving"].includes(state.status)
        ? state.status
        : fingerprint(document) === confirmed
          ? "saved"
          : "dirty",
    })
  }
  function accept(result: CanvasWriteResult, submitted: CanvasSaveRequest) {
    if (result.kind === "saved") {
      const receipt = result.receipt
      if (
        receipt.documentId !== submitted.document.id ||
        receipt.requestId !== submitted.requestId ||
        receipt.documentRevision !== submitted.document.revision ||
        !receipt.serverRevision
      ) {
        emit({
          ...state,
          status: "unknown",
          message: "保存回执与请求不匹配；保留草稿并查询回执。",
        })
        return
      }
      confirmed = fingerprint(submitted.document)
      request = undefined
      emit({
        documentId: state.documentId,
        status: fingerprint(document) === confirmed ? "saved" : "dirty",
        serverRevision: receipt.serverRevision,
        receipt,
      })
    } else if (result.kind === "conflict") {
      request = undefined
      emit({
        ...state,
        status: "conflict",
        conflictingRevision: result.serverRevision,
        message: "服务端版本已变化。保留本地草稿，请比较或合并后明确处理冲突。",
      })
    } else if (result.kind === "unknown")
      emit({
        ...state,
        status: "unknown",
        message: "保存结果未确认；先查询此 requestId，禁止重复写入。",
      })
    else {
      request = undefined
      emit({ ...state, status: "error", message: result.message })
    }
  }
  async function save() {
    if (pending || ["unknown", "conflict", "saved"].includes(state.status))
      return
    pending = true
    request = {
      document: structuredClone(document),
      expectedServerRevision: state.serverRevision,
      requestId: canvasId("save"),
    }
    const submitted = request,
      token = generation
    emit({
      ...state,
      status: "saving",
      requestId: submitted.requestId,
      message: undefined,
    })
    try {
      const result = await adapter.save(submitted)
      if (token === generation) accept(result, submitted)
    } catch {
      if (token === generation)
        emit({
          ...state,
          status: "unknown",
          message: "保存响应丢失，草稿保留。查询回执后再决定下一步。",
        })
    } finally {
      if (token === generation) pending = false
    }
  }
  async function query() {
    if (pending || !request) return
    pending = true
    const submitted = request,
      token = generation
    try {
      const result = await adapter.querySave(submitted.requestId)
      if (token === generation) accept(result, submitted)
    } catch {
      if (token === generation)
        emit({
          ...state,
          status: "unknown",
          message: "查询保存回执失败，草稿和请求 ID 保留。",
        })
    } finally {
      if (token === generation) pending = false
    }
  }
  /** Caller invokes only after an explicit comparison/merge and an authoritative base read. */
  function resolveConflict(next: CanvasDocument, serverRevision: string) {
    if (
      state.status !== "conflict" ||
      next.id !== state.documentId ||
      !serverRevision
    )
      throw new Error("需要同一文档的明确冲突处理和服务版本。")
    generation++
    pending = false
    request = undefined
    document = next
    emit({
      documentId: next.id,
      status: "dirty",
      serverRevision,
      message: "已采用调用方明确提供的合并草稿；尚未保存。",
    })
  }
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setDocument,
    save,
    query,
    resolveConflict,
  }
}
export type CanvasPersistenceSession = ReturnType<
  typeof createCanvasPersistence
>

/** Server history is separate from local graph undo. Restoration is a guarded service write. */
export type CanvasVersionAdapter = {
  list: (
    documentId: string,
  ) => Promise<
    { id: string; serverRevision: string; createdAt: string; author?: string }[]
  >
  read: (documentId: string, versionId: string) => Promise<CanvasDocument>
  restore: (request: {
    documentId: string
    versionId: string
    expectedServerRevision: string
    requestId: string
  }) => Promise<{ document: CanvasDocument; receipt: CanvasSaveReceipt }>
}
export type CanvasCommentThread = {
  id: string
  nodeId?: string
  resolved: boolean
  messages: { id: string; author: string; text: string; createdAt: string }[]
}
export type CanvasCollaborationSnapshot = {
  documentId: string
  revision: string
  asOf: number
  threads: CanvasCommentThread[]
  presence: {
    memberId: string
    name: string
    expiresAt: number
    cursor?: { x: number; y: number }
  }[]
  permissions: {
    comment: boolean
    share: boolean
    publish: boolean
    restore: boolean
  }
}
export type CanvasPublicationReceipt = {
  documentId: string
  requestId: string
  serverRevision: string
  environmentId: string
  publicationId: string
  url?: string
}
export type CanvasPublicationAdapter = {
  environments: { id: string; name: string; available: boolean }[]
  publish: (request: {
    documentId: string
    serverRevision: string
    environmentId: string
    requestId: string
  }) => Promise<
    | { kind: "confirmed"; receipt: CanvasPublicationReceipt }
    | { kind: "unknown" }
  >
  query: (
    requestId: string,
  ) => Promise<
    | { kind: "confirmed"; receipt: CanvasPublicationReceipt }
    | { kind: "unknown" }
    | { kind: "rejected"; message: string }
  >
  share?: (documentId: string) => Promise<{ url: string; expiresAt?: string }>
}
