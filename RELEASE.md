# 发布准备与阻塞项

当前为本地候选版本，未发布、未打 Git tag。公开发布需要项目所有者确定许可证、公开 origin 与托管目标；仓库未添加 LICENSE 时 `pnpm check:release` 必须失败。

1. 确定许可条款并审核自有资源与第三方归属后添加 LICENSE。依赖的声明不能代替本项目的许可决定。
2. 设置真实 HTTPS `NEXT_PUBLIC_SITE_URL`，运行 `pnpm check:release`、完整质量流程与三个模式的安装验证。
3. 冻结源码，编写 Changelog 和迁移说明，选择版本；随后运行 `pnpm registry:snapshot -- --version <version> --origin <https-origin>`。
4. 快照提供 `/r/<version>/<item>.json` 与 `/r/<version>/host|scoped/<item>.json`，依赖递归锁定同一快照。相同版本的不同字节被拒绝，已有文件不能覆盖。
5. 经明确发布授权后创建对应 Git tag、部署不可变目录，再从公开 URL 在独立项目安装，并核对 HTTP 字节和样式。当前本地安装不能代替此项。

| 兼容项            | 当前验证目标                                                  |
| ----------------- | ------------------------------------------------------------- |
| React / React DOM | 19.3.0                                                        |
| Next.js           | 16.3.8，静态导出、Webpack                                     |
| Base UI           | 1.8.0                                                         |
| React Flow        | 12.12.0                                                       |
| Tailwind CSS      | 4.3.x，lockfile 固定实际版本                                  |
| Node / pnpm       | 24.21.0 / 11.9.0                                              |
| 测试浏览器        | Linux Chrome for Testing 138.0.7204.92，归档 SHA256 固定在 CI |

第三方资源审核入口：React/Next/Base UI/React Flow/lucide-react/Shiki/Tailwind 的安装包许可文件和 package metadata；安装工具 shadcn 与测试工具 Playwright/axe 的许可；如后续引入字体、截图中的外部商标或图片，逐项记录来源与再分发范围。目前 Blog 封面为项目内 SVG，截图为确定性本地 fixture，不引入远程字体。

升级说明：既有 URL 和安装 ID 保留；目录预览改为主动加载；host/scoped 是显式选择；WorkspaceShell 原底部折叠接口兼容；高频 Conversation/Activity 可选 revision，必须覆盖所有数据变化，未提供仍走兼容路径。Canvas 已在并行修改结束后完成本地隔离行为验收，稳定环境性能目标仍待校准。变更见 [Changelog](CHANGELOG.md)，证据与限制见 [实施记录](plans/optimization-and-blog-implementation-log.md)。
