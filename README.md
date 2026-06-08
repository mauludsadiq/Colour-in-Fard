# Colour in FARD

A complete colour system written entirely in FARD. Generates, names, and relates
every colour viewable by the human eye.

## What it does

- Produces all 16,777,216 colours in the 24-bit RGB space
- Names every colour using perceptual LAB-space nearest-match lookup
- Computes colour relationships -- complement, analogous, triadic, split-complementary, tetradic
- Generates shades, tints, and tones for any input colour
- Exports to PPM, SVG, JSON catalogue, and CSS custom properties

## Geometry

Simplex palette -- { (r,g,b) in N^3 : r+g+b <= K }
Integer steps of 1/K along the RGB simplex boundary. Used for palette quantization.

Cube palette -- { (r,g,b) : 0 <= r,g,b <= K }
Full K^3 grid. At K=255 this is every 8-bit RGB colour -- 16,777,216 total.

## Colour Science

All relationships and naming operate in CIELAB (L*a*b*) and LCH colour spaces,
not RGB or HSV. This means hue rotation, shade/tint/tone generation, and colour
distance are perceptually uniform -- the way the human eye actually works.

- RGB to XYZ to LAB: D65 illuminant, sRGB gamma expansion
- LAB to LCH: cylindrical representation, hue in degrees
- Delta-E (CIE76): perceptual distance between any two colours
- Nearest name: 85 anchor colours, LAB-space nearest-match

## Apps

### full_spectrum
Generates every colour in the RGB cube as a PPM file.

   fardrun run --program apps/full_spectrum.fard --out out/run -- 255

Produces out/full_spectrum_K255.ppm -- 16,777,216 colours, 171MB.

### query
Takes a hex code and returns a full colour profile plus relationships.

   fardrun run --program apps/query.fard --out out/run -- "#ff6600"

Output: hex, name, RGB, HSV, LAB, LCH, complement, triadic, analogous, shades, tints.

### catalogue
Generates a full named colour catalogue for any K value as JSON, CSS, and SVG.

   fardrun run --program apps/catalogue.fard --out out/run -- 20

Produces out/catalogue_K20.json, out/catalogue_K20.css, out/catalogue_K20.svg.

### relations
Generates an SVG colour relationship sheet for any hex code.

   fardrun run --program apps/relations.fard --out out/run -- "#ff6600"

Produces out/relations_ff6600.svg -- base, complement, analogous, triadic,
split-complementary, shades, tints, tones.

## Performance

Naive pixel rendering in a functional interpreter is O(n^2) due to immutable
list append. This project uses a collapsed image algebra instead.

The key insight: represent the image as m solid rectangles, expand once at the
PPM emit boundary. Construction scales with palette cells, not pixels.

For K=5 (56 colours, 89600 pixels):
- Per-pixel list.append: O(n^2), 4+ minutes
- list.build per pixel: O(n), ~8 seconds
- Collapsed rectangles: O(m=56), 1.7 seconds

For K=255 (16,777,216 colours), output is streamed in chunks of 1000 pixels
to avoid building a single giant string in memory.

## Architecture

   src/core/types.fard            -- RGB, HSV, LAB, LCH, quantizer types
   src/core/math.fard             -- abs, clamp, round, mod360, sq
   src/core/rgb_hsv.fard          -- RGB/HSV conversion
   src/core/rgb_lab.fard          -- RGB/XYZ/LAB/LCH conversion, Delta-E
   src/core/cube.fard             -- cube palette enumeration
   src/core/simplex.fard          -- simplex palette enumeration
   src/core/nearest.fard          -- nearest palette colour by RGB distance
   src/core/quantizer_simplex.fard -- simplex quantizer with full RGB coverage
   src/core/color_name.fard       -- 85 named colours, LAB nearest-name lookup
   src/core/color_relations.fard  -- complement, analogous, triadic, shades, tints, tones
   src/render/ppm.fard            -- collapsed image algebra, PPM encoder
   src/render/grid.fard           -- palette grid layout
   src/render/strip.fard          -- horizontal colour strip
   src/render/swatch.fard         -- swatch row renderer
   src/render/svg.fard            -- SVG swatch grid renderer
   src/export/json_catalogue.fard -- hex, name, RGB, HSV, LAB, LCH per colour
   src/export/css.fard            -- CSS custom properties export
   apps/full_spectrum.fard        -- generate all 16.7M colours
   apps/query.fard                -- hex in, full profile out
   apps/catalogue.fard            -- generate JSON + CSS + SVG catalogue
   apps/relations.fard            -- generate SVG relationship sheet
   apps/k_palette_grid.fard       -- simplex palette grid
   apps/k_cube_palette_grid.fard  -- cube palette grid sorted by hue
   apps/k_hue_strip_cube.fard     -- hue strip from cube palette
   apps/k_hue_swatches_simplex.fard -- hue swatches from simplex palette

## Output formats

- PPM: ASCII pixel map, no dependencies
- SVG: scalable vector, opens in any browser
- JSON: full colour data, machine-readable
- CSS: custom properties, drop into any stylesheet

## Tests

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

66 tests, all passing.

## Built with FARD v1.7.1

https://github.com/mauludsadiq/FARD
