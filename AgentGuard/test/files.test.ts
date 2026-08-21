import { test } from "node:test";
import assert from "node:assert/strict";
import { findProtectedPathTokens, isProtectedPath } from "../src/detectors/files.js";

const patterns = [".env", ".env.*", "**/*.pem", ".ssh/**"];

test("flags .env reference in a command", () => {
  const m = findProtectedPathTokens("cat .env", patterns, process.cwd());
  assert.ok(m.length >= 1);
});

test("flags nested key file", () => {
  assert.ok(isProtectedPath("config/server.pem", patterns));
  assert.ok(isProtectedPath(".ssh/id_rsa", patterns));
});

test("does not flag ordinary source files", () => {
  assert.equal(isProtectedPath("src/index.ts", patterns), null);
  assert.equal(findProtectedPathTokens("npm test", patterns, process.cwd()).length, 0);
});
