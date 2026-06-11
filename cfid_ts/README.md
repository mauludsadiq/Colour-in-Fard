# cfcolor (TypeScript)

CF-ID: deterministic colour identity, per CF-Protocol-2.0.0
(see SPEC-2.0.md in the main repo).

Pure TypeScript, zero runtime dependencies (uses node:crypto for SHA-256,
part of the Node.js standard library). This is the fourth independent
CF-ID implementation, after FARD, Python (cfcolor on PyPI), and Rust
(cfcolor crate), and matches all of them exactly on every SPEC-2.0.md
test vector.

This factors out and extends the algorithm already embedded in
vscode-extension/cfid.js and figma-plugin/code.js into a typed, reusable,
tested package -- those surfaces can depend on this package directly going
forward instead of carrying their own copies.

## Usage

    import { fromHex, fromRgb } from "cfcolor";

    fromHex("#7B3F00").cfId   // "CF-7B3F00-EA262463"
    fromRgb(255, 0, 0)        // "CF-FF0000-37AB74A7"

fromHex also returns LAB, LCH, and WCAG contrast ratios against white and
black:

    const info = fromHex("#7B3F00");
    info.lab.L           // 33.493
    info.contrastWhite   // 8.22

## CLI

    node bin.mjs "#7B3F00"
    CF-7B3F00-EA262463

## Build and test

    npm install
    npm test

8/8 tests pass: all 7 SPEC-2.0.md Appendix A.1 vectors, the round3
negative-truncation edge case from Appendix A.2, 3-digit hex expansion,
WCAG contrast verification, and hue-range checks.

## Status

Part of the Colour-in-FARD project's Roadmap v4, Phase B.2. Not yet
published to npm. A WebAssembly build of the full LAB/LCH/CIEDE2000
pipeline (the other half of "B.2 -- TypeScript/WebAssembly") remains
future work.
