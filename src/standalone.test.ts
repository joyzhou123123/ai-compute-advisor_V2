import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { Script } from "node:vm";
import { describe, expect, it } from "vitest";

const html = readFileSync(new URL("../public/standalone.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)![1];

describe("offline standalone distribution", () => {
  it("is generated from the current UI and executes without module imports", () => {
    expect(() => execFileSync(process.execPath, ["scripts/build-standalone.mjs", "--check"])).not.toThrow();
    expect(() => new Script(script)).not.toThrow();
    expect(html).not.toMatch(/<script[^>]*src=|<link[^>]*rel="stylesheet"/);
  });

  it("preserves every embedded metadata file and the original calculator byte for byte", () => {
    const resources = JSON.parse(script.match(/const embeddedResources = (.*);\n/)![1]) as Record<string, { text: string }>;
    const manifest = JSON.parse(readFileSync(new URL("../public/data/manifest.json", import.meta.url), "utf8"));
    const paths = ["../data/manifest.json", ...Object.values(manifest.catalogs).map(file => "../data/" + file), "./device-additions.json", "../live-deployment-calculator.html"];
    expect(Object.keys(resources).sort()).toEqual(paths.sort());
    for (const path of paths) {
      const original = readFileSync(new URL("../public/ui-v2/" + path, import.meta.url), "utf8");
      expect(resources[path].text).toBe(original);
    }
  });
});
