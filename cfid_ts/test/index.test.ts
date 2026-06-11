import test from "node:test";
import assert from "node:assert/strict";
import { fromHex, fromRgb, round3 } from "../src/index.js";

// SPEC-2.0.md Appendix A.1 test vectors
test("SPEC-2.0.md vectors", () => {
  const cases: [string, string][] = [
    ["#000000", "CF-000000-86165F20"],
    ["#ffffff", "CF-FFFFFF-2DD4EB92"],
    ["#ff0000", "CF-FF0000-37AB74A7"],
    ["#00ff00", "CF-00FF00-9377CC77"],
    ["#0000ff", "CF-0000FF-D81673DF"],
    ["#7b3f00", "CF-7B3F00-EA262463"],
    ["#cc0000", "CF-CC0000-791976F7"],
  ];
  for (const [hex, expected] of cases) {
    assert.equal(fromHex(hex).cfId, expected, `mismatch for ${hex}`);
  }
});

test("3-digit hex expands to match 6-digit", () => {
  assert.equal(fromHex("#f00").cfId, fromHex("#ff0000").cfId);
});

test("round3 truncates toward zero for negatives (Appendix A.2)", () => {
  assert.equal(round3(-86.183), -86.182);
});

test("round3 truncates toward zero for positives", () => {
  assert.equal(round3(86.183), 86.183);
  assert.equal(round3(0.0001), 0);
});

test("invalid hex throws", () => {
  assert.throws(() => fromHex("#zzzzzz"));
  assert.throws(() => fromHex("#ff00"));
});

test("contrast ratio for #7B3F00 matches known WCAG vector", () => {
  const info = fromHex("#7B3F00");
  assert.ok(Math.abs(info.contrastWhite - 8.22) < 0.01);
});

test("fromRgb matches fromHex", () => {
  assert.equal(fromRgb(255, 0, 0), fromHex("#ff0000").cfId);
});

test("LCH hue is in [0,360)", () => {
  for (const hex of ["#ff0000", "#00ff00", "#0000ff", "#7b3f00"]) {
    const info = fromHex(hex);
    assert.ok(info.lch.H >= 0 && info.lch.H < 360);
  }
});
