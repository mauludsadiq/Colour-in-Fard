# CF Colour Protocol -- Specification v2.0.0

**Status:** Draft Community Group Report
**Date:** 2026-06-10
**Repo:** https://github.com/mauludsadiq/Colour-in-Fard
**Supersedes:** CF-Protocol-1.0.0 (SPEC.md), CF-Claim-1.0.0 (CLAIM-SPEC.md)

---

## Status of This Document

This document is a Draft Community Group Report. It consolidates and
supersedes CF-Protocol-1.0.0 and CF-Claim-1.0.0 into a single versioned
specification covering colour identity, receipts, registry layout,
spectral identity, community naming, and colour claims.

This is not a W3C Standard. It is intended for submission to a W3C
Community Group as a Draft Report, where it may be discussed, revised,
and iterated by participants. Community Group Reports have no official
standing and are not endorsed by W3C or its Members.

Feedback: https://github.com/mauludsadiq/Colour-in-Fard/issues

---

## Abstract

The CF Colour Protocol defines a system for stable, deterministic,
verifiable colour identity, spanning digital (sRGB), spectral
(reflectance), print (CMYK/ICC), and brand communication (Colour Claims).

Version 2.0 adds three components to the v1.0 core (CF-ID, receipts,
registry):

- **CF-Spectral-ID** -- identity for a measured spectral reflectance
  curve, independent of (but related to) CF-ID
- **CF Naming Databases** -- versioned, content-hashed, pluggable naming
  layers with no central authority
- **CF Colour Claims** -- self-verifying JSON documents for publishing
  brand colour information without licensing a proprietary system

All four components share one property: anyone can independently verify
them using only the published algorithms and standard cryptographic
primitives (SHA-256). No central registry, paid licence, or proprietary
software is required to compute, publish, or verify a CF identity.

---

## 1. Conformance

The key words MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT, and MAY in
this document are to be interpreted as described in BCP 14 (RFC 2119).

A conformant implementation:

- MUST implement CF-ID (Section 3) and reproduce all test vectors in
  Appendix A.
- MAY implement CF-Spectral-ID (Section 4), CF Naming (Section 5), and
  CF Colour Claims (Section 6). These build on CF-ID but are independently
  optional.
- MUST, if implementing any optional component, reproduce the relevant
  test vectors in the Appendix.

---

## 2. Terminology

**sRGB**: the standard RGB colour space defined in IEC 61966-2-1, with
D65 white point.

**CIELAB (LAB)**: the CIE 1976 L*a*b* colour space, computed relative to
a D65 reference white.

**Reflectance curve**: a list of 36 reflectance values (0.0-1.0) at
10nm intervals from 380nm to 730nm.

**Canonical JSON**: JSON serialisation with object keys sorted
alphabetically (byte-wise), no insignificant whitespace, and numbers
serialised without a decimal point when the value is a whole number.

**Digest**: `"sha256:" + lowercase_hex(SHA-256(UTF-8(input)))`.

---

## 3. CF-ID (unchanged from v1.0.0)

CF-ID-1.0.0 is unchanged in v2.0 and remains permanent: a CF-ID computed
under CF-ID-1.0.0 will always be reproducible by any conformant
implementation, indefinitely.

### 3.1 Format

    CF-<HEX6>-<LABHASH8>

`HEX6` is the uppercase 6-digit sRGB hex (no `#`). `LABHASH8` is the
first 8 uppercase hex characters of SHA-256 over the canonical JSON
`{"a":<a>,"b":<b>,"l":<l>}`, where `l`,`a`,`b` are the colour's CIELAB
values rounded via:

    round3(x) = trunc(x * 1000.0 + 0.5) / 1000.0

(`trunc` rounds toward zero; this is intentional and MUST be replicated
exactly -- see Appendix A for why this matters for negative values.)

### 3.2 Computation

1. Convert sRGB 0-255 to linear light via standard sRGB EOTF.
2. Convert linear RGB to XYZ via the standard sRGB-to-XYZ (D65) matrix.
3. Convert XYZ to CIELAB via the standard D65 white point.
4. Round L,a,b via `round3`.
5. Serialise as canonical JSON `{"a":...,"b":...,"l":...}`.
6. SHA-256 the UTF-8 bytes; take the first 8 hex chars, uppercase.
7. `CF-ID = "CF-" + HEX6 + "-" + LABHASH8`.

