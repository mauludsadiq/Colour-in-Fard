# CF Colour Protocol — Specification v1.0.0

**Status:** Draft
**Date:** 2026-06-10
**Repo:** https://github.com/mauludsadiq/Colour-in-Fard

---

## Abstract

The CF Colour Protocol defines a system for stable, deterministic, verifiable
colour identity. Every 8-bit sRGB colour has exactly one CF ID. That ID is
computable from the colour's hex value alone, requires no central authority,
and resolves to a public URL in the CF Registry.

This document defines:

1. The CF-ID format and computation algorithm
2. The CF Receipt format
3. The CF Registry layout
4. Reference test vectors for implementation verification

Any implementation that produces the correct CF IDs for the test vectors in
Section 5 is a conformant CF-ID implementation.

---

## 1. CF-ID Format

A CF-ID is a string of the form:

    CF-<HEX6>-<LABHASH8>

Where:

- CF- is a fixed prefix (3 characters)
- HEX6 is the uppercase 6-character sRGB hexadecimal representation
- - is a separator (1 character)
- LABHASH8 is the first 8 uppercase hex characters of the SHA-256 hash
  of the colour's CIELAB values serialised as described in Section 2

Example:

    CF-7B3F00-EA262463

Total length: 18 characters

---

## 2. CF-ID Computation

Given an 8-bit sRGB colour (R, G, B) where each component is an integer in [0, 255]:

### Step 1 — Compute HEX6

Convert R, G, B to uppercase hexadecimal, zero-padded to 2 digits each:

    HEX6 = uppercase( zero_pad(hex(R), 2)
                    + zero_pad(hex(G), 2)
                    + zero_pad(hex(B), 2) )

Example: R=123, G=63, B=0 -> HEX6 = "7B3F00"

### Step 2 — Linearise sRGB

Convert each 8-bit component to a float in [0.0, 1.0]:

    r = R / 255.0
    g = G / 255.0
    b = B / 255.0

Apply sRGB gamma expansion to each component:

    linear(c) =
        c / 12.92                        if c <= 0.04045
        ((c + 0.055) / 1.055) ^ 2.4     otherwise

### Step 3 — Convert to XYZ (D65)

Apply the sRGB to XYZ (D65) matrix:

    X = 0.4124564 * r_lin + 0.3575761 * g_lin + 0.1804375 * b_lin
    Y = 0.2126729 * r_lin + 0.7151522 * g_lin + 0.0721750 * b_lin
    Z = 0.0193339 * r_lin + 0.1191920 * g_lin + 0.9503041 * b_lin

### Step 4 — Convert to CIELAB (D65 illuminant)

Normalise by D65 white point (Xn=0.95047, Yn=1.00000, Zn=1.08883):

    fx = f(X / 0.95047)
    fy = f(Y / 1.00000)
    fz = f(Z / 1.08883)

Where:

    f(t) =
        t ^ (1/3)               if t > 0.008856
        7.787 * t + 16/116      otherwise

Compute LAB:

    L = 116 * fy - 16
    a = 500 * (fx - fy)
    b = 200 * (fy - fz)

### Step 5 — Serialise LAB

Round each component to 3 decimal places using round-half-up:

    L_r = round3(L)
    a_r = round3(a)
    b_r = round3(b)

Serialise as a UTF-8 string with no spaces:

    preimage = str(L_r) + "," + str(a_r) + "," + str(b_r)

Where str() produces the minimal decimal representation: no trailing zeros
beyond the 3rd decimal place, no leading zeros except the integer part.

Example: L=33.493, a=22.291, b=43.796 -> preimage = "33.493,22.291,43.796"

Special cases:
- If a rounded value is exactly 0, serialise as "0.0"
- If a rounded value is a whole number, serialise with ".0" (e.g. "100.0")

### Step 6 — Compute LABHASH8

Compute SHA-256 of the preimage string encoded as UTF-8:

    hash = sha256(utf8(preimage))

Take the first 4 bytes (8 hex characters) and convert to uppercase:

    LABHASH8 = uppercase(hex(hash[0:4]))

### Step 7 — Assemble CF-ID

    CF-ID = "CF-" + HEX6 + "-" + LABHASH8

---

## 3. CF Receipt Format

A CF Receipt is a JSON object that cryptographically binds the inputs,
outputs, and version constants of a colour computation.

Fields:

    kind           string   identifies the type of computation
    inputs         object   the input values (hex, CF-ID, etc.)
    params         object   version constants used
    input_digest   string   sha256: + hex(sha256(canonical_json(inputs)))
    params_digest  string   sha256: + hex(sha256(canonical_json(params)))
    output_digest  string   sha256: + hex(sha256(utf8(output_string)))
    naming_version string   version of the naming anchor table
    lab_version    string   version of the LAB pipeline constants

Digest computation:

    "sha256:" + lowercase_hex(sha256(utf8(canonical_json(value))))

Where canonical_json produces JSON with keys sorted alphabetically,
no unnecessary whitespace, and UTF-8 encoding.

Stability guarantee: for a given set of inputs, params, and output,
the same receipt is always produced. Same inputs always produce the
same input_digest.

---

## 4. CF Registry Layout

The CF Registry is a static file system serving colour data at predictable URLs.

### 4.1 Index

    GET /registry/index.json

Returns registry metadata including version, entry count, layout type,
identity_version, naming_version, lab_version, and URL patterns.

