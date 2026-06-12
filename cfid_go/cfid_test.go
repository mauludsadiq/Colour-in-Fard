package cfcolor

import "testing"

func TestSpecVectors(t *testing.T) {
cases := []struct {
hex      string
expected string
}{
{"#000000", "CF-000000-86165F20"},
{"#ffffff", "CF-FFFFFF-2DD4EB92"},
{"#ff0000", "CF-FF0000-37AB74A7"},
{"#00ff00", "CF-00FF00-9377CC77"},
{"#0000ff", "CF-0000FF-D81673DF"},
{"#7b3f00", "CF-7B3F00-EA262463"},
{"#cc0000", "CF-CC0000-791976F7"},
}
for _, c := range cases {
got, err := FromHex(c.hex)
if err != nil {
t.Fatalf("FromHex(%s) error: %v", c.hex, err)
}
if got != c.expected {
t.Errorf("FromHex(%s) = %s, want %s", c.hex, got, c.expected)
}
}
}

func TestThreeDigitHexExpands(t *testing.T) {
a, _ := FromHex("#ff0000")
b, _ := FromHex("#f00")
if a != b {
t.Errorf("3-digit expansion mismatch: %s != %s", a, b)
}
}

func TestRound3TruncatesTowardZero(t *testing.T) {
if got := Round3(-86.183); got != -86.182 {
t.Errorf("Round3(-86.183) = %v, want -86.182", got)
}
if got := Round3(86.183); got != 86.183 {
t.Errorf("Round3(86.183) = %v, want 86.183", got)
}
if got := Round3(0.0001); got != 0.0 {
t.Errorf("Round3(0.0001) = %v, want 0.0", got)
}
}

func TestFromRGBMatchesFromHex(t *testing.T) {
a, _ := FromHex("#ff0000")
b := FromRGB(255, 0, 0)
if a != b {
t.Errorf("FromRGB/FromHex mismatch: %s != %s", b, a)
}
}

func TestInvalidHex(t *testing.T) {
if _, err := FromHex("#zzzzzz"); err == nil {
t.Error("expected error for #zzzzzz")
}
if _, err := FromHex("#ff00"); err == nil {
t.Error("expected error for wrong-length hex")
}
}

func TestHueInRange(t *testing.T) {
for _, hex := range []string{"#ff0000", "#00ff00", "#0000ff", "#7b3f00"} {
var r, g, b int
h := hex[1:]
fmt_sscanf_helper(h, &r, &g, &b)
lab := RGBToLab(r, g, b)
if lab.H < 0.0 || lab.H >= 360.0 {
t.Errorf("hue out of range for %s: %v", hex, lab.H)
}
}
}

func fmt_sscanf_helper(h string, r, g, b *int) {
*r = hex2(h[0:2])
*g = hex2(h[2:4])
*b = hex2(h[4:6])
}

func hex2(s string) int {
v := 0
for _, c := range s {
v *= 16
switch {
case c >= '0' && c <= '9':
v += int(c - '0')
case c >= 'a' && c <= 'f':
v += int(c-'a') + 10
case c >= 'A' && c <= 'F':
v += int(c-'A') + 10
}
}
return v
}