Full numeric detail (matrix coefficients, gamma constants, CIELAB
constants) is unchanged from CF-Protocol-1.0.0 and is given in Appendix B
for completeness.

---

## 4. CF-Spectral-ID (new in v2.0)

### 4.1 Purpose

CF-ID identifies how a colour *appears* under D65 illumination. Two
physically different surfaces (different pigments, different materials)
can produce the same XYZ under D65 -- they are **metamers** -- and
therefore share a CF-ID. CF-Spectral-ID identifies the underlying
physical reflectance curve itself, distinguishing metamers.

### 4.2 Format

    CF-SPECTRAL-<HASH8>

`HASH8` is the first 8 uppercase hex characters of SHA-256 over the
canonical JSON array of the reflectance curve, each value rounded to 4
decimal places via the same `round3`-style truncation (extended to 4dp):

    round4(x) = trunc(x * 10000.0 + 0.5) / 10000.0

### 4.3 Reflectance Curve

A reflectance curve is an array of exactly 36 floats in [0.0, 1.0],
representing reflectance at 380, 390, ..., 730 nm (10nm steps). This is
the standard CIE 15:2004 reduced-resolution practice.

### 4.4 Spectral to XYZ

XYZ is computed using the CIE 1931 2-degree standard observer color
matching functions and CIE Standard Illuminant D65, both sampled at the
same 36 wavelengths:

    X = k * sum(R(l) * D65(l) * xbar(l))
    Y = k * sum(R(l) * D65(l) * ybar(l))
    Z = k * sum(R(l) * D65(l) * zbar(l))
    k = 100 / sum(D65(l) * ybar(l))

The resulting XYZ (0-100 scale) feeds into the same XYZ-to-LAB-to-CF-ID
pipeline as Section 3, producing a CF-ID for the spectral sample's
appearance under D65, alongside its CF-Spectral-ID for its physical
identity.

### 4.5 Relationship Between CF-ID and CF-Spectral-ID

For a given reflectance curve R:

    cf_id(R)          = CF-ID of spectral_to_lab(R)
    cf_spectral_id(R) = hash of R itself

Two curves R1 != R2 with spectral_to_lab(R1) == spectral_to_lab(R2)
(metamers) satisfy:

    cf_id(R1) == cf_id(R2)
    cf_spectral_id(R1) != cf_spectral_id(R2)

---

## 5. CF Naming Databases (new in v2.0)

### 5.1 Purpose

CF-ID is permanent and naming-independent. The human-readable *name* for
a colour ("scarlet", "vermilion", "PMS 1795 C-ish") is a separate,
versioned, pluggable concern with no central authority.

### 5.2 Format

A naming database is an NDJSON file (one JSON object per line):

    {"name": "<string>", "hex": "#rrggbb"}

### 5.3 Versioning

A naming database's version is its content hash:

    naming_db_version = uppercase(hex(SHA-256(file_bytes))[0:8])

### 5.4 Nearest-Name Resolution

Given a target colour and a naming database, the nearest name is the
entry minimising perceptual distance in CIELAB, using either:

- CIE76 (Euclidean LAB distance), or
- CIEDE2000 (CIE 2000 weighted distance, more perceptually uniform)

Implementations SHOULD support both and SHOULD report which metric was
used.

### 5.5 No Central Authority

Anyone MAY publish a naming database. The same CF-ID MAY have different
names under different databases; this is not a conflict, since names are
not part of the identity. Any output that resolves a name SHOULD record
the `naming_db_version` used, so the naming claim is independently
reproducible.

---

## 6. CF Colour Claims (new in v2.0)

### 6.1 Purpose

A CF Colour Claim is a self-contained, tamper-evident JSON document that
lets any party publish "this is our colour" in a way that is freely and
independently verifiable, without licensing a proprietary colour system.

### 6.2 Format

    {
      "claim_version":          "CF-Claim-1.0.0",
      "name":                    string,
      "srgb_hex":                "#rrggbb",
      "cf_id":                   "CF-<HEX6>-<LABHASH8>",
      "spectral_reflectance":    [36 floats] | null,
      "cf_spectral_id":          "CF-SPECTRAL-<HASH8>" | null,
      "cmyk":                    {"c":int,"m":int,"y":int,"k":int} | null,
      "icc_profile":             string | null,
      "nearest_reference":       {"system":string,"code":string,"delta_e":number} | null,
      "provenance":              {"measured_by":..., "organisation":..., "date":..., "notes":...},
      "protocol_version":        "CF-Protocol-2.0.0",
      "claim_digest":            "sha256:..."
    }

