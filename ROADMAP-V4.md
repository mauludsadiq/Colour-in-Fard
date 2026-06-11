# Colour in FARD -- Roadmap v4

**Status:** Draft
**Date:** 2026-06-11
**Builds on:** SPEC-2.0.0 (CF-ID, CF-Spectral-ID, CF Naming, CF Colour Claims),
281 tests / 0 failures, 4 verified surfaces (FARD, cfcolor/PyPI, Figma, VS Code)

---

## Premise

v1.0.0 through v3.7.0 established CF-ID as a complete, internally
consistent, cross-language-verified colour identity protocol. Everything
in that arc was buildable with no new accounts, no new infrastructure, and
no external dependencies beyond what FARD itself could be extended to do
(`fs.read_bytes`).

This roadmap is different in kind. It includes work that genuinely
requires new infrastructure, new accounts, build toolchains, and external
SDKs -- things that could not be completed inside a single FARD-only
session. They are included anyway, because they are the natural next
layer: more colour spaces, more languages, more surfaces, and eventually
more institutional weight. Each item below is scoped, in priority order,
with its real prerequisites stated honestly.

---

## Phase A -- More Colour Science (pure FARD, no new infrastructure)

These follow the exact pattern already used for OKLab/OKLCH and
CIEDE2000: a new core module, a conversion pipeline, test vectors against
published reference values, and an app exposing it.

### A.1 -- CAM16 / CAM16-UCS
Colour appearance model accounting for viewing conditions (surround,
adapting luminance, background). Needed for any "how does this colour
look in this room" claim. Deliverable: `src/core/cam16.fard`,
`apps/cam16.fard`, test vectors against the CAM16 reference
implementation values published in the literature.

### A.2 -- HCT (Hue, Chroma, Tone)
Google's Material You colour space, built on CAM16 + CIELAB L*. Powers
dynamic theming (a single seed colour generates a full tonal palette).
Deliverable: `src/core/hct.fard`, `apps/hct_palette.fard` (generate a
Material-You-style tonal palette from any CF-ID).

### A.3 -- JzAzBz / IPT
Perceptually uniform spaces designed for HDR and wide-gamut work,
addressing known CIELAB blue-hue non-uniformity more directly than even
CIEDE2000's correction terms. Deliverable: `src/core/jzazbz.fard`,
`src/core/ipt.fard`, with delta-E variants for each.

### A.4 -- Registry Similarity Search
Given the existing K=100 registry (1,030,301 entries), add:
"all colours within ΔE2000 < N of CF-ID X" and "k nearest colours to
CF-ID X". Deliverable: `apps/similar.fard`, operating on the existing
shards -- no new registry generation required.

### A.5 -- Expanded Spectral Sampling
Current CF-Spectral-ID uses 36 samples (380-730nm, 10nm). Add a
higher-resolution mode (5nm, 380-780nm = 81 samples) as
CF-Spectral-ID-2.0, with the v1.0 36-sample mode remaining valid
indefinitely (identity permanence applies to spectral IDs too).
Deliverable: extend `src/core/spectral.fard`, document both resolutions
in SPEC-2.0.md as parallel, both-valid identity schemes.

### A.6 -- Fluorescence and Multi-Illuminant
Reflectance-only spectral models can't represent fluorescent materials
(which re-emit at different wavelengths than they absorb) or
illuminant-dependent appearance (metameric pairs that match under D65 but
not under A or F11). Deliverable: bispectral reflectance/emission model,
CF-ID computed under multiple standard illuminants (D65, A, F11), with a
"metamerism index" between them.

**Phase A prerequisites:** none beyond what's already in the repo.
**Phase A risk:** purely a matter of session time -- each module is
independent and additive.

---

## Phase B -- More Languages (new toolchains, no new accounts)

The pattern from `cfid_py` (Python) and the VS Code/Figma JS
implementations generalises directly. Each new language port:

1. Implements `from_hex`/`from_rgb` -> CF-ID per SPEC-2.0.md Section 3
2. Reproduces all Appendix A test vectors exactly
3. Documents the language's equivalent of FARD's `round3` truncation
   behaviour (the most common source of cross-language bugs, as found
   during the Python port)

### B.1 -- Rust
Performance-critical CF-ID computation, suitable as a dependency for
other Rust tools (including, eventually, a faster FARD-adjacent batch
registry generator). Deliverable: `cfid_rs/` crate, published to
crates.io.

