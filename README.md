# Colour in FARD

Colour-in-Fard is a deterministic perceptual colour engine where every colour
result is reproducible, named, related, exported, and cryptographically receipted.

Full 24-bit RGB universe. LAB naming. LCH relationships. Multi-format exports.
Written entirely in FARD. No FFI. No native dependencies. No external libraries.

## Quickstart

    fardrun run --program apps/colorbrain.fard --out out/run -- explain "#7B3F00"

Output:

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
      svg swatch: out/colorbrain_7b3f00.svg
      receipt:    out/colorbrain_7b3f00.receipt.json

## Why This Matters

Most colour tools are wrappers. They call native libraries, depend on system
colour profiles, or produce results that vary across environments.

Colour-in-Fard does not approximate. Every result is derived from first
principles in pure FARD:

    sRGB gamma expansion
    --> D65 illuminant matrix
    --> CIELAB cube root
    --> LCH cylindrical projection
    --> Delta-E CIE76 nearest-name

The math is in the repo. The receipts prove it ran. The outputs are identical
on any machine running the same FARD version.

At K=255 it covers 16,777,216 colours -- the entire 24-bit RGB space, every
colour a standard display can show. Each one is named, related, and exportable.
No Pantone licence required. No native colour engine. No trust required beyond
the source.

This is what a colour system looks like when built from first principles.

## Receipts

Every output is reproducible and verifiable:

    {
      "kind": "colorbrain_explain",
      "naming_version": "1.0.0",
      "lab_version": "1.0.0",
      "input_digest":  "sha256:...",
      "params_digest": "sha256:...",
      "output_digest": "sha256:..."
    }

Same hex + same naming table + same LAB constants = same receipt. Always.

## Validation

- 81 tests across 12 suites, all passing
- 40/40 CSS named colour corpus matched
- 15 perceptual boundary tests: grayscale axis, hue wraparound,
  adjacent colours, low-light, chroma boundary

## Benchmarks

Measured on MacBook Pro, FARD v1.7.1 interpreter (pure eval, no native compile).

    Full RGB traversal (16.7M colours)   41m49s
    PPM export K=255 (171MB streamed)    41m49s
    Catalogue K=10 (1,331 colours)       1m6s
    Relationship sheet SVG               0.5s
    colorbrain explain                   0.8s

See BENCHMARKS.md for notes. The --compile-linked flag would reduce these
significantly. All timings are interpreter-only.

## Apps

### colorbrain explain
Full colour profile: name, family, character, LCH, LAB, HSV, RGB,
relationships, shades, tints, tones, SVG export, receipt.

    fardrun run --program apps/colorbrain.fard --out out/run -- explain "#7B3F00"

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

    RGB -- sRGB gamma expansion --> linear light
    linear light -- D65 matrix --> XYZ
    XYZ -- D65 illuminant, cube root --> LAB
    LAB -- cylindrical projection --> LCH

    Delta-E (CIE76): perceptual distance between any two colours
    Nearest name: 87 anchor colours, LAB-space nearest-match

All relationships operate in LCH space. Hue rotation is perceptually uniform.

## Architecture

    src/core/types.fard             -- RGB, HSV, LAB, LCH, quantizer types
    src/core/math.fard              -- abs, clamp, round, mod360, sq
    src/core/rgb_hsv.fard           -- RGB/HSV conversion
    src/core/rgb_lab.fard           -- RGB/XYZ/LAB/LCH, Delta-E CIE76
    src/core/cube.fard              -- cube palette enumeration
    src/core/simplex.fard           -- simplex palette enumeration
    src/core/nearest.fard           -- nearest palette colour, RGB distance
    src/core/quantizer_simplex.fard -- simplex quantizer, full RGB cube coverage
    src/core/color_name.fard        -- 87 anchor colours, LAB nearest-name
    src/core/color_relations.fard   -- complement, analogous, triadic, shades, tints, tones
    src/core/receipt.fard           -- input/output/params digest, reproducibility
    src/render/ppm.fard             -- collapsed image algebra, PPM encoder
    src/render/grid.fard            -- palette grid layout
    src/render/strip.fard           -- horizontal colour strip
    src/render/swatch.fard          -- swatch row renderer
    src/render/svg.fard             -- SVG swatch grid
    src/export/json_catalogue.fard  -- hex, name, RGB, HSV, LAB, LCH per colour
    src/export/css.fard             -- CSS custom properties
    apps/colorbrain.fard            -- flagship: explain any colour
    apps/full_spectrum.fard         -- generate all 16.7M colours
    apps/query.fard                 -- hex in, full JSON profile out
    apps/catalogue.fard             -- JSON + CSS + SVG catalogue
    apps/relations.fard             -- SVG relationship sheet

## Gallery

See docs/index.html for rendered examples: explain output, relationship sheets,
palette grids, receipt verification, and benchmarks.

## Built with FARD v1.7.1

https://github.com/mauludsadiq/FARD
