"""
CF-ID computation -- CF Protocol Specification v1.0.0
Reference: https://github.com/mauludsadiq/Colour-in-Fard/blob/main/SPEC.md
"""

import hashlib
import math

__version__ = "1.0.0"
IDENTITY_VERSION = "CF-ID-1.0.0"
PROTOCOL_VERSION = "CF-Protocol-1.0.0"


# --- sRGB linearisation ---

def _linearise(c: float) -> float:
    """sRGB gamma expansion. c in [0, 1]."""
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


# --- XYZ (D65) ---

def _rgb_to_xyz(r: float, g: float, b: float) -> tuple:
    """Linear sRGB to XYZ (D65). Inputs in [0, 1]."""
    rl = _linearise(r)
    gl = _linearise(g)
    bl = _linearise(b)
    x = 0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl
    y = 0.2126729 * rl + 0.7151522 * gl + 0.0721750 * bl
    z = 0.0193339 * rl + 0.1191920 * gl + 0.9503041 * bl
    return x, y, z


# --- CIELAB ---

_D65 = (0.95047, 1.00000, 1.08883)
_EPSILON = 0.008856
_KAPPA = 7.787


def _f(t: float) -> float:
    if t > _EPSILON:
        return t ** (1.0 / 3.0)
    return _KAPPA * t + 16.0 / 116.0


def rgb_to_lab(r: int, g: int, b: int) -> tuple:
    """
    Convert 8-bit sRGB to CIELAB (D65).
    Returns (L, a, b) as floats.
    """
    rf, gf, bf = r / 255.0, g / 255.0, b / 255.0
    x, y, z = _rgb_to_xyz(rf, gf, bf)
    fx = _f(x / _D65[0])
    fy = _f(y / _D65[1])
    fz = _f(z / _D65[2])
    L = 116.0 * fy - 16.0
    a = 500.0 * (fx - fy)
    b_val = 200.0 * (fy - fz)
    return L, a, b_val


# --- LAB serialisation ---

def _round3(v: float) -> float:
    """
    Round to 3 decimal places matching FARD's round3:
        cast.int(x * 1000.0 + 0.5) / 1000.0
    where cast.int truncates toward zero (not floor).
    """
    scaled = v * 1000.0 + 0.5
    truncated = math.trunc(scaled)
    return truncated / 1000.0


def _json_number(v: float) -> str:
    """
    Serialise a rounded LAB component as a JSON number.
    Whole numbers serialise without a decimal point (e.g. 0, 100, -3),
    matching standard JSON number formatting used by FARD\'s json.encode.
    """
    r = _round3(v)
    if r == int(r):
        return str(int(r))
    # Format to 3 decimals, strip trailing zeros (but keep at least one digit after .)
    s = f"{r:.3f}".rstrip("0").rstrip(".")
    return s


def _lab_preimage(L: float, a: float, b: float) -> str:
    # Serialise LAB values as canonical JSON with alphabetically sorted keys,
    # matching FARD's json.encode({l: L, a: a, b: b}) -> {"a":...,"b":...,"l":...}
    a_s = _json_number(a)
    b_s = _json_number(b)
    l_s = _json_number(L)
    return '{"a":' + a_s + ',"b":' + b_s + ',"l":' + l_s + '}'


# --- LABHASH8 ---

def lab_hash(L: float, a: float, b: float) -> str:
    """
    Compute LABHASH8 from LAB values.

    Algorithm:
      1. Round L, a, b to 3 decimals (round-half-up)
      2. Serialise as canonical JSON: {"a":...,"b":...,"l":...}
         (alphabetical key order, whole numbers without decimal point,
         matching FARD\'s json.encode)
      3. Compute SHA-256 of the UTF-8 bytes, prefixed conceptually as
         "sha256:" + hexdigest (64 hex chars)
      4. Take the first 8 hex characters of the hexdigest, uppercase

    Returns 8 uppercase hex characters.
    """
    preimage = _lab_preimage(L, a, b)
    hexdigest = hashlib.sha256(preimage.encode("utf-8")).hexdigest()
    return hexdigest[:8].upper()


# --- CF-ID ---

def from_rgb(r: int, g: int, b: int) -> str:
    """
    Compute CF-ID from 8-bit sRGB components.

    >>> from_rgb(0, 0, 0)
    'CF-000000-86165F20'
    >>> from_rgb(255, 255, 255)
    'CF-FFFFFF-2DD4EB92'
    >>> from_rgb(123, 63, 0)
    'CF-7B3F00-EA262463'
    """
    if not (0 <= r <= 255 and 0 <= g <= 255 and 0 <= b <= 255):
        raise ValueError(f"RGB components must be in [0, 255], got ({r}, {g}, {b})")
    hex6 = f"{r:02X}{g:02X}{b:02X}"
    L, a, b_val = rgb_to_lab(r, g, b)
    labhash = lab_hash(L, a, b_val)
    return f"CF-{hex6}-{labhash}"


def from_hex(hex_str: str) -> str:
    """
    Compute CF-ID from a hex colour string.

    >>> from_hex("#000000")
    'CF-000000-86165F20'
    >>> from_hex("#FFFFFF")
    'CF-FFFFFF-2DD4EB92'
    >>> from_hex("#7b3f00")
    'CF-7B3F00-EA262463'
    >>> from_hex("#CC0000")
    'CF-CC0000-791976F7'
    """
    h = hex_str.lstrip("#")
    if len(h) != 6:
        raise ValueError(f"Invalid hex colour: {hex_str!r}")
    r = int(h[0:2], 16)
    g = int(h[2:4], 16)
    b = int(h[4:6], 16)
    return from_rgb(r, g, b)
