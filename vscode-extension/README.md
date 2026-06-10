# CF Colour ID -- VS Code Extension

Hover over any hex colour (#fff, #ffffff, #FF0000, etc.) anywhere in any
file to see its CF Colour Identity:

- **CF-ID** -- a stable, deterministic identity computed from the colour's
  CIELAB values (CF-ID-1.0.0)
- **LAB / LCH** values
- **WCAG contrast ratios** against white and black, with AA pass/fail

All computation is offline and instant -- no network requests, no API keys.
The algorithm matches the CF Colour Protocol specification exactly:

https://github.com/mauludsadiq/Colour-in-Fard/blob/main/SPEC.md

## Why CF-ID in your editor

A hex code like `#7B3F00` is just six characters -- it doesn't tell you
anything about the colour itself. Hovering shows you immediately:

    CF-7B3F00-EA262463
    LAB  L=33.493 a=22.291 b=43.796
    LCH  L=33.493 C=49.119 H=63.025
    contrast on white: 8.22:1 (AA pass)
    contrast on black: 2.55:1 (fail)

This is useful for design systems, accessibility audits, and anyone working
with colour values in CSS, design tokens, or code.

## Install (development)

1. Clone this repo
2. Open `vscode-extension/` in VS Code
3. Press F5 to launch an Extension Development Host
4. Open any file with a hex colour and hover over it

## Specification

This extension implements CF-ID-1.0.0 exactly as defined in SPEC.md,
including FARD's specific round3 truncation behaviour, so CF-IDs computed
here match the FARD reference implementation and the Python (`cfcolor`)
package exactly.

## Scope

CF-ID is defined for 24-bit sRGB (#rrggbb / #rgb forms). 4- and 8-digit
hex (with alpha) are not given a CF-ID, since alpha is outside the CF-ID
specification.
