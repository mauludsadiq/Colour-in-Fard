"""
cfid -- CF Colour Protocol reference implementation
https://github.com/mauludsadiq/Colour-in-Fard/blob/main/SPEC.md
"""

from .cfid import (
    from_hex,
    from_rgb,
    rgb_to_lab,
    lab_hash,
    __version__,
)

__all__ = ["from_hex", "from_rgb", "rgb_to_lab", "lab_hash", "__version__"]
