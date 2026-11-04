import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createContext, runInContext } from "node:vm";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../public/ui-v2/source.js", import.meta.url),
  "utf8",
)
  .replace(/^export \{[^}]*\};$/gm, "")
  .replace(/^export /gm, "");
const app = readFileSync(
  new URL("../public/ui-v2/app.js", import.meta.url),
  "utf8",
)
  .replace(/^import[\s\S]*?from "\.\/source\.js";\n/, "")
  .replace(/^import .*from "\.\/combination-planner\.js";\n/m, "");
const planner = readFileSync(
  new URL("../public/ui-v2/combination-planner.js", import.meta.url),
  "utf8",
).replace(/^export /gm, "");

function harness(search = "?lang=zh") {
  type Node = {
    innerHTML: string;
    textContent: string;
    value: string;
    setAttribute(): void;
    focus(): void;
  };
  const nodes = new Map<string, Node>();
  const node = (key: string) => {
    if (!nodes.has(key))
      nodes.set(key, {
        innerHTML: "",
        textContent: "",
        value: "",
        setAttribute() {},
        focus() {},
      });
    return nodes.get(key)!;
  };
  const handlers: Record<string, (event: unknown) => void> = {};
  const root = {
    querySelector: node,
    querySelectorAll: () => [],
    addEventListener: (name: string, handler: (event: unknown) => void) => {
      handlers[name] = handler;
    },
    getBoundingClientRect: () => ({ height: 800 }),
  };
  const location = {
    search,
    href: `https://example.test/project/ui-v2/index.html${search}`,
    origin: "https://example.test",
  };
  const history = {
    replaceState(_state: unknown, _title: string, url: URL) {
      location.href = String(url);
      location.search = url.search;
    },
  };
  const window: Record<string, unknown> = { addEventListener() {} };
  window.parent = window;
  const context = createContext({
    document: {
      getElementById: () => root,
      documentElement: {},
      activeElement: null,
    },
    window,
    fetch: async (path: string) => ({
      ok: true,
      json: async () =>
        JSON.parse(
          readFileSync(
            new URL(
              path.replace("../data/", "../public/data/"),
              import.meta.url,
            ),
            "utf8",
          ),
        ),
    }),
    history,
    location,
    URL,
    URLSearchParams,
    ResizeObserver: class {
      observe() {}
    },
    console,
  });
  runInContext(source + "\n" + planner + "\n" + app, context);
  const click = (dataset: Record<string, string>, id?: string) =>
    handlers.click({ target: { closest: () => ({ dataset, id }) } });
  const change = (field: string, value: string) =>
    handlers.change({
      target: { dataset: { field }, value, type: "select-one" },
    });
  return {
    node,
    click,
    change,
    context,
    location,
    changeData: (
      dataset: Record<string, string>,
      value: string,
      checked = false,
    ) =>
      handlers.change({
        target: { dataset, value, checked, type: "select-one" },
      }),
    content: () => node("#af-content").innerHTML,
  };
}

describe("UI v2 preserves the original data and calculator", () => {
  it("matches the source catalog literals and formula blocks byte for byte", () => {
    expect(() =>
      execFileSync(process.execPath, [
        "scripts/extract-live-source.mjs",
        "--check",
      ]),
    ).not.toThrow();
  });

  it("keeps all catalog records including unavailable values and cross-device plans", () => {
    const { context } = harness();
    expect(
      runInContext(
        "[catalog.M.length,catalog.H.length,catalog.P.length]",
        context,
      ),
    ).toEqual([22, 26, 27]);
    expect(
      runInContext(
        "Number.isNaN(catalog.M.find(m=>m[0]==='MiniMax H3 33B')[2])",
        context,
      ),
    ).toBe(true);
    expect(runInContext("catalog.P.some(p=>p[3]>1)", context)).toBe(true);
  });

  it("matches original hardware arithmetic across quantization, context and concurrency boundaries", () => {
    const { context } = harness();
    const mismatches = runInContext(
      `(() => {
      const errors=[];
      for(const m of catalog.M)for(const bits of [4,8,16])for(const ctx of [16,32,128,1024])for(const con of [1,4,32]){
        const a=calculateHardwareMemory(m,bits,ctx,con),b=inspectMemory(m,bits,ctx,con);
        if(a.need!==b.need||a.weight!==b.w||a.kv!==b.kv||a.offload!==b.off||a.ssdKv!==b.ssd||a.util!==b.util)errors.push(m[0]);
      }
      return errors;
    })()`,
      context,
    );
    expect(mismatches).toEqual([]);
  });
});

