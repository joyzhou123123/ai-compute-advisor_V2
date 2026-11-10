# AI Compute Advisor V2

[打开 V2 中文版](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=zh) · [English](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=en) · [独立 V2 仓库](https://github.com/joyzhou123123/ai-compute-advisor_V2)

**这是独立的 V2 仓库，默认分支为 `main`，有独立的在线地址。后续 V2 更新都在这里进行。**

V2 采用确认后的浅色、结果优先界面。原始数据和显存计算公式保持不变，只调整展示和交互。

## V2 的界面

- 默认先看结果，按“容量候选 / 条件不满足”分组。
- 选型结果每页 5 条，资料库每页 8 条，支持搜索和排序。
- 需求编辑、结果列表、完整详情、模型对比分开呈现。
- 支持跨页勾选 2–3 个模型进行对比。
- 硬件侧选择单台设备，模型侧可逐项比较多个模型及其独立运行参数；多台部署功能暂停，等待数据验证。
- 顶部保留中文 / EN 切换，网址中的 `lang` 参数随语言更新。
- 固定浅色，不随系统切换为深色；支持手机和桌面布局。

## 怎么用

1. 打开 [V2 在线计算器](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=zh)。
2. 已有设备时用“硬件找模型”；已有目标模型时用“模型找硬件”。
3. 点击“编辑硬件与参数”或“编辑模型与参数”，选择设备或添加模型，逐项调整配置。
4. 模型侧查看每个模型的单机方案，按剩余显存升序、每页 5 条展示；硬件侧可勾选 2–3 个模型对比参数。

容量估算不代表吞吐或运行时兼容性保证。TOPS 只表示硬件规格，不换算为对话速度；性能资料库分别标出上游指定模型的实测记录和设备方向性估算。

## 2026-11-10 更新

- 设备库现有 28 条配置，新增 ThinkCentre neo50t Gen7 和 YangTian T490INS，均搭配 RTX 5060 Ti 16GB。
- 两款设备由产品负责人确认沿用 ThinkCentre X Tower RTX 5060 Ti 16GB 的模型搭配与 AI Fusion 2.0 规则。扩展数据、日期和来源保存在 `public/ui-v2/device-additions.json`，新设备不自动继承实测速度。
- 微调状态统一为“AI Fusion 1.0不支持”，其余界面使用完整的 AI Fusion 名称和对应版本。
- 多台硬件部署、设备台数和跨机方案暂时撤下。单机双卡配置仍可选，原始跨机记录保留在数据快照中。

## 数据完整保留

当前上游快照包含 **22 条模型、26 条设备配置、27 条部署方案**。缺失值保持原样，未替换为 0；22 条模型仍在资料库，其中 21 条具备容量估算所需的 KV 数据。「源数据与元数据」可查阅九张 Data Pack 数据表的原始字段、来源和版本，并打开完整 JSON。[上游快照 4181077](https://github.com/Johnguo0915/ai-compute-advisor/commit/4181077bfe1aa040b50235f1323fc72c98a91ae3)。

- 原计算器 `public/live-deployment-calculator.html` 完整保留。
- `public/data/*.json` 中的完整 Data Pack 数据保持不变。
- `src/calculator/**` 原计算模块保持不变。
- `public/ui-v2/source.js` 由原页面的数据字面量和公式块生成，不手工重录数据。

完整数据基线和维护方式见 [V2 说明](docs/ui-v2.md)。`npm run verify:data` 会对 33 个原始文件做 SHA-256 校验。

原仓库中另一套 React 数据管理、导入导出和汇率模块仍保留在源码里，但没有把未接入 V2 入口的功能伪装成可用按钮。

## 单文件离线版

[打开 standalone 网页](https://joyzhou123123.github.io/ai-compute-advisor_V2/standalone.html)，也可以下载 `public/standalone.html`，双击直接使用，无需启动服务。文件内含最新界面、计算逻辑、九张元数据表、清单、新增设备规则和原始计算器。中英文切换、模型与硬件选型、元数据查看均可离线使用；外部资料链接需要联网。

更新界面或数据后运行 `npm run generate:standalone`。正式构建也会自动重新生成，`npm run verify:standalone` 可检查文件是否已同步。

## 本地运行

需要 Node.js 22.13.0 或更高版本。

```sh
npm ci
npm run dev
```

打开 Vite 输出的本地地址。完整检查和生产预览：

```sh
npm run verify:data
npm run check
npm run preview
```

不要直接双击构建后的 HTML，ES Module 需要通过 HTTP / HTTPS 访问。

## 在线部署

仓库的 GitHub Actions 会在 `main` 更新后构建并发布 `dist/`：

- [V2 中文版](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=zh)
- [V2 英文版](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=en)

纯静态部署，无需后端、登录、数据库或必填 API Key。资源采用相对路径，可部署到 GitHub Pages 的仓库子目录，也可将 `dist/` 部署到其他静态托管服务。

默认入口 `/` 打开 V2；原版界面继续保留在 `/live-deployment-calculator.html`。

## 来源

原项目：[Johnguo0915/ai-compute-advisor](https://github.com/Johnguo0915/ai-compute-advisor)。

本项目基于 [V1 Fork](https://github.com/joyzhou123123/ai-compute-advisor_V1) 独立建立，保留原 Git 历史、数据和计算代码。后续新版界面以当前 **V2 独立仓库** 为准。


## V2.1：多模型、多硬件组合

- **模型找硬件**：添加多个模型，分别配置量化、上下文、并发；默认寻找同时部署组合，也可逐项比较。
- **硬件找模型**：添加多种设备，每种分别填台数；跨页勾选模型后，点击「评估同时部署」，还能调整每个模型的运行参数。
- **结果顺序**：台数少优先，其次剩余显存少。每页 5 组方案，展开查看哪个模型放在哪台机器、占用与剩余显存。
- **计算边界**：沿用原显存公式，保留每个模型的安全余量；不会把跨机器显存直接合并。容量匹配仍需验证运行时、机内多卡、Fusion 内存与 SSD 条件。
- **搜索范围**：最多展示 30 个组合，搜索达到上限会明确提示；不会把“没搜到”当成“无解”。
- **数据保持原样**：22 条模型、26 条设备配置、27 条原始部署方案均由上游快照提取。

新增分配器位于 `src/calculator/combinationPlanner.ts`，浏览器版本由 `npm run generate:planner` 生成。发布前执行 `npm run verify:data` 和 `npm run check`。
