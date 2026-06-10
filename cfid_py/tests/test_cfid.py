"""
CF-ID conformance tests -- verifies all SPEC.md Section 5 test vectors.
"""
import pytest
from cfid import from_hex, from_rgb, rgb_to_lab, lab_hash


# --- Section 5.1: CF-ID test vectors ---

@pytest.mark.parametrize("hex_str,expected", [
    ("#000000", "CF-000000-86165F20"),
    ("#ffffff", "CF-FFFFFF-2DD4EB92"),
    ("#FFFFFF", "CF-FFFFFF-2DD4EB92"),
    ("#ff0000", "CF-FF0000-37AB74A7"),
    ("#00ff00", "CF-00FF00-9377CC77"),
    ("#0000ff", "CF-0000FF-D81673DF"),
    ("#7b3f00", "CF-7B3F00-EA262463"),
    ("#7B3F00", "CF-7B3F00-EA262463"),
    ("#cc0000", "CF-CC0000-791976F7"),
    ("#CC0000", "CF-CC0000-791976F7"),
])
def test_cf_id_vectors(hex_str, expected):
    assert from_hex(hex_str) == expected


# --- Section 5.2: CIELAB intermediate values ---

def close(a, b, tol=0.001):
    return abs(a - b) < tol


@pytest.mark.parametrize("r,g,b,L,a,bv", [
    (0,   0,   0,    0.0,     0.0,      0.0),
    (255, 255, 255, 100.0,    0.0,      0.0),
    (255, 0,   0,    53.241,  80.092,  67.203),
    (0,   255, 0,    87.735, -86.183,  83.179),
    (0,   0,   255,  32.297,  79.188, -107.860),
    (123, 63,  0,    33.493,  22.291,  43.796),
    (204, 0,   0,    42.524,  67.696,  56.802),
])
def test_lab_values(r, g, b, L, a, bv):
    Lc, ac, bc = rgb_to_lab(r, g, b)
    assert close(Lc, L), f"L: {Lc} != {L}"
    assert close(ac, a), f"a: {ac} != {a}"
    assert close(bc, bv), f"b: {bc} != {bv}"


# --- Section 5.3: LABHASH8 preimages ---

@pytest.mark.parametrize("r,g,b,expected_hash", [
    (0,   0,   0,   "86165F20"),
    (255, 255, 255, "2DD4EB92"),
    (123, 63,  0,   "EA262463"),
    (204, 0,   0,   "791976F7"),
])
def test_labhash8(r, g, b, expected_hash):
    L, a, bv = rgb_to_lab(r, g, b)
    assert lab_hash(L, a, bv) == expected_hash


# --- from_rgb ---

def test_from_rgb_black():
    assert from_rgb(0, 0, 0) == "CF-000000-86165F20"

def test_from_rgb_white():
    assert from_rgb(255, 255, 255) == "CF-FFFFFF-2DD4EB92"

def test_from_rgb_invalid():
    with pytest.raises(ValueError):
        from_rgb(256, 0, 0)
    with pytest.raises(ValueError):
        from_rgb(-1, 0, 0)


# --- CF-ID properties ---

def test_cf_id_format():
    cf = from_hex("#7B3F00")
    assert cf.startswith("CF-")
    assert len(cf) == 18
    parts = cf.split("-")
    assert len(parts) == 3
    assert parts[1] == "7B3F00"
    assert len(parts[2]) == 8

def test_cf_id_case_insensitive():
    assert from_hex("#7b3f00") == from_hex("#7B3F00")
    assert from_hex("#FFFFFF") == from_hex("#ffffff")

def test_cf_id_deterministic():
    assert from_hex("#7B3F00") == from_hex("#7B3F00")

def test_cf_id_unique():
    assert from_hex("#FF0000") != from_hex("#FF0001")
