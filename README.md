# Colour in FARD

Colour-in-Fard is a deterministic perceptual colour engine where every colour
result is reproducible, named, related, exported, and cryptographically receipted.

Full 24-bit RGB universe. CIELAB, CIELCH, CIEDE2000, OKLab, OKLCH. Multi-format
exports. Written entirely in FARD. No FFI. No native dependencies. No external
libraries. 4,614 lines of FARD. 182 tests, 23 suites, 0 failures.

## Quickstart

    fardrun run --program apps/colorbrain.fard --out out/run -- explain "#7B3F00"

Output:

    cf_id:        CF-7B3F00-EA262463
    input:        #7b3f00
    nearest_name: sienna
    family:       yellow
    character:    dark, medium chroma

    lch:  L=33.4  C=49.1  H=63
    lab:  L=33.4  a=22.2  b=43.7
    hsv:  H=30.7  S=1  V=0.4
    rgb:  123 63 0

    relations:
      complement    : #005c94 (steel blue)
      analogous [-] : #8f2c27 (brown)
      analogous [+] : #5c4e00 (olive)
      triadic   [1] : #006052 (hunter green)
      triadic   [2] : #524291 (cobalt)
      split     [1] : #006078 (cerulean)
      split     [2] : #00529d (cobalt)

    shades:  #7b3f00  #642c00  #4f1900  #3d0400  #330000
    tints:   #7b3f00  #ab672b  #dc9254  #ffbe7e  #ffedab
    tones:   #7b3f00  #73431a  #69472c  #5e4b3e  #4f4f4f

    exports:
      svg:     out/colorbrain_7b3f00.svg
      png:     out/colorbrain_7b3f00.png
      jpg:     out/colorbrain_7b3f00.jpg
      bmp:     out/colorbrain_7b3f00.bmp
      tiff:    out/colorbrain_7b3f00.tiff
      heic:    out/colorbrain_7b3f00.heic
      receipt: out/colorbrain_7b3f00.receipt.json

## CF Registry — Live

The CF Registry is publicly accessible:

    https://mauludsadiq.github.io/Colour-in-Fard/registry/index.json

Resolve any colour by CF ID:

    https://mauludsadiq.github.io/Colour-in-Fard/registry/by-id/CF-CC0000-791976F7.json

Resolve any colour by hex:

    https://mauludsadiq.github.io/Colour-in-Fard/registry/by-hex/cc/00/00.json

Browse by R-channel shard:

    https://mauludsadiq.github.io/Colour-in-Fard/registry/shards/cc.ndjson

CF-CC0000-791976F7 is not a local label.
It is a resolvable, verifiable colour identity.

## Web Viewer — Live

    https://mauludsadiq.github.io/Colour-in-Fard/viewer.html

Search by hex or name. Shows CF ID, LAB, LCH, WCAG contrast against white,
and live colour blindness simulations (protanopia, deuteranopia, tritanopia,
achromatopsia, and anomaly variants) for every colour, including ones not yet
in the K=20 registry.

## Lookup

Resolve any hex or CF ID to its full colour entry:

    fardrun run --program apps/lookup.fard --out out/run -- "#7B3F00"
    fardrun run --program apps/lookup.fard --out out/run -- "CF-7B3F00-EA262463"

CF ID verification is built in. A tampered hash is rejected:

    fardrun run --program apps/lookup.fard --out out/run -- "CF-7B3F00-00000000"
    error: CF ID mismatch -- expected CF-7B3F00-EA262463 for hex #7b3f00

## Why This Matters

Most colour tools are wrappers. They call native libraries, depend on system
colour profiles, or produce results that vary across environments.

Colour-in-Fard does not approximate. Every result is derived from first
principles in pure FARD:

    sRGB gamma expansion
    --> D65 illuminant matrix
    --> CIELAB cube root
    --> CIELCH cylindrical projection
    --> CIEDE2000 / CIE76 nearest-name

    sRGB gamma expansion
    --> LMS cone response matrix
    --> OKLab cube root
    --> OKLCH cylindrical projection

The math is in the repo. The receipts prove it ran. The outputs are identical
on any machine running the same FARD version.

At K=255 it covers 16,777,216 colours -- the entire 24-bit RGB space, every
colour a standard display can show. Each one has a stable CF identifier, a name,
relationships, and exports in six formats. No Pantone licence required. No native
colour engine. No trust required beyond the source.

## CF Colour Identity

Every colour has a stable, deterministic, human-readable identifier:

    CF-7B3F00-EA262463

Format: CF-<HEX6>-<LABHASH8>

    HEX6:     uppercase sRGB hex (the exact digital colour)
    LABHASH8: first 8 hex chars of SHA256 over CIELAB rounded to 3dp
              stable across naming/anchor changes
              only changes if D65 matrix or sRGB gamma constants change

16,777,216 CF IDs. One per 8-bit RGB value. Immutable. Public. Free.

## Receipts

