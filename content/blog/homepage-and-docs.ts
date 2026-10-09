import type { BlogPost } from "../../lib/blog-model"
export const homepageAndDocs: BlogPost = {
  slug: "homepage-and-docs",
  title: {
    "zh-CN": "从组件目录到场景入口：重做首页与文档",
    en: "From catalog to workspace: redesigning the home and docs",
  },
  summary: {
    "zh-CN":
      "收敛导航，用真实工作台展示组件组合，并让文档搜索、预览和源码按需读取。",
    en: "Focused navigation, real workspace scenes, and documentation search, previews and source loaded on demand.",
  },
  originalLocale: "zh-CN",
  hasEnglishBody: false,
  visibility: "published",
  status: "verified",
  author: "EasyuseUI",
  publishedAt: "2026-10-09",
  updatedAt: "2026-10-09",
  category: "design",
  tags: ["docs", "homepage", "performance"],
  optimizationIds: ["DOCS-D0-D5"],
  relatedComponents: [
    "button",
    "data-table",
    "tool-call",
    "work-items-workspace",
    "workflow-canvas",
  ],
  relatedPosts: [
    "on-demand-demos",
    "agent-board-showcase",
    "work-items-shared-views",
  ],
  baselineVersion: "804756e3f7b390f44821a689eb54c20d928e3262",
  resultVersion: null,
  sourceSnapshotId:
    "8aab330d0eb24d917d34c90f3397d806aab3d1fc6d18d23c2f65afe724d46cc8",
  body: [
    {
      type: "heading",
      id: "intent",
      text: {
        "zh-CN": "让场景展示组件，让文档完成接入",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "首页由基础控件介绍转为 Agent、Work Items 和 Canvas 三个真实场景。四项主导航对应文档、组件、示例与 Blog；资源放入菜单和页脚。首页图片来自固定本地 fixture，首屏不挂载完整工作台，引擎通过明确入口加载。",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "文档采用分组侧栏、正文和页内目录。104项正式组件保留原地址、安装ID和五个旧锚点；五篇指南帮助完成安装、受控模式、国际化、源码接入和工作台组合。预览与代码保留同一演示草稿，重置才清空，隐藏时暂停本地播放。源码从Manifest白名单按文件读取，完整原文、复制文本与构建高亮来自同一个资源。",
      },
    },
    {
      type: "heading",
      id: "home-1440",
      text: {
        "zh-CN": "桌面首页：从控件介绍到真实工作台",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/homepage-and-docs/before-home-1440-light-zh-CN.jpg",
        alt: {
          "zh-CN": "桌面首页：从控件介绍到真实工作台，改版前",
        },
        caption: {
          "zh-CN": "1440px · light · zh-CN · 改版前生产基线",
        },
        sourceSnapshotId:
          "5410c79915b6a97d302f16f0c03c9cd6b4ca3a9ad2ec4ca4a7aa87d0ccd0541a",
        capturedAt: "2026-10-09T00:21:32.842Z",
        fixture: "Committed local site and component demo; default state",
        viewport: {
          width: 1440,
          height: 900,
        },
        theme: "light",
        locale: "zh-CN",
      },
      after: {
        src: "/blog/homepage-and-docs/after-home-1440-light-zh-CN.jpg",
        alt: {
          "zh-CN": "桌面首页：从控件介绍到真实工作台，改版后",
        },
        caption: {
          "zh-CN": "1440px · light · zh-CN · 改版后生产候选",
        },
        sourceSnapshotId:
          "8aab330d0eb24d917d34c90f3397d806aab3d1fc6d18d23c2f65afe724d46cc8",
        capturedAt: "2026-10-09T01:16:32.284Z",
        fixture: "Committed local site and component demo; default state",
        viewport: {
          width: 1440,
          height: 900,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "heading",
      id: "docs-button-1440",
      text: {
        "zh-CN": "桌面文档：稳定阅读栏与章节入口",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/homepage-and-docs/before-docs-button-1440-light-zh-CN.jpg",
        alt: {
          "zh-CN": "桌面文档：稳定阅读栏与章节入口，改版前",
        },
        caption: {
          "zh-CN": "1440px · light · zh-CN · 改版前生产基线",
        },
        sourceSnapshotId:
          "5410c79915b6a97d302f16f0c03c9cd6b4ca3a9ad2ec4ca4a7aa87d0ccd0541a",
        capturedAt: "2026-10-09T00:21:32.842Z",
        fixture: "Committed local site and component demo; default state",
        viewport: {
          width: 1440,
          height: 900,
        },
        theme: "light",
        locale: "zh-CN",
      },
      after: {
        src: "/blog/homepage-and-docs/after-docs-button-1440-light-zh-CN.jpg",
        alt: {
          "zh-CN": "桌面文档：稳定阅读栏与章节入口，改版后",
        },
        caption: {
          "zh-CN": "1440px · light · zh-CN · 改版后生产候选",
        },
        sourceSnapshotId:
          "8aab330d0eb24d917d34c90f3397d806aab3d1fc6d18d23c2f65afe724d46cc8",
        capturedAt: "2026-10-09T01:16:32.284Z",
        fixture: "Committed local site and component demo; default state",
        viewport: {
          width: 1440,
          height: 900,
        },
        theme: "light",
        locale: "zh-CN",
      },
    },
    {
      type: "heading",
      id: "home-390",
      text: {
        "zh-CN": "窄屏首页：深色与英文",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/homepage-and-docs/before-home-390-dark-en.jpg",
        alt: {
          "zh-CN": "窄屏首页：深色与英文，改版前",
        },
        caption: {
          "zh-CN": "390px · dark · en · 改版前生产基线",
        },
        sourceSnapshotId:
          "5410c79915b6a97d302f16f0c03c9cd6b4ca3a9ad2ec4ca4a7aa87d0ccd0541a",
        capturedAt: "2026-10-09T00:21:32.842Z",
        fixture: "Committed local site and component demo; default state",
        viewport: {
          width: 390,
          height: 844,
        },
        theme: "dark",
        locale: "en",
      },
      after: {
        src: "/blog/homepage-and-docs/after-home-390-dark-en.jpg",
        alt: {
          "zh-CN": "窄屏首页：深色与英文，改版后",
        },
        caption: {
          "zh-CN": "390px · dark · en · 改版后生产候选",
        },
        sourceSnapshotId:
          "8aab330d0eb24d917d34c90f3397d806aab3d1fc6d18d23c2f65afe724d46cc8",
        capturedAt: "2026-10-09T01:16:32.284Z",
        fixture: "Committed local site and component demo; default state",
        viewport: {
          width: 390,
          height: 844,
        },
        theme: "dark",
        locale: "en",
      },
    },
    {
      type: "heading",
      id: "docs-button-390",
      text: {
        "zh-CN": "窄屏文档：抽屉与本页目录",
      },
    },
    {
      type: "comparison",
      before: {
        src: "/blog/homepage-and-docs/before-docs-button-390-dark-en.jpg",
        alt: {
          "zh-CN": "窄屏文档：抽屉与本页目录，改版前",
        },
        caption: {
          "zh-CN": "390px · dark · en · 改版前生产基线",
        },
        sourceSnapshotId:
          "5410c79915b6a97d302f16f0c03c9cd6b4ca3a9ad2ec4ca4a7aa87d0ccd0541a",
        capturedAt: "2026-10-09T00:21:32.842Z",
        fixture: "Committed local site and component demo; default state",
        viewport: {
          width: 390,
          height: 844,
        },
        theme: "dark",
        locale: "en",
      },
      after: {
        src: "/blog/homepage-and-docs/after-docs-button-390-dark-en.jpg",
        alt: {
          "zh-CN": "窄屏文档：抽屉与本页目录，改版后",
        },
        caption: {
          "zh-CN": "390px · dark · en · 改版后生产候选",
        },
        sourceSnapshotId:
          "8aab330d0eb24d917d34c90f3397d806aab3d1fc6d18d23c2f65afe724d46cc8",
        capturedAt: "2026-10-09T01:16:32.284Z",
        fixture: "Committed local site and component demo; default state",
        viewport: {
          width: 390,
          height: 844,
        },
        theme: "dark",
        locale: "en",
      },
    },
    {
      type: "heading",
      id: "loading",
      text: {
        "zh-CN": "把长源码移出初始HTML，保留原有JS门禁",
      },
    },
    {
      type: "metrics",
      metrics: [
        {
          key: "/jsEstimatedGzipBytes",
          label: {
            "zh-CN": "首页初始JS gzip估算",
          },
          unit: "bytes",
          direction: "lower",
          before: 355776,
          after: 357503,
          target: null,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "after",
          beforeContext:
            "Chrome 138.0.7204.92; Node 24.21.0; 1440x900; light; zh-CN; production static export; three fresh contexts; no throttling; response-body gzip estimate",
          afterContext:
            "Chrome 138.0.7204.92; Node 24.21.0; 1440x900; light; zh-CN; production static export; three fresh contexts; no throttling; response-body gzip estimate",
        },
        {
          key: "/docs/button/htmlBytes",
          label: {
            "zh-CN": "Button文档HTML",
          },
          unit: "bytes",
          direction: "lower",
          before: 201743,
          after: 113005,
          target: null,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "after",
          beforeContext:
            "Chrome 138.0.7204.92; Node 24.21.0; 1440x900; light; zh-CN; production static export; three fresh contexts; no throttling; response-body gzip estimate",
          afterContext:
            "Chrome 138.0.7204.92; Node 24.21.0; 1440x900; light; zh-CN; production static export; three fresh contexts; no throttling; response-body gzip estimate",
        },
        {
          key: "/components/htmlBytes",
          label: {
            "zh-CN": "组件目录HTML",
          },
          unit: "bytes",
          direction: "lower",
          before: 255216,
          after: 351272,
          target: null,
          statistic: "median",
          sampleCount: 3,
          evidenceId: "after",
          beforeContext:
            "Chrome 138.0.7204.92; Node 24.21.0; 1440x900; light; zh-CN; production static export; three fresh contexts; no throttling; response-body gzip estimate",
          afterContext:
            "Chrome 138.0.7204.92; Node 24.21.0; 1440x900; light; zh-CN; production static export; three fresh contexts; no throttling; response-body gzip estimate",
        },
      ],
    },
    {
      type: "list",
      items: [
        {
          "zh-CN":
            "/ — HTML 59765 → 75536 bytes；初始JS gzip估算 355776 → 357503 bytes。",
        },
        {
          "zh-CN":
            "/docs/button/ — HTML 201743 → 113005 bytes；初始JS gzip估算 350654 → 357020 bytes。",
        },
        {
          "zh-CN":
            "/docs/tool-call/ — HTML 609525 → 122792 bytes；初始JS gzip估算 356253 → 362619 bytes。",
        },
        {
          "zh-CN":
            "/docs/work-items-workspace/ — HTML 515848 → 115067 bytes；初始JS gzip估算 440319 → 356330 bytes。",
        },
        {
          "zh-CN":
            "/docs/workflow-canvas/ — HTML 900653 → 121243 bytes；初始JS gzip估算 417315 → 356330 bytes。",
        },
        {
          "zh-CN":
            "/components/ — HTML 255216 → 351272 bytes；初始JS gzip估算 370150 → 374358 bytes。",
        },
        {
          "zh-CN":
            "/docs/installation/ — HTML 78536 → 96328 bytes；初始JS gzip估算 346747 → 351641 bytes。",
        },
        {
          "zh-CN":
            "/examples/ — HTML 18633 → 48872 bytes；初始JS gzip估算 340512 → 346939 bytes。",
        },
      ],
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "源码按文件读取使代表文档初始HTML下降；首页与示例库增加真实图片和场景说明，视觉目录增加结构示意，三者HTML上升。首页和目录初始JS也略增，仍在固定预算内。以上均为同条件三次样本的中位数。gzip是响应体压缩估算，不是服务器传输编码。长源码改为显式按文件读取，HTML减少来自实际响应；没有提高已有五项体积预算。首页与示例库的380000字节上限在候选测量前按D0基线固定。完整原始数据记录资源哈希、HTML哈希及是否下载引擎。",
      },
    },
    {
      type: "heading",
      id: "observations",
      text: {
        "zh-CN": "交互时间是本机观测，不是服务性能保证",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "首页 LCP 中位数 344 → 320ms，CLS 0.265256 → 0.0845563。候选首次打开搜索 850.1ms，Button源码读取 63.0ms，WorkflowCanvas主动加载 893.9ms。观测流程包含自动化操作与语言切换，不能视作纯首屏稳定性评测，主机有共享负载；三次样本不用于推导稳定提升比例或CI/p95结论。",
      },
    },
    {
      type: "heading",
      id: "verification",
      text: {
        "zh-CN": "验证页面行为与展示边界",
      },
    },
    {
      type: "paragraph",
      text: {
        "zh-CN":
          "检查覆盖四种宽度、深浅主题、中英文、键盘与触屏导航、搜索失败重试、IME、复制失败、源码晚响应、草稿保留、显式重置、隐藏播放暂停，以及锚点后的前进与返回。示例继续承担本地组件展示，真实执行、持久化与审批权威仍由调用方提供。验收记录保留失败修正、完整回归、最终发布构建和性能观测各自范围。",
      },
    },
  ],
  evidence: [
    {
      id: "before",
      type: "measurement",
      file: "/blog/homepage-and-docs/before.json",
      capturedAt: "2026-10-09T00:21:32.842Z",
      sourceSnapshotId:
        "5410c79915b6a97d302f16f0c03c9cd6b4ca3a9ad2ec4ca4a7aa87d0ccd0541a",
      command: "CAPTURE_PHASE=before node scripts/capture-home-docs.mjs",
      environment:
        "Chrome 138.0.7204.92; Node 24.21.0; 1440x900; light; zh-CN; production static export; three fresh contexts; no throttling; response-body gzip estimate",
      method:
        "Three fresh contexts per route, production static output, no throttling. gzip bytes estimate compression of response bodies. LCP/CLS are browser observations; hydration includes network idle and a language switch. Search and source timings include automation. Shared-host samples are not p95, transport bytes, CI certification or service performance.",
      sampleCount: 3,
      scope: {
        "zh-CN":
          "8条路线、每条3次新浏览器上下文；首页与Button的四宽度、双主题、双语言截图矩阵。固定改版前基线。",
      },
    },
    {
      id: "after",
      type: "measurement",
      file: "/blog/homepage-and-docs/after.json",
      capturedAt: "2026-10-09T01:16:32.284Z",
      sourceSnapshotId:
        "8aab330d0eb24d917d34c90f3397d806aab3d1fc6d18d23c2f65afe724d46cc8",
      command: "CAPTURE_PHASE=after node scripts/capture-home-docs.mjs",
      environment:
        "Chrome 138.0.7204.92; Node 24.21.0; 1440x900; light; zh-CN; production static export; three fresh contexts; no throttling; response-body gzip estimate",
      method:
        "Three fresh contexts per route, production static output, no throttling. gzip bytes estimate compression of response bodies. LCP/CLS are browser observations; hydration includes network idle and a language switch. Search and source timings include automation. Shared-host samples are not p95, transport bytes, CI certification or service performance.",
      sampleCount: 3,
      scope: {
        "zh-CN":
          "8条路线、每条3次新浏览器上下文；首页与Button的四宽度、双主题、双语言截图矩阵。候选UI冻结于最终证据更新之前。",
      },
    },
    {
      id: "verification",
      type: "test",
      file: "/blog/homepage-and-docs/verification.json",
      capturedAt: "2026-10-09T01:18:50.878067+00:00",
      sourceSnapshotId:
        "8aab330d0eb24d917d34c90f3397d806aab3d1fc6d18d23c2f65afe724d46cc8",
      command:
        "pnpm lint && pnpm typecheck && pnpm check:i18n && pnpm check:manifest && pnpm check:blog && pnpm check:docs; pnpm build; playwright test",
      environment:
        "Isolated local production static export; Chrome 138; shared Linux host",
      method:
        "Engineering gates, browser regression, AA scans, loading budgets and separate observational performance fixtures. See raw summary for final build scope.",
      sampleCount: 1,
      scope: {
        "zh-CN": "本机静态站点与组件回归；不代表已运行远程CI或公开部署。",
      },
    },
  ],
  limitations: [
    {
      "zh-CN":
        "所有场景均为本地 fixture，不证明真实模型、存储、授权或执行服务。共享主机上的三次观测不是稳定 CI、p95 或服务性能保证。系统盘满后，候选的浏览器临时目录移至数据盘；时间观测不能当作受控硬件基准。",
    },
    {
      "zh-CN":
        "基线为99项组件，候选包含已正式提交的五项表单组件，共104项。测量冻结于最终证据更新之前；最终发布构建另验加载预算，文章元数据与构建哈希会变化，不能将候选资源字节冒充最终部署字节。",
    },
  ],
}
