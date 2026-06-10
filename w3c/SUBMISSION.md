# W3C Community Group Submission Checklist

SPEC-2.0.md is written as a Draft Community Group Report. Submitting it
to W3C requires a few manual steps with a W3C account, which cannot be
automated from here.

## Steps

1. **Create a W3C account** (free): https://www.w3.org/accounts/request
   Any individual can do this; no organisational affiliation required.

2. **Propose a Community Group**:
   https://www.w3.org/community/groups/proposed/
   - Name suggestion: "CF Colour Protocol Community Group"
   - Scope: a brief description (SPEC-2.0.0's Abstract works well)
   - Charter: W3C provides a template; the scope/abstract from
     SPEC-2.0.md can be adapted directly.

3. **Wait for the proposal period** (W3C requires a short public comment
   period before a Community Group is formally created -- typically a
   few weeks).

4. **Once the group exists**, publish SPEC-2.0.md as a Draft Community
   Group Report using W3C's ECHIDNA publishing tool, or simply link to
   the GitHub-hosted version from the group's homepage -- many CGs do
   this informally before formal ReSpec/Echidna publication.

5. **Update SPEC-2.0.md's "Status of This Document"** section with the
   Community Group's name and a link once it exists.

## What does NOT require W3C

- The specification itself (SPEC-2.0.md) is complete and usable today,
  with or without W3C. W3C Community Group status adds visibility and a
  "house" for discussion/iteration -- it does not change the technical
  content or its validity.
- Anyone can implement and conform to SPEC-2.0.md right now by
  reproducing the test vectors in Appendix A, exactly as with
  SPEC-2.0.0/SPEC.md/CLAIM-SPEC.md today.

## Recognition criteria (from the original roadmap)

A useful signal that "the standard exists" independent of any formal W3C
status:

- pip install cfcolor usage grows
- The Figma plugin / VS Code extension see real users
- A second/third-party implementation appears (beyond FARD, Python, JS)
- At least one CF Colour Claim is published by an entity other than this
  project
- A W3C Community Group Report references SPEC-2.0.md

These are observable from outside this repo and don't require any further
code changes here.
