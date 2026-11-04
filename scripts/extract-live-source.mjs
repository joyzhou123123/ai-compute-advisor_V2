/**
 * Read-only bridge for UI v2. Catalog literals and arithmetic are copied from
 * the original live calculator, never re-entered or replaced by mockup data.
 * Run `node scripts/extract-live-source.mjs --check` to detect drift.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import ts from "typescript";

const originalUrl = new URL(
  "../public/live-deployment-calculator.html",
  import.meta.url,
);
const original = readFileSync(originalUrl, "utf8");
const script = original.match(/<script>([\s\S]*?)<\/script>/)[1];
const ast = ts.createSourceFile(
  "legacy.js",
  script,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.JS,
);
const statements = new Map();
const functions = new Map();
function visit(node) {
  if (ts.isVariableStatement(node)) {
    for (const d of node.declarationList.declarations) {
      if (ts.isIdentifier(d.name)) statements.set(d.name.text, node);
    }
  }
  if (ts.isFunctionDeclaration(node) && node.name)
    functions.set(node.name.text, node);
  ts.forEachChild(node, visit);
}
visit(ast);
const text = (node) => node.getText(ast);
const catalogs = ["M", "H", "P"]
  .map((name) => text(statements.get(name)))
  .join("\n");
const helpers = [
  "isMeasuredModel",
  "measuredChatSpeed",
  "matchesCapability",
  "isAiFusion2",
  "canPostTrain",
  "fusionOffloadGB",
  "fusionSsdKvGB",
  "fusionUtilization",
]
  .map((name) => text(functions.get(name)))
  .join("\n");
const calc = functions.get("calc");
const memory = calc.body.statements.find(
  (node) =>
    ts.isVariableStatement(node) &&
    node.declarationList.declarations[0].name.getText(ast) ===
      "vramUtilization",
);
const hardwareCandidates =
  statements.get("candidates").declarationList.declarations[0].initializer;
// candidates = M.map(callback).filter(...); retain the callback body verbatim.
const callback = hardwareCandidates.expression.expression.arguments[0];
if (!ts.isArrowFunction(callback))
  throw new Error("Legacy hardware expression changed; review the bridge.");
const hardwareBody = callback.body.getText(ast).slice(1, -1);
const digest = createHash("sha256").update(original).digest("hex");
const manifest = JSON.parse(readFileSync(new URL("../public/data/manifest.json", import.meta.url), "utf8"));
const generated = `// Generated from public/live-deployment-calculator.html. Do not edit.\n// Source SHA-256: ${digest}\n${catalogs}\n${helpers}\nexport const catalog = { M, H, P };\nexport const packManifest = ${JSON.stringify(manifest)};\nexport { measuredChatSpeed, matchesCapability, isAiFusion2, canPostTrain };\n\nexport function calculateModelMemory(m, bits, contextK, con, utilizationPercent) {\n  const ctx = contextK * 1024;\n  const userVramUtilization = Math.min(99, Math.max(50, (+utilizationPercent || 90))) / 100;\n  ${text(memory)}\n  return { m, weight: gpuWeight, offload, ssdKv, kv, kvKnown, util: vramUtilization, need, reserve: safetyReserve };\n}\n\nexport function calculateHardwareMemory(m, bits, contextK, con) {\n  const ctx = contextK * 1024, vramUtilization = 0.9;\n${hardwareBody}\n}\n\n// Presentation eligibility guards; the original arithmetic above is unchanged.\nexport function inspectMemory(m, bits, contextK, con, utilizationPercent = 90) {\n  const result = calculateModelMemory(m, bits, contextK, con, utilizationPercent);\n  return { w: result.weight, kv: result.kv, off: result.offload, ssd: result.ssdKv, util: result.util, need: result.need, reserve: result.reserve, supported: m.slice(4).some(q => q[1] === bits), contextOK: contextK * 1024 <= m[3] };\n}\nexport function capacityFor(deviceIndex, count, sharding) {\n  const h = H[deviceIndex];\n  return sharding ? h[1] * Math.max(1, count || 1) : h[1];\n}\nexport function modelPlans(need) {\n  return need === null ? [] : P.filter(h => h[1] >= need);\n}\n`;
const target = new URL("../public/ui-v2/source.js", import.meta.url);
if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== generated)
    throw new Error(
      "UI source bridge differs from the original calculator. Regenerate and review.",
    );
  console.log(
    "Original catalogs and calculation blocks match the UI bridge exactly.",
  );
} else {
  mkdirSync(new URL("../public/ui-v2/", import.meta.url), { recursive: true });
  writeFileSync(target, generated);
}
