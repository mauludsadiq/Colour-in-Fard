# Colour in FARD

**A deterministic, open colour standard -- and the engine that proves it.**

Every 8-bit sRGB colour has a permanent identity: a CF-ID, computed from
first principles (CIELAB under D65), verifiable by anyone, owned by no one.
Colour-in-FARD is the reference implementation: a complete perceptual
colour engine, a public registry of over a million identities, eight
independent cross-language implementations, and a full pipeline from
images and seed colours to accessible, exportable, tamper-evident design
systems -- and now a text-to-emotional-palette protocol (CF-EMOLEX-1.0.0)
grounded in peer-reviewed cross-cultural colour-emotion research.

Written entirely in FARD -- 11,188 lines, 416 tests, zero failures, no FFI,
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

Build a full, accessible colour scheme from a single seed -- or straight
from an image -- and export it to CSS, Tailwind, Design Tokens, Android,
or SwiftUI:

    fardrun run --program apps/dynamic_theme.fard --out out/run -- "#7B3F00" dark

    primary:
      onPrimary: #572000  (T20, CF-572000-EED1F279)
      primary: #FFB575  (T80, CF-FFB575-C78010C2)
        contrast(onPrimary on primary) = 7.52  AA/AAA
    ...

    fardrun run --program apps/theme_from_image.fard --out out/run -- photo.jpg 6 light
    fardrun run --program apps/theme_export.fard --out out/run -- "#7B3F00" light css
    fardrun run --program apps/theme_claims.fard --out out/run -- create "#7B3F00" light "out/theme"
    fardrun run --program apps/theme_claims.fard --out out/run -- verify "out/theme"

    21/21 claims valid

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

Find colours near a given colour in the registry, generate an HCT tonal
palette, and see how a colour shifts under a different light source:

    fardrun run --program apps/similar.fard --out out/run -- "#cc0000" "--nearest" "5"
    #cc0300  CF-CC0300-8E5E6876  scarlet  (dE76=0.26)

    fardrun run --program apps/hct_palette.fard --out out/run -- "#7B3F00"
    seed: hue=56.31  chroma=42.15  tone=33.49
    T50  #ab672b  hue=56.88  chroma=40.86  tone=50

    fardrun run --program apps/multi_illuminant.fard --out out/run -- "0.5"
    under D65:           #bbbcbb  L=76.069 a=-0.047 b=0.033
    under Illuminant A:  #f6ac5f  L=76.069 a=19.695 b=49.636

Look up a colour's name from any versioned naming database:

    fardrun run --program apps/naming.fard --out out/run -- "#cc0000"
    naming_db:    names/cf-anchors-1.0.0.ndjson  (db_version: 17638FCB)
    nearest (CIEDE2000): crimson

    fardrun run --program apps/naming.fard --out out/run -- "#cc0000" "names/cf-pigments-1.0.0.ndjson"
    naming_db:    names/cf-pigments-1.0.0.ndjson  (db_version: B57126B4)
    nearest (CIEDE2000): vermilion

Same CF-ID, different (equally valid) name -- both receipted with their
database's content hash.

Publish and verify a self-contained colour claim, optionally relating it
to a reference colour from any open or licensed system:

    fardrun run --program apps/claim.fard --out out/run -- create "Vermilion (reference)" "#ea682d" "out/claim.json"
    fardrun run --program apps/claim.fard --out out/run -- verify "out/claim.json"
    VALID -- cf_id matches srgb_hex, claim_digest matches content

    fardrun run --program apps/claim.fard --out out/run -- create "Brick Red" "#b32424" "out/brick.json" "CSS Color Module Level 4" "firebrick" "#b22222"
    nearest_reference: CSS Color Module Level 4 firebrick (dE2000=0.45)

Embed CF-ID directly into image and design files:

    fardrun run --program apps/png_embed.fard --out out/run -- input.png "#7B3F00" output.png
    embedded: CF-7B3F00-EA262463 (PNG tEXt chunk, byte-valid output)

Derive a deterministic CF palette from any text, grounded in the NRC Emotion
Lexicon and Jonauskaite et al. (2020) cross-cultural colour-emotion data:

    fardrun run --program apps/emotion_palette.fard --out out/run -- "I feel sad and lonely but I hope things will get better and I am grateful for your kindness" 4

    tokens: 19  scored: 5
    dominant: neutral/factual/stable (14)
    lexicon: CF-EMOLEX-1.0.0

    palette (k=4):
      1. #798686  CF-798686-F390AE57  neutral/factual/stable   contrast/white=3.75
      2. #da9768  CF-DA9768-6AA9B8EA  care/gratitude/compassion  contrast/white=2.44
      3. #09455a  CF-09455A-F2C47049  sadness/loss/damage       contrast/white=10.4
      4. #9adc94  CF-9ADC94-D02C1BA8  hope/aspiration           contrast/white=1.60

