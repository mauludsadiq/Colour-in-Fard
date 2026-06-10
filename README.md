# Colour in FARD

A deterministic perceptual colour engine and open colour standard. Every colour
result is reproducible, named, related, exported, and cryptographically receipted.

Full 24-bit RGB universe. CIELAB, CIELCH, CIEDE2000, OKLab, OKLCH, CMYK.
Image-to-palette extraction. Multi-format exports. Written entirely in FARD.
No FFI. No native dependencies. No external libraries.

**6,337 lines of FARD. 237 tests, 28 suites, 0 failures.**
**Plus: Python reference implementation (cfid_py), 28/28 tests passing.**
**CF Protocol Specification v1.0.0 published — CF-ID is language-independent.**

---

## Live

   Registry:  https://mauludsadiq.github.io/Colour-in-Fard/registry/index.json
   Viewer:    https://mauludsadiq.github.io/Colour-in-Fard/viewer.html
   PyPI:      https://pypi.org/project/cfcolor/
   Repo:      https://github.com/mauludsadiq/Colour-in-Fard

---

## Quickstart

   fardrun run --program apps/colorbrain.fard --out out/run -- explain "#7B3F00"

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
     svg, png, jpg, bmp, tiff, heic, receipt

Extract a palette from any image:

   fardrun run --program apps/palette.fard --out out/run -- photo.jpg 6

   1. #9c96f8  electric blue   CF-9C96F8-D5DA0DD2  L=66.4  C=53.9
   2. #96c929  yellow green    CF-96C929-876A48B0  L=75.1  C=77.8
   3. #f26454  terracotta      CF-F26454-FB3A93D6  L=60.5  C=65.1
   4. #3b6e22  pine            CF-3B6E22-7A7ED138  L=41.5  C=47.8
   5. #6275fd  sapphire        CF-6275FD-ECFB7B37  L=54.4  C=78.0
   6. #d38ab7  plum            CF-D38AB7-EAA0FE7E  L=66.2  C=36.4

Check WCAG contrast:

   fardrun run --program apps/contrast.fard --out out/run -- "#7B3F00" "#ffffff"

   contrast ratio: 8.22:1  |  wcag level: AAA

Simulate colour blindness:

   fardrun run --program apps/simulate.fard --out out/run -- "#ff6600"

---

## CF Registry

9,261 colours at K=20 (individual JSON files, by-hex and by-id):

   https://mauludsadiq.github.io/Colour-in-Fard/registry/by-id/CF-CC0000-791976F7.json
   https://mauludsadiq.github.io/Colour-in-Fard/registry/by-hex/cc/00/00.json

1,030,301 colours at K=100 (NDJSON shards by R channel):

   https://mauludsadiq.github.io/Colour-in-Fard/registry/shards/cc.ndjson

CF-CC0000-791976F7 is not a local label.
It is a resolvable, verifiable colour identity.

---

## Why This Matters

Most colour tools are wrappers. They call native libraries, depend on system
colour profiles, or produce results that vary across environments.

Colour-in-FARD derives every result from first principles:

   sRGB gamma expansion --> D65 matrix --> CIELAB cube root --> CIELCH
   sRGB gamma expansion --> LMS matrix --> OKLab cube root --> OKLCH
   CIELAB --> CIEDE2000 weighted distance (Sharma 2005, 6/6 canonical pairs)
   RGB --> device-independent CMYK (GCR, TAC)

The math is in the repo. The receipts prove it ran. The outputs are identical
on any machine running the same FARD version.

---

## CF Colour Identity

   CF-7B3F00-EA262463

Format: CF-<HEX6>-<LABHASH8>

   HEX6:     uppercase sRGB hex
   LABHASH8: first 8 hex chars of SHA256 over CIELAB rounded to 3dp
             stable across naming changes
             only changes if D65 matrix or sRGB gamma constants change

16,777,216 CF IDs. One per 8-bit RGB value. Immutable. Public. Free.

---

## Receipt Verification

Two digest levels:

**fard_run_digest** -- program-level hash. Same for all runs of the same program.
Use to verify you are running unmodified source.

