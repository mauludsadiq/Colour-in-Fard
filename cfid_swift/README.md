# CFColor (Swift)

CF-ID: deterministic colour identity, per CF-Protocol-2.0.0
(see SPEC-2.0.md in the main repo).

Pure Swift, zero third-party dependencies (uses CryptoKit, part of
Apple's standard SDKs, for SHA-256). This is the sixth independent CF-ID
implementation, after FARD, Python, Rust, TypeScript, and WASM, and
matches all of them exactly on every SPEC-2.0.md test vector.

A Swift package is the prerequisite for any future iOS/macOS app (Roadmap
v4 Phase C.5).

## Usage

    import CFColor

    try fromHex("#7B3F00")   // "CF-7B3F00-EA262463"
    fromRGB(255, 0, 0)       // "CF-FF0000-37AB74A7"

## CLI

    swift run cfid "#7B3F00"
    CF-7B3F00-EA262463

## Build and test

    swift build
    swift test

6/6 tests pass: all 7 SPEC-2.0.md Appendix A.1 vectors (in one test case),
the round3 negative-truncation edge case from Appendix A.2, 3-digit hex
expansion, invalid-hex error handling, and fromRGB/fromHex consistency.

## Platform requirement

Package.swift specifies `.macOS(.v10_15)` as the minimum platform, since
CryptoKit's SHA256 requires macOS 10.15+ / iOS 13+.

## Status

Part of the Colour-in-FARD project's Roadmap v4, Phase B.3 (Swift half).
Not yet published as a tagged SPM package or to CocoaPods.

The Kotlin half of B.3 is deferred: this development environment has no
JDK/Kotlin toolchain installed (`kotlinc` not found), so it could not be
built or tested here. The Swift implementation above can serve as the
reference for a future Kotlin port -- the algorithm and SPEC-2.0.md test
vectors are identical.
