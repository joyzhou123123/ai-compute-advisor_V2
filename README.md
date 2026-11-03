# AI Compute Advisor V2

[中文在线版](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=zh) · [Live Calculator — English](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=en) · [中文说明](README.zh-CN.md)

**V2 is an independent repository and website.** Its default branch is `main`; it does not require checking out a V2 branch in the V1 repository.

A static model and hardware capacity planner with a results-first, fixed light interface. The original data and memory formulas are preserved.

## What changed in V2.1

- Results first: capacity candidates and incompatible configurations are grouped separately.
- Five results per page; eight records per catalog page, with search and sorting.
- Separate requirement editing, full details, and side-by-side comparison of 2–3 models.
- Multi-model simultaneous deployment with independent quantization, context and concurrency.
- Multi-type hardware inventory with a separate machine count per type.
- Ranked hardware combinations with explicit model placement and remaining VRAM per machine. Cross-machine VRAM is not pooled.
- Unimplemented controls and empty/TBD detail fields are hidden.
- Global Chinese / English switch; language is retained in the URL.
- Fixed light theme, independent of the operating system's appearance.

## Use the calculator

1. Open the [V2 calculator](https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=en).
2. Start with **Hardware → models**, or switch to **Model → hardware**.
3. Use **Edit requirements** to change hardware, quantization, context, concurrency and the relevant deployment inputs.
4. In **Model → hardware**, add models and find simultaneous deployment combinations, or switch to individual comparison.
5. In **Hardware → models**, add hardware types and counts, then select models across pages and choose **Assess simultaneous deployment**. Parameter comparison remains available for 2–3 models.

Capacity estimates are not guarantees of throughput or runtime compatibility. TOPS remains hardware metadata, not LLM tokens per second. The included performance entries are directional estimates, not model-bound measurements.

## Original data preserved

The source calculator contains **22 model records, 9 device configurations and 10 deployment plans**. All records and missing values are preserved; 21 models have sufficient KV data for capacity estimation. The earlier design prototype's separate 26-device snapshot is not imported.

- `public/live-deployment-calculator.html`: unchanged original calculator and its embedded catalog.
- `public/data/*.json`: unchanged complete bundled Data Pack catalogs.
- `src/calculator/**`: original calculation modules unchanged; V2.1 adds a separate combination placement module.
- `public/ui-v2/source.js`: generated from the original catalog literals and formula blocks; never hand-edit this file.

Run `npm run verify:data` to compare 33 original files against their SHA-256 baseline, and `npm run verify:source` to verify the UI's generated source bridge. See [V2 implementation and data notes](docs/ui-v2.md).

## Run locally

Requires Node.js 22.13.0 or newer.

```sh
npm ci
npm run dev
```

Verification and production preview:

```sh
npm run verify:data
npm run check
npm run preview
```

## Deployment

GitHub Actions builds this repository's `main` branch and deploys `dist/` to:

- Chinese: https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=zh
- English: https://joyzhou123123.github.io/ai-compute-advisor_V2/?lang=en

No backend, login, required API key or runtime server API is needed. The UI uses relative asset paths for GitHub Pages subpath hosting. The original interface remains accessible at `/live-deployment-calculator.html`; the default `/` entry opens V2.

## Project history

Derived from [Johnguo0915/ai-compute-advisor](https://github.com/Johnguo0915/ai-compute-advisor), through [joyzhou123123/ai-compute-advisor_V1](https://github.com/joyzhou123123/ai-compute-advisor_V1). Original Git history, data and calculation code are retained. Development of the new interface continues in **this V2 repository**.
