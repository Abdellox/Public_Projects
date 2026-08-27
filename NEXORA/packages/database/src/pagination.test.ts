import { describe, expect, it } from "vitest";
import { decodeCursor, encodeCursor } from "../src/pagination.js";

describe("cursor codec", () => {
  it("round-trips a cursor", () => {
    const cursor = { at: "2026-08-24T10:00:00.000Z", id: "0b6c1e2a-9f4d-4a5b-8c7d-1234567890ab" };
    const decoded = decodeCursor(encodeCursor(cursor));
    expect(decoded).toEqual(cursor);
  });

  it("rejects malformed payloads", () => {
    expect(decodeCursor("!!!not-base64url!!!")).toBeNull();
    expect(decodeCursor(Buffer.from('{"at":"x"}').toString("base64url"))).toBeNull();
    expect(decodeCursor(Buffer.from('"string"').toString("base64url"))).toBeNull();
  });

  it("rejects invalid timestamps", () => {
    const bad = Buffer.from(JSON.stringify({ at: "nope", id: "abc" })).toString("base64url");
    expect(decodeCursor(bad)).toBeNull();
  });
});
