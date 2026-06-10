# CF Colour Claim Protocol -- Specification v1.0.0

**Status:** Draft
**Date:** 2026-06-10
**Repo:** https://github.com/mauludsadiq/Colour-in-Fard

---

## Abstract

A CF Colour Claim is a small, self-contained JSON document that lets a
brand, manufacturer, or individual publicly state "this is our colour" in
a way that anyone can independently verify, without licensing any
proprietary colour system.

A claim binds together:

- The colour's CF-ID (computed from sRGB, per CF-Protocol-1.0.0)
- Optionally, a CF-Spectral-ID (computed from a measured spectral
  reflectance curve, per CF-Spectral-1.0.0)
- Optionally, a CMYK breakdown for print reproduction
- Optionally, a nearest-equivalent reference in another colour system
  (e.g. a Pantone approximation), with a stated perceptual distance
- Provenance: who measured it, with what instrument, when
- A receipt binding all of the above to content hashes

Anyone with the CF Colour Protocol reference implementation (FARD,
`cfcolor`, or the JS implementation) can recompute the CF-ID from the
stated `srgb_hex` and confirm it matches `cf_id`. If a spectral curve is
included, its CF-Spectral-ID can be recomputed and checked too. A claim
that fails this check is not a valid CF Colour Claim, regardless of what
it asserts.

---

## 1. Claim Format

A CF Colour Claim is a JSON object with the following fields:

    {
      "claim_version":          "CF-Claim-1.0.0",
      "name":                    "<human-readable name, e.g. brand colour name>",
      "srgb_hex":                "#rrggbb",
      "cf_id":                   "CF-<HEX6>-<LABHASH8>",

      "spectral_reflectance":    [36 floats, 380-730nm 10nm steps] | null,
      "cf_spectral_id":          "CF-SPECTRAL-<HASH8>" | null,

      "cmyk":                    {"c": int, "m": int, "y": int, "k": int} | null,
      "icc_profile":             "<path or identifier of ICC profile used>" | null,

      "nearest_reference":       {"system": "<string>", "code": "<string>", "delta_e": <float>} | null,

      "provenance": {
        "measured_by":  "<instrument or method>" | null,
        "organisation": "<who is making this claim>" | null,
        "date":         "<ISO 8601 date>" | null,
        "notes":        "<free text>" | null
      },

      "protocol_version": "CF-Protocol-1.0.0",
      "claim_digest":     "sha256:..."
    }

### Field notes

- `srgb_hex` and `cf_id` are REQUIRED. `cf_id` MUST equal the CF-ID
  computed from `srgb_hex` per CF-Protocol-1.0.0 Section 2. This is the
  minimum verifiable claim.
- `spectral_reflectance` and `cf_spectral_id`, if present, MUST be
  consistent: `cf_spectral_id` MUST equal the CF-Spectral-ID computed from
  `spectral_reflectance` per CF-Spectral-1.0.0.
- `nearest_reference` lets a claim relate itself to a non-CF system (e.g.
  Pantone, RAL, NCS) WITHOUT requiring a licence to publish that relation
  -- the claim states "our colour is approximately Pantone XYZ, at this
  perceptual distance," which is a factual statement about the claimant's
  own colour, not a reproduction of the third-party system itself.
- `claim_digest` is `"sha256:" + lowercase_hex(sha256(utf8(canonical_json(claim_without_digest_field))))`,
  i.e. the SHA-256 of the canonical JSON of the entire claim with the
  `claim_digest` field itself omitted (and re-added afterward).

---

## 2. Verification Algorithm

To verify a CF Colour Claim:

1. Recompute `cf_id` from `srgb_hex` (CF-Protocol-1.0.0 Section 2).
   If it does not match the claim's `cf_id`, the claim is INVALID.
2. If `spectral_reflectance` is present, recompute `cf_spectral_id` from
   it (CF-Spectral-1.0.0). If it does not match the claim's
   `cf_spectral_id`, the claim is INVALID.
3. Recompute `claim_digest` (Section 1). If it does not match, the claim
   has been tampered with since it was created -- INVALID.
4. If all checks pass, the claim is VALID. This means: the stated CF-ID
   correctly corresponds to the stated sRGB hex, the stated CF-Spectral-ID
   (if any) correctly corresponds to the stated spectral curve, and the
   claim document has not been altered since its digest was computed.

Verification does NOT and CANNOT confirm that the `srgb_hex` or
`spectral_reflectance` values are an accurate measurement of any real
physical object -- that is a provenance question, addressed by the
`provenance` field, which is a statement of trust in the claimant, not a
cryptographic guarantee.

---

## 3. What a Valid Claim Means -- and What It Doesn't

A valid CF Colour Claim means: **the math is internally consistent**. The
CF-ID really does correspond to the stated hex; the CF-Spectral-ID really
does correspond to the stated spectral curve; the document hasn't been
altered.

A valid CF Colour Claim does NOT mean: the claimant's product actually is
that colour, that the measurement was taken correctly, or that the
claimant is who they say they are. Those require provenance (instrument,
organisation, date) and, ultimately, trust in the claimant -- the same as
any other published specification (e.g. a Pantone book entry is also just
a claim by Pantone).

What CF Colour Claims add over existing systems: the claim is free to
publish, free to verify, requires no licence, and the verification step
is a few lines of open-source code rather than a proprietary lookup.

---

## 4. Example Claim

    {
      "claim_version": "CF-Claim-1.0.0",
      "name": "Vermilion (reference)",
      "srgb_hex": "#ea682d",
      "cf_id": "CF-EA682D-DDF72ED2",

      "spectral_reflectance": null,
      "cf_spectral_id": null,

      "cmyk": {"c": 0, "m": 65, "y": 87, "k": 0},
      "icc_profile": null,

      "nearest_reference": null,

      "provenance": {
        "measured_by": "CF Historical Pigment Corpus v1.0.0 (representative curve)",
        "organisation": "Colour-in-FARD project",
        "date": "2026-06-10",
        "notes": "Representative reflectance curve, not a measured physical sample. See src/data/pigments.fard."
      },

      "protocol_version": "CF-Protocol-1.0.0",
      "claim_digest": "sha256:..."
    }

---

## 5. Reference Implementation

    src/core/claim.fard -- make_claim, verify_claim
    apps/claim.fard      -- CLI: create and verify CF Colour Claims

A claim created by `apps/claim.fard` and a claim verified by
`apps/claim.fard --verify` use the same digest algorithm, so any claim
produced by the reference implementation verifies as valid by
construction; the verification step matters most for claims received
from third parties.