The claim: given this lexicon and this colour mapping, this text deterministically
produces this palette. The protocol makes no claim of universal colour-emotion
truth -- only deterministic, receipted, reproducible derivation.

---

## Surfaces

CF-ID is reachable from eleven independent surfaces, all verified against the
same conformance suite (conformance/vectors.json):

| Surface | Language | Use |
|---|---|---|
| Reference implementation | FARD | source of truth, full colour engine |
| cfcolor (PyPI) | Python | pip install cfcolor, scripting/CLI |
| Figma plugin | JavaScript | select a fill, see its CF-ID and registry name |
| VS Code extension | JavaScript | hover any hex colour in any file |
| cfcolor (Rust) | Rust | zero-dependency crate, own SHA-256, CLI |
| cfcolor (TypeScript) | TypeScript | typed npm package, zero runtime deps |
| cfcolor-wasm | WASM (via Rust) | ~74KB, browser-native CF-ID computation |
| CFColor (Swift) | Swift | zero 3rd-party deps (CryptoKit), SPM package |
| cfcolor (C++) | C++17 | header-only, zero deps, embeddable via C ABI |
| cfcolor (Kotlin) | Kotlin | zero 3rd-party deps (java.security.MessageDigest), CLI |
| cfcolor (Go) | Go | zero deps (crypto/sha256), CLI |

Nine independent implementations (FARD, Python, Rust, TypeScript, WASM,
Swift, C++, Kotlin, Go) all agree on every conformance vector.

    from cfcolor import from_hex
    from_hex("#7B3F00")   # "CF-7B3F00-EA262463"

---

## The CF Registry

Over a million colours, each resolvable at a predictable URL:

    https://mauludsadiq.github.io/Colour-in-Fard/registry/by-id/CF-CC0000-791976F7.json
    https://mauludsadiq.github.io/Colour-in-Fard/registry/shards/cc.ndjson

CF-CC0000-791976F7 is not a local label -- it's a resolvable, verifiable
identity, computable offline by anyone, in any of the eleven surfaces above.

---

## How It Works

**The colour pipeline.** sRGB is converted to linear light, then to XYZ
under D65, then to CIELAB and CIELCH. CIEDE2000 (verified against all six
Sharma 2005 canonical pairs), OKLab/OKLCH (Ottosson 2020), CAM16, HCT, IPT,
and JzAzBz provide perceptually uniform distance, gradients, and dynamic
theming across colour models. CMYK is derived via grey component
replacement with total-ink-coverage warnings, and can optionally be
calibrated against a real ICC profile's tone-response curves rather than
an assumed sRGB gamma.

**CF-ID.** Eighteen characters: CF-<HEX6>-<LABHASH8>. The hash half is
SHA-256 over the colour's CIELAB values, serialised as canonical JSON and
rounded with FARD's specific truncation behaviour -- documented precisely
in SPEC-2.0.md and conformance/vectors.json because it must be replicated
exactly for cross-language conformance (and it is: all eight
implementations agree on every vector). CF-ID is always computed from the
8-bit (hex) colour, so cf_id and the displayed hex never disagree.

**CF-Spectral-ID.** Two physically different pigments can look identical
under D65 -- they're metamers, and they share a CF-ID. CF-Spectral-ID
hashes the underlying reflectance curve itself (CIE 1931 observer + D65),
so metamers get distinct spectral identities even when their appearance is
the same. CF-Spectral-ID-2.0 expands the original 36-sample/10nm sampling
to 71 samples/5nm, valid in parallel with v1.0. The CF Historical Pigment
Corpus (Egyptian Blue through Han Purple) demonstrates this with
representative spectral curves, provenance, and gamut-loss measurements
against sRGB.

**Naming.** CF-ID never changes; names do. A naming database is a
versioned NDJSON file (one {"name":..., "hex":...} object per line), and
its version is simply the SHA-256 of its own bytes. Anyone can publish
one; receipts record exactly which database produced a given name.

**Receipts and Claims.** Every computation can produce a receipt: SHA-256
digests binding inputs, parameters, and outputs, so a result can be
independently reproduced and checked. CF Colour Claims extend this to
brand communication -- a self-contained JSON document stating "this is our
colour," verifiable by recomputing its CF-ID and digest, with no licence
required. Claims can optionally state a `nearest_reference` (CIEDE2000
distance to any caller-supplied reference colour, e.g. a CSS named colour
or a licensed Pantone/RAL value) without reproducing that system's data.

