# Pi 接入实施记录

2026-10-10，首轮 P0–P5 实现与工程验收完成。范围、声明、命令、失败/复测、性能基线和后续边界见[首轮记录](agent-workspace-completion-log.md)。

| 阶段 | 最终实现与验收 |
| --- | --- |
| P0 | 项目锁定 `@earendil-works/pi-coding-agent@1.1.0`，Node 24.21.0 / GLIBC 2.28；采用 SDK，不依赖全局 CLI。原生 SessionManager 和公开订阅接口已用安装版本验证。协议 v1 只含浏览器安全类型。 |
| P1 | 配置项目和会话目录，不透明身份、Host/Origin/Bearer 校验；原文件只读、默认有效父链、压缩记录、复制继续。字节/mtime 不变、两项目不串历史、重启可读。 |
| P2 | SDK prompt/subscribe/abort；只启用 read/grep/find/ls，关闭扩展、Skills、模板、主题和自动项目上下文；明确模型。执行前落盘 requestId，来源 user entry 才确认接受；prompt/settled/stopReason 决定最终状态。单运行/单写锁，SSE epoch/sequence 和回放快照。 |
| P3 | `/examples/agent-workbench/pi/` 真 HTTP/SSE 私有 Provider，公共受控 Shell/导航/Header/对话/Composer。五态、错误恢复、外部只读/复制和能力驱动发送/停止；固定输入与参考 V2 对话外观。 |
| P4 | 逐会话版本草稿、刷新/URL 选择、迟到结果不抢导航、历史锚点、双标签并发、停止绑定 runId、丢回执按原键查询。服务关闭等待原生写入结束；崩溃 pending/旧 running 保持 unknown 锁，不重发。 |
| P5 | Host 最终 8 项；Pi 浏览器 10 项含真实模型；旧工作台回归、独立安装、lint/typecheck/Webpack build。Git 以本轮承载记录的提交和最终远端 SHA 验证为准。 |

真实模型使用现有默认 `openai-codex/gpt-6.1-sol`，临时项目、合成旧上下文标记和文件。真实网页验证流式、Read、原生复制上下文、刷新稳定身份、Host 重启追问及来源确认停止；原外部文件字节/mtime 不变。最初裸 fetch 因未采用已有代理失败，使用 Node `--use-env-proxy` 后同一 provider 通过。模型凭据没有进入页面、日志、URL、静态构建或 Git。

关闭时写锁持续到初始化、abort 和 prompt 最终落盘完成；不是关闭网页时停止执行。来源接受与运行完成分开。崩溃无法证明的 unknown 保持锁，当前版本无自动解锁或跨进程 exactly-once 承诺。

页面 history 保留压缩前可读条目，模型 context 由 SDK 原生规则恢复；不把二者等同。首屏50条，有界文本/工具、总传输预算、未知公开块提示和局部 partial，缓存按文件身份/版本与原始字节预算失效。没有全量 DOM 或 content-visibility 的虚拟列表承诺。

真实业务项目、写文件/Git/PTY/审批/队列/Checkpoint/多Agent均不在首轮能力内；fixture 回归不等于这些服务已实现。启动和配置见 [PI-WORKSPACE.md](../PI-WORKSPACE.md)。
