# color_quant_k_fard

Pure-FARD reconstruction of the color quantization repo.

## Geometry split

### Simplex palette
Palette:
{ (r,g,b) in N^3 : r+g+b <= K }

Used by:
- quantize_demo
- quantize_image_simplex
- k_palette_grid
- k_hue_swatches_simplex
- k_hue_report_simplex
- enumerate_k5_simplex

### Cube palette
Palette:
{ (r,g,b) : 0<=r,g,b<=K }

Used by:
- k_hue_strip_cube
- k_cube_palette_grid

## Output format

Canonical renderer writes PPM images.
That keeps the system fully FARD and file-format transparent.

If a PNG adapter is later desired, only the render backend changes.
All geometry and quantization code remains identical.
