# CF-ID File Format Embedding

CF-ID is small enough (18 characters) to embed directly in common file
formats, alongside the colour itself, so the identity travels with the
asset. This document gives concrete, working examples for SVG, PNG,
CSS, and design tokens.

## SVG

Two complementary approaches, both shown in docs/embedding/example.svg:

- A `data-cf-id` attribute on the relevant element -- simple, greppable,
  works with any SVG tooling that preserves data-* attributes.
- A `<metadata>` block with a namespaced `cf:colour` element -- more
  structured, survives most SVG optimisers (which typically preserve
  `<metadata>`), and can carry additional fields (hex, identity version)
  without cluttering the visual elements.

    <svg ... data-cf-id="CF-7B3F00-EA262463">
      <metadata>
        <cf:colour xmlns:cf="https://github.com/mauludsadiq/Colour-in-Fard"
                    cf:id="CF-7B3F00-EA262463" cf:hex="#7B3F00"/>
      </metadata>
      <rect width="100" height="100" fill="#7B3F00"/>
    </svg>

## PNG

CF-ID can be embedded as a tEXt chunk (keyword "CF-ID"), inserted after
the IHDR chunk -- the standard place for ancillary chunks per the PNG
specification (ISO/IEC 15948). This is implemented in
apps/png_embed.fard:

    fardrun run --program apps/png_embed.fard --out out/run -- \
      input.png "#7B3F00" output.png

    embedded: CF-7B3F00-EA262463
      tEXt chunk: keyword=CF-ID, 24 bytes of data
      written: output.png

The CF-ID is computed from the hex you supply (e.g. a dominant colour
from apps/palette.fard), not extracted from the image's pixels -- this
lets a CF-ID act as a caption/identity for an image's brand colour,
independent of the image's full pixel content. The implementation
includes its own CRC-32 (verified against the standard "123456789" test
vector and against zlib for a real PNG IHDR chunk), so the output is a
byte-for-byte valid PNG: `file output.png` reports a normal PNG, and
every chunk's CRC (including the new tEXt chunk) is valid.

Reading it back (any PNG tool that exposes tEXt chunks, e.g. Python's
Pillow `Image.open(...).text`, or `exiftool`) will show:

    CF-ID: CF-7B3F00-EA262463

## CSS Custom Properties

A CF-ID alongside a CSS custom property, as a comment or a string-valued
companion property (docs/embedding/example.css):

    :root {
      --brand-primary: #7B3F00;
      /* CF-ID: CF-7B3F00-EA262463 */
      --brand-primary-cf-id: "CF-7B3F00-EA262463";
    }

The companion custom property is queryable from JS
(`getComputedStyle(...).getPropertyValue('--brand-primary-cf-id')`)
without parsing comments.

## Design Tokens (W3C Design Tokens Community Group format)

The W3C Design Tokens format supports `$extensions` for tool-specific
metadata without breaking consumers that don't recognise it
(docs/embedding/tokens.json):

    {
      "color": {
        "brand": {
          "primary": {
            "$type": "color",
            "$value": "#7B3F00",
            "$extensions": {
              "io.github.mauludsadiq.colour-in-fard": {
                "cfId": "CF-7B3F00-EA262463",
                "identityVersion": "CF-ID-1.0.0"
              }
            }
          }
        }
      }
    }

Any consumer of the token (a build tool generating CSS, Swift, Android
resources, etc.) that doesn't know about `$extensions` simply ignores it
and uses `$value` as normal; a CF-ID-aware tool can additionally verify
that `$value` and `cfId` are consistent (recompute CF-ID from `$value`
and compare).

## General principle

In every format above, the embedding is additive and non-breaking: a
consumer that doesn't know about CF-ID sees a normal SVG/PNG/CSS/JSON
file. A CF-ID-aware consumer gets a free, verifiable cross-check: if the
embedded CF-ID doesn't match `from_hex(the colour value)`, something has
been edited inconsistently (e.g. the colour changed but the metadata
wasn't updated) -- the same tamper-evidence property as CF Colour Claims,
applied to file formats directly.
