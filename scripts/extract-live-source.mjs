/**
 * Read-only bridge for UI v2. Catalog literals and arithmetic are copied from
 * the original live calculator, never re-entered or replaced by mockup data.
 * Run `node scripts/extract-live-source.mjs --check` to detect drift.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import ts from "typescript";
import { z } from "zod";

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
// Owner-confirmed additions stay separate so the upstream snapshot remains intact.
const validationIndex = process.argv.indexOf("--validate-additions");
const additionsPath = validationIndex >= 0 ? process.argv[validationIndex + 1] : new URL("../public/ui-v2/device-additions.json", import.meta.url);
if (!additionsPath) throw new Error("Provide an additions JSON file to validate.");
const additions = z.object({
  schemaVersion: z.literal(1),
  lastUpdated: z.iso.date(),
  source: z.object({ label: z.string().min(1), methodology: z.string().min(1) }).strict(),
  devices: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    referenceDevice: z.string().min(1),
    aiFusion2: z.boolean(),
    lastUpdated: z.iso.date(),
  }).strict()),
}).strict().parse(JSON.parse(readFileSync(additionsPath, "utf8")));
const originalH = statements.get("H").declarationList.declarations[0].initializer.elements;
const originalP = statements.get("P").declarationList.declarations[0].initializer.elements;
const hardwareNames = new Set(originalH.map(row => row.elements[0].text));
const planNames = new Set(originalP.map(row => row.elements[0].text));
const ids = new Set();
const names = new Set(hardwareNames);
for (const device of additions.devices) {
  if (ids.has(device.id) || names.has(device.name) || !hardwareNames.has(device.referenceDevice) || !planNames.has("1 × " + device.referenceDevice))
    throw new Error("Duplicate addition or missing reference: " + device.id);
  ids.add(device.id);
  names.add(device.name);
}
if (validationIndex >= 0) {
  console.log("Device additions and source references are valid.");
  process.exit(0);
}
const extension = `export const deviceAdditions = ${JSON.stringify(additions)};
for (const device of deviceAdditions.devices) {
  const reference = H.find(h => h[0] === device.referenceDevice);
  const referencePlan = P.find(p => p[0] === "1 × " + device.referenceDevice && p[3] === 1);
  H.push([device.name, reference[1], null, [...reference[3]], reference[4]]);
  P.push(["1 × " + device.name, referencePlan[1], null, 1, referencePlan[4], referencePlan[5], null, null, null, device.aiFusion2 ? "支持 AI Fusion 2.0" : ""]);
}`;
const generated = `// Generated from public/live-deployment-calculator.html. Do not edit.\n// Source SHA-256: ${digest}\n${catalogs}\n${extension}\n${helpers}\nexport const catalog = { M, H, P };\nexport const packManifest = ${JSON.stringify(manifest)};\nexport { measuredChatSpeed, matchesCapability, isAiFusion2, canPostTrain };\n\nexport function calculateModelMemory(m, bits, contextK, con, utilizationPercent) {\n  const ctx = contextK * 1024;\n  const userVramUtilization = Math.min(99, Math.max(50, (+utilizationPercent || 90))) / 100;\n  ${text(memory)}\n  return { m, weight: gpuWeight, offload, ssdKv, kv, kvKnown, util: vramUtilization, need, reserve: safetyReserve };\n}\n\nexport function calculateHardwareMemory(m, bits, contextK, con) {\n  const ctx = contextK * 1024, vramUtilization = 0.9;\n${hardwareBody}\n}\n\n// Presentation eligibility guards; the original arithmetic above is unchanged.\nexport function inspectMemory(m, bits, contextK, con, utilizationPercent = 90) {\n  const result = calculateModelMemory(m, bits, contextK, con, utilizationPercent);\n  return { w: result.weight, kv: result.kv, off: result.offload, ssd: result.ssdKv, util: result.util, need: result.need, reserve: result.reserve, supported: m.slice(4).some(q => q[1] === bits), contextOK: contextK * 1024 <= m[3] };\n}\nexport function capacityFor(deviceIndex, count, sharding) {\n  const h = H[deviceIndex];\n  return sharding ? h[1] * Math.max(1, count || 1) : h[1];\n}\nexport function modelPlans(need) {\n  return need === null ? [] : P.filter(h => h[1] >= need);\n}\n`;
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
