# cfcolor-wasm

WebAssembly bindings for cfcolor (CF-ID, CF-Protocol-2.0.0).

This crate is a thin wasm-bindgen wrapper around the dependency-free
cfcolor crate (cfid_rs) -- the CF-ID algorithm itself has zero
dependencies; only this WASM binding layer depends on wasm-bindgen.

This is the fifth independent CF-ID surface (FARD, Python, Rust,
TypeScript, and now WASM-via-Rust), and the highest-performance option for
browser-based tools that need to compute many CF-IDs (e.g. palette
extraction, registry-scale operations) without a server round-trip.

## Build

    wasm-pack build --target web --out-dir pkg

Produces a ~74KB .wasm binary (small enough to be trivially CDN-cacheable)
plus JS/TS bindings in pkg/.

## Usage (browser/ES module)

    import init, { fromHex, fromRgb, round3 } from "./pkg/cfcolor_wasm.js";
    await init();

    fromHex("#7B3F00")   // "CF-7B3F00-EA262463"
    fromRgb(255, 0, 0)   // "CF-FF0000-37AB74A7"
    round3(-86.183)      // -86.182

fromHex throws a JS exception on invalid input.

## Verified

All 7 SPEC-2.0.md Appendix A.1 vectors pass via the compiled WASM module
(see test_wasm.mjs), plus the round3 negative-truncation edge case from
Appendix A.2 and invalid-input error handling.

## Status

Part of the Colour-in-FARD project's Roadmap v4, Phase B.2 (WASM half).
Not yet published to npm. The pkg/ directory is gitignored (build
artifact); run `wasm-pack build` to regenerate it.
