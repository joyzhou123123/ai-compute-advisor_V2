# AI Compute Advisor V2

[打开 V2 中文版](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=zh) · [English](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=en) · [独立 V2 仓库](https://github.com/joyzhou123123/ai-compute-advisor_V2)

**这是独立的 V2 仓库，默认分支为 `main`，有独立的在线地址。后续 V2 更新都在这里进行。**

V2 采用确认后的浅色、结果优先界面。原始数据和显存计算公式保持不变，只调整展示和交互。

## V2 的界面

- 默认先看结果，按“容量候选 / 条件不满足”分组。
- 选型结果每页 5 条，资料库每页 8 条，支持搜索和排序。
- 需求编辑、结果列表、完整详情、模型对比分开呈现。
- 支持跨页勾选 2–3 个模型进行对比。
- 硬件选型保留 8 项有效配置，模型选型保留 5 项；不展示未接入评估的输入和空的 TBD 字段。
- 顶部保留中文 / EN 切换，网址中的 `lang` 参数随语言更新。
- 固定浅色，不随系统切换为深色；支持手机和桌面布局。

## 怎么用

1. 打开 [V2 在线计算器](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=zh)。
2. 已有设备时用“硬件找模型”；已有目标模型时用“模型找硬件”。
3. 点击“编辑需求”，调整设备、量化、上下文、并发等参数。
4. 查看分页结果、完整参数，或勾选模型进行对比。

容量估算不代表吞吐或运行时兼容性保证。TOPS 只表示硬件规格，不换算为对话速度；现有性能资料为方向性估算，不作为模型实测结果。

## 数据完整保留

沿用 Fork 中的 **22 条模型、9 条设备、10 条部署方案**。缺失值保持原样，未替换为 0；22 条模型仍在资料库，其中 21 条具备容量估算所需的 KV 数据。此前示意里的另一份 26 设备数据没有混入。

- 原计算器 `public/live-deployment-calculator.html` 完整保留。
- `public/data/*.json` 中的完整 Data Pack 数据保持不变。
- `src/calculator/**` 原计算模块保持不变。
- `public/ui-v2/source.js` 由原页面的数据字面量和公式块生成，不手工重录数据。

完整数据基线和维护方式见 [V2 说明](docs/ui-v2.md)。`npm run verify:data` 会对 33 个原始文件做 SHA-256 校验。

原仓库中另一套 React 数据管理、导入导出和汇率模块仍保留在源码里，但没有把未接入 V2 入口的功能伪装成可用按钮。

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
