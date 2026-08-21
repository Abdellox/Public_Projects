import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeCommand } from "../src/detectors/commands.js";

test("fork bomb is critical", () => {
  const f = analyzeCommand(":(){ :|:& };:");
  assert.ok(f.some((x) => x.risk === "critical"));
});

test("dd to raw disk is critical", () => {
  const f = analyzeCommand("dd if=zeros.img of=/dev/sda");
  assert.ok(f.some((x) => x.ruleId === "cmd.disk-overwrite"));
});

test("sudo is high", () => {
  const f = analyzeCommand("sudo rm file.txt");
  assert.ok(f.some((x) => x.ruleId === "cmd.sudo" && x.risk === "high"));
});

test("env dump is medium", () => {
  const f = analyzeCommand("printenv");
  assert.ok(f.some((x) => x.ruleId === "cmd.env-dump" && x.risk === "medium"));
});

test("safe commands produce no findings", () => {
  assert.deepEqual(analyzeCommand("npm test"), []);
  assert.deepEqual(analyzeCommand("git status"), []);
});
