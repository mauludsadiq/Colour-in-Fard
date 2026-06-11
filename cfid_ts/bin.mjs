#!/usr/bin/env node
import { fromHex } from "./dist/src/index.js";

const hex = process.argv[2];
if (!hex) {
  console.error("usage: cfid <hex>");
  process.exit(1);
}
try {
  console.log(fromHex(hex).cfId);
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exit(1);
}