describe("results-first interactions", () => {
  it("paginates and preserves the result page when returning from details", () => {
    const h = harness();
    expect((h.content().match(/data-pick=/g) || []).length).toBe(5);
    expect(h.content()).toMatch(/1–5 \/ \d+/);
    h.click({ turn: "1" });
    const id = h.content().match(/data-pick="(\d+)"/)![1];
    h.click({ resultDetail: id });
    expect(h.content()).toContain("返回第 2 页结果");
    h.click({ work: "results" });
    expect(h.content()).toMatch(/6–10 \/ \d+/);
  });

  it("keeps active inputs and switches language without resetting choices", () => {
    const h = harness();
    h.click({ work: "config" });
    expect(h.content()).toContain("data-fleet-count");
    h.click({ configGroup: "1" });
    expect((h.content().match(/data-field=/g) || []).length).toBe(4);
    h.change("context", "64");
    h.click({ lang: "en" });
    expect(h.content()).toContain("Model & workload");
    expect(h.content()).toContain('value="64" selected');
    expect(h.location.search).toBe("?lang=en");
    h.click({ page: "model" });
    h.click({ modelTab: "config" });
    expect((h.content().match(/data-request=/g) || []).length).toBe(3);
    expect(h.content()).not.toContain("MiniMax H3");
  });

  it("serves the requested language from a copied URL", () => {
    expect(harness("?lang=en").content()).toContain("Hardware → models");
    expect(harness("?locale=zh-cn").content()).toContain("硬件找模型");
  });

  it("preserves library counts while hiding absent fields and incomplete recommendations", () => {
    const h = harness();
    expect(h.content()).not.toContain('data-result-group="pending"');
    for (const lang of ["zh", "en"]) {
      h.click({ lang });
      for (const page of [
        "hardware",
        "model",
        "models",
        "devices",
        "performance",
      ]) {
        h.click({ page });
        expect(h.content()).not.toMatch(
          /TBD|待补|待校验|待测试|Not recorded|Pending test|TTFT|预算上限|目标速度/,
        );
      }
    }
    h.click({ page: "models" });
    h.click({ catalogTurn: "1" });
    h.click({ catalogTurn: "1" });
    expect(h.content()).toContain("17–22 / 22");
    h.click({ page: "devices" });
    h.click({ catalogTurn: "1" });
    expect(h.content()).toContain("9–16 / 26");
  });

  it("separates incompatible contexts and prevents missing data from becoming zero", () => {
    const h = harness();
    h.click({ resultGroup: "excluded" });
    expect(h.content()).toContain("上下文超限");
    const result = runInContext(
      "inspectMemory(catalog.M.find(m=>m[0]==='MiniMax H3 33B'),4,32,1)",
      h.context,
    );
    expect(result.need).toBeNull();
    expect(result.kv).toBeNull();
  });
});