**Dynamic Theming.** A single seed colour (or an image, via k-means
palette extraction) generates a full Material-3-style scheme: 21 roles
(primary/secondary/tertiary/surface/error, each with an "on" pair) across
light and dark modes, every pairing verified against WCAG AA, every role
carrying its own CF-ID. Schemes export to CSS custom properties, Tailwind
config, W3C Design Tokens, Android XML, and SwiftUI -- and every role can
be wrapped in a CF Colour Claim for tamper-evident design-system tracking.

**Image to Palette.** A native BMP/PNG reader (built on fs.read_bytes,
contributed to the FARD runtime as part of this project) plus k-means
clustering in LAB space extracts dominant colours from any image, each
with a full CF profile.

**File Format Embedding.** CF-ID can travel with an asset directly: as a
PNG tEXt chunk (via a from-scratch CRC-32, byte-for-byte valid output), an
SVG data attribute or namespaced `<metadata>` block, a CSS custom
property, or a W3C Design Tokens `$extensions` field -- all additive and
non-breaking for consumers that don't know about CF-ID.

---

## Architecture

    src/core/types.fard             -- RGB, HSV, LAB, LCH types
    src/core/rgb_lab.fard            -- RGB/XYZ/LAB/LCH, Delta-E CIE76
    src/core/delta_e2000.fard        -- CIEDE2000 (Sharma 2005)
    src/core/oklab.fard              -- OKLab/OKLCH (Ottosson 2020)
    src/core/cam16.fard              -- CAM16 colour appearance model
    src/core/hct.fard                -- HCT (Hue, Chroma, Tone)
    src/core/ipt.fard                -- IPT colour space
    src/core/jzazbz.fard             -- JzAzBz (Safdar 2017)
    src/core/rgb_cmyk.fard           -- CMYK, GCR, TAC, ICC-calibrated linearisation
    src/core/icc_read.fard           -- ICC profile parser, profile-to-profile conversion
    src/core/spectral.fard           -- CF-Spectral-ID-1.0 (CIE 1931 CMFs, D65)
    src/core/spectral2.fard          -- CF-Spectral-ID-2.0 (5nm/71-sample)
    src/core/multi_illuminant.fard   -- CF-ID under Illuminant A, metamerism index
    src/core/bmp_read.fard           -- native BMP parser (fs.read_bytes)
    src/core/kmeans.fard             -- k-means clustering in LAB space
    src/core/color_relations.fard    -- complement, analogous, triadic, shades
    src/core/colorblind.fard         -- colour blindness simulation
    src/core/wcag.fard               -- WCAG contrast, AA/AAA
    src/core/cf_id.fard              -- CF-ID v1.0.0
    src/core/naming.fard             -- CF Community Naming Layer
    src/core/claim.fard              -- CF Colour Claim Protocol + reference claims
    src/core/dynamic_theme.fard      -- Material-3-style scheme generator
    src/data/pigments.fard           -- CF Historical Pigment Corpus
    src/emotion/emotion_ids.fard     -- 20 frozen emotion classes (Russell 1980 circumplex)
    src/emotion/emotion_lexicon.fard -- 166-word NRC-grounded lexicon, confidence levels
    src/emotion/emotion_palette.fard -- 20 LCH anchor colours (Jonauskaite et al. 2020)
    src/emotion/emotion_profile.fard -- text tokenizer + emotion histogram
    src/emotion/emotion_theme.fard   -- profile -> CF palette with L* variety offsets
    SPEC-EMOLEX-1.0.md               -- CF Emotional Palette Protocol specification
    apps/dynamic_theme.fard          -- scheme from a seed colour
    apps/theme_from_image.fard       -- scheme from an image
    apps/theme_export.fard           -- CSS/Tailwind/Tokens/Android/SwiftUI export
    apps/theme_claims.fard           -- CF Colour Claims for every theme role
    apps/png_embed.fard              -- embed CF-ID as a PNG tEXt chunk
    apps/emotion_palette.fard        -- text -> CF emotional palette
    conformance/vectors.json         -- canonical cross-language test vectors
    names/                           -- versioned naming databases
    figma-plugin/                    -- Figma plugin (JS)
    vscode-extension/                -- VS Code extension (JS)
    cfid_py/                         -- Python reference implementation (PyPI: cfcolor)
    cfid_rs/, cfid_ts/, cfid_wasm/, cfid_swift/, cfid_cpp/, cfid_kotlin/, cfid_go/
                                     -- Rust/TypeScript/WASM/Swift/C++/Kotlin/Go ports
    docs/registry/                   -- CF Registry (static, GitHub Pages)
    docs/viewer.html                 -- live web viewer
    docs/embedding/                  -- file format embedding examples
    SPEC-2.0.md                      -- CF Protocol Specification v2.0.0
    CLAIM-SPEC.md                    -- CF Colour Claim Protocol v1.0.0
    EMBEDDING.md                     -- CF-ID file format embedding guide
    CONFORMANCE.md                   -- conformance suite documentation

