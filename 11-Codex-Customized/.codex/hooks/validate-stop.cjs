const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const workspace = path.resolve(__dirname, "..", "..");
const scriptPath = path.join(workspace, "App", "script.js");
const reportPath = path.join(workspace, "App", "HOOK_VALIDATION.md");

if (!fs.existsSync(scriptPath)) {
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
}

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

Generated automatically by the Codex Stop hook.
`;

fs.writeFileSync(reportPath, report, "utf8");

if (!passed) {
  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason: result.stderr || "Fix JavaScript syntax errors in App/script.js, then run validation again.",
    }),
  );
  process.exit(0);
}

process.stdout.write(JSON.stringify({ continue: true }));
process.exit(0);

