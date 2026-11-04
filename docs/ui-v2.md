# UI v2 (2.0.0)

本版本位于独立仓库 `joyzhou123123/ai-compute-advisor_V2`，默认分支为 `main`。

[中文在线版](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=zh) · [English](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=en)

本版本仅更新展示层，基于已经确认的“结果优先 / 精简字段”浅色界面。

- 默认进入硬件找模型：容量候选、条件不满足分组；按显存需求或参数规模排序。
- 两个选型流程均每页展示 5 条结果；模型库、设备库每页展示 8 条。
- 需求编辑、结果、详情和对比分开显示。翻页和切换语言保留选择。
- 硬件流程保留 8 个有效输入；模型流程保留 5 个。没有数据的详情字段不渲染。
- 中文 / EN 位于全局顶部；语言写入原有 `lang` URL 参数。
- 外层页面跟随内容高度，避免 iframe 内外出现两层纵向滚动。

## 数据保持原样

基线：`4181077bfe1aa040b50235f1323fc72c98a91ae3`。

上游在线计算器的固定快照包含 **22 条模型、26 条设备、27 条部署方案**。
MiniMax 的 `Number.NaN` 和原数据中的 `null` 均保留原值；不在 UI 中伪装成 0。
22 条模型都保留在目录，21 条有 KV 数据的记录可用于容量估算。
跨设备方案仍在原始部署目录中，并可在模型找硬件的容量结果中查看。

以下文件没有改写：

- `public/live-deployment-calculator.html`：完整原始页面，旧地址仍可访问。
- `public/data/*.json`：另一套完整 Data Pack 数据，未删记录、字段或改值。
- `src/calculator/**`：原有计算模块及其测试。
- 原有 schemas、validators、state、FX、Data Pack 导入导出接口。

`scripts/extract-live-source.mjs` 从原页面的 AST 提取 M/H/P 数据字面量、原有辅助函数及显存计算语句，生成 `public/ui-v2/source.js`。
不通过 JSON 序列化复制原数组，避免 `NaN` 被变成 `null`；公式块原样复制。
新增的上下文上限和量化格式检查用于结果展示分组，不修改原显存算式。
上游的 measuredChatSpeed 规则按设备与模型名称匹配。测速记载和方向性估算分列展示。「源数据与元数据」按原 manifest 读取九张 JSON 表，可浏览记录与数据来源。

## 运行与核验

```sh
npm ci
npm run verify:data
npm run lint
npm test
npm run build
npm run preview
```

`verify:data` 校验 SHA-256 基线，覆盖原页面、所有 bundled JSON 和原计算模块。
`verify:source` 校验新版引用的数据字面量和公式块是否与原页面一致。
确需在后续版本更新数据时，应先更新原权威数据，再运行 `npm run generate:source`，并依照 AGENTS.md 更新数据元信息、校验与基线；不要直接编辑生成文件。

新版入口为 `/`，也可以直接访问 `/ui-v2/index.html?lang=zh` 或 `?lang=en`。
原版入口为 `/live-deployment-calculator.html?lang=zh`。
保持相对路径，支持 GitHub Pages 仓库子路径部署；没有新后端或外部 API 依赖。

根入口原本就是独立静态计算器，没有 Full Data Pack 导入按钮；此版本保留这个入口边界，不将未接入的管理操作添加到 UI。

## V2.1 simultaneous placement

- Model → hardware accepts multiple catalog models. Quantization, context and
  concurrency belong to each selected model. Standard utilization uses the model
  workspace setting; Fusion retains the original 95% rule.
- Hardware → models accepts multiple hardware types, each with an integer count
  (1–999). Candidate filtering is now based on the largest individual machine,
  not pooled cross-machine VRAM. Models can be selected across result pages for
  simultaneous placement; their per-model inputs can then be edited. Hardware
  workloads retain the original 90% utilization (Fusion 95%). Parameter comparison
  remains a separate 2–3 model view.
- `src/calculator/combinationPlanner.ts` adds pure placement search on top of the
  **unchanged** per-model memory calculation. Each model is indivisible and each
  machine may host several models. Per-model headroom and rounding are retained
  conservatively. Placement consumes only GPU capacity; runtime compatibility,
  model throughput, interconnects, host RAM and SSD sufficiency are not certified.
- The search tries increasing machine counts and then ranks found configurations
  by unused capacity. It returns up to 30 distinct hardware multisets at the first
  feasible machine count, with one valid placement per multiset. It is bounded at
  50,000 search nodes; reaching that limit is explicitly shown and never treated
  as proof that no feasible plan exists or that the result is globally optimal.
- Cross-machine sharding is not inferred from added VRAM. The original standalone
  plans (including the conditional cross-machine plan) remain available under
  individual comparison. Device and model catalogs remain unchanged.
- `npm run generate:planner` emits the browser module. `npm run verify:planner`
  checks it against the TypeScript source and runs before builds.
- Combination summaries paginate five per page; only the first placement is open
  by default. Full model and hardware parameters remain available on demand.
