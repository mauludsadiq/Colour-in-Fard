# CF Colour ID -- Figma Plugin

Read-only Figma plugin. Select a shape with a solid fill or stroke and see
its CF Colour Identity: CF-ID, hex, RGB, LCH, nearest name, and WCAG contrast
ratios against white and black.

## Install (development)

1. Open Figma desktop app
2. Menu -> Plugins -> Development -> Import plugin from manifest...
3. Select `figma-plugin/manifest.json` from this repo

## What it does

- Reads the fill (or stroke) colour of the selected node
- Computes the CF-ID client-side using the algorithm in SPEC.md
- Looks up the colour in the public CF Registry (mauludsadiq.github.io)
- Shows nearest name, LCH values, and WCAG AA contrast against white/black
- "Copy CF-ID" button copies the identifier to clipboard

## Specification

https://github.com/mauludsadiq/Colour-in-Fard/blob/main/SPEC.md

## Network access

This plugin only contacts `mauludsadiq.github.io` to resolve colour names
from the public CF Registry. CF-ID computation itself is fully offline.
