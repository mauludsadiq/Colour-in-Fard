# Colour in FARD

A colour quantization and palette rendering system written entirely in FARD.

## What it does

Generates palette grids, hue strips, and colour swatches from simplex and cube
colour spaces. Every output is a verified PPM image with a cryptographic receipt.

## Geometry

**Simplex palette** -- { (r,g,b) in N^3 : r+g+b <= K }
The K=5 simplex has 56 colours. Each is a proportional mix of red, green, and blue
at integer steps of 1/K, living on the boundary of the RGB simplex.

**Cube palette** -- { (r,g,b) : 0 <= r,g,b <= K }
Full grid of K^3 colours. Used for hue strips and cube grids.

## Performance

Naive pixel rendering in a functional interpreter is O(n^2) due to immutable
list append. This project uses a collapsed image algebra instead.

The key insight: represent the image as m solid rectangles, expand once at the
PPM emit boundary. Construction scales with palette cells, not pixels.

For K=5 (56 colours, 89600 pixels):
- Per-pixel list.append: O(n^2), 4+ minutes
- list.build per pixel: O(n), ~8 seconds
- Collapsed rectangles: O(m=56), 1.7 seconds

## Architecture

src/core/simplex.fard  -- simplex enumeration, colour projection
src/core/rgb_hsv.fard  -- RGB/HSV conversion
src/render/ppm.fard    -- collapsed image algebra, PPM encoder
src/render/grid.fard   -- palette grid layout
apps/                  -- entry points for each output type
tests/                 -- conformance tests

## Output format

All renders produce ASCII PPM files. No native image libraries required.
The renderer is pure FARD -- no Rust, no FFI, no external dependencies.

## Built with FARD v1.6.0

https://github.com/mauludsadiq/FARD
