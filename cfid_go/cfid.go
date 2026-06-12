// Package cfcolor computes CF-ID: deterministic colour identity, per
// CF-Protocol-2.0.0 (see SPEC-2.0.md in the main repo).
//
// Pure Go, zero dependencies (crypto/sha256 from the standard library).
// This is the ninth independent CF-ID implementation, after FARD,
// Python, Rust, TypeScript, WASM, Swift, C++, and Kotlin, and matches
// all of them exactly on every conformance vector
// (conformance/vectors.json).
package cfcolor

import (
"crypto/sha256"
"errors"
"fmt"
"math"
"strings"
)

// Lab holds CIELAB and CIELCH values for a colour.
type Lab struct {
L, A, B float64
C, H    float64
}

func srgbToLinear(c float64) float64 {
cc := c / 255.0
if cc <= 0.04045 {
return cc / 12.92
}
return math.Pow((cc+0.055)/1.055, 2.4)
}

// RGBToLab converts an 8-bit sRGB triple to CIELAB/CIELCH under D65.
func RGBToLab(r, g, b int) Lab {
r1 := srgbToLinear(float64(r))
g1 := srgbToLinear(float64(g))
b1 := srgbToLinear(float64(b))

x := (r1*0.4124564 + g1*0.3575761 + b1*0.1804375) * 100.0 / 95.047
y := (r1*0.2126729 + g1*0.7151522 + b1*0.0721750) * 100.0 / 100.0
z := (r1*0.0193339 + g1*0.1191920 + b1*0.9503041) * 100.0 / 108.883

f := func(v float64) float64 {
if v > 0.008856 {
return math.Pow(v, 1.0/3.0)
}
return 7.787*v + 16.0/116.0
}

L := 116.0*f(y) - 16.0
a := 500.0 * (f(x) - f(y))
bb := 200.0 * (f(y) - f(z))
c := math.Sqrt(a*a + bb*bb)
h := math.Atan2(bb, a) * 180.0 / math.Pi
if h < 0 {
h += 360.0
}

return Lab{L: L, A: a, B: bb, C: c, H: h}
}

// Round3 implements FARD's round3: truncation toward zero, NOT
// round-half-up. Round3(-86.183) == -86.182.
func Round3(x float64) float64 {
scaled := x*1000.0 + 0.5
var truncated float64
if scaled >= 0.0 {
truncated = math.Floor(scaled)
} else {
truncated = math.Ceil(scaled)
}
return truncated / 1000.0
}

func jsonNumber(v float64) string {
r := Round3(v)
if r == math.Floor(r) && !math.IsInf(r, 0) {
return fmt.Sprintf("%d", int64(r))
}
s := fmt.Sprintf("%.3f", r)
s = strings.TrimRight(s, "0")
s = strings.TrimRight(s, ".")
return s
}

// FromRGB computes the CF-ID for an 8-bit RGB triple.
func FromRGB(r, g, b int) string {
lab := RGBToLab(r, g, b)

aS := jsonNumber(lab.A)
bS := jsonNumber(lab.B)
lS := jsonNumber(lab.L)

// Canonical JSON: alphabetical keys, no whitespace
preimage := fmt.Sprintf(`{"a":%s,"b":%s,"l":%s}`, aS, bS, lS)

sum := sha256.Sum256([]byte(preimage))
labHash8 := strings.ToUpper(fmt.Sprintf("%x", sum[:4]))

return fmt.Sprintf("CF-%02X%02X%02X-%s", r, g, b, labHash8)
}

// FromHex parses #rgb or #rrggbb (with or without leading '#') and
// returns its CF-ID.
func FromHex(hex string) (string, error) {
h := strings.TrimPrefix(hex, "#")
if len(h) == 3 {
h = string([]byte{h[0], h[0], h[1], h[1], h[2], h[2]})
}
if len(h) != 6 {
return "", errors.New("invalid hex colour: " + hex)
}
var r, g, b int
if _, err := fmt.Sscanf(h, "%02x%02x%02x", &r, &g, &b); err != nil {
return "", errors.New("invalid hex colour: " + hex)
}
// Sscanf with %02x is lenient about case but not about non-hex chars;
// double-check by re-encoding.
if !isHex(h) {
return "", errors.New("invalid hex colour: " + hex)
}
return FromRGB(r, g, b), nil
}

func isHex(s string) bool {
for _, c := range s {
if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
return false
}
}
return true
}
