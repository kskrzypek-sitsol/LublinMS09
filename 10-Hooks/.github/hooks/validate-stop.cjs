const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const workspace = process.cwd();

const scriptPath = path.join(workspace, "App", "script.js");

const reportPath = path.join(workspace, "App", "HOOK_VALIDATION.md");

const result = spawnSync(process.execPath, ["--check", scriptPath], {
  encoding: "utf8",
});

const passed = result.status === 0;

const report = `# Hook Validation

Hook: Stop

Command:

    node --check App/script.js

## JavaScript Validation

${passed ? "- [x] App/script.js syntax is valid" : "- [ ] App/script.js syntax is valid"}

## Result

${passed ? "PASS" : "FAIL"}

Generated automatically by the VS Code Stop hook.
`;

fs.writeFileSync(reportPath, report, "utf8");

if (!passed) {
  console.error(result.stderr || "JavaScript validation failed.");
  process.exit(2);
}

console.log("Stop hook validation: PASS");
process.exit(0);