**App receipts** -- per-run. Written to out/*.receipt.json by every app.
Binds inputs, outputs, CF IDs, and version constants to specific SHA256 digests.
Different inputs always produce different input_digest and output_digest.
Cite receipts for public claims, not fard_run_digest.

---

## Export Formats

   SVG, PNG, JPG, BMP, TIFF, HEIC  -- raster and vector
   PPM                              -- ASCII pixel map, no dependencies
   JSON, CSS, NDJSON                -- machine-readable
   CMYK percentages                 -- print workflows

---

## Validation

- 202 tests, 26 suites, 0 failures
- 40/40 CSS named colour corpus matched
- All 6 Sharma 2005 CIEDE2000 canonical pairs pass exactly
- OKLab roundtrips verified for all primaries
- CMYK roundtrip verified for primary and neutral colours
- Native BMP reader verified against sips-generated files
- ICC parser verified against real macOS sRGB and Display P3 profiles (header, tag table, XYZ matrix, TRC curves, profile-to-profile roundtrips)
- Spectral pipeline verified: flat 100% reflectance -> LAB L~100, white sRGB; metamerism demonstrated (distinct CF-Spectral-IDs for visually-identical curves)

---

## Benchmarks

MacBook Pro, FARD v1.7.1 interpreter.

   Full RGB traversal (16.7M colours)     41m49s
   CF Registry K=100 (1,030,301 entries)  ~85 min
   CF Registry K=20 (9,261 entries)       11m39s
   Image palette extraction (64x64 → k=6) ~45s
   colorbrain explain (all 6 formats)     0.8s
   contrast report                        0.5s
   colour blindness simulation            0.6s
   lookup by hex or CF-ID                 0.5s

---

## Apps

| App | Description |
|-----|-------------|
| `apps/colorbrain.fard explain <hex>` | Full colour profile: CF ID, name, LCH, LAB, HSV, RGB, relationships, exports |
| `apps/lookup.fard <hex\|CF-ID>` | Resolve hex or CF ID to full entry, with tamper detection |
| `apps/contrast.fard <hex1> <hex2>` | WCAG 2.1 contrast report with CF IDs and receipt |
| `apps/simulate.fard <hex>` | Colour blindness simulation: 7 types, SVG/PNG export |
| `apps/gradient.fard <hex1> <hex2> [n]` | LAB, LCH, RGB gradient — demonstrates why LAB matters |
| `apps/cmyk.fard <hex>` | Device-independent CMYK with GCR, TAC, print warnings |
| `apps/icc_info.fard <profile.icc>` | Dump ICC profile: header, tags, matrix, TRC curves |
| `apps/icc_convert.fard <hex> <src.icc> <dst.icc>` | Convert colour between ICC profiles via XYZ PCS, with CF IDs and receipt |
| `apps/spectral.fard <reflectance-csv\|flat-value>` | Spectral reflectance (380-730nm, 10nm) -> XYZ/LAB/sRGB, CF-ID, CF-Spectral-ID |
| `apps/palette.fard <image> [k]` | Extract k dominant colours from any image via k-means in LAB |
| `apps/build_registry.fard [k]` | Generate CF registry: by-hex, by-id, shards, receipts |
| `apps/build_search_index.fard [k]` | Generate registry search index |
| `apps/full_spectrum.fard [k]` | All colours in RGB cube as PPM |
| `apps/query.fard <hex>` | Hex in, full JSON profile out |
| `apps/catalogue.fard [k]` | JSON + CSS + SVG colour catalogue |
| `apps/relations.fard <hex>` | SVG colour relationship sheet |

---

## Colour Science

**CIELAB pipeline**

   RGB → linear light (sRGB gamma) → XYZ (D65) → LAB (cube root)
   LAB → LCH (cylindrical)
   Distance: CIE76 (Euclidean LAB) or CIEDE2000 (weighted, Sharma 2005)

**OKLab pipeline** (Björn Ottosson, 2020)

   RGB → linear light → LMS (cone response) → OKLab (cube root)
   OKLab → OKLCH (cylindrical)
   Distance: Delta-E OK (Euclidean OKLab)

**CMYK** (device-independent)

   RGB → linear light → CMY → K via GCR
   Total Ink Coverage (TAC) with press limits

**Naming**

   107 anchor colours — CSS named colours, neons, gray ladder, violet darks
   Nearest match in CIELAB via CIE76 or CIEDE2000

**Colour blindness** (Vienot 1999, Brettel 1997)

   Protanopia, deuteranopia, tritanopia, achromatopsia
   + anomaly variants (50% severity)

**Image → Palette**

   sips resize → native FARD BMP reader (fs.read_bytes)
   K-means clustering in CIELAB space
   Each cluster centroid assigned CF ID, name, LCH, WCAG contrast

---

## Architecture

   src/core/types.fard             -- RGB, HSV, LAB, LCH types
   src/core/math.fard              -- abs, clamp, mod360
   src/core/rgb_hsv.fard           -- RGB/HSV
   src/core/rgb_lab.fard           -- RGB/XYZ/LAB/LCH, Delta-E CIE76
   src/core/delta_e2000.fard       -- CIEDE2000 (Sharma 2005)
   src/core/oklab.fard             -- OKLab/OKLCH (Ottosson 2020)
   src/core/rgb_cmyk.fard          -- CMYK, GCR, TAC
   src/core/bmp_read.fard          -- native BMP parser (fs.read_bytes)
   src/core/image_read.fard        -- image → pixels via sips + BMP
   src/core/kmeans.fard            -- k-means clustering in LAB space
   src/core/cube.fard              -- cube palette enumeration
   src/core/nearest.fard           -- nearest colour, RGB distance
   src/core/color_name.fard        -- 107 anchors, LAB nearest-name
   src/core/color_relations.fard   -- complement, analogous, triadic, shades
   src/core/gradient.fard          -- LAB/LCH/RGB gradient interpolation
   src/core/colorblind.fard        -- colour blindness simulation
   src/core/wcag.fard              -- WCAG contrast, AA/AAA
   src/core/receipt.fard           -- SHA256 receipt system
   src/core/cf_id.fard             -- CF-ID v1.0.0
   src/render/svg.fard             -- SVG swatch grid
   src/render/image_export.fard    -- PNG/JPG/BMP/TIFF/HEIC via sips
   src/export/json_catalogue.fard  -- JSON colour data
   src/export/css.fard             -- CSS custom properties
   docs/viewer.html                -- live web viewer
   docs/registry/                  -- CF Registry (K=20 + K=100)

---

## Roadmap

   v1.0.0   Complete -- perceptual engine, LAB/LCH, naming, receipts
   v1.1.0   Complete -- CF-ID v1.0.0, registry generator, multi-format export
   v1.2.0   Complete -- registry lookup, CF-ID verification
   v1.3.0   Complete -- WCAG contrast, receipt model
   v1.4.0   Complete -- neon/gray naming, LAB/LCH gradients
   v1.5.0   Complete -- CF Registry live (K=20, 9,261 colours)
   v1.6.0   Complete -- colour blindness simulation
   v1.7.0   Complete -- CIEDE2000 (Sharma-verified), OKLab/OKLCH
   v1.8.0   Complete -- CF Registry K=100 (1,030,301 colours)
   v1.9.0   Complete -- CMYK conversion
   v1.10.0  Complete -- Image→Palette (native BMP reader, k-means LAB)
    v1.11.0  Complete -- CF Protocol Specification v1.0 (SPEC.md)
    v2.0.0   Complete -- Python reference implementation (cfid_py), 28/28 tests, CF-ID verified language-independent
   v2.1.0   Complete -- pip install cfcolor (PyPI publish, live)
    v2.2.0   Complete -- Figma plugin (read-only CF-ID lookup, registry name, WCAG contrast)
    v3.0.0   Complete -- ICC profile support (the print bridge)
    v3.1.0   Complete -- Spectral input / CF-Spectral-ID

---

## Built with FARD v1.7.1

https://github.com/mauludsadiq/FARD

`fs.read_bytes` was added to the FARD runtime as part of this project
to enable native binary file parsing without FFI.
