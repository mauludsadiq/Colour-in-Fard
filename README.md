# Colour in FARD

**A deterministic, open colour standard -- and the engine that proves it.**

Every 8-bit sRGB colour has a permanent identity: a CF-ID, computed from
first principles (CIELAB under D65), verifiable by anyone, owned by no one.
Colour-in-FARD is the reference implementation: a complete perceptual
colour engine, a public registry of over a million identities, and the
tooling that puts colour identity directly into design and development
workflows.

Written entirely in FARD -- 7,567 lines, 281 tests, zero failures, no FFI,
no external libraries.

---

## Why

Hex codes and Pantone numbers describe colour, but neither is a stable,
open *identity*. #7B3F00 is just six characters; "PMS 1795 C" requires a
licence to use authoritatively. Neither lets you ask "is this the same
colour as that?" with a verifiable answer.

CF-ID answers that question. CF-7B3F00-EA262463 is computed from the
colour's CIELAB values under D65 -- the same calculation, the same result,
in any conformant implementation, forever. The identity is permanent even
if naming, tooling, or anchor colours change around it.

## Live

    Registry:       https://mauludsadiq.github.io/Colour-in-Fard/registry/index.json
    Viewer:         https://mauludsadiq.github.io/Colour-in-Fard/viewer.html
    Specification:  https://github.com/mauludsadiq/Colour-in-Fard/blob/main/SPEC-2.0.md
    PyPI:           https://pypi.org/project/cfcolor/
    Repo:           https://github.com/mauludsadiq/Colour-in-Fard

---

## Quickstart

Get the full perceptual profile of a colour -- identity, relationships,
and exports:

    fardrun run --program apps/colorbrain.fard --out out/run -- explain "#7B3F00"

    cf_id:        CF-7B3F00-EA262463
    nearest_name: sienna
    lch:  L=33.4  C=49.1  H=63
    lab:  L=33.4  a=22.2  b=43.7
    rgb:  123 63 0

    relations:
      complement    : #005c94 (steel blue)
      analogous [-] : #8f2c27 (brown)
      triadic   [1] : #006052 (hunter green)

    shades:  #7b3f00  #642c00  #4f1900  #3d0400  #330000
    tints:   #7b3f00  #ab672b  #dc9254  #ffbe7e  #ffedab

Extract a palette from any image:

    fardrun run --program apps/palette.fard --out out/run -- photo.jpg 6

    1. #9c96f8  electric blue   CF-9C96F8-D5DA0DD2
    2. #f26454  terracotta      CF-F26454-FB3A93D6
    3. #3b6e22  pine            CF-3B6E22-7A7ED138
    ...

Check WCAG contrast, simulate colour blindness, build a gradient:

    fardrun run --program apps/contrast.fard --out out/run -- "#7B3F00" "#ffffff"
    contrast ratio: 8.22:1  |  wcag level: AAA

    fardrun run --program apps/simulate.fard --out out/run -- "#ff6600"
    fardrun run --program apps/gradient.fard --out out/run -- "#7B3F00" "#005c94" 5

Convert between ICC colour profiles, with calibrated CMYK:

    fardrun run --program apps/icc_convert.fard --out out/run -- "#ff0000" "/System/Library/ColorSync/Profiles/sRGB Profile.icc" "/System/Library/ColorSync/Profiles/Display P3.icc"
    output: #eb3e2f  CF-EB3E2F-4422C9BC

    fardrun run --program apps/icc_cmyk.fard --out out/run -- "#7B3F00" "/System/Library/ColorSync/Profiles/Display P3.icc"
    ICC-calibrated CMYK: C=0% M=80% Y=100% K=83%
    standard sRGB CMYK:  C=0% M=75% Y=100% K=80%

Compute a colour from a measured spectral reflectance curve, and look up
historical pigments:

    fardrun run --program apps/spectral.fard --out out/run -- "0.5"
    cf_id:          CF-BBBCBB-55C6D241
    cf_spectral_id: CF-SPECTRAL-A238F71E

    fardrun run --program apps/pigments.fard --out out/run -- "vermilion"
    Vermilion (Cinnabar) -- HgS, used since antiquity
    measured LAB (D65): L=59.5 a=47.1 b=55.2
    sRGB best fit: #ea682d  (dE76=0.11, in gamut)

