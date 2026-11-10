import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
    ).toEqual([22, 28, 29]);
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
    expect(h.content()).toContain('data-field="device"');
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
    expect(h.content()).toContain("9–16 / 28");
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

describe("single-machine selection and owner-confirmed additions", () => {
  it("rejects malformed additions, duplicate identities and broken source references before generation", () => {
    const directory = mkdtempSync(join(tmpdir(), "advisor-additions-"));
    const path = join(directory, "devices.json");
    const original = JSON.parse(readFileSync(new URL("../public/ui-v2/device-additions.json", import.meta.url), "utf8"));
    const validate = (data: typeof original) => {
      writeFileSync(path, JSON.stringify(data));
      return execFileSync(process.execPath, ["scripts/extract-live-source.mjs", "--validate-additions", path], { stdio: "pipe" });
    };
    try {
      expect(() => validate(original)).not.toThrow();
      for (const mutation of [
        (d: typeof original) => { d.devices[1].id = d.devices[0].id; },
        (d: typeof original) => { d.devices[1].name = d.devices[0].name; },
        (d: typeof original) => { d.devices[0].referenceDevice = "Missing reference"; },
        (d: typeof original) => { d.devices[0].aiFusion2 = "yes"; },
        (d: typeof original) => { d.devices[0].lastUpdated = "not-a-date"; },
        (d: typeof original) => { d.devices[0].measuredSpeed = 70; },
      ]) {
        const changed = structuredClone(original);
        mutation(changed);
        expect(() => validate(changed)).toThrow();
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("keeps independent model inputs and lists only single-machine plans", () => {
    const h = harness();
    h.click({ page: "model" });
    h.click({ modelTab: "config" });
    h.node("#af-add-model").value = "0";
    h.click({ add: "model" });
    h.changeData({ request: "0", scope: "model", param: "concurrency" }, "3");
    h.click({ lang: "en" });
    expect(runInContext("state.requests.map(r=>[r.id,r.concurrency])", h.context)).toEqual([["15", 4], ["0", 3]]);
    h.click({ modelTab: "results" });
    expect(h.content()).toContain("standalone plans");
    expect(h.content()).toContain("Qwen3 8B");
    expect(h.content()).not.toMatch(/data-combo-mode|Model placement|2 × ThinkCentre|Hardware combinations/);
    h.click({ modelPlan: "0", pageNumber: "2" });
    expect(h.content()).toContain("6–10 /");
    expect(h.content()).toContain('data-model-plan-details="0" open');
    h.click({ modelTab: "config" });
    h.click({ removeModel: "0", scope: "model" });
    expect(runInContext("state.requests.length", h.context)).toBe(1);
  });

  it("has no multi-machine controls and changing hardware replaces its capacity", () => {
    const h = harness();
    for (const lang of ["zh", "en"]) {
      h.click({ lang });
      h.click({ work: "config" });
      expect(h.content()).not.toMatch(/data-fleet-count|data-add="device"|data-field="shard"/);
      h.change("device", "26");
      expect(runInContext("fleetCapacity()", h.context)).toBe(16);
      h.click({ work: "results" });
      expect(h.content()).toContain("ThinkCentre neo50t Gen7");
      expect(h.content()).not.toContain('data-work="allocation"');
      h.changeData({ pick: "0" }, "", true);
      h.changeData({ pick: "1" }, "", true);
      h.click({ work: "compare" });
      expect(h.content()).toContain("Qwen3 8B");
      expect(h.content()).toContain("Llama 3.2");
      h.click({ work: "allocation" });
      expect(h.content()).not.toMatch(/模型分配|Model placement/);
    }
  });

  it("reuses the reference capacity and AI Fusion 2.0 rules without claiming measurements", () => {
    const h = harness();
    const result = runInContext(`(() => {
      const reference = catalog.H[0];
      return catalog.H.slice(26).map(device => ({
        capacity: device[1], specs: device[3], measurement: speed(device, catalog.M[7]),
        detail: deviceDetail(device),
        samePlans: catalog.M.filter(m=>Number.isFinite(m[2])).every(m => [4,8,16].every(bits => [16,32,128].every(ctx => {
          const need = inspectMemory(m,bits,ctx,1).need;
          const plans = modelPlans(need);
          return plans.some(p=>p[0]==="1 × "+reference[0]) === plans.some(p=>p[0]==="1 × "+device[0]);
        }))),
      }));
    })()`, h.context) as {capacity:number; specs: unknown[]; measurement:unknown; detail:string; samePlans:boolean}[];
    expect(result).toHaveLength(2);
    for (const device of result) {
      expect(device.capacity).toBe(16);
      expect(device.specs).toEqual([448,759,"FP4 Tensor Core vendor peak",180]);
      expect(device.measurement).toBeNull();
      expect(device.samePlans).toBe(true);
      expect(device.detail).toContain("AI Fusion 2.0");
      expect(device.detail).toContain("2026-11-10");
      expect(device.detail).toContain("ThinkCentre X Tower");
    }
    h.click({ page: "devices" });
    h.node("#af-search").value = "neo50t";
    h.click({}, "af-apply");
    expect(h.content()).toContain("ThinkCentre neo50t Gen7");
    h.node("#af-search").value = "T490INS";
    h.click({}, "af-apply");
    expect(h.content()).toContain("YangTian T490INS");
    h.click({ page: "performance" });
    expect(h.content()).not.toContain("<strong>YangTian T490INS");
  });

  it("uses the requested AI Fusion 1.0 fine-tuning label in both languages", () => {
    const h = harness();
    for (const [lang, label] of [["zh", "AI Fusion 1.0不支持"], ["en", "AI Fusion 1.0 unsupported"]]) {
      h.click({ lang });
      expect(runInContext("catalog.M.filter(isAiFusion2).map(tune)", h.context)).toEqual(Array(3).fill(label));
      const detail = runInContext("modelDetail(catalog.M.find(isAiFusion2))", h.context);
      expect(detail).toContain(label);
      expect(detail).not.toMatch(/(?<!AI )Fusion/);
    }
  });

  it("does not recommend hardware for invalid model inputs", () => {
    const h = harness();
    h.click({ page: "model" });
    h.changeData({ request: "15", scope: "model", param: "context" }, "999999");
    expect(h.content()).toContain("请调整参数");
    expect(h.content()).not.toContain("1 × ThinkCentre");
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
    expect(h.content()).toContain("11/28");
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
