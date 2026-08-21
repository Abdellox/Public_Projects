import { test } from "node:test";
import assert from "node:assert/strict";
import { detectSecrets, redactSecrets } from "../src/detectors/secrets.js";

test("detects AWS access key", () => {
  const found = detectSecrets("key = AKIAIOSFODNN7EXAMPLE");
  assert.ok(found.some((f) => f.ruleId === "secret.aws-access-key"));
});

test("detects GitHub token", () => {
  const token = "ghp_" + "a".repeat(36);
  const found = detectSecrets(`export GH=${token}`);
  assert.ok(found.some((f) => f.ruleId === "secret.github-token"));
});

test("detects OpenAI key", () => {
  const found = detectSecrets("OPENAI_API_KEY=sk-proj-abcdefghij0123456789");
  assert.ok(found.some((f) => f.ruleId === "secret.openai-key"));
});

test("detects private key block", () => {
  const found = detectSecrets("-----BEGIN RSA PRIVATE KEY-----");
  assert.ok(found.some((f) => f.ruleId === "secret.private-key-block"));
});

test("detects generic high-entropy assignment", () => {
  const found = detectSecrets('MY_API_TOKEN="AbCdEf123456AbCdEf123456AbCdEf12"');
  assert.ok(found.some((f) => f.ruleId === "secret.generic-assignment"));
});

test("ignores ordinary text", () => {
  assert.equal(detectSecrets("hello world npm test").length, 0);
});

test("redaction removes the secret and keeps a hint", () => {
  const token = "ghp_" + "b".repeat(36);
  const { redacted, findings } = redactSecrets(`token ${token}`);
  assert.ok(!redacted.includes(token));
  assert.ok(redacted.includes("*"));
  assert.equal(findings.length, 1);
});
