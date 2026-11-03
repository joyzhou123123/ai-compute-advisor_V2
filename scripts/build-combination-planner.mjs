import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";
const input = "src/calculator/combinationPlanner.ts";
const output = "public/ui-v2/combination-planner.js";
const generated =
  "// Generated from " +
  input +
  "; do not edit.\n" +
  ts.transpileModule(readFileSync(input, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  }).outputText;
if (process.argv.includes("--check")) {
  if (readFileSync(output, "utf8") !== generated)
    throw new Error(
      "Regenerate combination-planner.js with npm run generate:planner",
    );
} else writeFileSync(output, generated);