### 4.2 Colour Entry Schema

Each colour entry contains:

    cf_id             string     e.g. "CF-CC0000-791976F7"
    hex               string     e.g. "#cc0000"
    rgb               [R, G, B]  integers 0-255
    lab               [L, a, b]  floats rounded to 3dp
    lch               [L, C, H]  floats rounded to 3dp
    nearest_name      string     closest named anchor colour
    family            string     hue family (red, orange, yellow, ...)
    identity_version  string     "CF-ID-1.0.0"
    naming_version    string     "1.0.0"
    lab_version       string     "1.0.0"

### 4.3 Shard Layout (K=100)

Colours grouped by R-channel value. Each shard is NDJSON (one JSON
object per line) containing all colours with that R-channel byte:

    GET /registry/shards/{r2}.ndjson

Where r2 is the lowercase 2-character hex of the R byte.

Resolution algorithm:
1. Extract R byte from hex string
2. Compute r2 = lowercase_hex(R)
3. Fetch /registry/shards/{r2}.ndjson
4. Scan lines for matching hex field

### 4.4 Individual File Layout (K=20)

    GET /registry/by-hex/{r2}/{g2}/{b2}.json
    GET /registry/by-id/{CF-ID}.json

Both paths resolve to the same colour entry object.

---

## 5. Reference Test Vectors

These test vectors MUST be reproduced exactly by any conformant implementation.

### 5.1 CF-ID Test Vectors

    Input              CF-ID
    ------             -----
    #000000  (black)   CF-000000-86165F20
    #ffffff  (white)   CF-FFFFFF-2DD4EB92
    #ff0000  (red)     CF-FF0000-37AB74A7
    #00ff00  (green)   CF-00FF00-7696CEEA
    #0000ff  (blue)    CF-0000FF-D81673DF
    #7b3f00  (sienna)  CF-7B3F00-EA262463
    #cc0000  (scarlet) CF-CC0000-791976F7
    #ffffff  (white)   CF-FFFFFF-2DD4EB92

### 5.2 CIELAB Values (intermediate)

    Input    L        a        b
    ------   ------   ------   ------
    #000000  0.0      0.0      0.0
    #ffffff  100.0    0.0      0.003
    #ff0000  53.389   80.812   67.234
    #0000ff  32.303   79.187  -107.864
    #7b3f00  33.493   22.291   43.796

### 5.3 LABHASH8 Preimages

    Input    Preimage                    LABHASH8
    ------   --------                    --------
    #000000  "0.0,0.0,0.0"              86165F20
    #ffffff  "100.0,0.0,0.003"          2DD4EB92
    #7b3f00  "33.493,22.291,43.796"     EA262463
    #cc0000  "42.524,67.696,56.802"     791976F7

### 5.4 WCAG Contrast Test Vectors

    Foreground   Background   Ratio     Level
    ----------   ----------   -----     -----
    #000000      #ffffff      21.00:1   AAA
    #ffffff      #ffffff       1.00:1   fail
    #ff0000      #ffffff       3.99:1   AA-large
    #7b3f00      #ffffff       8.22:1   AAA

### 5.5 CIEDE2000 Test Vectors (Sharma 2005)

    LAB1                          LAB2                     Delta-E 2000
    ----                          ----                     ------------
    (50, 2.6772, -79.7751)        (50, 0, -82.7485)        2.0425
    (50, 3.1571, -77.2803)        (50, 0, -82.7485)        2.8615
    (50, 2.8361, -74.020)         (50, 0, -82.7485)        3.4412
    (50, -1.3802, -84.2814)       (50, 0, -82.7485)        1.0000
    (50, -1.1848, -84.8006)       (50, 0, -82.7485)        1.0000
    (50, -0.9009, -85.5211)       (50, 0, -82.7485)        1.0000

---

## 6. Version History

    CF-ID-1.0.0       2026-06-10    Initial release
    CF-Protocol-1.0.0 2026-06-10    This document

---

## 7. Stability Guarantees

- CF-ID-1.0.0 identifiers are permanent. A CF-ID computed today will
  produce the same result in any future conformant implementation.
- The LABHASH8 component is stable unless the D65 illuminant constants,
  sRGB gamma parameters, or XYZ matrix coefficients change. Any such
  change constitutes a new identity version (CF-ID-2.0.0).
- The nearest_name field is NOT part of the identity. It depends on
  naming_version and may change across naming table updates. The CF-ID
  itself never changes for a given sRGB value.

---

## 8. Implementation Notes

- The round3 function must use round-half-up (not round-half-to-even /
  banker's rounding). For x.xx5, round up.
- SHA-256 must be standard (FIPS 180-4).
- All floating-point arithmetic should use IEEE 754 double precision.
- The preimage string must be UTF-8 with no BOM.
- Implementations should verify against all test vectors in Section 5
  before claiming conformance.

---

## 9. Reference Implementation

The canonical reference implementation is Colour-in-FARD, written in FARD:

    src/core/cf_id.fard       -- CF-ID computation
    src/core/rgb_lab.fard     -- CIELAB pipeline
    src/core/receipt.fard     -- receipt system
    src/core/wcag.fard        -- WCAG contrast
    src/core/delta_e2000.fard -- CIEDE2000

Source: https://github.com/mauludsadiq/Colour-in-Fard

All test vectors in Section 5 are verified by the test suite (202 tests,
0 failures) in that repository.
