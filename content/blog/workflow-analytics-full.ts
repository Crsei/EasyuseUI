import type { BlogPost } from "../../lib/blog-model"
export const workflowAnalyticsFull: BlogPost = {
  "slug": "workflow-analytics-full",
  "title": {
    "zh-CN": "从项目概览到资源、交付与风险分析",
    "en": "From project overview to resources, delivery and risk"
  },
  "summary": {
    "zh-CN": "十种共享查询与来源身份的分析场景，展示历史指标、资源容量、Agent 用量、配置保存和分析构建。",
    "en": "Ten analysis views with shared queries and source identity, historical metrics, capacity, agent usage, layout saves and an analytics builder."
  },
  "originalLocale": "zh-CN",
  "hasEnglishBody": false,
  "visibility": "published",
  "status": "measuring",
  "author": "EasyuseUI",
  "publishedAt": "2026-10-09",
  "updatedAt": "2026-10-09",
  "category": "design",
  "tags": [
    "analytics",
    "dashboard",
    "workflow",
    "resources"
  ],
  "optimizationIds": [
    "OPT-07",
    "OPT-09"
  ],
  "relatedComponents": [
    "resource-allocation-view",
    "agent-operations-dashboard",
    "workflow-history-charts",
    "forecast-chart",
    "work-dependency-view",
    "dashboard-layout-editor",
    "analytics-builder"
  ],
  "relatedPosts": [
    "workflow-analytics"
  ],
  "baselineVersion": null,
  "resultVersion": "worktree:2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
  "sourceSnapshotId": "2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
  "body": [
    {
      "type": "heading",
      "id": "scope",
      "text": {
        "zh-CN": "先明确统计了谁"
      }
    },
    {
      "type": "paragraph",
      "text": {
        "zh-CN": "统一入口提供项目概览、工作关联、图表目录、Agent、资源、迭代、流程、风险、自定义布局和分析构建器。概览限制为四个 KPI、两张主图和关注项；URL 保留项目、范围、时间字段、分桶、时区和选择。每次下钻携带查询与快照身份，应用为筛选需要显式操作。"
      }
    },
    {
      "type": "link",
      "href": "/examples/workflow-analytics/",
      "text": {
        "zh-CN": "打开完整本地分析示例",
        "en": "Open the full local analytics example"
      }
    },
    {
      "type": "heading",
      "id": "resources",
      "text": {
        "zh-CN": "计划容量与实际执行分别解释"
      }
    },
    {
      "type": "paragraph",
      "text": {
        "zh-CN": "成员与日期热图使用显式分摊份额和相同单位的容量。容量未知、容量零、无分配和超载分别显示。实际运行区间保留时间戳精度，Run completed 与业务验收分别展示；用量去重后仍按币种分组，包含性未知不擅自相加。"
      }
    },
    {
      "type": "demo",
      "componentSlug": "resource-allocation-view"
    },
    {
      "type": "heading",
      "id": "history",
      "text": {
        "zh-CN": "历史变化需要历史依据"
      }
    },
    {
      "type": "paragraph",
      "text": {
        "zh-CN": "燃起的范围与完成线来自同一重放快照；燃尽理想线从期初剩余承诺开始。迭代交付排除期初已完成项。CFD 保留历史状态成员；周期时间从首次实际开始到最终有效完成，排除缺起点样本并显示覆盖率。来源不完整时降级，不从计划日期推测实际耗时。"
      }
    },
    {
      "type": "heading",
      "id": "risk",
      "text": {
        "zh-CN": "规则事实与条件化预测分别阅读"
      }
    },
    {
      "type": "paragraph",
      "text": {
        "zh-CN": "风险事实有阈值、来源和时间。条件化预测使用带版本、种子与日历的经验吞吐抽样，并对同一剩余队列的完成天数做滚动起点 P85 回测。样本不足、范围不稳定、覆盖不足、过期或未校准时不给预测区间；不会生成未来任务。依赖成环按强连通分量定位，不把下游任务误标成环。"
      }
    },
    {
      "type": "heading",
      "id": "configuration",
      "text": {
        "zh-CN": "配置草稿与服务回执分开"
      }
    },
    {
      "type": "paragraph",
      "text": {
        "zh-CN": "布局编辑支持添加、移除、尺寸与键盘重排。拒绝保存保留草稿；unknown 回执在页面切换后仍锁定，先核对再允许新写入。构建器约束指标版本、单位、维度、分段和图型；预览匹配当前配置后才可应用，取消保留原分析。"
      }
    },
    {
      "type": "demo",
      "componentSlug": "dashboard-layout-editor"
    },
    {
      "type": "heading",
      "id": "validation",
      "text": {
        "zh-CN": "证据按实际范围记录"
      }
    },
    {
      "type": "paragraph",
      "text": {
        "zh-CN": "计算测试、浏览器行为、截图、独立安装和主题隔离分别验证。性能采集分别记录事件聚合、点数更新、筛选响应和单条来源下钻；这是基线测量，没有优化前后对照，不宣称真实服务容量。"
      }
    },
    {
      "type": "image",
      "image": {
        "src": "/blog/workflow-analytics/full/overview-1440-light-zh-CN.png",
        "alt": {
          "zh-CN": "桌面项目概览，四个 KPI 与两张主图"
        },
        "caption": {
          "zh-CN": "确定性本地 fixture；截图不代表真实服务或业务验收。"
        },
        "sourceSnapshotId": "2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
        "capturedAt": "2026-10-09T02:46:36.387Z",
        "fixture": "workflow-fixture-90d-v2; alpha; 30d; asOf; Asia/Shanghai",
        "viewport": {
          "width": 1440,
          "height": 1000
        },
        "theme": "light",
        "locale": "zh-CN"
      }
    },
    {
      "type": "image",
      "image": {
        "src": "/blog/workflow-analytics/full/scene-resources.png",
        "alt": {
          "zh-CN": "成员容量热图与实际分配来源"
        },
        "caption": {
          "zh-CN": "确定性本地 fixture；截图不代表真实服务或业务验收。"
        },
        "sourceSnapshotId": "2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
        "capturedAt": "2026-10-09T02:47:26.952Z",
        "fixture": "workflow-fixture-90d-v2; alpha; 90d",
        "viewport": {
          "width": 1440,
          "height": 1000
        },
        "theme": "light",
        "locale": "zh-CN"
      }
    },
    {
      "type": "image",
      "image": {
        "src": "/blog/workflow-analytics/full/scene-risk.png",
        "alt": {
          "zh-CN": "风险事实来源列表，含规则阈值与数据时间"
        },
        "caption": {
          "zh-CN": "确定性本地 fixture；截图不代表真实服务或业务验收。"
        },
        "sourceSnapshotId": "2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
        "capturedAt": "2026-10-09T02:47:35.030Z",
        "fixture": "workflow-fixture-90d-v2; alpha; 90d",
        "viewport": {
          "width": 1440,
          "height": 1000
        },
        "theme": "light",
        "locale": "zh-CN"
      }
    },
    {
      "type": "image",
      "image": {
        "src": "/blog/workflow-analytics/full/scene-custom.png",
        "alt": {
          "zh-CN": "可恢复草稿与 unknown 核对的布局编辑"
        },
        "caption": {
          "zh-CN": "确定性本地 fixture；截图不代表真实服务或业务验收。"
        },
        "sourceSnapshotId": "2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
        "capturedAt": "2026-10-09T02:47:37.614Z",
        "fixture": "workflow-fixture-90d-v2; alpha; 90d",
        "viewport": {
          "width": 1440,
          "height": 1000
        },
        "theme": "light",
        "locale": "zh-CN"
      }
    },
    {
      "type": "image",
      "image": {
        "src": "/blog/workflow-analytics/full/overview-390-dark-en.png",
        "alt": {
          "zh-CN": "窄屏深色英文项目概览"
        },
        "caption": {
          "zh-CN": "确定性本地 fixture；截图不代表真实服务或业务验收。"
        },
        "sourceSnapshotId": "2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
        "capturedAt": "2026-10-09T02:47:21.329Z",
        "fixture": "workflow-fixture-90d-v2; alpha; 30d; asOf; Asia/Shanghai",
        "viewport": {
          "width": 390,
          "height": 1000
        },
        "theme": "dark",
        "locale": "en"
      }
    },
    {
      "type": "paragraph",
      "text": {
        "zh-CN": "最终专项共 51 项通过：29 项独立计算与 22 项浏览器行为；另完成独立安装、host/scoped 主题隔离及 16 张概览与 9 张场景截图。截图与测量保留逐文件来源哈希，首版证据继续冻结。"
      }
    },
    {
      "type": "metrics",
      "metrics": [
        {
          "key": "chart-point-update",
          "label": {
            "zh-CN": "12 Widget / 10000 总点更新"
          },
          "unit": "ms",
          "direction": "lower",
          "before": null,
          "after": 1671.1364599999943,
          "target": null,
          "statistic": "single automated interaction; includes Playwright and two RAFs (drilldown waits for dialog)",
          "sampleCount": 1,
          "evidenceId": "full-capture",
          "beforeContext": null,
          "afterContext": "1440x1000; light; zh-CN; 138.0.7204.92; 2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f"
        },
        {
          "key": "filter-response",
          "label": {
            "zh-CN": "同档本地筛选交互"
          },
          "unit": "ms",
          "direction": "lower",
          "before": null,
          "after": 1685.193803000002,
          "target": null,
          "statistic": "single automated interaction; includes Playwright and two RAFs (drilldown waits for dialog)",
          "sampleCount": 1,
          "evidenceId": "full-capture",
          "beforeContext": null,
          "afterContext": "1440x1000; light; zh-CN; 138.0.7204.92; 2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f"
        },
        {
          "key": "single-source",
          "label": {
            "zh-CN": "同档单条合成来源下钻"
          },
          "unit": "ms",
          "direction": "lower",
          "before": null,
          "after": 925.1145380000089,
          "target": null,
          "statistic": "single automated interaction; includes Playwright and two RAFs (drilldown waits for dialog)",
          "sampleCount": 1,
          "evidenceId": "full-capture",
          "beforeContext": null,
          "afterContext": "1440x1000; light; zh-CN; 138.0.7204.92; 2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f"
        },
        {
          "key": "aggregate-50k",
          "label": {
            "zh-CN": "50000 条事件重放"
          },
          "unit": "ms",
          "direction": "lower",
          "before": null,
          "after": 243.63357199999996,
          "target": null,
          "statistic": "median of five pure-function samples",
          "sampleCount": 5,
          "evidenceId": "full-aggregation",
          "beforeContext": null,
          "afterContext": "{\"node\":\"v24.21.0\",\"platform\":\"linux\",\"arch\":\"x64\"}; 2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f"
        }
      ]
    }
  ],
  "evidence": [
    {
      "id": "full-validation",
      "type": "test",
      "file": "/blog/workflow-analytics/full/validation.json",
      "command": "WORKFLOW_ANALYTICS_EXTERNAL=1 WORKFLOW_ANALYTICS_PRODUCTION=1 WORKFLOW_ANALYTICS_PORT=3016 pnpm exec playwright test --config playwright.workflow-analytics.config.ts",
      "sampleCount": 51,
      "method": "29 independently expected calculation cases and 22 browser behavior cases; checks and standalone installation log digests",
      "scope": {
        "zh-CN": "隔离合并快照、确定性 fixture 与独立消费；不包含真实服务验收"
      },
      "capturedAt": "2026-10-09T02:48:43.421Z",
      "sourceSnapshotId": "2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
      "environment": "v24.21.0 / 138.0.7204.92 / Debian GLIBC 2.28 / Webpack"
    },
    {
      "id": "full-capture",
      "type": "measurement",
      "file": "/blog/workflow-analytics/full/capture.json",
      "command": "TMPDIR=/tmp/euwa-consumers node scripts/capture-workflow-analytics.mjs",
      "sampleCount": 9,
      "method": "Screenshot matrix: 4 widths × 2 themes × 2 locales; additional scenes. Browser timings include Playwright interaction and two RAFs; chart timing is a point-count update after preparing the target widget layout; drilldown opens one synthetic source record; total points distributed across widgets; one sample each. Baseline observations, no before/after or service capacity claims.",
      "scope": {
        "zh-CN": "九档浏览器交互基线，每档一次；并含 25 张展示截图，无优化前后对照"
      },
      "capturedAt": "2026-10-09T02:48:43.421Z",
      "sourceSnapshotId": "2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
      "environment": "v24.21.0 / 138.0.7204.92 / Debian GLIBC 2.28 / Webpack"
    },
    {
      "id": "full-aggregation",
      "type": "measurement",
      "file": "/blog/workflow-analytics/full/aggregation.json",
      "command": "WORKFLOW_ANALYTICS_MEASURE_OUTPUT=public/blog/workflow-analytics/full/aggregation.json node scripts/measure-workflow-analytics.mjs",
      "sampleCount": 30,
      "method": "5 pure-function samples; medians; no rendering or service capacity claim",
      "scope": {
        "zh-CN": "三档事件、三档点数，每档五次纯函数样本，不是浏览器绘制或服务容量"
      },
      "capturedAt": "2026-10-09T02:48:43.421Z",
      "sourceSnapshotId": "2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
      "environment": "v24.21.0 / 138.0.7204.92 / Debian GLIBC 2.28 / Webpack"
    },
    {
      "id": "full-themes",
      "type": "test",
      "file": "/blog/workflow-analytics/full/theme-validation.json",
      "command": "pnpm test:install:themes",
      "sampleCount": 2,
      "method": "Frozen host/scoped Registry hashes; installed actual heatmap and chart colors, host pixels, focus and portals",
      "scope": {
        "zh-CN": "独立主题消费；分发源码哈希与最终 Registry 逐项匹配"
      },
      "capturedAt": "2026-10-09T02:48:43.421Z",
      "sourceSnapshotId": "2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
      "environment": "v24.21.0 / 138.0.7204.92 / Debian GLIBC 2.28 / Webpack"
    },
    {
      "id": "full-bundle",
      "type": "measurement",
      "file": "/blog/workflow-analytics/full/bundle-isolation.json",
      "command": "WORKFLOW_ANALYTICS_EXTERNAL=1 WORKFLOW_ANALYTICS_PRODUCTION=1 WORKFLOW_ANALYTICS_PORT=3016 pnpm exec playwright test --config playwright.workflow-analytics.config.ts",
      "sampleCount": 3,
      "method": "fresh production browser contexts; decoded downloaded script bytes; no gzip equivalence",
      "scope": {
        "zh-CN": "首页、Button 文档与首版分析路由的下载边界；解码字节不等于 gzip"
      },
      "capturedAt": "2026-10-09T02:48:43.421Z",
      "sourceSnapshotId": "2ce90bb001468a616e789b293c10565c47d186b0d9f719990005ac6800b3668f",
      "environment": "v24.21.0 / 138.0.7204.92 / Debian GLIBC 2.28 / Webpack"
    }
  ],
  "limitations": [
    {
      "zh-CN": "全部数据来自确定性本地 fixture；刷新重置。真实历史采集、查询、权限、业务写入和持久化仍由消费项目提供。"
    },
    {
      "zh-CN": "预测只是给定历史与稳定范围假设下的模拟；真实团队数据与可信度需另行验收。"
    },
    {
      "zh-CN": "性能记录为本机静态生产页面的基线观察，包含浏览器自动化开销，没有前后收益或服务容量承诺。"
    }
  ]
}
