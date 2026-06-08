# Colour in FARD

A deterministic perceptual colour engine: full RGB universe, LAB naming,
LCH relationships, multi-format exports, receiptable outputs.

Written entirely in FARD. No native dependencies. No FFI. No external libraries.

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

## What it does

- Produces all 16,777,216 colours in the 24-bit RGB space
- Names every colour using perceptual LAB-space Delta-E nearest-match
- Computes colour relationships in LCH space -- complement, analogous, triadic,
  split-complementary, tetradic, shades, tints, tones
- Exports to PPM, SVG, JSON catalogue, and CSS custom properties
- Produces cryptographic receipts over inputs, naming table, and output bytes
- Validated against the 140 CSS named colours -- 40/40 family matches

## Colour Science

All relationships and naming operate in CIELAB (L*a*b*) and LCH colour spaces.
Hue rotation, shade/tint/tone generation, and colour distance are perceptually
uniform -- calibrated to human vision, not RGB arithmetic.

    RGB -- sRGB gamma expansion --> linear light
    linear light -- D65 matrix --> XYZ
    XYZ -- D65 illuminant, cube root --> LAB
    LAB -- cylindrical projection --> LCH (L=lightness, C=chroma, H=hue)

    Delta-E (CIE76): perceptual distance between any two colours
    Nearest name: 87 anchor colours, LAB-space nearest-match lookup

## Receipts

Every output is reproducible and verifiable. Each run produces a receipt:

    {
      "kind": "colorbrain_explain",
      "naming_version": "1.0.0",
      "lab_version": "1.0.0",
      "input_digest":  "sha256:...",
      "params_digest": "sha256:...",
      "output_digest": "sha256:..."
    }

Same hex + same naming table + same LAB constants = same receipt. Always.

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

## Tests

81 tests across 11 suites, all passing.

    fardrun test --program tests/smoke_loop.fard
    fardrun test --program tests/test_core.fard
    fardrun test --program tests/test_expand.fard
    fardrun test --program tests/test_palette_colors.fard
    fardrun test --program tests/test_render.fard
    fardrun test --program tests/test_row_runs.fard
    fardrun test --program tests/test_lab_roundtrip.fard
    fardrun test --program tests/test_color_name.fard
    fardrun test --program tests/test_color_relations.fard
    fardrun test --program tests/test_exports.fard
    fardrun test --program tests/test_receipt.fard
    fardrun test --program tests/test_perceptual.fard

Validation corpus:

    fardrun run --program tests/corpus_css.fard --out out/corpus -- 40/40 CSS named colours

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

## Performance

The renderer uses a collapsed image algebra: images are lists of solid rectangles,
expanded once at the PPM emit boundary. Construction is O(m) where m = palette cells,
not O(WH) pixels.

Full spectrum output (K=255, 16.7M colours) streams in chunks of 1000 to avoid
building a single 171MB string in memory.

## Built with FARD v1.7.1

https://github.com/mauludsadiq/FARD
