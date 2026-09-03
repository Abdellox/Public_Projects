import { describe, expect, it } from "vitest";
import { parseCsv, parseCsvWithHeaders, toCsv } from "../src/lib/csv.js";

describe("csv", () => {
  it("parses simple rows", () => {
    const rows = parseCsv("a,b,c\n1,2,3");
    expect(rows).toEqual([["a", "b", "c"], ["1", "2", "3"]]);
  });

  it("handles quoted fields with commas and escaped quotes", () => {
    const rows = parseCsv('name,note\n"Doe, Jane","she said ""hi"""');
    expect(rows[1]).toEqual(["Doe, Jane", 'she said "hi"']);
  });

  it("handles CRLF and trailing newline", () => {
    const rows = parseCsv("a,b\r\n1,2\r\n");
    expect(rows).toEqual([["a", "b"], ["1", "2"]]);
  });

  it("roundtrips through toCsv", () => {
    const headers = ["x", "y"];
    const body = [["1", 'a,b"c'], ["2", null]];
    const csv = toCsv(headers, body);
    expect(csv).toContain('"a,b""c"');
    expect(parseCsvWithHeaders(csv).records[0]).toEqual({ x: "1", y: 'a,b"c' });
  });
});