Look up a colour's name from any versioned naming database:

    fardrun run --program apps/naming.fard --out out/run -- "#cc0000"
    naming_db:    names/cf-anchors-1.0.0.ndjson  (db_version: 17638FCB)
    nearest (CIEDE2000): crimson

    fardrun run --program apps/naming.fard --out out/run -- "#cc0000" "names/cf-pigments-1.0.0.ndjson"
    naming_db:    names/cf-pigments-1.0.0.ndjson  (db_version: B57126B4)
    nearest (CIEDE2000): vermilion

Same CF-ID, different (equally valid) name -- both receipted with their
database's content hash.

Publish and verify a self-contained colour claim:

    fardrun run --program apps/claim.fard --out out/run -- create "Vermilion (reference)" "#ea682d" "out/claim.json"
    fardrun run --program apps/claim.fard --out out/run -- verify "out/claim.json"
    VALID -- cf_id matches srgb_hex, claim_digest matches content

---

## Surfaces

CF-ID is reachable from four independent implementations, all verified
against the same test vectors in SPEC-2.0.md:

| Surface | Language | Use |
|---|---|---|
| Reference implementation | FARD | source of truth, full colour engine |
| cfcolor (PyPI) | Python | pip install cfcolor, scripting/CLI |
| Figma plugin | JavaScript | select a fill, see its CF-ID and registry name |
| VS Code extension | JavaScript | hover any hex colour in any file |

    from cfcolor import from_hex
    from_hex("#7B3F00")   # "CF-7B3F00-EA262463"

---

## The CF Registry

Over a million colours, each resolvable at a predictable URL:

    https://mauludsadiq.github.io/Colour-in-Fard/registry/by-id/CF-CC0000-791976F7.json
    https://mauludsadiq.github.io/Colour-in-Fard/registry/shards/cc.ndjson

CF-CC0000-791976F7 is not a local label -- it's a resolvable, verifiable
identity, computable offline by anyone, in any of the four surfaces above.

---

## How It Works

**The colour pipeline.** sRGB is converted to linear light, then to XYZ
under D65, then to CIELAB and CIELCH. CIEDE2000 (verified against all six
Sharma 2005 canonical pairs) and OKLab/OKLCH (Ottosson 2020) provide
perceptually uniform distance and gradients. CMYK is derived via grey
component replacement with total-ink-coverage warnings, and can
optionally be calibrated against a real ICC profile's tone-response
curves rather than an assumed sRGB gamma.

**CF-ID.** Eighteen characters: CF-<HEX6>-<LABHASH8>. The hash half is
SHA-256 over the colour's CIELAB values, serialised as canonical JSON and
rounded with FARD's specific truncation behaviour -- documented precisely
in SPEC-2.0.md because it must be replicated exactly for cross-language
conformance (and it has been: FARD, Python, and JavaScript all agree on
all test vectors).

**CF-Spectral-ID.** Two physically different pigments can look identical
under D65 -- they're metamers, and they share a CF-ID. CF-Spectral-ID
hashes the underlying reflectance curve itself (CIE 1931 observer + D65,
36 samples from 380-730nm), so metamers get distinct spectral identities
even when their appearance is the same. The CF Historical Pigment Corpus
(Egyptian Blue through Han Purple, roughly 5000 years of pigments)
demonstrates this with representative spectral curves, provenance, and
gamut-loss measurements against sRGB.

**Naming.** CF-ID never changes; names do. A naming database is a
versioned NDJSON file (one {"name":..., "hex":...} object per line), and
its version is simply the SHA-256 of its own bytes. Anyone can publish
one; receipts record exactly which database produced a given name.