Every output is reproducible and verifiable:

    {
      "kind": "colorbrain_explain",
      "naming_version": "1.0.0",
      "lab_version": "1.0.0",
      "identity_version": "CF-ID-1.0.0",
      "input_digest":  "sha256:...",
      "params_digest": "sha256:...",
      "output_digest": "sha256:..."
    }

Same hex + same naming table + same LAB constants = same receipt. Always.

## Receipt Verification Model

Two digest levels exist in this system:

**fard_run_digest** -- program-level. SHA256 of the source modules. Identical
across runs of the same program regardless of inputs. Use this to verify you
are running unmodified code.

**App receipts** -- per-run. Written to out/*.receipt.json by every app.
Binds inputs, outputs, CF IDs, naming version, and LAB version to specific
digests. Different inputs always produce different input_digest and
output_digest. This is the verification artifact for public claims.

Example contrast receipt:

    {
      "kind": "contrast",
      "inputs": {
        "fg_hex": "#7b3f00",
        "bg_hex": "#ffffff",
        "fg_cf_id": "CF-7B3F00-EA262463",
        "bg_cf_id": "CF-FFFFFF-2DD4EB92",
        "ratio": 8.22,
        "level": "AAA"
      },
      "input_digest":  "sha256:32893ba1...",
      "output_digest": "sha256:10eebac9...",
      "naming_version": "1.0.0",
      "lab_version": "1.0.0",
      "identity_version": "CF-ID-1.0.0"
    }

When making accessibility claims, cite the receipt file, not fard_run_digest.

## Export Formats

Every colour output is available in:

    SVG   -- scalable vector, opens in any browser
    PNG   -- lossless raster
    JPG   -- compressed raster
    BMP   -- uncompressed bitmap
    TIFF  -- print-ready raster
    HEIC  -- Apple high-efficiency
    PPM   -- ASCII pixel map, no dependencies
    JSON  -- full colour data, machine-readable
    CSS   -- custom properties, drop into any stylesheet
    NDJSON -- registry format, one CF entry per line

## Validation

- 182 tests across 23 suites, 0 failures
- 40/40 CSS named colour corpus matched
- All 6 Sharma 2005 canonical CIEDE2000 verification pairs pass exactly
- 15 perceptual boundary tests: grayscale axis, hue wraparound,
  adjacent colours, low-light, chroma boundary
- OKLab roundtrips verified for all primaries plus arbitrary colours

## Benchmarks

Measured on MacBook Pro, FARD v1.7.1 interpreter (pure eval, no native compile).

    Full RGB traversal (16.7M colours)   41m49s
    PPM export K=255 (171MB streamed)    41m49s
    CF Registry K=20 (9,261 entries)     11m39s
    Catalogue K=10 (1,331 colours)       1m6s
    Relationship sheet SVG               0.5s
    colorbrain explain (all 6 formats)   0.8s
    lookup by hex or CF-ID               0.5s
    contrast report                      0.5s
    colour blindness simulation          0.6s

See BENCHMARKS.md for notes.

## Apps

### colorbrain explain
Full colour profile: CF ID, name, family, character, LCH, LAB, HSV, RGB,
relationships, shades, tints, tones, exports in 6 formats, receipt.

    fardrun run --program apps/colorbrain.fard --out out/run -- explain "#7B3F00"

### lookup
Resolve a hex code or CF ID to its full colour entry. Verifies CF ID integrity.

    fardrun run --program apps/lookup.fard --out out/run -- "#7B3F00"
    fardrun run --program apps/lookup.fard --out out/run -- "CF-7B3F00-EA262463"

### contrast
WCAG 2.1 contrast report between two colours, with CF IDs and a per-run receipt.

    fardrun run --program apps/contrast.fard --out out/run -- "#7B3F00" "#ffffff"

### gradient
LAB, LCH, and RGB gradient interpolation between two colours, with SVG exports.
Demonstrates why LAB/LCH avoid the muddy midpoints of RGB interpolation.

    fardrun run --program apps/gradient.fard --out out/run -- "#ff0000" "#0000ff" 7

### simulate
Colour blindness simulation: protanopia, deuteranopia, tritanopia, achromatopsia,
and anomaly variants, with SVG/PNG export and receipt.

    fardrun run --program apps/simulate.fard --out out/run -- "#ff6600"

### registry / build_registry
Generate the CF registry as a sharded static site: by-hex, by-id, NDJSON shards,
search index, and receipts.

    fardrun run --program apps/build_registry.fard --out out/run -- 20
    fardrun run --program apps/build_search_index.fard --out out/run -- 20

### full_spectrum
Every colour in the RGB cube as a PPM file. At K=255: 16,777,216 colours, 171MB.

    fardrun run --program apps/full_spectrum.fard --out out/run -- 255

### query
Hex in, full JSON profile out, with receipt.

    fardrun run --program apps/query.fard --out out/run -- "#ff6600"

### catalogue
Full named colour catalogue as JSON + CSS + SVG for any K value.

    fardrun run --program apps/catalogue.fard --out out/run -- 20

### relations
SVG colour relationship sheet for any hex code.

    fardrun run --program apps/relations.fard --out out/run -- "#ff6600"

## Colour Science

CIELAB pipeline:

    RGB -- sRGB gamma expansion --> linear light
    linear light -- D65 matrix --> XYZ
    XYZ -- D65 illuminant, cube root --> LAB
    LAB -- cylindrical projection --> LCH

OKLab pipeline (Björn Ottosson, 2020):

    RGB -- sRGB gamma expansion --> linear light
    linear light -- LMS cone matrix --> LMS
    LMS -- cube root --> OKLab
    OKLab -- cylindrical projection --> OKLCH

Distance metrics:

    Delta-E CIE76:    Euclidean distance in LAB space
    Delta-E CIEDE2000: weighted distance correcting for hue rotation,
                       chroma compression, and lightness non-uniformity
                       (matches all 6 Sharma 2005 canonical pairs exactly)
    Delta-E OK:       Euclidean distance in OKLab space

Naming: 107 anchor colours (CSS named colours, neons, gray ladder,
violet-cast darks), nearest-match in LAB space via CIE76 or CIEDE2000.

All relationships operate in LCH space -- hue rotation is perceptually uniform.

## Architecture

    src/core/types.fard             -- RGB, HSV, LAB, LCH, quantizer types
    src/core/math.fard              -- abs, clamp, round, mod360, sq
    src/core/rgb_hsv.fard           -- RGB/HSV conversion
    src/core/rgb_lab.fard           -- RGB/XYZ/LAB/LCH, Delta-E CIE76
    src/core/delta_e2000.fard       -- CIEDE2000 (Sharma 2005)
    src/core/oklab.fard             -- OKLab/OKLCH (Ottosson 2020)
    src/core/cube.fard              -- cube palette enumeration
    src/core/simplex.fard           -- simplex palette enumeration
    src/core/nearest.fard           -- nearest palette colour, RGB distance
    src/core/quantizer_simplex.fard -- simplex quantizer, full RGB cube coverage
    src/core/color_name.fard        -- 107 anchor colours, LAB nearest-name (CIE76 + DE2000)
    src/core/color_relations.fard   -- complement, analogous, triadic, shades, tints, tones
    src/core/gradient.fard          -- LAB/LCH/RGB gradient interpolation
    src/core/colorblind.fard        -- protanopia, deuteranopia, tritanopia, achromatopsia
    src/core/wcag.fard              -- relative luminance, contrast ratio, AA/AAA
    src/core/receipt.fard           -- input/output/params digest, reproducibility
    src/core/cf_id.fard             -- CF-ID v1.0.0: stable colour identity
    src/render/ppm.fard             -- collapsed image algebra, PPM encoder
    src/render/grid.fard            -- palette grid layout
    src/render/strip.fard           -- horizontal colour strip
    src/render/swatch.fard          -- swatch row renderer
    src/render/svg.fard             -- SVG swatch grid
    src/render/image_export.fard    -- PNG/JPG/BMP/TIFF/HEIC via std/png + sips
    src/export/json_catalogue.fard  -- hex, name, RGB, HSV, LAB, LCH per colour
    src/export/css.fard             -- CSS custom properties
    apps/colorbrain.fard            -- flagship: explain any colour, all formats
    apps/lookup.fard                -- resolve hex or CF-ID to full entry
    apps/contrast.fard              -- WCAG contrast report with receipt
    apps/gradient.fard              -- LAB/LCH/RGB gradient with SVG export
    apps/simulate.fard              -- colour blindness simulation
    apps/build_registry.fard        -- CF registry static site generator
    apps/build_search_index.fard    -- registry search index generator
    apps/full_spectrum.fard         -- generate all 16.7M colours
    apps/query.fard                 -- hex in, full JSON profile out
    apps/catalogue.fard             -- JSON + CSS + SVG catalogue
    apps/relations.fard             -- SVG relationship sheet
    docs/viewer.html                -- live web viewer (registry + simulations)
    docs/registry/                  -- CF Registry v1.0.0 (9,261 entries, K=20)

## Roadmap

    v1.0.0  Complete -- perceptual engine, LAB/LCH, naming, exports, receipts
    v1.1.0  Complete -- CF-ID v1.0.0, registry generator, multi-format export
    v1.2.0  Complete -- registry lookup, CF-ID verification
    v1.3.0  Complete -- WCAG contrast, receipt model clarified
    v1.4.0  Complete -- neon/gray naming, LAB/LCH gradient interpolation
    v1.5.0  Complete -- CF Registry v1.0.0 live (K=20, 9,261 colours)
    v1.8.0  Complete -- CF Registry K=100 (1,030,301 colours, shard-only layout)
    v1.5.1  Complete -- web viewer, name search, search index
    v1.6.0  Complete -- colour blindness simulation
    v1.7.0  Complete -- CIEDE2000 (Sharma-verified), OKLab/OKLCH

    v1.9.0  Planned  -- CMYK conversion, ICC profile support
    v2.0.0  Planned  -- image-to-palette extraction with CF IDs

## Built with FARD v1.7.1

https://github.com/mauludsadiq/FARD
