import init, { fromHex, fromRgb, round3 } from "./pkg/cfcolor_wasm.js";
import { readFileSync } from "node:fs";

const wasmBytes = readFileSync("./pkg/cfcolor_wasm_bg.wasm");
await init(wasmBytes);

const cases = [
  ["#000000", "CF-000000-86165F20"],
  ["#ffffff", "CF-FFFFFF-2DD4EB92"],
  ["#ff0000", "CF-FF0000-37AB74A7"],
  ["#00ff00", "CF-00FF00-9377CC77"],
  ["#0000ff", "CF-0000FF-D81673DF"],
  ["#7b3f00", "CF-7B3F00-EA262463"],
  ["#cc0000", "CF-CC0000-791976F7"],
];

let allOk = true;
for (const [hex, expected] of cases) {
  const got = fromHex(hex);
  const ok = got === expected;
  if (!ok) allOk = false;
  console.log(hex, got, expected, ok ? "OK" : "MISMATCH");
}

console.log("fromRgb(255,0,0):", fromRgb(255, 0, 0));
console.log("round3(-86.183):", round3(-86.183));

try {
  fromHex("#zzzzzz");
  console.log("ERROR: should have thrown");
  allOk = false;
} catch (e) {
  console.log("invalid hex correctly threw:", e.message);
}

console.log(allOk ? "ALL PASS" : "FAILURES");
