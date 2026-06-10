"""
cfid command-line interface.

Usage:
    cfid "#7B3F00"
    cfid "#7B3F00" --json
    echo "#cc0000" | cfid
"""

import sys
import json
import argparse
from .cfid import from_hex, rgb_to_lab, lab_hash, IDENTITY_VERSION, __version__


def main():
    parser = argparse.ArgumentParser(
        prog="cfid",
        description="CF Colour Protocol -- compute CF-ID for any sRGB hex colour"
    )
    parser.add_argument("hex", nargs="?", help="hex colour e.g. #7B3F00")
    parser.add_argument("--json", action="store_true", help="output full JSON profile")
    parser.add_argument("--version", action="version", version=f"cfid {__version__}")
    args = parser.parse_args()

    hex_str = args.hex
    if not hex_str:
        if not sys.stdin.isatty():
            hex_str = sys.stdin.read().strip()
        else:
            parser.print_help()
            sys.exit(1)

    try:
        cf_id = from_hex(hex_str)
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(1)

    if args.json:
        h = hex_str.lstrip("#")
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        L, a, bv = rgb_to_lab(r, g, b)
        out = {
            "cf_id": cf_id,
            "hex": "#" + h.lower(),
            "rgb": [r, g, b],
            "lab": [round(L, 3), round(a, 3), round(bv, 3)],
            "identity_version": IDENTITY_VERSION,
        }
        print(json.dumps(out, indent=2))
    else:
        print(cf_id)


if __name__ == "__main__":
    main()