### B.2 -- TypeScript / WebAssembly
A proper npm package (the VS Code extension currently embeds the
algorithm directly in `cfid.js`; this factors it out into a reusable,
tree-shakeable package, and adds a WASM build of the full LAB/LCH/CIEDE2000
pipeline for performance-sensitive web apps). Deliverable: `cfid_ts/`,
published to npm as `cfcolor` (name availability to be checked, as with
PyPI).

### B.3 -- Swift and Kotlin
Mobile-native implementations, prerequisite for any native iOS/Android
app (Phase C). Deliverable: Swift package + Kotlin/Maven artifact, both
implementing the same conformance test vectors.

### B.4 -- C++
Native implementation for embedding in desktop creative tools (the kind
that load native plugins, e.g. via C ABI). Deliverable: header-only
`cfid.hpp` plus a small CMake project, conformance tests via the same
Appendix A vectors.

**Phase B prerequisites:**
- crates.io account (Rust)
- npm account (TypeScript) -- separate from the existing PyPI account
- Apple Developer account (Swift package distribution via SPM is free,
  but a paid account is needed for any eventual iOS app in Phase C)
- Maven Central / JitPack account (Kotlin)

None of these block each other; they can be done in any order, and each
is independently useful even if Phase C never happens.

---

## Phase C -- Native Apps and Pro Integrations (new accounts, build
toolchains, platform SDKs)

This is the largest phase and the one most dependent on external
ecosystems. Ordered by how self-contained each item is.

### C.1 -- Desktop App (Tauri)
A cross-platform desktop app wrapping the Rust CF-ID core (B.1) with a
web-based UI: colour picker with LCH/OKLCH wheels, live WCAG/colourblind
simulation, palette extraction (reusing the k-means/BMP pipeline,
ported to Rust for speed), and CF Colour Claim creation/verification as
a GUI workflow. Deliverable: signed builds for macOS/Windows/Linux.

**Prerequisites:** Apple Developer account + notarisation (macOS),
code-signing certificate (Windows), no special account needed for Linux.

### C.2 -- Browser DevTools Extension
A Chrome/Firefox DevTools panel: inspect any computed colour in the page,
see its CF-ID, nearest name, contrast against adjacent elements. Builds
directly on the TypeScript/WASM package (B.2).

**Prerequisites:** Chrome Web Store developer account (one-time fee),
Firefox Add-ons account (free).

### C.3 -- Adobe (Photoshop/Illustrator) Plugin
Official UXP-based plugin: CF-ID panel for the colour picker, swatch
library import/export as CF Colour Claims, ICC-aware CMYK preview using
the existing `icc_cmyk` pipeline ported to the plugin's runtime.

**Prerequisites:** Adobe Developer account, UXP SDK, Creative Cloud for
testing.

### C.4 -- DaVinci Resolve LUT / ACES Integration
Export CF-ID-tagged LUTs and ACES-compatible colour transforms for
film/VFX pipelines. Builds on the ICC/profile-conversion math already
proven in v3.0/v3.4, extended to ACES IDTs/ODTs.

**Prerequisites:** DaVinci Resolve (free version sufficient for LUT
format validation), familiarity with ACES transform specifications.

### C.5 -- Mobile App (iOS/Android)
Native app using the Swift/Kotlin ports (B.3): camera-based colour
extraction (point at a real object, get its CF-ID and nearest pigment
match from the historical corpus), AR colour preview.

**Prerequisites:** Apple Developer Program ($99/yr), Google Play
Developer account (one-time fee), physical test devices recommended.

### C.6 -- HDR / Wide-Gamut Display Support
Extend the colour pipeline to Rec.2020 primaries and PQ/HLG transfer
functions, enabling CF-ID computation for HDR content. This is a Phase A
style math addition (new primaries matrix, new transfer function), but is
grouped here because its main value is realised through C.1/C.5 (apps
that can actually display HDR).

**Prerequisites:** none for the math; an HDR-capable display for visual
verification (common on recent MacBooks/iPhones).

---

## Phase D -- Standards, Governance, and Ecosystem

### D.1 -- W3C Community Group (carried over from v3.7.0)
SPEC-2.0.md is already formatted as a Draft CG Report. Submission
requires a W3C account and the CG proposal process (see
`w3c/SUBMISSION.md`).