describe("V2.1 simultaneous deployment", () => {
  it("keeps the browser planner in sync with the pure calculator", () => {
    expect(() =>
      execFileSync(process.execPath, [
        "scripts/build-combination-planner.mjs",
        "--check",
      ]),
    ).not.toThrow();
  });
  it("adds models, keeps independent parameters across language changes, and displays placements", () => {
    const h = harness();
    h.click({ page: "model" });
    h.click({ modelTab: "config" });
    h.node("#af-add-model").value = "0";
    h.click({ add: "model" });
    h.changeData({ request: "0", scope: "model", param: "concurrency" }, "3");
    h.click({ lang: "en" });
    expect(h.content()).toContain('id="af-model-0-concurrency"');
    expect(
      runInContext("state.requests.map(r=>[r.id,r.concurrency])", h.context),
    ).toEqual([
      ["15", 4],
      ["0", 3],
    ]);
    h.click({ modelTab: "results" });
    expect(h.content()).toContain("Model placement");
    expect(h.content()).toContain("Qwen3 8B");
    h.click({ comboMode: "compare" });
    expect(h.content()).toContain("standalone plans");
    h.click({ modelTab: "config" });
    h.click({ removeModel: "0", scope: "model" });
    expect(runInContext("state.requests.length", h.context)).toBe(1);
  });
  it("selects models across pages and allocates them within mixed inventory", () => {
    const h = harness();
    h.click({ work: "config" });
    h.node("#af-add-device").value = "0";
    h.click({ add: "device" });
    h.changeData({ fleetCount: "0" }, "3");
    h.click({ work: "results" });
    for (const id of ["0", "1", "2", "5"]) h.changeData({ pick: id }, "", true);
    expect(runInContext("state.selected.length", h.context)).toBe(4);
    h.click({ work: "allocation" });
    expect(h.content()).toContain("模型分配");
    const plans = runInContext("state.planningResult.plans", h.context) as {
      machines: {
        deviceId: string;
        models: string[];
        used: number;
        capacity: number;
      }[];
    }[];
    expect(plans.length).toBeGreaterThan(0);
    for (const p of plans) {
      expect(p.machines.flatMap((m) => m.models).sort()).toEqual([
        "0",
        "1",
        "2",
        "5",
      ]);
      expect(
        p.machines.filter((m) => m.deviceId === "1").length,
      ).toBeLessThanOrEqual(2);
      expect(
        p.machines.filter((m) => m.deviceId === "0").length,
      ).toBeLessThanOrEqual(3);
      for (const m of p.machines)
        expect(m.used).toBeLessThanOrEqual(m.capacity);
    }
    h.click({ removeModel: "0", scope: "hardware" });
    expect(runInContext("state.selected.includes(0)", h.context)).toBe(false);
  });
  it("blocks combinations with unsupported per-model inputs", () => {
    const h = harness();
    h.click({ page: "model" });
    h.changeData({ request: "15", scope: "model", param: "context" }, "999999");
    expect(h.content()).toContain("暂不生成组合");
    expect(h.content()).not.toContain("af-plan-body");
  });
});

describe("upstream metadata restoration", () => {
  it("uses upstream named-model measurements and excludes dual-card extrapolation", () => {
    const h = harness();
    expect(runInContext("speed(catalog.H[9], catalog.M[7])", h.context)).toBe(
      "60–70",
    );
    expect(runInContext("speed(catalog.H[10], catalog.M[7])", h.context)).toBe(
      "约 50",
    );
    expect(
      runInContext("speed(catalog.H[12], catalog.M[7])", h.context),
    ).toBeNull();
    expect(
      runInContext("speed(catalog.H[9], catalog.M[0])", h.context),
    ).toBeNull();
    h.click({ page: "performance" });
    expect(h.content()).toContain("指定模型有实测");
    h.node("#af-filter").value = "measured";
    h.node("#af-family").value = "all";
    h.click({}, "af-apply");
    expect(h.content()).toContain("11/26");
  });
  it("allows each original Data Pack catalog to be browsed via the UI", async () => {
    const h = harness();
    h.click({ page: "metadata" });
    const ids = runInContext(
      "Object.keys(packManifest.catalogs)",
      h.context,
    ) as string[];
    expect(ids).toHaveLength(9);
    for (const id of ids) {
      h.changeData({ packSelect: "1" }, id);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(h.content()).toContain("原始记录字段");
      expect(h.content()).toContain("打开完整原始 JSON");
      expect(h.content()).toContain("lastUpdated");
      expect(h.content()).not.toContain("undefined");
    }
    h.changeData({ packSelect: "1" }, "models");
    h.changeData({ recordSelect: "1" }, "1");
    expect(h.content()).toContain("qwen3-8b");
    expect(h.content()).toContain("maxOutputTokens");
  });
});
