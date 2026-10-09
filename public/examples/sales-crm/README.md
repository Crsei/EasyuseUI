# CRM 本地示例资产与数据

- 参考：<https://github.com/kargulstudio/sales-crm>；只读冻结快照 `9700e58d87fb4a8b04b319d63e455e6d99acba181e31adbf9c92890d6aff8739`。
- `fixture-data.json` 保留参考 `data/companies.ts` 的18条演示记录与负责人姓名。邮箱替换为 `example.invalid`，页面不触发电话或邮件发送。
- 未发现参考项目的资产许可声明，因此不复制头像、公司Logo、SVG或字体文件。头像/Logo用通用Avatar的姓名缩写回退；图标来自现有 `lucide-react`（ISC）。上传图片由使用者选择，仅在当前内存实例使用。
- 参考页面使用Geist；复刻沿用EasyuseUI宿主的系统字体。字体、图标轮廓、替代头像、较高文字对比度是明确允许的视觉差异，不宣称像素一致。
- `public/blog/sales-crm/reference/` 是本机只读参考副本的浏览器截图，用于来源和比较记录；环境与操作见 `environment.json`。不是可复用的原始资产包。
- 公司、通知、草稿及Logo均不持久化，刷新重置。只有侧栏宽度采用 `easyuseui:sales-crm:sidebar-width:v1`，站点语言使用已有偏好接口。
