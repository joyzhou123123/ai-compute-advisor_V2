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

## 2026-11-10 单机选型与设备扩展

- 新增 `public/ui-v2/device-additions.json`，存放稳定 ID、设备名称、参考设备、AI Fusion 2.0 支持、确认日期和来源。构建脚本使用严格 schema，并检查重复 ID、重复名称和参考设备 / 单机方案是否存在。先校验全部扩展记录，再生成浏览器文件。
- 上游 22 个模型、26 个设备和 27 个方案的原始文件及哈希基线不变。生成后的目录追加 2 个设备和 2 个单机方案。新设备不会自动继承实测或方向性速度。保留相同 GPU 的芯片规格、容量及用户确认的模型匹配规则。
- 硬件侧选择单台设备，使用该设备显存筛选模型，保留 2–3 个模型的参数比较。模型侧逐项查看所选模型，独立配置量化、上下文和并发。
- 单机推荐按剩余显存升序排序，每个模型每页 5 条。只展示机器数为 1 的原始方案，保留单机双卡。跨机方案仍在原始快照中，但不进入选型推荐。
- 多台部署入口、台数控件及同时放置结果暂停。`src/calculator/combinationPlanner.ts` 及其单元测试保留，UI 不再加载或调用该模块，等待验证后再恢复。
- 界面完整使用 AI Fusion 命名。微调排除标签按用户要求为“AI Fusion 1.0不支持 / AI Fusion 1.0 unsupported”。AI Fusion 2.0 的容量公式和支持判断不变。
