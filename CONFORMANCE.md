# CF Conformance Suite

`conformance/vectors.json` is the canonical, language-neutral source of
test vectors for CF-ID-1.0.0 and related identities (CF-Spectral-ID,
round3, claim digests). Any implementation -- existing or future -- is
conformant if and only if it reproduces every value in that file exactly.

## Why this exists

By v3.17.0, seven independent implementations (FARD, Python, Rust,
TypeScript, WASM, Swift, C++) each carried their own copy of the same
small set of test vectors, transcribed by hand into each language's test
framework. That worked, but it meant "all seven agree" was a claim you
had to verify by reading seven different test files.

`vectors.json` makes it one file. Every implementation's test suite either
already matches it (Status table below) or, for new implementations, can
load it directly and iterate.

## Status

| Implementation | Vectors covered | How verified |
|---|---|---|
| FARD (reference) | cf_id, round3, 3-digit hex, spectral v1/v2, claim digest | tests/test_*.fard (320+ tests) |
| Python (cfcolor, PyPI) | cf_id, round3, 3-digit hex | cfid_py/tests/ (28 tests) |
| Figma plugin (JS) | cf_id, round3, 3-digit hex, WCAG | manual verification against SPEC vectors |
| VS Code extension (JS) | cf_id, round3, 3-digit hex, WCAG | node test against cfid.js |
| Rust (cfcolor) | cf_id, round3, 3-digit hex | cargo test (8 tests) |
| TypeScript (cfcolor) | cf_id, round3, 3-digit hex, WCAG | node --test (8 tests) |
| WASM (cfcolor-wasm) | cf_id, round3 | test_wasm.mjs against compiled module |
| Swift (CFColor) | cf_id, round3, 3-digit hex | swift test (6 tests) |
| C++ (cfcolor) | cf_id, round3, 3-digit hex | ctest (13 checks) |

The `round3_vectors.cases` entry `{-86.183 -> -86.182}` is the single most
important case in the file: it's the one place where a "reasonable"
implementation (round-half-up instead of truncate-toward-zero) silently
produces a different, non-conformant CF-ID. Every implementation above
has been checked against this specific case.

## Using vectors.json from a new implementation

The file is plain JSON with no implementation-specific structure. A
minimal conformance check:

1. For each entry in `cf_id_vectors`, compute `from_hex(entry.hex)` and
   assert it equals `entry.cf_id`.
2. For each entry in `three_digit_hex_expansion`, assert
   `from_hex(entry.short) == from_hex(entry.expands_to)`.
3. For each case in `round3_vectors.cases`, assert
   `round3(case.input) == case.expected`.
4. (Optional, if implementing CF-Spectral-ID) check
   `cf_spectral_id_v1_vectors` and `cf_spectral_id_v2_vectors`.
5. (Optional, if implementing CF Colour Claims) recompute
   `claim_digest_vector.expected_digest` from
   `claim_digest_vector.claim_without_digest` via canonical JSON + SHA-256.

A conformant implementation passes all of (1)-(3) at minimum.

## FARD reference loader

`tests/test_conformance_vectors.fard` loads `conformance/vectors.json`
directly and checks the FARD reference implementation against it -- this
is the file other implementations should treat as ground truth, and the
FARD test demonstrates the file is itself well-formed and consumable.

## Versioning

`vectors.json`'s `suite_version` (CF-Conformance-1.0.0) is independent of
`spec_version` (CF-Protocol-2.0.0). New vectors may be appended in future
suite versions as new identity schemes are added (e.g. multi-illuminant),
but existing vectors are permanent, per SPEC-2.0.md's permanence
principle.
