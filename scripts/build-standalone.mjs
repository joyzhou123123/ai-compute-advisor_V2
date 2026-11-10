/** Build a portable, offline HTML from the same verified UI and data files. */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const manifest = JSON.parse(read("public/data/manifest.json"));
const resources = {};
for (const filename of ["manifest.json", ...Object.values(manifest.catalogs)]) {
  resources["../data/" + filename] = {
    type: "application/json;charset=utf-8",
    text: read("public/data/" + filename),
    filename,
  };
}
resources["./device-additions.json"] = {
  type: "application/json;charset=utf-8",
  text: read("public/ui-v2/device-additions.json"),
  filename: "device-additions.json",
};
resources["../live-deployment-calculator.html"] = {
  type: "text/html;charset=utf-8",
  text: read("public/live-deployment-calculator.html"),
  filename: "live-deployment-calculator.html",
};
const source = read("public/ui-v2/source.js")
  .replace(/^export \{[^}]*\};$/gm, "")
  .replace(/^export /gm, "");
const imports = /^import \{[\s\S]*?\} from "\.\/source\.js";\n/;
let app = read("public/ui-v2/app.js");
if (!imports.test(app)) throw new Error("UI imports changed. Review standalone bundling.");
app = app.replace(imports, "");
const fetchCall = 'fetch("../data/" + packManifest.catalogs[id])';
if (!app.includes(fetchCall)) throw new Error("Metadata loading changed. Review offline loading.");
app = app.replace(fetchCall, 'readEmbeddedResource("../data/" + packManifest.catalogs[id])');
app = app.replace('function link(url, label) {', `function link(url, label) {
  if (Object.hasOwn(embeddedResources, url)) {
    const resource = embeddedResources[url];
    if (!resourceUrls.has(url)) resourceUrls.set(url, URL.createObjectURL(new Blob([resource.text], {type: resource.type})));
    const download = resource.type.startsWith("application/json") ? ' download="' + esc(resource.filename) + '"' : '';
    return '<a href="' + esc(resourceUrls.get(url)) + '" target="_blank" rel="noopener"' + download + '>' + label + '</a>';
  }`);
const runtime = `(() => {
"use strict";
const embeddedResources = ${JSON.stringify(resources).replaceAll("<", "\\u003c")};
const resourceUrls = new Map();
function readEmbeddedResource(path) {
  return Promise.resolve({
    ok: Object.hasOwn(embeddedResources, path),
    json: async () => JSON.parse(embeddedResources[path].text),
  });
}
${source}
${app}
})();`;
let html = read("public/ui-v2/index.html")
  .replace('<title>AI Compute Advisor v2</title>', '<title>AI Compute Advisor V2.1 · Standalone</title>')
  .replace('<link rel="icon" href="../favicon.svg" type="image/svg+xml" />', '<link rel="icon" href="data:image/svg+xml;base64,' + Buffer.from(read("public/favicon.svg")).toString("base64") + '" type="image/svg+xml" />')
  .replace('<link rel="stylesheet" href="./styles.css" />', () => '<style>\n' + read("public/ui-v2/styles.css") + '\n</style>')
  .replace('<script type="module" src="./app.js"></script>', () => '<script>\n' + runtime.replace(/<\/script/gi, '<\\/script') + '\n</script>');
if (/<script[^>]*\bsrc=|<link[^>]*rel="stylesheet"/.test(html)) throw new Error("External runtime asset remains.");
const target = new URL("../public/standalone.html", import.meta.url);
if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== html) throw new Error("Standalone is stale. Run npm run generate:standalone.");
  console.log("Standalone matches the current UI, original catalogs and device additions.");
} else {
  writeFileSync(target, html);
  console.log(`Standalone HTML written to ${fileURLToPath(target)} (${Buffer.byteLength(html)} bytes).`);
}
