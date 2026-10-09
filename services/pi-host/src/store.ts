import {
  mkdirSync,
  openSync,
  closeSync,
  writeFileSync,
  fsyncSync,
  renameSync,
  readFileSync,
  existsSync,
  unlinkSync,
} from "node:fs"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import type { PiReceipt } from "../../../lib/pi-workspace-protocol.ts"
import { HostError } from "./history.ts"

export type ManagedSession = {
  sessionId: string
  projectId: string
  file: string
  title: string
  updatedAt: string
  status: string
  runId?: string
  originId?: string
  aliases: Record<string, string>
  modelId: string
}
export type StoreData = {
  version: 1
  sessions: Record<string, ManagedSession>
  operations: Record<string, { digest: string; receipt: PiReceipt }>
}
export class Store {
  data: StoreData
  private directory: string
  private lock: string
  private lockId = randomUUID()
  constructor(directory: string) {
    this.directory = directory
    mkdirSync(directory, { recursive: true, mode: 0o700 })
    this.lock = join(directory, "host.lock")
    if (existsSync(this.lock)) {
      const owner = JSON.parse(readFileSync(this.lock, "utf8"))
      let alive = true
      try {
        process.kill(owner.pid, 0)
      } catch (error) {
        alive = (error as NodeJS.ErrnoException).code !== "ESRCH"
      }
      if (alive) throw new HostError("managed_directory_locked", 409)
      unlinkSync(this.lock)
    }
    const fd = openSync(this.lock, "wx", 0o600)
    try {
      writeFileSync(fd, JSON.stringify({ pid: process.pid, id: this.lockId }))
      fsyncSync(fd)
    } finally {
      closeSync(fd)
    }
    try {
      const path = join(directory, "index.json")
      this.data = existsSync(path)
        ? JSON.parse(readFileSync(path, "utf8"))
        : { version: 1, sessions: {}, operations: {} }
      if (
        this.data.version !== 1 ||
        !this.data.sessions ||
        !this.data.operations
      )
        throw new HostError("invalid_host_index")
      for (const operation of Object.values(this.data.operations)) {
        if (operation.receipt.state === "pending")
          operation.receipt = {
            ...operation.receipt,
            state: "unknown",
            reason: "host_restart_unconfirmed",
          }
      }
      for (const session of Object.values(this.data.sessions)) {
        if (
          ["starting", "running", "thinking", "waiting"].includes(
            session.status,
          )
        )
          session.status = "unknown"
      }
      this.save()
    } catch (error) {
      this.close()
      throw error
    }
  }
  save() {
    const target = join(this.directory, "index.json"),
      temporary = `${target}.${randomUUID()}.tmp`
    const fd = openSync(temporary, "wx", 0o600)
    try {
      writeFileSync(fd, JSON.stringify(this.data))
      fsyncSync(fd)
    } finally {
      closeSync(fd)
    }
    renameSync(temporary, target)
    const dirFd = openSync(this.directory, "r")
    try {
      fsyncSync(dirFd)
    } finally {
      closeSync(dirFd)
    }
  }
  close() {
    if (
      existsSync(this.lock) &&
      JSON.parse(readFileSync(this.lock, "utf8")).id === this.lockId
    )
      unlinkSync(this.lock)
  }
}