---

## Validation

416 tests, 0 failures, including:

- All 6 Sharma 2005 CIEDE2000 canonical pairs, exact
- All 7 SPEC-2.0.0 CF-ID test vectors, exact, across all nine independent
  implementations (FARD, Python, Rust, TypeScript, WASM, Swift, C++, Kotlin, Go)
- 40/40 CSS named colour corpus matched
- OKLab roundtrips for all primaries
- CMYK roundtrips for primaries and neutrals; ICC-calibrated CMYK verified
  against real sRGB and Display P3 profiles
- Native BMP/PNG readers verified against sips-generated and zlib-checked files
- Spectral pipeline: flat 100% reflectance gives LAB L~100 and white sRGB;
  metamerism demonstrated with distinct CF-Spectral-IDs for
  visually-identical curves; v1.0/v2.0 agree on LAB.L for flat reflectance
- Multi-illuminant: a flat-reflectance grey is #bbbcbb under D65 but
  #f6ac5f under Illuminant A, with identical L*
- Naming database version hashes are deterministic and content-dependent
- CF Colour Claim tampering, cf_id mismatch, cf_spectral_id mismatch, and
  reference-claim tampering are all detected; claim digests match across
  FARD and Python canonical JSON encodings
- PNG embedding: own CRC-32 matches the standard "123456789" vector and
  zlib for a real IHDR chunk; output PNG is byte-valid
- CF-EMOLEX-1.0.0: 30/30 tests across emotion_ids, emotion_lexicon,
  emotion_profile, emotion_palette, and emotion_theme; lookup is
  case-insensitive; unknown words fall back to neutral; palette derivation
  returns correct k colours with CF-IDs and WCAG contrast values
- Dynamic theme: every role pair meets WCAG AA across 7 diverse seeds
  (including pure red/green/blue, near-neutral grey, black, white) in both
  light and dark; cf_id is always consistent with the displayed hex across
  dynamic_theme, theme_export, and theme_claims
- theme_from_image correctly selects the highest-chroma palette cluster as
  seed; theme_claims correctly detects a hand-edited claim (21/21 -> 20/21)

---

## Roadmap v4

ROADMAP-V4.md sets out further work in six phases. Status:

- **Phase A -- additional colour science: complete.** CAM16/HCT, IPT/JzAzBz,
  registry similarity search, CF-Spectral-ID-2.0, multi-illuminant CF-ID.
- **Phase B -- language ports: complete for available toolchains.** Rust,
  TypeScript, WASM, Swift, C++, and Kotlin, all zero/near-zero dependency,
  all conformant.
- **Phase D -- standards and ecosystem: partial (no-new-infrastructure
  items complete).** D.2 reference claims (nearest_reference via
  CIEDE2000 against caller-supplied colours), D.3 file format embedding
  (SVG/PNG/CSS/Design Tokens), D.5 conformance suite
  (conformance/vectors.json + CONFORMANCE.md).
- **Phase F -- theming workflows: complete.** dynamic_theme (Material-3-
  style scheme generator), theme_export (5 formats), theme_from_image
  (palette -> seed -> theme), theme_claims (CF Colour Claims per role,
  with verify/tamper-detection).

Remaining Phase C (native apps), D.1 (W3C submission), D.4 (governance),
and E (reproducible builds, fuzzing, hardware bridges) require new
accounts, organisations, or hardware outside this environment -- see
ROADMAP-V4.md for the full list with honest prerequisites.

## What's Next

The protocol and reference implementation are complete, self-consistent,
and cross-validated across eight languages and a full theming pipeline.
What remains is intentionally left for the community:

- **Scale**: a CDN-hosted registry covering more of the 16.7 million
  possible colours (the current registry covers just over 1 million).
- **Recognition**: CF-ID becomes a standard the way any open format does
  -- by being used. SPEC-2.0.md is written in the format a W3C Community
  Group would expect (see w3c/SUBMISSION.md for what that step involves).
- **Native apps and pro integrations** (Phase C): iOS/Android apps (the
  Swift and Kotlin ports are the prerequisite), browser extensions, and
  plugins for Adobe/Sketch/etc.
- **Hardware bridges** (Phase E.3): real spectrophotometer/colorimeter
  data, once sample export files or device access are available.

Contributions welcome: additional naming databases, measured (rather than
representative) pigment spectra with citations, additional language
implementations, additional export formats, or just colours.

---

## Built with FARD

https://github.com/mauludsadiq/FARD

fs.read_bytes and fs.write_bytes were added to the FARD runtime as part of
this project to enable native binary file parsing and writing (BMP, PNG,
ICC) without FFI.

# License

MUI
