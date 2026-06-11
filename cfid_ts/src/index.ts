// CF-ID: deterministic colour identity, per CF-Protocol-2.0.0
// (see SPEC-2.0.md in the main repo).
//
// Pure TypeScript, zero runtime dependencies (uses node:crypto for
// SHA-256, which is part of the Node.js standard library).
//
// This is the fourth independent CF-ID implementation, after FARD,
// Python (cfcolor on PyPI), and Rust (cfcolor crate), and matches all
// of them exactly on every SPEC-2.0.md test vector.

import { createHash } from "node:crypto";

export interface Lab {
  l: number;
  a: number;
  b: number;
  C: number;
  H: number;
}

export interface ColourInfo {
  cfId: string;
  rgb: [number, number, number];
  lab: { L: number; a: number; b: number };
  lch: { L: number; C: number; H: number };
  contrastWhite: number;
  contrastBlack: number;
}

function srgbToLinear(c: number): number {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function rgbToLab(r: number, g: number, b: number): Lab {
  const r1 = srgbToLinear(r);
  const g1 = srgbToLinear(g);
  const b1 = srgbToLinear(b);

  const x = ((r1 * 0.4124564 + g1 * 0.3575761 + b1 * 0.1804375) * 100) / 95.047;
  const y = ((r1 * 0.2126729 + g1 * 0.7151522 + b1 * 0.072175) * 100) / 100;
  const z = ((r1 * 0.0193339 + g1 * 0.119192 + b1 * 0.9503041) * 100) / 108.883;

  const f = (v: number) => (v > 0.008856 ? Math.pow(v, 1 / 3) : 7.787 * v + 16 / 116);

  const L = 116 * f(y) - 16;
  const a = 500 * (f(x) - f(y));
  const bb = 200 * (f(y) - f(z));
  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, a, b: bb, C, H };
}

/**
 * FARD's round3: truncation toward zero, NOT round-half-up.
 * round3(-86.183) === -86.182
 */
export function round3(v: number): number {
  const scaled = v * 1000.0 + 0.5;
  const truncated = scaled >= 0 ? Math.floor(scaled) : Math.ceil(scaled);
  return truncated / 1000.0;
}

function jsonNumber(v: number): string {
  const r = round3(v);
  if (Number.isInteger(r)) return String(r);
  let s = r.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return s;
}

export function cfId(r: number, g: number, b: number): { cfId: string; lab: Lab } {
  const lab = rgbToLab(r, g, b);
  const aS = jsonNumber(lab.a);
  const bS = jsonNumber(lab.b);
  const lS = jsonNumber(lab.l);

  // Canonical JSON: alphabetical keys, no whitespace
  const preimage = `{"a":${aS},"b":${bS},"l":${lS}}`;

  const hexdigest = createHash("sha256").update(preimage, "utf8").digest("hex");
  const labhash8 = hexdigest.slice(0, 8).toUpperCase();
  const hex6 = [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

  return { cfId: `CF-${hex6}-${labhash8}`, lab };
}

function relLum(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(r: number, g: number, b: number, otherLum: number): number {
  const l1 = relLum(r, g, b);
  const lighter = Math.max(l1, otherLum);
  const darker = Math.min(l1, otherLum);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse a hex colour (#rgb or #rrggbb, with or without leading '#') and
 * return its CF-ID, LAB/LCH, and WCAG contrast ratios against white/black.
 */
export function fromHex(hexStr: string): ColourInfo {
  let h = hexStr.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`invalid hex colour: ${hexStr}`);
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
    lab: { L: round3(lab.l), a: round3(lab.a), b: round3(lab.b) },
    lch: { L: round3(lab.l), C: round3(lab.C), H: round3(lab.H) },
    contrastWhite,
    contrastBlack,
  };
}

/** CF-ID for an RGB triple (0-255 each). */
export function fromRgb(r: number, g: number, b: number): string {
  return cfId(r, g, b).cfId;
}
