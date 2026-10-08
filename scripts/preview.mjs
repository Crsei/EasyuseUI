import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "../out")
try {
  await stat(root)
} catch {
  throw new Error("Missing out/. Run pnpm build first.")
}
const port = Number(process.env.PORT || 3011)
const host = process.env.HOST || "127.0.0.1"
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
}

createServer(async (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" }).end()
      return
    }
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    )
    let file = path.resolve(root, `.${pathname}`)
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end()
      return
    }
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html")
    const body = await readFile(file)
    response.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
    })
    response.end(request.method === "HEAD" ? undefined : body)
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
    response.end(
      request.method === "HEAD"
        ? undefined
        : await readFile(path.join(root, "404.html")).catch(() => "Not found"),
    )
  }
}).listen(port, host, () =>
  console.log(`EasyuseUI preview: http://${host}:${port}`),
)
