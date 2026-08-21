import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePolicy, PolicyValidationError, defaultPolicy } from "../src/core/policy.js";

test("accepts a valid policy", () => {
  const p = validatePolicy({
    version: 1,
    permissions: {
      shell: { default: "deny", allow: ["npm *"], deny: ["rm -rf /"], ask: [] },
      filesystem: { protected: [".env"] },
      network: { mode: "monitor", allow: [] },
    },
    secrets: { scan_commands: true, block_on_detection: true },
  });
  assert.equal(p.permissions.shell.default, "deny");
  assert.deepEqual(p.permissions.filesystem.protected, [".env"]);
});

test("rejects invalid shell default", () => {
  assert.throws(() => validatePolicy({ permissions: { shell: { default: "maybe" } } }), PolicyValidationError);
});

test("rejects non-list allow", () => {
  assert.throws(() => validatePolicy({ permissions: { shell: { allow: "npm" } } }), PolicyValidationError);
});

test("defaults are complete", () => {
  const p = defaultPolicy();
  assert.ok(p.permissions.filesystem.protected.includes(".env"));
  assert.ok(p.permissions.shell.deny.length > 0);
});
