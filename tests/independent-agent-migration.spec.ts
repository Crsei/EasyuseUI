import { expect, test } from "@playwright/test"
import { agentAppHref, publicAppOrigin } from "../lib/independent-example-apps"

test("public addresses and compatibility queries exclude credentials and arbitrary destinations", () => {
  for (const value of [
    undefined,
    "javascript:alert(1)",
    "https://user:secret@example.com",
    "https://example.com/path/",
    "https://example.com/?token=secret",
  ])
    expect(publicAppOrigin(value)).toBeUndefined()
  expect(
    agentAppHref(undefined, "/workspace/", new URLSearchParams()),
  ).toBeUndefined()
  const params = new URLSearchParams(
    "template=console&page=inbox&session=session-report&token=secret&target=https://evil.example&project=project-demo&panel=changes&unknown=x&scenario=https://evil.example",
  )
  const url = new URL(
    agentAppHref(
      "https://agent.example",
      "/examples/agent-workbench/app/",
      params,
    )!,
  )
  expect(url.origin).toBe("https://agent.example")
  expect(url.pathname).toBe("/")
  expect(Object.fromEntries(url.searchParams)).toEqual({
    template: "console",
    page: "inbox",
    session: "session-report",
    project: "project-demo",
    panel: "changes",
  })
  expect(
    new URL(
      agentAppHref(
        "https://agent.example",
        "/examples/agent-workbench/pi/",
        params,
      )!,
    ).pathname,
  ).toBe("/pi/")
})

test("legacy workspace and Pi entries mount the 17-module docs gallery without service clients", async ({
  page,
}) => {
  const connections: string[] = []
  page.on("request", (request) => {
    if (request.url().includes("/api/pi/")) connections.push(request.url())
  })
  for (const route of [
    "/workspace/?template=artifacts&page=artifacts&session=session-report&token=secret",
    "/examples/agent-workbench/pi/",
  ]) {
    await page.goto(route)
    await expect(page.locator("[data-element-gallery]")).toBeVisible()
    await expect(page.locator("[data-gallery-module]")).toHaveCount(17)
    await expect(
      page.locator("[data-pi-workspace], [data-workbench-page]"),
    ).toHaveCount(0)
    const entry = page.locator("[data-independent-app]")
    if (await entry.count()) {
      const href = new URL((await entry.getAttribute("href"))!)
      expect(href.searchParams.has("token")).toBe(false)
      expect(href.pathname).toBe(route.includes("/pi/") ? "/pi/" : "/")
      if (!route.includes("/pi/"))
        expect(href.searchParams.get("template")).toBe("artifacts")
    } else
      await expect(
        page.locator("[data-independent-app-unconfigured]"),
      ).toBeVisible()
  }
  expect(connections).toEqual([])
})
