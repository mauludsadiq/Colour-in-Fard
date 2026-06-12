# cfcolor (Go)

CF-ID: deterministic colour identity, per CF-Protocol-2.0.0
(see SPEC-2.0.md in the main repo).

Pure Go, zero dependencies (crypto/sha256 from the standard library).
This is the ninth independent CF-ID implementation, after FARD, Python,
Rust, TypeScript, WASM, Swift, C++, and Kotlin, and matches all of them
exactly on every conformance vector (conformance/vectors.json).

## Usage

    import "cfcolor"

    id, err := cfcolor.FromHex("#7B3F00")  // "CF-7B3F00-EA262463", nil
    id = cfcolor.FromRGB(255, 0, 0)        // "CF-FF0000-37AB74A7"

FromHex returns an error on malformed input.

## CLI

    go run ./cmd/cfid "#7B3F00"
    CF-7B3F00-EA262463

## Build and test

    go test ./...
    go vet ./...

Tests cover all 7 SPEC-2.0.md Appendix A.1 vectors, the round3
negative-truncation edge case from Appendix A.2, 3-digit hex expansion,
FromRGB/FromHex consistency, invalid-input error handling (malformed and
wrong-length hex both error), and a hue-range check.

## Status

Part of the Colour-in-FARD project, extending Roadmap v4 Phase B with a
ninth conformant implementation. Not yet published as a Go module.
