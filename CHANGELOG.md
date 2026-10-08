# Changelog

## Unreleased · 2026-10-08

- 组件目录、视觉词典和 Blog 使用纯元数据与按需 Demo；统一搜索、分类、URL 恢复及加载失败重试。
- 新增 `/blog/` 和六篇优化文章，提供版本、前后截图、原始测量及验证范围。草稿不进入公开页面或 sitemap。
- Canvas 改用输入边界索引和稳定节点数据；新增 DAG 布局预览、取消、坐标事务及一次撤销。保留既有图文档、运行、审批和服务语义。
- Conversation/Activity 使用线性 ID 检查、稳定阅读锚点与行复用；可选 `revision` 和默认关闭的 `deferOffscreen`。
- WorkspaceShell 增加受控布局接口及按工作区保存偏好的示例；新增 Menu、Popover、Tabs、Segmented、Select、Combobox。
- Registry 增加显式 host/scoped 主题模式，保留 legacy 安装地址；Portal 跟随各自作用域。统一辅助文字对比度、浮层阴影和系统字体。
- 增加 Manifest/Blog/i18n 校验、网络体积预算、视觉快照、axe、性能报告及不可变版本快照工具。

迁移：现有安装 ID、文档 URL、底部面板折叠接口保留。显式 `revision` 必须覆盖所有数据变化；主题模式由消费方选择。运行、权限和持久化仍由调用方提供。

验收与限制见 [实施记录](plans/optimization-and-blog-implementation-log.md)。共享主机的 Canvas 冷启动与长会话追加仍有未达标项；尚未执行远程 CI 或公开发布。许可、域名和 Git tag 见 [发布前提](RELEASE.md)。
