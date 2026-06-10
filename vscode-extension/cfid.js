// CF-ID computation -- matches SPEC.md exactly (CF-ID-1.0.0)
// Pure JS, no dependencies. Used by extension.js for hover.

const crypto = require('crypto');

function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToLab(r, g, b) {
  const r1 = srgbToLinear(r), g1 = srgbToLinear(g), b1 = srgbToLinear(b);
  const x = (r1 * 0.4124564 + g1 * 0.3575761 + b1 * 0.1804375) * 100 / 95.047;
  const y = (r1 * 0.2126729 + g1 * 0.7151522 + b1 * 0.0721750) * 100 / 100;
  const z = (r1 * 0.0193339 + g1 * 0.1191920 + b1 * 0.9503041) * 100 / 108.883;
  const f = v => v > 0.008856 ? Math.pow(v, 1 / 3) : 7.787 * v + 16 / 116;
  const L = 116 * f(y) - 16, a = 500 * (f(x) - f(y)), bv = 200 * (f(y) - f(z));
  const C = Math.sqrt(a * a + bv * bv);
  let H = Math.atan2(bv, a) * 180 / Math.PI;
  if (H < 0) H += 360;
  return { L, a, b: bv, C, H };
}

// FARD round3: trunc(x*1000+0.5)/1000 (truncation toward zero)
function round3(v) {
  const scaled = v * 1000.0 + 0.5;
  const truncated = scaled >= 0 ? Math.floor(scaled) : Math.ceil(scaled);
  return truncated / 1000.0;
}

function jsonNumber(v) {
  const r = round3(v);
  if (Number.isInteger(r)) return String(r);
  let s = r.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

function cfId(r, g, b) {
  const lab = rgbToLab(r, g, b);
  const aS = jsonNumber(lab.a);
  const bS = jsonNumber(lab.b);
  const lS = jsonNumber(lab.L);
  const preimage = '{"a":' + aS + ',"b":' + bS + ',"l":' + lS + '}';
  const hexdigest = crypto.createHash('sha256').update(preimage, 'utf8').digest('hex');
  const labhash8 = hexdigest.slice(0, 8).toUpperCase();
  const hex6 = [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  return { cfId: 'CF-' + hex6 + '-' + labhash8, lab };
}

// WCAG contrast
function relLum(r, g, b) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
function contrastRatio(r, g, b, otherLum) {
  const l1 = relLum(r, g, b);
  const lighter = Math.max(l1, otherLum), darker = Math.min(l1, otherLum);
  return (lighter + 0.05) / (darker + 0.05);
}

function fromHex(hexStr) {
  let h = hexStr.replace('#', '');
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const { cfId: id, lab } = cfId(r, g, b);
  const contrastWhite = contrastRatio(r, g, b, 1.0);
  const contrastBlack = contrastRatio(r, g, b, 0.0);
  return {
    cfId: id,
    rgb: [r, g, b],
    lab: { L: round3(lab.L), a: round3(lab.a), b: round3(lab.b) },
    lch: { L: round3(lab.L), C: round3(lab.C), H: round3(lab.H) },
    contrastWhite,
    contrastBlack
  };
}

module.exports = { fromHex, cfId, rgbToLab, round3 };