### D.2 -- Reference Mappings to Pantone/RAL/NCS/Munsell
Rather than reproducing these proprietary systems, publish CF Colour
Claims (per CLAIM-SPEC.md) for well-known reference colours, each with a
`nearest_reference` field stating "approximately Pantone X, delta_e=Y" --
a factual statement about a CF-ID, not a reproduction of the third-party
system. This sidesteps the licensing question entirely while still
providing the cross-reference utility.

**Prerequisites:** none for the mechanism (already built in v3.6.0); the
work is curating the reference colour list and computing the deltas.

### D.3 -- File Format Embedding
Document and provide example code for embedding CF-ID in:
- SVG (`data-cf-id` attribute or `<metadata>` block)
- PNG (tEXt/iTXt chunks)
- Design token formats (W3C Design Tokens Community Group format, CSS
  Custom Properties with `--cf-id` companions)

**Prerequisites:** none -- this is documentation plus small code examples
in existing languages.

### D.4 -- Foundation / Governance Model
Longer-term: a governance structure (e.g. similar to Rust's or Blender's
foundation models) so the protocol's stewardship doesn't depend on any
single maintainer -- directly serving the "no central authority"
principle already established for naming and claims.

**Prerequisites:** legal/organisational, not technical. Out of scope for
code contributions but listed for completeness, since "no single entity
can hold the standard hostage" was a stated invariant from the original
roadmap.

### D.5 -- Conformance Test Suite + Compliance Marks
A standalone, downloadable conformance test suite (the Appendix A/B
vectors from SPEC-2.0.md, packaged for any language) plus a simple
"CF-ID Conformant" badge/logo for implementations that pass it.

**Prerequisites:** none beyond packaging the existing test vectors.

---

## Phase E -- Operational Hardening

### E.1 -- Fuzzing
Adversarial/malformed-input testing for the binary parsers: BMP
(`bmp_read.fard`), ICC (`icc_read.fard`), and spectral CSV input
(`apps/spectral.fard`). Goal: no panics/crashes on malformed input, only
graceful errors.

**Prerequisites:** none -- a fuzzing harness can be built in FARD or via
an external fuzzer (e.g. AFL on the Rust port from B.1, once it exists).

### E.2 -- Reproducible Builds
For each language port (B.1-B.4) and the FARD runtime itself, document
and verify that builds from source are bit-for-bit reproducible given
pinned toolchain versions.

**Prerequisites:** CI infrastructure (e.g. GitHub Actions, free for public
repos).

### E.3 -- Measurement Hardware Bridge
Support reading spectral data directly from common spectrophotometers
(X-Rite i1Pro, ColorMunki) via their export formats (many support CGATS
or simple CSV/TSV), feeding directly into `apps/spectral.fard` and
`apps/claim.fard`.

**Prerequisites:** access to the hardware (or sample export files from
its documentation) for format validation.

---

## What This Roadmap Deliberately Does Not Include

- **Cloud/SaaS infrastructure** (hosted registry beyond GitHub Pages,
  premium processing, telemetry): conflicts with the "no central
  authority, free to verify" principle that has held since v1.0.0. If
  pursued, it should be additive (an optional convenience), never
  required for verification.
- **AI/ML palette generation**: interesting, but a different kind of
  project (model training/hosting) rather than an extension of the
  identity protocol. Could exist as a separate downstream tool built *on*
  CF-ID, not part of this repo's core.
- **IPFS/decentralised registry hosting**: directionally aligned with "no
  central authority," but adds a new dependency (IPFS infrastructure) for
  a problem (static file hosting) that GitHub Pages + the existing
  shard-based registry already solve adequately at current scale.

---

## Suggested Sequencing

    Phase A (colour science)     -- any order, fully independent, no blockers
    Phase B.1-B.2 (Rust, TS/WASM) -- enables C.1, C.2; no account needed beyond crates.io/npm
    Phase D.2, D.3, D.5           -- low-effort, high-value, no new infrastructure
    Phase B.3-B.4, C.1-C.2        -- after B.1/B.2 land
    Phase A.5-A.6, E.1            -- hardening, can interleave anywhere
    Phase C.3-C.6                 -- each independent, pursue as opportunity/interest dictates
    Phase D.1                     -- whenever a W3C account exists
    Phase E.2-E.3                 -- ongoing
    Phase D.4                     -- only once adoption signals (from v3.7.0's
                                     recognition criteria) start appearing
