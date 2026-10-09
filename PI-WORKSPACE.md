# Pi Workspace

入口：`/examples/agent-workbench/pi/`。静态网页连接独立本地 Pi Host，支持项目、持久化会话、只读历史、复制继续、流式回复、只读工具、停止和断线恢复。设计与证据见[首轮计划](plans/agent-workspace-completion-plan.md)、[技术计划](plans/pi-agent-workspace-integration-plan.md)、[设计声明](plans/agent-workspace-plan.md)、[实施记录](plans/agent-workspace-completion-log.md)。

## 安装与启动

使用Node 24.5或更高版本（已验证24.21.0；Host使用Node原生TypeScript），从仓库根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm pi:host
pnpm dev
```

已有3010开发服务时复用。Host默认3012，仅监听`127.0.0.1`；网页与模型运行分开启动，打开网页不会自动发送消息。Next保持静态导出，Host不进入Registry或站点构建。

Host启动使用Node的[`--use-env-proxy`](https://nodejs.org/api/cli.html#--use-env-proxy)，尊重已有HTTP_PROXY/HTTPS_PROXY/NO_PROXY。本机需要代理才能访问已配置provider；该选项不更换模型或provider。无代理环境保持直接请求。

Host首次启动创建`.local/pi-host/service-token`（目录700、凭据600）。在网页“连接设置”输入`http://127.0.0.1:3012`及该文件内容；凭据仅保存当前标签页的sessionStorage，不进入URL、静态资源或Git。模型凭据由Pi读取`~/.pi/agent/auth.json`，网页不接收模型密钥。

默认项目为EasyuseUI目录，默认模型采用Pi的`settings.json`中`defaultProvider/defaultModel`。该模型不可用时，在输入设置选择Host列出的模型，不自动换provider发送。历史不要求模型在线。只启用`read/grep/find/ls`，关闭扩展、Skills、模板展开和项目自动指令发现；无Bash、写文件、PTY、Git、审批、queue/steer、多Agent或附件上传。

## 项目与历史配置

将[配置示例](services/pi-host/config.example.json)复制为`services/pi-host/config.local.json`。相对路径以仓库根为基准，`~/`按用户目录展开。`PI_HOST_CONFIG`指定其它配置，`PI_HOST_PORT`覆盖端口，`PI_HOST_TOKEN`可提供外部管理的凭据。认证值不要放入配置文件或命令参数。

```json
{
  "port": 3012,
  "dataDir": "./.local/pi-host",
  "agentDir": "~/.pi/agent",
  "defaultModel": "provider/model-id",
  "allowedOrigins": ["http://127.0.0.1:3010", "http://127.0.0.1:3011"],
  "projects": [{
    "projectId": "project-a", "name": "Project A",
    "cwd": "/absolute/project/path",
    "sessionDirs": ["/absolute/pi/session/directory"]
  }]
}
```

`sessionDirs`默认空，只有明确配置的外部目录被扫描。历史header的cwd须匹配项目；拒绝符号链接逃逸，浏览器只提交不透明ID。外部JSONL只读解析，不通过SDK打开原文件；目前支持Pi会话格式v3。沿最后有效条目的父链读取默认分支，保留压缩前可读历史，不拼接废弃分支或透传隐藏思考/扩展记录。

“复制并继续”创建托管身份和来源关联，原文件不变。SDK原生SessionManager恢复有效模型上下文及压缩规则。消息/工具保持源顺序，错误/unknown常驻；传输前脱敏、有界，复制使用同一显示内容。

内容在`dataDir/sessions`，映射、回执和流式ID映射在`index.json`。单目录只允许一个存活Host写入，最多一个运行。项目配置不是OS沙箱。远程浏览需SSH转发网页与Host端口，并配置对应Origin。

## 恢复与操作结果

刷新恢复项目/会话选择及逐会话版本草稿。关闭网页、切会话、断开SSE不停止后台运行。事件携带epoch/sequence及权威快照；序号缺口或过期游标重新同步，不重发消息。接受与最终完成分别显示；确认只清提交版本，确认期间新输入保留。

创建/复制/发送/停止携带requestId，执行前持久化。同键同内容返回原回执，同键不同内容拒绝。网络丢回执标unknown并锁定重复操作；查询使用原键。Host重启将pending回执和旧活动运行标unknown，不推测成功或自动补发。不能确认的崩溃执行需人工核对原始会话与账本；第一版无自动解锁/自动重试，不承诺跨进程exactly-once。

停止绑定runId，旧ID不停止新运行。回执表示提交，cancelled等待Pi停止事实；保留已有内容。

历史首屏50条，游标绑定会话/分支/文件revision；单页正文和关联工具合计小于512KiB、单文本/工具输出32KiB（另有截断提示）、文件读取64MiB。解析缓存至多64个文件，合计原始文件字节预算32MiB，这不是JavaScript堆内存预算。单条超大预览截断并显示partial；未知公开内容块明确标记不支持。坏行/未完成尾行/限额显示partial，刷新失败保留内容。测试覆盖1000条分页，未引入虚拟列表或性能SLA。

API前缀`/api/pi`：health、projects、projects/:id/sessions、sessions/:id、history、events、messages、interrupt、copy、operations/:requestId。全部需Bearer凭据并校验Host/Origin。历史`before + revision`用于快照锚点分页，与SSE游标分开。[协议类型](lib/pi-workspace-protocol.ts)不含Node/SDK依赖。

## 验证

```sh
pnpm pi:typecheck
pnpm pi:test
pnpm lint
pnpm typecheck
pnpm build
pnpm exec playwright test --config=playwright.pi.config.ts
pnpm test:install
```

浏览器受控测试启动临时fixture Host，不使用真实聊天或模型。真实provider验收需显式启用：

```sh
PI_REAL_PROVIDER=1 pnpm exec playwright test --config=playwright.pi.config.ts tests/pi-workspace-real.spec.ts
```

该测试使用临时项目/合成历史、用户已配置Pi provider，覆盖真实流式/read工具/旧上下文/刷新/重启追问/停止。生产浏览器默认3011；本地调试可用`PI_BROWSER_BASE_URL=http://127.0.0.1:3010`，共享smoke不替代隔离证据。真实测试跳过须记录未验证。

首轮与完整编辑器/Git/PTY/多Agent交付分开。实际验证结果见[首轮记录](plans/agent-workspace-completion-log.md)和[Pi记录](plans/pi-agent-workspace-integration-log.md)。