### 6.3 Verification

A claim is VALID if and only if:

1. `cf_id` equals the CF-ID recomputed from `srgb_hex` (Section 3).
2. If `spectral_reflectance` is present, `cf_spectral_id` equals the
   CF-Spectral-ID recomputed from it (Section 4).
3. `claim_digest` equals `digest(canonical_json(claim_without_claim_digest))`.

Validity establishes internal mathematical consistency only. It does not
establish that the claimed sRGB or spectral values accurately describe
any physical object -- that is a matter of `provenance` and trust in the
claimant, exactly as with any published colour specification.

### 6.4 Relationship to Third-Party Systems

`nearest_reference` allows a claim to relate itself to a third-party
system (e.g. "approximately Pantone 1795 C, delta_e=2.3") as a factual
statement about the claimant's own colour. This document takes no
position on the intellectual property status of any third-party colour
system; implementers should seek their own advice on referencing
third-party systems by name.

---

## 7. Receipts (unchanged from v1.0.0)

A CF Receipt binds inputs, parameters, and outputs of a computation to
SHA-256 digests of their canonical JSON. Receipts make outputs of any CF
tool independently checkable: given the same inputs and parameters,
re-running the computation MUST produce the same output digest.

---

## 8. Registry (unchanged from v1.0.0)

The CF Registry is a static file structure (`index.json`, per-hex/per-ID
JSON files, and R-channel-sharded NDJSON) serving precomputed CF-ID
entries. Section numbering and URL patterns are unchanged from
CF-Protocol-1.0.0 Section 4.

---

## Appendix A: Test Vectors

### A.1 CF-ID (CF-ID-1.0.0, unchanged)

    #000000  CF-000000-86165F20
    #ffffff  CF-FFFFFF-2DD4EB92
    #ff0000  CF-FF0000-37AB74A7
    #00ff00  CF-00FF00-9377CC77
    #0000ff  CF-0000FF-D81673DF
    #7b3f00  CF-7B3F00-EA262463
    #cc0000  CF-CC0000-791976F7

### A.2 round3 truncation behaviour (why it matters)

    round3(-86.183) = -86.182

because `-86.183 * 1000 + 0.5 = -86182.5`, and `trunc(-86182.5) = -86182`
(toward zero, not floor). An implementation using floor-based round-half-up
will compute `-86.183` instead and produce a DIFFERENT, NON-CONFORMANT
CF-ID for #00ff00.

### A.3 CF-Spectral-ID

A flat 50% reflectance curve (all 36 values = 0.5) under D65:

    XYZ (0-100): X=47.506 Y=50.0 Z=54.408
    LAB: L=76.069 a=-0.047 b=0.033
    cf_id:          CF-BBBCBB-55C6D241
    cf_spectral_id: CF-SPECTRAL-A238F71E

### A.4 CF Colour Claims

A claim with `srgb_hex="#ea682d"` MUST have `cf_id="CF-EA682D-94A4C6AC"`.
Changing any field after computing `claim_digest` MUST cause verification
to fail.

---

## Appendix B: Numeric Constants

(unchanged from CF-Protocol-1.0.0; reproduced here for self-containedness)

sRGB-to-XYZ (D65) matrix:

    X = 0.4124564 R + 0.3575761 G + 0.1804375 B
    Y = 0.2126729 R + 0.7151522 G + 0.0721750 B
    Z = 0.0193339 R + 0.1191920 G + 0.9503041 B

D65 white point: Xn=95.047, Yn=100.000, Zn=108.883

CIELAB f(t):

    f(t) = t^(1/3)            if t > 0.008856
         = 7.787 t + 16/116   otherwise

sRGB EOTF:

    linear(c) = c/12.92                      if c <= 0.04045
              = ((c+0.055)/1.055)^2.4        otherwise

---

## Change Log

    CF-Protocol-1.0.0   2026-06-10   CF-ID, receipts, registry
    CF-Claim-1.0.0      2026-06-10   CF Colour Claim Protocol
    CF-Protocol-2.0.0   2026-06-10   Consolidates 1.0.0 + Claim 1.0.0,
                                      adds CF-Spectral-ID, CF Naming