**Receipts and Claims.** Every computation can produce a receipt: SHA-256
digests binding inputs, parameters, and outputs, so a result can be
independently reproduced and checked. CF Colour Claims extend this to
brand communication -- a self-contained JSON document stating "this is our
colour," verifiable by recomputing its CF-ID and digest, with no licence
required.

**Image to Palette.** A native BMP reader (built on fs.read_bytes,
contributed to the FARD runtime as part of this project) plus k-means
clustering in LAB space extracts dominant colours from any image, each
with a full CF profile.

---

## Architecture

    src/core/types.fard             -- RGB, HSV, LAB, LCH types
    src/core/rgb_lab.fard            -- RGB/XYZ/LAB/LCH, Delta-E CIE76
    src/core/delta_e2000.fard        -- CIEDE2000 (Sharma 2005)
    src/core/oklab.fard              -- OKLab/OKLCH (Ottosson 2020)
    src/core/rgb_cmyk.fard           -- CMYK, GCR, TAC, ICC-calibrated linearisation
    src/core/icc_read.fard           -- ICC profile parser, profile-to-profile conversion
    src/core/spectral.fard           -- CIE 1931 CMFs, D65, spectral->XYZ/LAB, CF-Spectral-ID
    src/core/bmp_read.fard           -- native BMP parser (fs.read_bytes)
    src/core/kmeans.fard             -- k-means clustering in LAB space
    src/core/color_relations.fard    -- complement, analogous, triadic, shades
    src/core/colorblind.fard         -- colour blindness simulation
    src/core/wcag.fard               -- WCAG contrast, AA/AAA
    src/core/cf_id.fard              -- CF-ID v1.0.0
    src/core/naming.fard             -- CF Community Naming Layer
    src/core/claim.fard              -- CF Colour Claim Protocol
    src/data/pigments.fard           -- CF Historical Pigment Corpus
    names/                           -- versioned naming databases
    figma-plugin/                    -- Figma plugin (JS)
    vscode-extension/                -- VS Code extension (JS)
    cfid_py/                         -- Python reference implementation (PyPI: cfcolor)
    docs/registry/                   -- CF Registry (static, GitHub Pages)
    docs/viewer.html                 -- live web viewer
    SPEC-2.0.md                      -- CF Protocol Specification v2.0.0
    CLAIM-SPEC.md                    -- CF Colour Claim Protocol v1.0.0

---

## Validation

281 tests, 32 suites, 0 failures, including:

- All 6 Sharma 2005 CIEDE2000 canonical pairs, exact
- All 7 SPEC-2.0.0 CF-ID test vectors, exact, across FARD, Python, and JavaScript
- 40/40 CSS named colour corpus matched
- OKLab roundtrips for all primaries
- CMYK roundtrips for primaries and neutrals; ICC-calibrated CMYK verified
  against real sRGB and Display P3 profiles
- Native BMP reader verified against sips-generated files
- Spectral pipeline: flat 100% reflectance gives LAB L~100 and white sRGB;
  metamerism demonstrated with distinct CF-Spectral-IDs for
  visually-identical curves
- Naming database version hashes are deterministic and content-dependent
- CF Colour Claim tampering, cf_id mismatch, and cf_spectral_id mismatch
  are all detected; claim digests match across FARD and Python canonical
  JSON encodings

---

## What's Next

The protocol and reference implementation are complete and self-consistent.
Two directions remain open, both intentionally left for the community
rather than this repo:

- **Scale**: a CDN-hosted registry covering more of the 16.7 million
  possible colours (the current registry covers just over 1 million).
- **Recognition**: CF-ID becomes a standard the way any open format does
  -- by being used. SPEC-2.0.md is written in the format a W3C Community
  Group would expect (see w3c/SUBMISSION.md for what that step involves).

Contributions welcome: additional naming databases, measured (rather than
representative) pigment spectra with citations, additional language
implementations, or just colours.

---

## Built with FARD

https://github.com/mauludsadiq/FARD

fs.read_bytes was added to the FARD runtime as part of this project to
enable native binary file parsing (BMP, ICC) without FFI.

# License

MUI
