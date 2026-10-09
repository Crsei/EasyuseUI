# Sales CRM 复刻证据

- `reference/environment.json`：冻结参考的12种状态、操作、字体、视口、DPR、时区和DOM尺寸；`source-snapshot.json`记录参考源码。
- `replica/environment.json`：复刻的13种状态，包含额外1024px布局；`source-scope.json`记录实际提供截图的隔离源码。该hash覆盖UI域，排除文章、图片和报告，避免自引用；不是整个Git工作树的hash。
- `diff/comparisons.json`：12组原图、复刻图、RGB绝对差异图索引。热图仅用于定位差异，不计算或声明像素通过率。
- `visual-review.json`：逐图核对、DOM尺寸与保留差异。
- `verification.json`、`verification/`：工程检查、浏览器回归、独立安装及最终文章检查。全量回归和最后的CRM/Blog专项分别记录，不能将中间失败当作通过。

参考使用Webpack开发副本，复刻使用Webpack生产静态导出。截图固定Chrome、英文、UTC、DPR1、减少动态效果。390px截图和真实粗指针测试是两种证据：后者另外覆盖390/768/1024px。

复现脚本：`scripts/capture-sales-crm-reference.mjs`、`scripts/capture-sales-crm.mjs`、`scripts/compare-sales-crm.py`。复刻采集时用`CRM_SOURCE_ROOT`指定实际服务所用的完整隔离源码，`CRM_REPLICA_ORIGIN`指定该构建的预览地址；参考通过`CRM_REFERENCE_ORIGIN`指定冻结副本服务。

所有业务行为只使用本地fixture；独立安装验证通用组件及其依赖，不代表安装完整CRM应用或接入CRM服务。替代资产、通知文案、评分示例和无障碍改动有意保留差异。
