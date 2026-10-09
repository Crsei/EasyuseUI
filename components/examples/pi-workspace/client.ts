import {
  PI_PROTOCOL_VERSION,
  type PiEvent,
  type PiCommand,
  type PiReceipt,
} from "@/lib/pi-workspace-protocol"

export class PiHttpError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
export class PiClient {
  private endpoint: string
  private token: string
  constructor(endpoint: string, token: string) {
    const url = new URL(endpoint)
    if (
      url.protocol !== "http:" ||
      !["127.0.0.1", "localhost"].includes(url.hostname) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw new Error("invalid_endpoint")
    this.endpoint = url.origin
    this.token = token
  }
  async request<T>(
    path: string,
    body?: PiCommand,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await fetch(`${this.endpoint}/api/pi/${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15000)])
        : AbortSignal.timeout(15000),
      cache: "no-store",
    })
    const value = await response.json()
    if (!response.ok)
      throw new PiHttpError(value.error ?? "request_failed", response.status)
    return value as T
  }
  command(path: string, body: PiCommand) {
    return this.request<PiReceipt>(path, body)
  }
  async events(
    id: string,
    epoch: string,
    after: number,
    signal: AbortSignal,
    receive: (event: PiEvent) => Promise<void>,
  ) {
    const response = await fetch(
      `${this.endpoint}/api/pi/sessions/${encodeURIComponent(id)}/events?epoch=${encodeURIComponent(epoch)}&after=${after}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
        signal,
        cache: "no-store",
      },
    )
    if (!response.ok || !response.body)
      throw new PiHttpError("event_connection_failed", response.status)
    const reader = response.body.getReader(),
      decoder = new TextDecoder()
    let pending = ""
    try {
      while (!signal.aborted) {
        const { value, done } = await reader.read()
        if (done) throw new Error("event_connection_closed")
        pending += decoder
          .decode(value, { stream: true })
          .replace(/\r\n/g, "\n")
        if (pending.length > 4 * 1024 * 1024)
          throw new Error("event_size_limit")
        let boundary: number
        while ((boundary = pending.indexOf("\n\n")) >= 0) {
          const block = pending.slice(0, boundary)
          pending = pending.slice(boundary + 2)
          const data = block
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n")
          if (!data) continue
          const event = JSON.parse(data) as PiEvent
          if (
            event.protocolVersion !== PI_PROTOCOL_VERSION ||
            event.sessionId !== id ||
            !Number.isInteger(event.sequence)
          )
            throw new Error("invalid_event_envelope")
          await receive(event)
        }
      }
    } finally {
      await reader.cancel().catch(() => {})
      reader.releaseLock()
    }
  }
}
export function abortableDelay(signal: AbortSignal, milliseconds: number) {
  return new Promise<void>((resolve) => {
    const finish = () => {
      clearTimeout(timer)
      signal.removeEventListener("abort", finish)
      resolve()
    }
    const timer = setTimeout(finish, milliseconds)
    signal.addEventListener("abort", finish, { once: true })
    if (signal.aborted) finish()
  })
}
