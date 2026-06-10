# cfcolor

Python reference implementation of the CF Colour Protocol.

Every 8-bit sRGB colour has exactly one CF-ID — a stable, deterministic,
verifiable identity computed from first principles.

## Install

    pip install cfcolor

## Usage

    from cfcolor import from_hex, from_rgb

    from_hex("#7B3F00")     # "CF-7B3F00-EA262463"
    from_hex("#000000")     # "CF-000000-86165F20"
    from_rgb(255, 0, 0)     # "CF-FF0000-37AB74A7"

Command line:

    cfid "#7B3F00"
    cfid "#7B3F00" --json
    echo "#cc0000" | cfid

## Specification

CF Protocol Specification v1.0.0:
https://github.com/mauludsadiq/Colour-in-Fard/blob/main/SPEC.md

## Registry

1,030,301 colours publicly resolved at:
https://mauludsadiq.github.io/Colour-in-Fard/registry/index.json

## Conformance

This implementation passes all test vectors in SPEC.md Section 5.
Run tests with: python -m pytest cfid_py/tests/
