# cfcolor (Rust)

CF-ID: deterministic colour identity, per CF-Protocol-2.0.0
(see SPEC-2.0.md in the main repo).

Pure Rust, zero dependencies (includes its own SHA-256 implementation).
This is the third independent CF-ID implementation, after the FARD
reference implementation and Python (cfcolor on PyPI), and matches both
exactly on all SPEC-2.0.md test vectors.

## Usage

    use cfcolor::from_hex;
    assert_eq!(from_hex("#7B3F00").unwrap(), "CF-7B3F00-EA262463");

## CLI

    cargo run -- "#7B3F00"
    CF-7B3F00-EA262463

## Why no dependencies

cfcolor is meant to be a trivially-auditable building block: anyone
should be able to read this crate top to bottom (including its SHA-256
implementation) and confirm it does exactly what SPEC-2.0.md says, with
no supply-chain surface beyond the Rust standard library.

## Conformance

All 7 test vectors from SPEC-2.0.md Appendix A.1 pass, plus the
round3-truncation edge case from Appendix A.2 (round3(-86.183) ==
-86.182, truncation toward zero -- not standard rounding, which would
give -86.183 and a different, non-conformant CF-ID).

    cargo test

## Status

This crate is part of the Colour-in-FARD project's Roadmap v4, Phase B.1.
Not yet published to crates.io.
